import type { RunState } from "../../types";

interface MetricStripProps {
  status: RunState | null;
  characterCount: number;
}

export function MetricStrip({ status, characterCount }: MetricStripProps) {
  return (
    <section className="metric-strip" aria-label="Tổng quan dự án">
      <article className="metric-card">
        <span className="metric-card__label">Tiến độ</span>
        <strong>{status ? `${status.progressPercent}%` : "0%"}</strong>
        <p>{status ? `${status.logs.length} mốc log đã ghi` : "Chưa có hoạt động"}</p>
      </article>

      <article className="metric-card">
        <span className="metric-card__label">Nhân vật</span>
        <strong>{characterCount}</strong>
        <p>Hồ sơ đang có trong cấu hình</p>
      </article>

      <article className="metric-card">
        <span className="metric-card__label">Chapter hiện tại</span>
        <strong>{status?.currentChapter ?? 0}</strong>
        <p>{status ? "Đang xử lý hoặc đã hoàn tất" : "Chờ khởi tạo run"}</p>
      </article>

      <article className="metric-card">
        <span className="metric-card__label">Ngôn ngữ UI</span>
        <strong>Tiếng Việt</strong>
        <p>Tối ưu cho vận hành nội bộ</p>
      </article>
    </section>
  );
}
