import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <>
      <div className="promo-banner">
        Fictional workspace. Real automation pattern. No customer data is used. <Link href="/demo">Run the demo →</Link>
      </div>
      <div className="nav-wrap">
        <div className="shell">
          <nav className="nav-float" aria-label="Primary navigation">
            <Link className="brand" href="/" aria-label="Meridian Assist home">
              <span className="brand-mark" aria-hidden="true" />
              <span>Meridian Assist</span>
            </Link>
            <div className="nav-pills">
              <Link href="/architecture" className="pill-tab" style={{ border: "none" }}>
                How it works
              </Link>
              <Link href="/evals" className="pill-tab" style={{ border: "none" }}>
                Reliability
              </Link>
              <Link href="/corpus" className="pill-tab" style={{ border: "none" }}>
                Corpus
              </Link>
            </div>
            <div className="nav-links">
              <Button asChild variant="ink" className="!px-[20px] !py-[9px] !text-[13px]">
                <Link href="/demo">View demo</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
