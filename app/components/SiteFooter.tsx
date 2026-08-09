import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Case study.",
    links: [
      { href: "/#overview", label: "Overview" },
      { href: "/architecture", label: "Engineering" },
      { href: "/evals", label: "Evidence" },
    ],
  },
  {
    title: "Product.",
    links: [
      { href: "/demo", label: "Guided demo" },
      { href: "/inbox", label: "Agent inbox" },
      { href: "/corpus", label: "Policy corpus" },
    ],
  },
  {
    title: "Ariel.",
    links: [
      { href: "https://arielmagalso.com", label: "Portfolio ↗", external: true },
      { href: "https://github.com/ArielMagalsoDev/provenance", label: "GitHub ↗", external: true },
      { href: "https://www.linkedin.com/in/magalsoariel", label: "LinkedIn ↗", external: true },
      { href: "mailto:hello@arielmagalso.com", label: "Email ↗" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="editorial-footer">
      <div className="shell">
        <div className="footer-statement">
          <span className="footer-kicker">Ready to see how Ariel builds accountable AI workflows?</span>
          <h2>Turn an AI prototype into a workflow people can trust.</h2>
          <a className="cyan-action footer-contact" href="mailto:hello@arielmagalso.com">Contact Ariel&nbsp;→</a>
        </div>

        <div className="footer-directory">
          <div className="footer-brand-block">
            <Link className="footer-brand" href="/">provenance.</Link>
            <p>An independent AI automation case study designed and built by Ariel Magalso.</p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div className="footer-column" key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => "external" in link && link.external ? (
                <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
              ) : (
                <Link href={link.href} key={link.href}>{link.label}</Link>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-legal">
          <span>Independent portfolio project. Fictional workspace. No customer data.</span>
          <span>Designed and built by Ariel Magalso.</span>
          <span>© 2026 Provenance.</span>
        </div>
      </div>
    </footer>
  );
}
