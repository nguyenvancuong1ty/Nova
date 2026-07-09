import type { RunState } from "../../types";

interface ProgressPanelProps {
  status: RunState | null;
}

export function ProgressPanel({ status }: ProgressPanelProps) {
  return (
    <section className="status-card">
      <p className="eyebrow">Run monitor</p>
      <h2>{status ? "Đang xử lý" : "Chưa có run nào được bắt đầu"}</h2>
      {status ? (
        <>
          <p>Trạng thái: {status.status}</p>
          <p>Bước hiện tại: {status.currentStep ?? "-"}</p>
          <p>
            Chapter: {status.currentChapter ?? 0} / {status.totalChapters}
          </p>
          <div className="progress-track" aria-label="Thanh tiến độ">
            <div
              className="progress-track__bar"
              style={{ width: `${status.progressPercent}%` }}
            />
          </div>
          <p>{status.progressPercent}% hoàn tất</p>
        </>
      ) : (
        <p>Khởi tạo một cấu hình ở cột trái để bắt đầu run mới.</p>
      )}
    </section>
  );
}
