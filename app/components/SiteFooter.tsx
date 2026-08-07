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
              A fictional support-automation concept — cited answers, human review, and a real audit trail.
            </p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <h4>Product</h4>
              <Link href="/demo">Guided demo</Link>
              <Link href="/architecture">Architecture</Link>
            </div>
            <div className="footer-col">
              <h4>Evidence</h4>
              <Link href="/corpus">Policy corpus</Link>
              <Link href="/evals">Eval scorecard</Link>
            </div>
            <div className="footer-col">
              <h4>More</h4>
              <a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer">
                Source code
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Provenance is a fictional product concept for demonstration purposes.</span>
          <span>
            Built by:{" "}
            <a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer">
              Ariel Magalso
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
