"use client";

// Recruiter-facing proof values render immediately so the scorecard is legible
// on first paint, including when a browser delays intersection observers.
export function CountUp({ value, prefix = "", suffix = "", duration = 1200 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  return (
    <span>
      {prefix}
      {value}
      {suffix}
    </span>
  );
}
