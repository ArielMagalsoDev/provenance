import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <>
      <div className="promo-banner">
        Independent portfolio project. Fictional workspace. No customer data. <Link href="/demo">Run the live demo →</Link>
      </div>
      <div className="nav-wrap">
        <div className="shell">
          <nav className="nav-float" aria-label="Primary navigation">
            <Link className="brand" href="/" aria-label="Provenance home">
              <span className="brand-mark" aria-hidden="true" />
              <span>Provenance</span>
            </Link>
            <div className="nav-pills">
              <Link href="/#overview" className="pill-tab" style={{ border: "none" }}>Overview</Link>
              <Link href="/#demo" className="pill-tab" style={{ border: "none" }}>Demo</Link>
              <Link href="/#engineering" className="pill-tab" style={{ border: "none" }}>Engineering</Link>
              <Link href="/#evidence" className="pill-tab" style={{ border: "none" }}>Evidence</Link>
              <a href="https://github.com/ArielMagalsoDev/provenance" target="_blank" rel="noopener noreferrer" className="pill-tab" style={{ border: "none" }}>Source ↗</a>
              <a href="https://arielmagalso.com" target="_blank" rel="noopener noreferrer" className="pill-tab" style={{ border: "none" }}>Ariel Magalso ↗</a>
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
