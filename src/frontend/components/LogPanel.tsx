interface LogPanelProps {
  logs: string[];
}

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <section className="log-card">
      <p className="eyebrow">Log trực tiếp</p>
      <h2>Nhật ký xử lý</h2>
      <div className="log-card__body">
        {logs.length > 0 ? (
          logs.slice(-12).map((log) => (
            <p key={log} className="log-line">
              {log}
            </p>
          ))
        ) : (
          <p>Chưa có log nào được ghi.</p>
        )}
      </div>
    </section>
  );
}
