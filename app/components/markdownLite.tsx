// Deliberately not pulling in a markdown renderer for a handful of controlled,
// project-authored files (corpus docs, generated eval results) — see CLAUDE.md
// "no additional dependencies without a stated reason". Shared by /corpus and /evals
// so both get heading + paragraph + list + table + inline-bold support consistently.

const textStyle: React.CSSProperties = { color: "var(--charcoal)", lineHeight: 1.55, fontSize: "16px", letterSpacing: "-0.16px" };
const mutedStyle: React.CSSProperties = { color: "var(--steel)" };

/** Splits on **bold** and wraps matches in <strong>; everything else passes through as text. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/);
    return match ? (
      <strong key={`${keyPrefix}-${i}`} style={{ fontWeight: 700, color: "var(--ink)" }}>
        {match[1]}
      </strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    );
  });
}

const ORDERED_ITEM = /^\d+\.\s+(.*)/;

export function renderMarkdownLite(markdown: string): React.ReactNode[] {
  const lines = markdown.split("\n");
  const blocks: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let tableLines: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = (key: string) => {
    if (paragraph.length === 0) return;
    blocks.push(
      <p key={key} style={textStyle}>
        {renderInline(paragraph.join(" "), key)}
      </p>
    );
    paragraph = [];
  };

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    blocks.push(
      <ol key={key} style={{ ...textStyle, listStyle: "decimal", paddingLeft: "22px", display: "grid", gap: "8px" }}>
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </ol>
    );
    listItems = [];
  };

  const flushTable = (key: string) => {
    if (tableLines.length < 2) {
      tableLines = [];
      return;
    }
    // Row index 1 is the "|---|---|" separator — drop it.
    const rows = tableLines
      .filter((_, i) => i !== 1)
      .map((row) => row.split("|").slice(1, -1).map((cell) => cell.trim()));
    const [header, ...body] = rows;
    blocks.push(
      <div key={key} style={{ overflowX: "auto" }}>
        <table className="specs-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              {header.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ textAlign: ci === 0 ? "left" : "right" }}>
                    {renderInline(cell, `${key}-${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableLines = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      flushParagraph(`p${i}`);
      flushList(`l${i}`);
      tableLines.push(line);
      return;
    }
    if (tableLines.length > 0) flushTable(`t${i}`);

    const orderedMatch = trimmed.match(ORDERED_ITEM);
    if (orderedMatch) {
      flushParagraph(`p${i}`);
      listItems.push(orderedMatch[1]);
      return;
    }
    if (listItems.length > 0) flushList(`l${i}`);

    if (line.startsWith("## ")) {
      flushParagraph(`p${i}`);
      blocks.push(
        <h3 key={i} style={{ fontSize: "16px", fontWeight: 650, color: "var(--ink)", marginTop: "28px" }}>
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("# ")) {
      flushParagraph(`p${i}`);
      blocks.push(
        <h2 key={i} style={{ fontSize: "26px", marginTop: "36px" }}>
          {line.slice(2)}
        </h2>
      );
    } else if (trimmed === "") {
      flushParagraph(`p${i}`);
    } else {
      paragraph.push(line);
    }
  });
  flushParagraph("plast");
  flushList("llast");
  flushTable("tlast");

  return blocks;
}

export const markdownMutedStyle = mutedStyle;
