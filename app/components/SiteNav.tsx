"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

function SplitLabel({ children }: { children: string }) {
  return (
    <span className="split-label">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

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
      <div className="disclosure-bar">
        <span>INDEPENDENT PORTFOLIO PROJECT&nbsp;&nbsp;✦&nbsp;&nbsp;FICTIONAL WORKSPACE&nbsp;&nbsp;✦&nbsp;&nbsp;NO CUSTOMER DATA</span>
        <Link href="/demo">RUN THE LIVE DEMO&nbsp;→</Link>
      </div>
      <header className="site-header">
        <div className="shell site-header-grid">
          <nav className="desktop-nav" aria-label="Primary navigation">
            <Link className="editorial-brand" href="/" aria-label="Provenance home">provenance.</Link>
            <div className="desktop-nav-left">
              {MAIN_LINKS.map((link) => (
                <Link href={link.href} key={link.href}><SplitLabel>{link.label}</SplitLabel></Link>
              ))}
            </div>
            <div className="desktop-nav-right">
              {EXTERNAL_LINKS.map((link) => (
                <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer"><SplitLabel>{link.label}</SplitLabel></a>
              ))}
              <a className="cyan-action" href="mailto:hello@arielmagalso.com">Contact&nbsp;→</a>
            </div>
          </nav>

          <div className="mobile-nav" aria-label="Mobile navigation">
            <Link className="editorial-brand" href="/" onClick={closeMenu}>provenance.</Link>
            <Link className="cyan-action" href="/demo" onClick={closeMenu}>Demo</Link>
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
      </header>

      {open && (
        <div ref={menuRef} id="mobile-menu" className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="mobile-menu-close" type="button" onClick={closeMenu} aria-label="Close navigation menu">Close</button>
          <nav aria-label="Mobile menu links">
            {[...MAIN_LINKS, { href: "/corpus", label: "Corpus." }, { href: "/inbox", label: "Inbox." }].map((link, index) => (
              <Link href={link.href} key={link.href} onClick={closeMenu}><span>{String(index + 1).padStart(2, "0")}</span>{link.label}</Link>
            ))}
          </nav>
          <div className="mobile-menu-external">
            {EXTERNAL_LINKS.map((link) => (
              <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>{link.label} ↗</a>
            ))}
            <a href="mailto:hello@arielmagalso.com" onClick={closeMenu}>Email Ariel ↗</a>
          </div>
        </div>
      )}
    </>
  );
}
