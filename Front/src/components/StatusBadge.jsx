export default function StatusBadge({ status }) {
  const cls = (status || 'new').toLowerCase();
  return <span className={`status-badge status-${cls}`}>{status || 'Новый'}</span>;
}
