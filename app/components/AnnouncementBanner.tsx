import Link from "next/link";
import { DottedArrows } from "./DottedArrows";

export function AnnouncementBanner() {
  return (
    <div className="announcement-banner">
      <svg className="announcement-notch-shape" viewBox="0 0 390 36" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0H390C350 0 355 36 312 36H78C35 36 40 0 0 0Z" />
      </svg>
      <DottedArrows direction="left" />
      <span>
        Open to <b>product + AI engineering roles</b>
      </span>
      <Link href="/demo" className="announcement-link">Run the live demo →</Link>
      <DottedArrows direction="right" />
    </div>
  );
}
