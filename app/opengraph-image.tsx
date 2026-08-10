import { ImageResponse } from "next/og";
import { comfortaaBold, geistMonoSemiBold } from "@/lib/og-fonts";

/* Prerendered to a real PNG at build time, so nothing renders per-request. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ariel Magalso — AI Automation Engineer & Web Developer";

/**
 * The social preview card — what fills the link card in LinkedIn, Messenger,
 * Slack and iMessage. Ported verbatim from the finalportfolio site's card so
 * every project under arielmagalso.com shares one identity in link previews.
 *
 * Generated from code rather than kept as a committed PNG so it can never drift
 * from the site's real palette and wordmark.
 *
 * The faces are imported as bytes from lib/og-fonts rather than read off disk.
 * Reading them from node_modules with fs is the obvious version and it broke
 * production — see the note in that file before changing it back.
 */

/* The chevron logomark, inlined as a data URI. It relies on SVG masks to turn
   two strokes into fills; Satori's own SVG support doesn't cover masks, but an
   <img> is handed to resvg for rasterising, which does. */
const LOGOMARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 12" fill="none"><mask id="a" fill="white"><path d="M0 6L5.5 12L11 6"/></mask><path d="M1.47431 4.64855C0.727923 3.83431 -0.537211 3.77931 -1.35145 4.52569C-2.16569 5.27208 -2.22069 6.53721 -1.47431 7.35145L0 6L1.47431 4.64855ZM5.5 12L4.02569 13.3514C4.40451 13.7647 4.93939 14 5.5 14C6.06061 14 6.59549 13.7647 6.97431 13.3514L5.5 12ZM12.4743 7.35145C13.2207 6.53721 13.1657 5.27208 12.3514 4.52569C11.5372 3.77931 10.2721 3.83431 9.52569 4.64855L11 6L12.4743 7.35145ZM0 6L-1.47431 7.35145L4.02569 13.3514L5.5 12L6.97431 10.6486L1.47431 4.64855L0 6ZM5.5 12L6.97431 13.3514L12.4743 7.35145L11 6L9.52569 4.64855L4.02569 10.6486L5.5 12Z" fill="%2309090b" mask="url(%23a)"/><mask id="b" fill="white"><path d="M15 6L9.5 0L4 6"/></mask><path d="M13.5257 7.35145C14.2721 8.16569 15.5372 8.22069 16.3514 7.47431C17.1657 6.72792 17.2207 5.46279 16.4743 4.64855L15 6L13.5257 7.35145ZM9.5 0L10.9743 -1.35145C10.5955 -1.76471 10.0606 -2 9.5 -2C8.93939 -2 8.40451 -1.76471 8.02569 -1.35145L9.5 0ZM2.52569 4.64855C1.77931 5.46279 1.83431 6.72792 2.64855 7.47431C3.46279 8.22069 4.72792 8.16569 5.47431 7.35145L4 6L2.52569 4.64855ZM15 6L16.4743 4.64855L10.9743 -1.35145L9.5 0L8.02569 1.35145L13.5257 7.35145L15 6ZM9.5 0L8.02569 -1.35145L2.52569 4.64855L4 6L5.47431 7.35145L10.9743 1.35145L9.5 0Z" fill="%2309090b" mask="url(%23b)"/></svg>`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#f4f4f5",
          padding: "0 108px",
          fontFamily: "Comfortaa",
        }}
      >
        {/* logomark + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img
            src={`data:image/svg+xml;utf8,${LOGOMARK}`}
            width={65}
            height={52}
            alt=""
          />
          <div style={{ fontSize: 30, fontWeight: 700, color: "#09090b" }}>
            Ariel Magalso
          </div>
        </div>

        {/* the claim, two-tone exactly like the site's section headings */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 53,
            /* 76px, not larger: "AI Automation Engineer" is the longest line
               and needs to hold ONE line inside the 984px content column —
               at 91px it wrapped and made the headline three lines. */
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -2.8,
            lineHeight: 1.08,
          }}
        >
          {/* the "&" is muted and the rest is ink — the same accent treatment as
              the site's hero heading, where the ampersand sits in the grey span */}
          <div style={{ display: "flex", color: "#09090b" }}>
            AI Automation Engineer&nbsp;
            <span style={{ color: "#9898a3" }}>&amp;</span>
          </div>
          <div style={{ color: "#09090b" }}>Web Developer</div>
        </div>

        <div
          style={{
            display: "flex",
            height: 1,
            marginTop: 50,
            backgroundColor: "rgba(9,9,11,0.13)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 31,
            fontFamily: "Geist Mono",
            fontSize: 21,
            fontWeight: 600,
            letterSpacing: 1.4,
          }}
        >
          <div style={{ color: "#09090b" }}>provenance.arielmagalso.com</div>
          <div style={{ color: "#9898a3" }}>PHILIPPINES</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Comfortaa", data: comfortaaBold, weight: 700, style: "normal" },
        { name: "Geist Mono", data: geistMonoSemiBold, weight: 600, style: "normal" },
      ],
    },
  );
}
