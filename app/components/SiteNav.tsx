"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { ArrowUpRight } from "./ButtonArrow";

const MAIN_LINKS = [
  { href: "/#overview", label: "Overview" },
  { href: "/demo", label: "Demo" },
  { href: "/architecture", label: "Engineering" },
  { href: "/evals", label: "Evidence" },
] as const;

const EXTERNAL_LINKS = [
  { href: "https://github.com/ArielMagalsoDev/provenance", label: "Source" },
  { href: "https://arielmagalso.com", label: "Ariel" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const menu = menuRef.current;
    const focusable = menu?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    focusable?.[0]?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <AnnouncementBanner />

      <div className="site-nav">
        <div className="shell">
          <div className="site-nav-frame">
            <div className="site-nav-inner">
              <nav className="nav-desktop" aria-label="Primary navigation" style={{ width: "100%", justifyContent: "space-between" }}>
                <Link className="site-brand" href="/" aria-label="Provenance home" onClick={closeMenu}>Provenance</Link>
                <div className="nav-links">
                  {MAIN_LINKS.map((link) => (
                    <Link href={link.href} key={link.href}>{link.label}</Link>
                  ))}
                  {EXTERNAL_LINKS.map((link) => (
                    <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                  ))}
                </div>
                <a className="nav-cta" href="mailto:ariel.r.magalso@gmail.com">Contact</a>
              </nav>

              <div className="nav-mobile" style={{ width: "100%", justifyContent: "space-between" }}>
                <Link className="site-brand" href="/" onClick={closeMenu}>Provenance</Link>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link className="nav-cta" href="/demo" onClick={closeMenu}>Demo</Link>
                  <button
                    ref={triggerRef}
                    className="menu-trigger"
                    type="button"
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                    aria-label={open ? "Close navigation menu" : "Open navigation menu"}
                    onClick={() => setOpen((value) => !value)}
                  >
                    <span /><span />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div ref={menuRef} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="mobile-menu-close" type="button" onClick={closeMenu} aria-label="Close navigation menu">Close</button>
          <nav aria-label="Mobile menu links">
            {[...MAIN_LINKS, { href: "/corpus", label: "Corpus" }, { href: "/inbox", label: "Inbox" }].map((link, index) => (
              <Link href={link.href} key={link.href} onClick={closeMenu}><span>{String(index + 1).padStart(2, "0")}</span>{link.label}</Link>
            ))}
          </nav>
          <div className="mobile-menu-external">
            {EXTERNAL_LINKS.map((link) => (
              <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>{link.label}<ArrowUpRight /></a>
            ))}
            <a href="mailto:ariel.r.magalso@gmail.com" onClick={closeMenu}>Email Ariel<ArrowUpRight /></a>
          </div>
        </div>
      )}
    </>
  );
}
