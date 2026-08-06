// Answer generation with citations. System prompt instructs: answer only from the
// supplied passages, cite passage IDs, and say so honestly if the passages don't cover
// the question. Requests structured JSON; parses defensively.
import { getAnthropic, HAIKU_MODEL, stripCodeFences } from "./anthropic";
import type { RetrievedPassage, GenerationResult, ModelCallError } from "./types";

const MAX_TOKENS_OUT = 700;

const SYSTEM_PROMPT = `You are a support assistant for Meridian Nine Coworking, a coworking space. You answer member and prospective-member questions using ONLY the numbered passages supplied in the user message — never your own outside knowledge of coworking spaces in general.

Rules:
- If the passages fully answer the question, answer concisely and cite every passage ID you relied on.
- If the passages only partially answer the question, answer ONLY the part they actually cover. Do not add a sentence noting what isn't covered — a separate verification step handles that; your job here is to state only what's positively supported.
- If the passages do not answer the question at all — including if the closest thing you can find only tells you what's NOT included, or lets you infer an answer rather than stating one outright — return an empty answer string and empty citations/usedPassageIds arrays. Do not write an explanatory answer about what the passages don't cover, and do not answer a question by reasoning from silence or absence (e.g. "the passages don't mention X, so it's not offered" is not a supported answer — return empty instead).
- Every factual claim in your answer must trace back to at least one supplied passage stating it directly, not to your inference about what a passage's silence implies.
- Do not conflate related-but-distinct concepts. A passage about liability or who is responsible for something does not tell you anything about insurance coverage; a passage about premises/building insurance does not tell you anything about coverage for a member's own belongings. If the question asks about one concept (e.g. "is my laptop insured") and the passages only address a different, related concept (e.g. who is liable if it's stolen), that question is NOT answered — return empty rather than substituting the adjacent concept.

Respond with JSON only, no prose outside the JSON, no code fences:
{"answer": "<your answer text>", "citations": ["<passage id>", ...], "usedPassageIds": ["<passage id>", ...]}

"citations" and "usedPassageIds" should be the same list: every passage ID your answer actually relies on. Use an empty array for both if you cannot answer from the passages.`;

function formatPassages(passages: RetrievedPassage[]): string {
  return passages
    .map((p, i) => `[${i + 1}] id=${p.id}${p.heading ? ` heading="${p.heading}"` : ""}\n${p.content}`)
    .join("\n\n");
}

type ParsedGeneration = { answer: string; citations: string[]; usedPassageIds: string[] };

function parseGenerationJson(raw: string): ParsedGeneration | null {
  try {
    const parsed = JSON.parse(stripCodeFences(raw));
    if (typeof parsed?.answer !== "string") return null;
    const citations = Array.isArray(parsed.citations) ? parsed.citations.filter((c: unknown) => typeof c === "string") : [];
    const usedPassageIds = Array.isArray(parsed.usedPassageIds)
      ? parsed.usedPassageIds.filter((c: unknown) => typeof c === "string")
      : citations;
    return { answer: parsed.answer, citations, usedPassageIds };
  } catch {
    return null;
  }
}

export async function generateAnswer(
  question: string,
  passages: RetrievedPassage[]
): Promise<GenerationResult | ModelCallError> {
  const start = Date.now();
  const validIds = new Set(passages.map((p) => p.id));

  try {
    const response = await getAnthropic().messages.create({
      model: HAIKU_MODEL,
      max_tokens: MAX_TOKENS_OUT,
      // Pinned low for reproducibility — the same policy question should get the same
      // answer, not a different phrasing (and different resulting claims) each time.
      // See the fuller note in lib/ground.ts.
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Question: ${question}\n\nPassages:\n${formatPassages(passages)}`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const parsed = parseGenerationJson(raw);

    const latencyMs = Date.now() - start;
    const tokensOut = response.usage?.output_tokens ?? 0;

    if (!parsed) {
      // Malformed JSON — fail closed into a refusal-shaped result rather than crashing
      // or forwarding unparseable text as an "answer". lib/ground.ts will still run
      // against zero claims and correctly discard this.
      return { answer: "", citations: [], usedPassageIds: [], tokensOut, latencyMs };
    }

    // Defensive: only trust citations that resolve to passages we actually retrieved.
    const citations = parsed.citations.filter((id) => validIds.has(id));
    const usedPassageIds = parsed.usedPassageIds.filter((id) => validIds.has(id));

    return { answer: parsed.answer, citations, usedPassageIds, tokensOut, latencyMs };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), stage: "generate" };
  }
}
