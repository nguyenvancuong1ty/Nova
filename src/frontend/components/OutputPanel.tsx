interface OutputPanelProps {
  outputPath: string;
}

export function OutputPanel({ outputPath }: OutputPanelProps) {
  return (
    <section className="output-card">
      <p className="eyebrow">Đầu ra hiện tại</p>
      <h2>Artifact chính</h2>
      <p className="output-card__path">
        {outputPath || "Chưa có đường dẫn output."}
      </p>
      <div className="output-card__actions">
        <button type="button" className="secondary-action secondary-action--dark">
          Mở thư mục output
        </button>
        <button type="button" className="secondary-action secondary-action--dark">
          Sao chép đường dẫn
        </button>
      </div>
    </section>
  );
}
