import { useEffect, useState } from "react";
import type { RunState } from "../../types";
import { LogPanel } from "../components/LogPanel";
import { ProductionForm } from "../components/ProductionForm";
import { ProgressPanel } from "../components/ProgressPanel";

export function ProductionPage() {
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<RunState | null>(null);

  useEffect(() => {
    if (!runId) {
      return;
    }

    let cancelled = false;
    const poll = async () => {
      const response = await fetch(`/api/production/status/${runId}`);
      if (!response.ok || cancelled) {
        return;
      }
      const payload = (await response.json()) as RunState;
      setStatus(payload);
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 1500);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [runId]);

  return (
    <main
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "32px 20px 48px",
        display: "grid",
        gap: 24,
      }}
    >
      <header>
        <h1>Nova Phase 1</h1>
        <p>
          Novel-to-video script production engine for deterministic Phase 1
          output generation.
        </p>
      </header>
      <ProductionForm onStarted={setRunId} />
      <ProgressPanel status={status} />
      <LogPanel logs={status?.logs ?? []} />
    </main>
  );
}
