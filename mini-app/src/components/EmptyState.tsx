export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">🤖</div>
      <div className="empty-title">No agents yet</div>
      <div className="empty-sub">
        Deploy your first agent. Each one gets its own wallet, its own mandate, its own spending limit.
      </div>
    </div>
  );
}
