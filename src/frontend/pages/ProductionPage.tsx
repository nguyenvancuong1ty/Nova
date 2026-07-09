import { useEffect, useState } from "react";
import type { RunState } from "../../types";
import { LogPanel } from "../components/LogPanel";
import { MetricStrip } from "../components/MetricStrip";
import { OutputPanel } from "../components/OutputPanel";
import { ProductionForm } from "../components/ProductionForm";
import { ProgressPanel } from "../components/ProgressPanel";
import { StudioHeader } from "../components/StudioHeader";

export function ProductionPage() {
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<RunState | null>(null);
  const [characterCount, setCharacterCount] = useState(2);

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
    <main className="studio-page">
      <StudioHeader status={status} />
      <MetricStrip status={status} characterCount={characterCount} />
      <section className="studio-workspace">
        <ProductionForm
          onStarted={setRunId}
          onCharacterCountChange={setCharacterCount}
        />
        <aside className="studio-sidebar">
          <ProgressPanel status={status} />
          <LogPanel logs={status?.logs ?? []} />
          <OutputPanel outputPath={status?.outputPath ?? ""} />
        </aside>
      </section>
    </main>
  );
}
