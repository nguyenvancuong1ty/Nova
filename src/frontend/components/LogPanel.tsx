interface LogPanelProps {
  logs: string[];
}

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <section>
      <h2>Logs</h2>
      <div
        style={{
          maxHeight: 220,
          overflow: "auto",
          border: "1px solid #d0d7de",
          padding: 12,
          borderRadius: 12,
        }}
      >
        {logs.length > 0 ? (
          logs.slice(-12).map((log) => (
            <p key={log} style={{ margin: "0 0 8px" }}>
              {log}
            </p>
          ))
        ) : (
          <p>No logs yet.</p>
        )}
      </div>
    </section>
  );
}
