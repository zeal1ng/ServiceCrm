import { api } from './api.js';

export async function loadAccounting() {
    const [orders, transactions] = await Promise.all([
        api('/orders'),
        api('/transactions')
    ]);
    const container = document.getElementById('accounting-content');

    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-data">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
                <h2>Финансы</h2>
                <p>Нет заказов для отчёта</p>
            </div>`;
        return;
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (o.paid || 0), 0);
    const totalCost = orders.reduce((s, o) => s + (o.cost || 0), 0);
    const totalDebt = Math.max(0, totalCost - totalRevenue);
    const completed = orders.filter(o => o.status === 'Ready' || o.status === 'Issued').length;
    const inWork = orders.filter(o => o.status === 'New' || o.status === 'Diagnostics' || o.status === 'Repair').length;

    let income = 0, expense = 0;
    if (transactions) {
        transactions.forEach(t => {
            if (t.type === 'Income') income += t.amount;
            else if (t.type === 'Expense') expense += t.amount;
        });
    }

    container.innerHTML = `
        <div class="accounting-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
            <div class="stat-card"><div class="stat-value" style="color:#4caf50">${totalRevenue.toLocaleString()} ₽</div><div class="stat-label">Доход (оплачено)</div></div>
            <div class="stat-card"><div class="stat-value" style="color:#f44336">${totalDebt.toLocaleString()} ₽</div><div class="stat-label">Долг клиентов</div></div>
            <div class="stat-card"><div class="stat-value">${totalCost.toLocaleString()} ₽</div><div class="stat-label">Общая стоимость заказов</div></div>
            <div class="stat-card"><div class="stat-value">${totalOrders}</div><div class="stat-label">Всего заказов</div></div>
            <div class="stat-card"><div class="stat-value" style="color:#4caf50">${completed}</div><div class="stat-label">Выполнено</div></div>
            <div class="stat-card"><div class="stat-value" style="color:#ff9800">${inWork}</div><div class="stat-label">В работе</div></div>
        </div>
        <h3>Последние транзакции</h3>
        <div style="overflow-x:auto">
            <table class="orders-table">
                <thead><tr><th>Дата</th><th>Тип</th><th>Категория</th><th>Описание</th><th>Сумма</th><th>Заказ №</th></tr></thead>
                <tbody>
                    ${(transactions && transactions.length ? transactions.slice(-20).reverse() : []).map(t => {
                        const date = new Date(t.createdAt).toLocaleDateString('ru-RU');
                        const typeColor = t.type === 'Income' ? '#4caf50' : '#f44336';
                        const typeLabel = t.type === 'Income' ? 'Доход' : 'Расход';
                        return `<tr>
                            <td>${date}</td>
                            <td style="color:${typeColor};font-weight:600">${typeLabel}</td>
                            <td>${t.category || '-'}</td>
                            <td>${t.description || '-'}</td>
                            <td style="color:${typeColor};font-weight:600">${t.type === 'Income' ? '+' : '-'}${t.amount.toLocaleString()} ₽</td>
                            <td>#${t.orderId}</td>
                        </tr>`;
                    }).join('') || '<tr><td colspan="6" style="text-align:center;padding:32px;color:#888">Нет транзакций</td></tr>'}
                </tbody>
            </table>
        </div>
        <div style="margin-top:24px;display:flex;gap:16px;flex-wrap:wrap">
            <div style="background:#1e3a3f;padding:20px;border-radius:12px;min-width:280px;flex:1">
                <h4 style="margin:0 0 12px 0;color:#e0f2f1">Доходы / Расходы</h4>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#d1d5db">
                    <span>Доходы:</span><span style="color:#4caf50;font-weight:600">+${income.toLocaleString()} ₽</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#d1d5db">
                    <span>Расходы:</span><span style="color:#f44336;font-weight:600">-${expense.toLocaleString()} ₽</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #2a5057;color:#d1d5db">
                    <span>Прибыль:</span><span style="color:#ffc107;font-weight:600">${(income - expense).toLocaleString()} ₽</span>
                </div>
            </div>
            <div style="background:#1e3a3f;padding:20px;border-radius:12px;min-width:280px;flex:1">
                <h4 style="margin:0 0 12px 0;color:#e0f2f1">Статистика заказов</h4>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#d1d5db">
                    <span>Средний чек:</span><span style="color:#e0f2f1;font-weight:600">${totalOrders ? Math.round(totalCost / totalOrders).toLocaleString() : 0} ₽</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#d1d5db">
                    <span>Средняя оплата:</span><span style="color:#e0f2f1;font-weight:600">${totalOrders ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0} ₽</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #2a5057;color:#d1d5db">
                    <span>Процент оплат:</span><span style="color:#e0f2f1;font-weight:600">${totalCost ? Math.round(totalRevenue / totalCost * 100) : 0}%</span>
                </div>
            </div>
        </div>`;
}
