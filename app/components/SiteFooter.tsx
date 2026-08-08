import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer-region">
      <div className="shell">
        <div className="footer-top">
          <div>
            <div className="brand" style={{ marginBottom: "12px" }}>
              <span className="brand-mark" aria-hidden="true" />
              <span>Provenance</span>
            </div>
            <p className="text-body-sm" style={{ color: "var(--steel)", maxWidth: "260px" }}>
              An independent AI automation case study — cited answers, human review, and a real audit trail.
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h4>Case study</h4>
              <Link href="/#overview">Overview</Link>
              <Link href="/#engineering">Engineering</Link>
              <Link href="/#evidence">Evidence</Link>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link href="/demo">Guided demo</Link>
              <Link href="/inbox">Inbox</Link>
              <Link href="/corpus">Policy corpus</Link>
            </div>
            <div className="footer-col">
              <h4>Ariel</h4>
              <a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">Portfolio ↗</a>
              <a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">
                GitHub ↗
              </a>
              <a href="https://www.linkedin.com/in/magalsoariel" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a href="mailto:hello@arielmagalso.com">Contact ↗</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Provenance is a fictional product concept for demonstration purposes.</span>
          <span>
            A project designed and built by{" "}
            <a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">
              Ariel Magalso
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
