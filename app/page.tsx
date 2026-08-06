import type { Metadata } from "next";
import { Demo } from "./components/Demo";

export const metadata: Metadata = {
  title: "grounded-rag",
  description: "A RAG system that answers only from source material and refuses when it can't.",
};

export default function Home() {
  return (
    <div className="flex-1 bg-white dark:bg-zinc-950">
      <Demo />
    </div>
  );
}
