import Link from "next/link";
import { ArrowUpRight } from "./ButtonArrow";
import { LocalTime } from "./LocalTime";

const FOOTER_COLUMNS = [
  {
    title: "Case study",
    links: [
      { href: "/#overview", label: "Overview" },
      { href: "/architecture", label: "Engineering" },
      { href: "/evals", label: "Evidence" },
      { href: "/corpus", label: "Policy corpus" },
    ],
  },
  {
    title: "Product",
    links: [
      { href: "/demo", label: "Guided demo" },
      { href: "/inbox", label: "Agent inbox" },
    ],
  },
  {
    title: "Ariel",
    links: [
      { href: "https://arielmagalso.com", label: "Portfolio", external: true },
      { href: "https://github.com/ArielMagalsoDev/provenance", label: "GitHub", external: true },
      { href: "https://www.linkedin.com/in/magalsoariel", label: "LinkedIn", external: true },
      { href: "mailto:ariel.r.magalso@gmail.com", label: "Email" },
    ],
  },
] as const;

function FooterLinkArrow() {
  return (
    <svg className="footer-link-arrow" width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="editorial-footer">
      <div className="shell">
        <div className="recruiter-cta">
          <h2>Looking for someone who can turn AI prototypes into accountable products?</h2>
          <div className="recruiter-actions">
            <a className="btn btn-primary" href="mailto:ariel.r.magalso@gmail.com">Contact Ariel →</a>
            <a className="btn btn-secondary" href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">Portfolio<ArrowUpRight /></a>
          </div>
        </div>

        <div className="footer-directory" style={{ marginTop: "clamp(32px, 4vw, 48px)" }}>
          <div className="footer-brand-block">
            <Link className="footer-brand" href="/">Provenance</Link>
            <p>An independent AI automation case study designed and built by Ariel Magalso.</p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div className="footer-column" key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => "external" in link && link.external ? (
                <a className="footer-link" href={link.href} key={link.href} target="_blank" rel="noopener noreferrer">
                  <span className="footer-link-label">{link.label}<span className="footer-link-underline" aria-hidden="true"><i /></span></span>
                  <FooterLinkArrow />
                </a>
              ) : (
                <Link className="footer-link" href={link.href} key={link.href}>
                  <span className="footer-link-label">{link.label}<span className="footer-link-underline" aria-hidden="true"><i /></span></span>
                  <FooterLinkArrow />
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-legal">
          <div className="footer-legal-left">
            <span>Independent portfolio project. Fictional workspace. No customer data.</span>
            <span>Designed and built by Ariel Magalso</span>
          </div>
          <LocalTime />
          <a className="back-to-top" href="#main-content">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
