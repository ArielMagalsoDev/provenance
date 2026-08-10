import Link from "next/link";
import { DottedArrows } from "./DottedArrows";

export function AnnouncementBanner() {
  return (
    <div className="announcement-banner">
      <DottedArrows direction="left" />
      <span>
        Available for <b>product + AI engineering roles</b>
      </span>
      <Link href="/demo" className="announcement-link">Run the live demo →</Link>
      <DottedArrows direction="right" />
    </div>
  );
}
