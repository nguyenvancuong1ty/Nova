import type { RunState } from "../../types";

interface ProgressPanelProps {
  status: RunState | null;
}

export function ProgressPanel({ status }: ProgressPanelProps) {
  return (
    <section>
      <h2>Progress</h2>
      {status ? (
        <div
          style={{ border: "1px solid #d0d7de", padding: 16, borderRadius: 12 }}
        >
          <p>Status: {status.status}</p>
          <p>Current Step: {status.currentStep ?? "-"}</p>
          <p>
            Chapter: {status.currentChapter ?? 0} / {status.totalChapters}
          </p>
          <p>Progress: {status.progressPercent}%</p>
          <div
            aria-label="progress bar"
            style={{ background: "#e5e7eb", borderRadius: 999, height: 12 }}
          >
            <div
              style={{
                width: `${status.progressPercent}%`,
                background: "#111827",
                height: "100%",
                borderRadius: 999,
              }}
            />
          </div>
          <p>Output: {status.outputPath || "-"}</p>
        </div>
      ) : (
        <p>No production run started.</p>
      )}
    </section>
  );
}
