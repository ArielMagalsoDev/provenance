// The headline feature. Decomposes the generated answer into atomic claims, scores
// entailment for every claim against the retrieved passages in one batched Haiku call,
// applies a cheap lexical sanity check, then gates on mean score AND a per-claim floor
// (see CLAUDE.md "Grounding gate" — the spec's original mean-only rule lets one
// fabricated claim hide inside several well-supported ones).
import { getAnthropic, HAIKU_MODEL, stripCodeFences } from "./anthropic";
import type { Claim, GroundingResult, RetrievedPassage, ModelCallError } from "./types";

const DECOMPOSE_MAX_TOKENS = 500;
const ENTAIL_MAX_TOKENS = 1000;

const GROUNDEDNESS_THRESHOLD = Number(process.env.GROUNDEDNESS_THRESHOLD ?? 0.7);
const GROUNDEDNESS_MIN_CLAIM_SCORE = Number(process.env.GROUNDEDNESS_MIN_CLAIM_SCORE ?? 0.4);

// Lexical sanity check: if a claim shares almost no vocabulary with any retrieved
// passage, don't let the model's entailment score alone push it above this cap — this
// is the specific failure mode where Haiku agrees a claim is supported because it
// "sounds right" rather than because the words are actually there (same-model
// self-grading is a known weakness; this is a cheap, non-LLM check against it).
const LEXICAL_SANITY_FLOOR = 0.15;
const LEXICAL_SANITY_CAP = 0.4;

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "of", "to", "in",
  "on", "at", "for", "and", "or", "but", "with", "as", "by", "it", "its", "this", "that",
  "these", "those", "not", "no", "if", "than", "then", "so", "do", "does", "did", "can",
  "will", "would", "should", "may", "might", "must", "has", "have", "had", "their", "they",
]);

function normalizeWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function lexicalOverlap(claim: string, passages: RetrievedPassage[]): number {
  const claimWords = normalizeWords(claim);
  if (claimWords.size === 0) return 0;
  let best = 0;
  for (const p of passages) {
    const passageWords = normalizeWords(p.content);
    let hits = 0;
    for (const w of claimWords) if (passageWords.has(w)) hits += 1;
    const overlap = hits / claimWords.size;
    if (overlap > best) best = overlap;
  }
  return best;
}

async function decomposeClaims(answer: string): Promise<string[]> {
  const response = await getAnthropic().messages.create({
    model: HAIKU_MODEL,
    max_tokens: DECOMPOSE_MAX_TOKENS,
    // Pinned near-zero: this is a classification-shaped task (which sentences are
    // claims vs. meta-commentary), not creative generation. Left at the API default,
    // the same answer text can decompose differently across calls — observed directly
    // in eval runs where an identical guided-scenario question flipped between
    // "answered" and "refused" run to run. A demo scenario should teach the same
    // lesson every time.
    temperature: 0,
    system:
      'Break the given answer into atomic factual claims — each a single, independently verifiable statement about the world (e.g. a policy, price, or rule). Skip hedges, greetings, and meta-commentary about the answer itself or about what the source material does or doesn\'t say — none of these are claims: ("I cannot answer...", "the passages don\'t mention X", "this isn\'t specified", "it\'s unclear whether Y", or any statement whose subject is the documentation\'s coverage rather than a real-world fact). Also skip any statement that reasons from silence (e.g. "X isn\'t mentioned, so it must not be offered") — that is an inference, not a stated fact. Respond with JSON only: {"claims": ["claim text", ...]}. Use an empty array if the answer contains no verifiable factual claims — this is the correct, common case for a refusal-flavored answer.',
    messages: [{ role: "user", content: answer }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  try {
    const parsed = JSON.parse(stripCodeFences(raw));
    return Array.isArray(parsed?.claims) ? parsed.claims.filter((c: unknown) => typeof c === "string") : [];
  } catch {
    return [];
  }
}

type EntailmentScore = { claimIndex: number; score: number; supportingPassageIds: string[] };

async function scoreEntailment(
  claims: string[],
  passages: RetrievedPassage[]
): Promise<EntailmentScore[]> {
  const claimsList = claims.map((c, i) => `${i}: ${c}`).join("\n");
  const passagesList = passages.map((p) => `id=${p.id}\n${p.content}`).join("\n\n");

  const response = await getAnthropic().messages.create({
    model: HAIKU_MODEL,
    max_tokens: ENTAIL_MAX_TOKENS,
    // Same reasoning as decomposeClaims above — entailment scoring is the safety-
    // critical verification step and should be as consistent as possible run to run.
    temperature: 0,
    system:
      'You will be given a numbered list of claims and a set of source passages, each with an id. For EVERY claim, judge how well the passages entail (directly support) it — a score from 0 (not mentioned, unsupported, or contradicted) to 1 (fully and directly supported by at least one passage). Do not use outside knowledge — judge only against the given passages.\n\n' +
      'Be strict about topic conflation: a claim about topic A is NOT entailed by a passage about a related-but-distinct topic B, even if B would plausibly imply A in the real world. Example — a passage stating "the company does not accept liability for lost property" does NOT entail a claim that "insurance does not cover lost property." Liability/responsibility and insurance coverage are different concepts; a passage discussing one does not establish a claim about the other unless it says so explicitly. When a claim names a specific concept (insurance, warranty, refund, legal liability, etc.), only passages that discuss that SAME concept can support it — do not fill the gap with adjacent policy language, no matter how reasonable the inference feels.\n\n' +
      'List which passage id(s), if any, support each claim. Respond with JSON only: {"scores": [{"claimIndex": 0, "score": 0.9, "supportingPassageIds": ["some-id"]}, ...]}. Include one entry per claim, in order.',
    messages: [
      {
        role: "user",
        content: `Claims:\n${claimsList}\n\nPassages:\n${passagesList}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && textBlock.type === "text" ? textBlock.text : "";
  try {
    const parsed = JSON.parse(stripCodeFences(raw));
    const scores = Array.isArray(parsed?.scores) ? parsed.scores : [];
    return scores
      .filter((s: unknown): s is EntailmentScore => {
        const obj = s as Record<string, unknown>;
        return (
          typeof obj?.claimIndex === "number" &&
          typeof obj?.score === "number" &&
          Array.isArray(obj?.supportingPassageIds)
        );
      })
      .map((s: EntailmentScore) => ({
        claimIndex: s.claimIndex,
        score: Math.max(0, Math.min(1, s.score)),
        supportingPassageIds: s.supportingPassageIds.filter((id) => typeof id === "string"),
      }));
  } catch {
    return [];
  }
}

/**
 * Citations shown to the user are derived from VERIFIED per-claim support, not from
 * generation.ts's self-reported citations array. Haiku doesn't reliably keep that
 * self-report in sync with the answer it actually wrote — observed in eval runs where
 * the answer stated specific, correctly-grounded facts but the model left citations
 * empty. The grounding layer already computes supportingPassageIds per claim via real
 * entailment scoring, so deriving citations from that instead is strictly better: what
 * the user sees as "sources" is exactly what the verification layer confirmed, not
 * what the generator claims — the same trust-but-verify principle the whole pipeline
 * is built on.
 */
export function deriveCitations(grounding: GroundingResult): string[] {
  const ids = grounding.claims.filter((c) => c.supported).flatMap((c) => c.supportingPassageIds);
  return [...new Set(ids)];
}

export async function groundAnswer(
  answer: string,
  passages: RetrievedPassage[]
): Promise<GroundingResult | ModelCallError> {
  if (!answer.trim()) {
    return {
      score: 0,
      minClaimScore: 0,
      threshold: GROUNDEDNESS_THRESHOLD,
      minClaimFloor: GROUNDEDNESS_MIN_CLAIM_SCORE,
      passed: false,
      claims: [],
    };
  }

  try {
    const claimTexts = await decomposeClaims(answer);

    if (claimTexts.length === 0) {
      // Non-empty answer with no verifiable claims (e.g. a pure refusal sentence) —
      // nothing to ground, and nothing to fabricate. Treat as vacuously ungrounded
      // rather than vacuously passing, so this path never accidentally produces
      // outcome: "answered" with zero substance.
      return {
        score: 0,
        minClaimScore: 0,
        threshold: GROUNDEDNESS_THRESHOLD,
        minClaimFloor: GROUNDEDNESS_MIN_CLAIM_SCORE,
        passed: false,
        claims: [],
      };
    }

    const entailments = await scoreEntailment(claimTexts, passages);
    const byIndex = new Map(entailments.map((e) => [e.claimIndex, e]));

    const claims: Claim[] = claimTexts.map((text, i) => {
      const entailment = byIndex.get(i);
      const entailmentScore = entailment?.score ?? 0;
      const supportingPassageIds = entailment?.supportingPassageIds ?? [];
      const lex = lexicalOverlap(text, passages);
      const score =
        lex < LEXICAL_SANITY_FLOOR ? Math.min(entailmentScore, LEXICAL_SANITY_CAP) : entailmentScore;

      return {
        text,
        supported: score >= GROUNDEDNESS_MIN_CLAIM_SCORE,
        supportingPassageIds,
        score,
      };
    });

    const scores = claims.map((c) => c.score);
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const minClaimScore = Math.min(...scores);

    return {
      score: meanScore,
      minClaimScore,
      threshold: GROUNDEDNESS_THRESHOLD,
      minClaimFloor: GROUNDEDNESS_MIN_CLAIM_SCORE,
      passed: meanScore >= GROUNDEDNESS_THRESHOLD && minClaimScore >= GROUNDEDNESS_MIN_CLAIM_SCORE,
      claims,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), stage: "ground" };
  }
}
