import { api } from './api.js';

export async function updateDashboard() {
    const [orders, clients] = await Promise.all([
        api('/orders'),
        api('/clients')
    ]);
    if (orders) {
        const active = orders.filter(o => o.status !== 'Готов' && o.status !== 'Выдан' && o.status !== 'Ready' && o.status !== 'Issued');
        document.getElementById('dash-active-orders').textContent = active.length;
        const today = new Date().toISOString().split('T')[0];
        const doneToday = orders.filter(o =>
            (o.status === 'Ready' || o.status === 'Готов' || o.status === 'Issued' || o.status === 'Выдан') &&
            o.createdAt && o.createdAt.startsWith(today)
        );
        document.getElementById('dash-completed-today').textContent = doneToday.length;
    }
    if (clients) {
        document.getElementById('dash-total-clients').textContent = clients.length;
    }
    if (orders) {
        const monthStart = new Date();
        monthStart.setDate(1);
        const revenue = orders
            .filter(o => o.createdAt && new Date(o.createdAt) >= monthStart)
            .reduce((sum, o) => sum + o.paid, 0);
        document.getElementById('dash-month-revenue').textContent = revenue + ' Byn';
    }
}
