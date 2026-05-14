import { useState, useEffect, useRef } from 'react';
import { getOrders, getClients } from '../api';

export default function Dashboard() {
  const [data, setData] = useState({ orders: [], clients: [] });
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  };

  useEffect(() => {
    Promise.all([getOrders(), getClients()]).then(([orders, clients]) => {
      setData({ orders: orders || [], clients: clients || [] });
    });
  }, []);

  const { orders, clients } = data;
  const active = orders.filter(o => o.status !== 'Готов' && o.status !== 'Выдан' && o.status !== 'Ready' && o.status !== 'Issued');
  const today = new Date().toISOString().split('T')[0];
  const doneToday = orders.filter(o =>
    (o.status === 'Ready' || o.status === 'Готов' || o.status === 'Issued' || o.status === 'Выдан') &&
    o.completedAt && o.completedAt.startsWith(today)
  );
  const monthStart = new Date();
  monthStart.setDate(1);
  const revenue = orders
    .filter(o => o.createdAt && new Date(o.createdAt) >= monthStart)
    .reduce((sum, o) => sum + o.paid, 0);

  return (
    <>
      <h1 className="page-title">Главная панель</h1>
      <div className="dashboard-cards">
        <div className="dash-card card-blue">
          <div className="dash-card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
          </div>
          <div className="dash-card-content">
            <span className="dash-card-value">{active.length}</span>
            <span className="dash-card-label">Активных заказов</span>
          </div>
        </div>
        <div className="dash-card card-green">
          <div className="dash-card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
          </div>
          <div className="dash-card-content">
            <span className="dash-card-value">{doneToday.length}</span>
            <span className="dash-card-label">Выполнено сегодня</span>
          </div>
        </div>
        <div className="dash-card card-purple">
          <div className="dash-card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
          </div>
          <div className="dash-card-content">
            <span className="dash-card-value">{clients.length}</span>
            <span className="dash-card-label">Клиентов в базе</span>
          </div>
        </div>
        <div className="dash-card card-pink">
          <div className="dash-card-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>
          </div>
          <div className="dash-card-content">
            <span className="dash-card-value">{revenue} Byn</span>
            <span className="dash-card-label">Выручка за месяц</span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <img src="/gojo/gojo-gojo-satoru.gif" alt="gojo" onClick={toggleMusic} style={{ maxWidth: 600, width: '100%', borderRadius: 12, cursor: 'pointer' }} />
        <audio ref={audioRef} src="/gojo/gojo-music.mp3" />
      </div>
    </>
  );
}
