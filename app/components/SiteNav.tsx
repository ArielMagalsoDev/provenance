"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { PROJECTS } from "@/lib/projects";
import { AnnouncementBanner } from "./AnnouncementBanner";
import { ArrowUpRight } from "./ButtonArrow";

const PROVENANCE_ORDER = PROJECTS.find((project) => project.id === "provenance")!.order;

const EXTERNAL_LINKS = [
  { href: "https://github.com/ArielMagalsoDev/provenance", label: "Source" },
  { href: "https://arielmagalso.com", label: "Ariel" },
] as const;

const RECRUITER_LINKS = [
  { href: "/#problem", label: "Problem" },
  { href: "/#automation", label: "Automation" },
  { href: "/#integrations", label: "Integrations" },
  { href: "/#industries", label: "Industries" },
  { href: "/demo", label: "Demo" },
  { href: "/evals", label: "Evidence" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
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

  useEffect(() => {
    if (pathname !== "/" || !window.location.hash) return;

    const restoreHashPosition = () => {
      const target = document.querySelector<HTMLElement>(window.location.hash);
      target?.scrollIntoView({ block: "start" });
    };

    const firstFrame = window.requestAnimationFrame(restoreHashPosition);
    const afterLayout = window.setTimeout(restoreHashPosition, 500);
    window.addEventListener("hashchange", restoreHashPosition);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.clearTimeout(afterLayout);
      window.removeEventListener("hashchange", restoreHashPosition);
    };
  }, [pathname]);

  const closeMenu = () => {
    setOpen(false);
  };
  const followNavLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    closeMenu();
    if (pathname !== "/" || !href.startsWith("/#")) return;

    const hash = href.slice(1);
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;

    event.preventDefault();
    window.history.pushState(null, "", hash);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const primaryLinks = RECRUITER_LINKS;
  const secondaryLinks = EXTERNAL_LINKS.slice(0, 1);

  return (
    <>
      <AnnouncementBanner />

      <div className="site-nav">
        <div className="shell">
          <div className="site-nav-frame">
            <i className="nav-handle nav-handle-tl" aria-hidden="true" />
            <i className="nav-handle nav-handle-tr" aria-hidden="true" />
            <i className="nav-handle nav-handle-bl" aria-hidden="true" />
            <i className="nav-handle nav-handle-br" aria-hidden="true" />
            <div className="site-nav-inner">
              <nav className="nav-desktop" aria-label="Primary navigation" style={{ width: "100%", justifyContent: "space-between" }}>
                <Link className="site-brand" href="/" aria-label="Provenance home" onClick={closeMenu}>Provenance</Link>
                <div className="nav-links">
                  {primaryLinks.map((link) => (
                    <Link href={link.href} key={link.href} onClick={(event) => followNavLink(event, link.href)}>{link.label}</Link>
                  ))}
                  {secondaryLinks.map((link) => (
                    <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                  ))}
                </div>
                <div className="nav-end-group">
                  <Link
                    className="nav-position-marker"
                    href="/#escalation"
                    onClick={(event) => followNavLink(event, "/#escalation")}
                  >
                    {PROVENANCE_ORDER} of 3 · cost of being wrong ↑
                  </Link>
                  <a className="nav-cta" href="mailto:hello@arielmagalso.com">Contact</a>
                </div>
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
            {primaryLinks.map((link, index) => (
              <Link href={link.href} key={link.href} onClick={(event) => followNavLink(event, link.href)}><span>{String(index + 1).padStart(2, "0")}</span>{link.label}</Link>
            ))}
          </nav>
          <div className="mobile-menu-external">
            {secondaryLinks.map((link) => (
              <a href={link.href} key={link.href} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>{link.label}<ArrowUpRight /></a>
            ))}
            <a href="mailto:hello@arielmagalso.com" onClick={closeMenu}>Email Ariel<ArrowUpRight /></a>
          </div>
        </div>
      )}
    </>
  );
}
