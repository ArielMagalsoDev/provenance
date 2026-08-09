"use client";

import { useMemo, useState } from "react";

// All figures here are illustrative — user-adjustable assumptions run through a
// transparent calculation, never presented as measured customer outcomes (see
// docs/PRODUCT-PLAN.md §8). Defaults reproduce the plan's own worked example
// (600 tickets, 45% eligible, 9.3 min/ticket -> ~42 staff hours/month).
function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <label className="impact-control" style={{ display: "block" }}>
      <div className="impact-control-label" style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span className="text-body-sm" style={{ color: "var(--steel)" }}>{label}</span>
        <span className="impact-control-value text-body-sm-bold" style={{ color: "var(--ink)" }}>
          {value}
          {suffix ?? ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="impact-range"
        style={{ width: "100%", accentColor: "var(--primary)" }}
      />
    </label>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="impact-stat card-icon-feature">
      <span className="text-caption" style={{ color: "var(--stone)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <div className="text-heading-sm" style={{ marginTop: "10px" }}>
        {value}
      </div>
      {note && (
        <p className="impact-stat-note text-caption" style={{ color: "var(--steel)", marginTop: "6px" }}>
          {note}
        </p>
      )}
    </article>
  );
}

export function BusinessImpactCalculator() {
  const [ticketsPerMonth, setTicketsPerMonth] = useState(600);
  const [eligibleRate, setEligibleRate] = useState(45);
  const [minutesSaved, setMinutesSaved] = useState(9.3);
  const [staffCostPerHour, setStaffCostPerHour] = useState(35);
  const [modelCostPerRequest, setModelCostPerRequest] = useState(0.005);
  const [reviewRate, setReviewRate] = useState(18);
  const [implementationCost, setImplementationCost] = useState(10000);

  const results = useMemo(() => {
    const eligibleTickets = Math.round(ticketsPerMonth * (eligibleRate / 100));
    const staffHoursReturned = (eligibleTickets * minutesSaved) / 60;
    const monthlySavings = staffHoursReturned * staffCostPerHour;
    const monthlyModelCost = eligibleTickets * modelCostPerRequest;
    const netMonthlySavings = monthlySavings - monthlyModelCost;
    const paybackMonths = netMonthlySavings > 0 ? implementationCost / netMonthlySavings : null;
    return { eligibleTickets, staffHoursReturned, monthlySavings, monthlyModelCost, netMonthlySavings, paybackMonths };
  }, [ticketsPerMonth, eligibleRate, minutesSaved, staffCostPerHour, modelCostPerRequest, implementationCost]);

  return (
    <div className="impact-calculator card-feature" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "28px" }}>
      <div className="impact-calculator-head">
        <span className="badge" style={{ background: "var(--surface-soft)", color: "var(--steel)" }}>
          <i className="badge-dot" /> Illustrative calculator
        </span>
        <h3>Model the opportunity. Keep the assumptions visible.</h3>
        <p className="text-body-sm" style={{ color: "var(--steel)", marginTop: "14px" }}>
          Adjust the assumptions for your own operation.{" "}
          <strong style={{ color: "var(--ink)" }}>These are not measured customer results</strong> — this is a
          demonstration of the calculation, seeded with the fictional example from the product plan.
        </p>
      </div>

      <div className="impact-controls" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px 32px" }}>
        <NumberInput label="Support tickets per month" value={ticketsPerMonth} onChange={setTicketsPerMonth} min={50} max={5000} step={50} />
        <NumberInput label="Automation-eligible rate" value={eligibleRate} onChange={setEligibleRate} min={0} max={100} step={1} suffix="%" />
        <NumberInput label="Minutes saved per eligible ticket" value={minutesSaved} onChange={setMinutesSaved} min={1} max={30} step={0.1} suffix=" min" />
        <NumberInput label="Fully-loaded support cost" value={staffCostPerHour} onChange={setStaffCostPerHour} min={10} max={100} step={1} suffix="/hr" />
        <NumberInput label="Model + infra cost per request" value={modelCostPerRequest} onChange={setModelCostPerRequest} min={0.001} max={0.05} step={0.001} suffix=" USD" />
        <NumberInput label="Target human-review rate" value={reviewRate} onChange={setReviewRate} min={0} max={100} step={1} suffix="%" />
        <NumberInput label="One-time implementation cost" value={implementationCost} onChange={setImplementationCost} min={0} max={100000} step={500} suffix=" USD" />
      </div>

      <div className="impact-results" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
        <Stat label="Tickets eligible for automatic resolution" value={results.eligibleTickets.toLocaleString()} note="per month" />
        <Stat label="Staff hours potentially returned" value={results.staffHoursReturned.toFixed(1)} note="per month" />
        <Stat label="Human-review rate (target)" value={`${reviewRate}%`} note="of tickets not auto-resolved" />
        <Stat
          label="Estimated handling-cost reduction"
          value={`$${Math.round(results.monthlySavings).toLocaleString()}`}
          note="per month, before automation cost"
        />
        <Stat
          label="Estimated automation cost"
          value={`$${results.monthlyModelCost.toFixed(2)}`}
          note={`per month · ~$${modelCostPerRequest.toFixed(3)}/resolution`}
        />
        <Stat
          label="Estimated payback period"
          value={results.paybackMonths ? `${results.paybackMonths.toFixed(1)} mo` : "—"}
          note="on the one-time implementation cost"
        />
      </div>
    </div>
  );
}
