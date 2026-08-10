import Link from "next/link";
import { DottedArrows } from "./DottedArrows";

export function AnnouncementBanner() {
  return (
    <div className="announcement-banner">
      <DottedArrows direction="left" />
      <span>
        Independent portfolio project <b>· fictional workspace · no customer data</b>
      </span>
      <Link href="/demo" style={{ color: "var(--primary)", flexShrink: 0 }}>Run the live demo →</Link>
      <DottedArrows direction="right" />
    </div>
  );
}
