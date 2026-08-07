import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // unpdf wraps pdf.js, whose internal dynamic resource loading breaks under
  // Turbopack's default server-route bundling — it doesn't throw, it just
  // silently extracts near-empty text. Opting it out of bundling (native
  // Node `require` instead) fixes this; verified locally that unpdf works
  // fine unbundled (both CJS and ESM), and fails only through the bundled
  // route. Not in Next's pre-approved auto-exempt list (see
  // serverExternalPackages docs) — @react-pdf/renderer is on it for PDF
  // *generation*, nothing covers PDF *parsing*.
  serverExternalPackages: ["unpdf"],
};

export default nextConfig;
