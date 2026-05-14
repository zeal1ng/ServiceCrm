import { useState, useEffect } from 'react';
import { getOrders, getTransactions } from '../api';

export default function Accounting() {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    Promise.all([getOrders(), getTransactions()]).then(([o, t]) => {
      if (o) setOrders(o);
      if (t) setTransactions(t);
    });
  }, []);

  if (!orders.length) {
    return (
      <>
        <h1 className="page-title">Бухгалтерия</h1>
        <div className="empty-data">
          <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>
          <h2>Финансы</h2>
          <p>Нет заказов для отчёта</p>
        </div>
      </>
    );
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.paid || 0), 0);
  const totalCost = orders.reduce((s, o) => s + (o.cost || 0), 0);
  const totalDebt = Math.max(0, totalCost - totalRevenue);
  const completed = orders.filter(o => o.status === 'Ready' || o.status === 'Issued').length;
  const inWork = orders.filter(o => o.status === 'New' || o.status === 'Diagnostics' || o.status === 'Repair').length;

  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.type === 'Income') income += t.amount;
    else if (t.type === 'Expense') expense += t.amount;
  });

  return (
    <>
      <h1 className="page-title">Бухгалтерия</h1>
      <div className="accounting-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-value" style={{ color: '#4caf50' }}>{totalRevenue.toLocaleString()} ₽</div><div className="stat-label">Доход (оплачено)</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#f44336' }}>{totalDebt.toLocaleString()} ₽</div><div className="stat-label">Долг клиентов</div></div>
        <div className="stat-card"><div className="stat-value">{totalCost.toLocaleString()} ₽</div><div className="stat-label">Общая стоимость заказов</div></div>
        <div className="stat-card"><div className="stat-value">{totalOrders}</div><div className="stat-label">Всего заказов</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#4caf50' }}>{completed}</div><div className="stat-label">Выполнено</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: '#ff9800' }}>{inWork}</div><div className="stat-label">В работе</div></div>
      </div>
      <h3>Последние транзакции</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="orders-table">
          <thead><tr><th>Дата</th><th>Тип</th><th>Категория</th><th>Описание</th><th>Сумма</th><th>Заказ №</th></tr></thead>
          <tbody>
            {transactions.length ? transactions.slice(-20).reverse().map(t => {
              const date = new Date(t.createdAt).toLocaleDateString('ru-RU');
              const typeColor = t.type === 'Income' ? '#4caf50' : '#f44336';
              return <tr key={t.id}>
                <td>{date}</td>
                <td style={{ color: typeColor, fontWeight: 600 }}>{t.type === 'Income' ? 'Доход' : 'Расход'}</td>
                <td>{t.category || '-'}</td><td>{t.description || '-'}</td>
                <td style={{ color: typeColor, fontWeight: 600 }}>{t.type === 'Income' ? '+' : '-'}{t.amount.toLocaleString()} ₽</td>
                <td>#{t.orderId}</td>
              </tr>;
            }) : <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#888' }}>Нет транзакций</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
