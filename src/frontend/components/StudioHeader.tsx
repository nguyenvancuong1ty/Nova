import type { RunState } from "../../types";

interface StudioHeaderProps {
  status: RunState | null;
}

function formatStatus(status: RunState["status"] | undefined) {
  switch (status) {
    case "running":
      return "Đang xử lý";
    case "completed":
      return "Đã hoàn tất";
    case "failed":
      return "Thất bại";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Sẵn sàng khởi tạo";
  }
}

export function StudioHeader({ status }: StudioHeaderProps) {
  return (
    <section className="studio-hero">
      <div className="studio-hero__copy">
        <p className="eyebrow">Nova Studio / Phase 1 Console</p>
        <h1>Bảng điều khiển sản xuất tiểu thuyết sang gói video</h1>
        <p className="studio-hero__description">
          Không gian làm việc thống nhất cho cấu hình dự án, theo dõi run theo
          thời gian thực và mở nhanh các artifact đầu ra.
        </p>
      </div>

      <div className="studio-hero__summary">
        <article className="glass-card">
          <span className="glass-card__label">Run hiện tại</span>
          <strong>{status?.runId ?? "Chưa có run nào"}</strong>
        </article>
        <article className="glass-card">
          <span className="glass-card__label">Trạng thái</span>
          <strong>{formatStatus(status?.status)}</strong>
        </article>
      </div>
    </section>
  );
}
