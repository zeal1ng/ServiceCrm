export default function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-data">
      <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
        <path d={icon} />
      </svg>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
