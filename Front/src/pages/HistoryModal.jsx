import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityLogs } from '../api';
import { ACTION_LABELS } from '../constants';

export default function HistoryModal() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    getActivityLogs().then(data => { if (data) setLogs(data); });
  }, []);

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) navigate(-1); }}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <h2>История действий</h2>
          <button className="modal-close" onClick={() => navigate(-1)}>&times;</button>
        </div>
        <div className="modal-body" style={{ maxHeight: 500, overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>История пока пуста</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: 10, textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Дата</th>
                  <th style={{ padding: 10, textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Пользователь</th>
                  <th style={{ padding: 10, textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Действие</th>
                  <th style={{ padding: 10, textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Объект</th>
                  <th style={{ padding: 10, textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>Детали</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => {
                  const date = new Date(l.createdAt).toLocaleString('ru-RU');
                  return <tr key={l.id}>
                    <td style={{ padding: 10, whiteSpace: 'nowrap', color: '#4b5563', borderBottom: '1px solid #f3f4f6' }}>{date}</td>
                    <td style={{ padding: 10, color: '#1f2937', borderBottom: '1px solid #f3f4f6' }}>{l.userName}</td>
                    <td style={{ padding: 10, borderBottom: '1px solid #f3f4f6' }}><span style={{ color: '#4caf50', fontWeight: 600 }}>{ACTION_LABELS[l.action] || l.action}</span></td>
                    <td style={{ padding: 10, color: '#4b5563', borderBottom: '1px solid #f3f4f6' }}>{l.entityType}{l.entityId ? ` #${l.entityId}` : ''}</td>
                    <td style={{ padding: 10, color: '#4b5563', borderBottom: '1px solid #f3f4f6' }}>{l.details || '-'}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
