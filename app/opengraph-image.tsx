import { ImageResponse } from "next/og";
import {
  jetbrainsMono600,
  spaceGrotesk700,
  urbanist500,
  urbanist600,
} from "@/lib/og-card-fonts";

/* Prerendered to a real PNG at build time, so nothing renders per-request. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Provenance — RAG claim verification by Ariel Magalso";

/**
 * The social preview card — what fills the link card in LinkedIn, Messenger,
 * Slack and iMessage.
 *
 * This used to be the shared "AI Engineer & Web Developer" card copied across
 * every project under arielmagalso.com. That gave all three projects one
 * identity, which reads as three duplicates the moment they sit side by side in
 * a LinkedIn Featured carousel — so each project now draws its own card in its
 * own palette and type.
 *
 * Generated from code rather than kept as a committed PNG so it can never drift
 * from the site's real look: the orange wordmark, Space Grotesk display type,
 * and the dark pill the homepage uses for its status chip.
 */

/* Tokens, mirrored from the live site's computed styles. Satori has no
   CSS-variable support, so these are duplicated as literals. The wordmark
   orange is the site's own logo color, not the --primary cobalt, which is
   reserved for interaction. */
const CANVAS = "#f0f0f0";
const INK = "#030712";
const CHARCOAL = "#1f2937";
const MUTED = "#6b7280";
const STONE = "#9ca3af";
const ORANGE = "#ff4d00";
const DARK_PILL = "#1f2124";
const GREEN = "#22c55e";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: CANVAS,
          padding: "56px 72px",
          fontFamily: "Space Grotesk",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: ORANGE }}>
          Provenance
        </div>

        {/* The site's availability chip, reduced to its dot and label. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 54,
            fontFamily: "Urbanist",
            fontSize: 20,
            fontWeight: 500,
            color: MUTED,
          }}
        >
          <div
            style={{ width: 11, height: 11, borderRadius: 999, backgroundColor: GREEN }}
          />
          RAG claim verification · cited or refused
        </div>

        {/* The homepage headline, compressed to the half that is the product's
            actual promise, in the same two-tone weighting the hero uses. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 18,
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -2.5,
            lineHeight: 1.06,
            color: CHARCOAL,
          }}
        >
          <div style={{ display: "flex", color: INK }}>Proof,</div>
          <div style={{ display: "flex", color: MUTED }}>not promises.</div>
        </div>

        {/* Dark pill — the site's own CTA shape, carrying the refusal guarantee
            that is the whole reason the project exists. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: "auto",
            /* Without this the pill stretches the full content width — Satori
               applies the default `align-items: stretch` to a column child, and
               there is no shrink-to-fit the way `width: fit-content` gives in a
               real browser. */
            alignSelf: "flex-start",
            backgroundColor: DARK_PILL,
            color: "#ffffff",
            borderRadius: 999,
            padding: "15px 30px",
            fontFamily: "Urbanist",
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          <div
            style={{ width: 13, height: 13, borderRadius: 999, backgroundColor: ORANGE }}
          />
          Every answer cites its source — or says &ldquo;can&rsquo;t find that&rdquo;
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 34,
            fontFamily: "JetBrains Mono",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: 1.5,
          }}
        >
          <div style={{ color: INK }}>provenance.arielmagalso.com</div>
          <div style={{ color: STONE }}>ARIEL MAGALSO · AI ENGINEER</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: spaceGrotesk700, weight: 700, style: "normal" },
        { name: "Urbanist", data: urbanist500, weight: 500, style: "normal" },
        { name: "Urbanist", data: urbanist600, weight: 600, style: "normal" },
        { name: "JetBrains Mono", data: jetbrainsMono600, weight: 600, style: "normal" },
      ],
    },
  );
}
