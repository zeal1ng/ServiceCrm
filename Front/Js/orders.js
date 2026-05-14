import { api } from './api.js';
import { showToast, openModal, closeModal } from './utils.js';
import { STATUSES, STATUS_LABELS, PRIORITIES, PRIORITY_LABELS, PRIORITY_COLORS } from './constants.js';
import { currentUser } from './auth.js';
import { updateDashboard } from './dashboard.js';

let _orderFilters = {};
let editOrderId = null;

function buildFilterQuery() {
    const params = new URLSearchParams();
    if (_orderFilters.status) params.set('status', _orderFilters.status);
    if (_orderFilters.dateFrom) params.set('dateFrom', _orderFilters.dateFrom);
    if (_orderFilters.dateTo) params.set('dateTo', _orderFilters.dateTo);
    if (_orderFilters.priority) params.set('priority', _orderFilters.priority);
    if (_orderFilters.search) params.set('search', _orderFilters.search);
    const qs = params.toString();
    return qs ? `/orders?${qs}` : '/orders';
}

export async function loadOrders() {
    const orders = await api(buildFilterQuery());
    const container = document.getElementById('tab-client-orders');
    const btnText = document.getElementById('btn-filter-text');
    const hasFilters = Object.keys(_orderFilters).length > 0;
    if (btnText) btnText.textContent = hasFilters ? 'Фильтры активны' : 'Фильтровать';
    document.getElementById('btn-filter')?.classList.toggle('active', hasFilters);
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-data">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                <h2>${hasFilters ? 'Ничего не найдено' : 'Заказов пока нет'}</h2>
                <p>${hasFilters ? 'Попробуйте изменить параметры фильтрации' : 'Создайте первый заказ'}</p>
            </div>`;
        return;
    }
    if (hasFilters) showToast(`Найдено заказов: ${orders.length}`, 'info');
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const canEdit = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager');
    container.innerHTML = `
        <div style="overflow-x:auto">
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Клиент</th>
                        <th>Устройство</th>
                        <th>Серийный №</th>
                        <th>Статус</th>
                        <th>Приоритет</th>
                        <th>Мастер</th>
                        <th>Сумма</th>
                        <th>Оплачено</th>
                        <th>Дата</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td>${o.id}</td>
                            <td>${o.clientName || '-'}</td>
                            <td>${o.device || '-'}</td>
                            <td>${o.serial || '-'}</td>
                            <td><span class="status-badge status-${(o.status || 'new').toLowerCase()}">${o.status || 'Новый'}</span></td>
                            <td style="color:${PRIORITY_COLORS[o.priority] || ''};font-weight:600">${PRIORITY_LABELS[o.priority] || o.priority}</td>
                            <td>${o.executorName || '-'}</td>
                            <td>${o.cost} Byn</td>
                            <td>${o.paid} Byn</td>
                            <td>${o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
                            <td style="white-space:nowrap">
                                ${canEdit ? `<button class="btn-table" onclick="openEditOrderModal(${o.id})">✎</button>` : ''}
                                ${isAdmin ? `<button class="btn-table" onclick="deleteOrder(${o.id})" style="color:#f44336">✕</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

export function openCreateOrderModal() {
    const form = `
        <div class="form-group">
            <label>Клиент *</label>
            <select id="order-clientId">
                <option value="">Выберите клиента</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Устройство *</label>
                <input type="text" id="order-device" placeholder="iPhone 12">
            </div>
            <div class="form-group">
                <label>Серийный номер</label>
                <input type="text" id="order-serial" placeholder="IMEI/SN">
            </div>
        </div>
        <div class="form-group">
            <label>Неисправность *</label>
            <textarea id="order-issue" placeholder="Опишите проблему"></textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Приоритет</label>
                <select id="order-priority">
                    <option value="Normal">Обычный</option>
                    <option value="High">Срочно</option>
                    <option value="VIP">VIP</option>
                </select>
            </div>
            <div class="form-group">
                <label>Стоимость</label>
                <input type="number" id="order-cost" placeholder="0" step="0.01">
            </div>
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="order-comment" placeholder="Дополнительная информация"></textarea>
        </div>`;
    openModal('Создание заказа', form, saveOrder);
    loadClientSelect();
}

export async function loadClientSelect() {
    const clients = await api('/clients');
    const sel = document.getElementById('order-clientId');
    if (clients) {
        sel.innerHTML = '<option value="">Выберите клиента</option>' +
            clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
}

async function saveOrder() {
    const clientId = document.getElementById('order-clientId')?.value;
    const device = document.getElementById('order-device')?.value;
    const serial = document.getElementById('order-serial')?.value;
    const issue = document.getElementById('order-issue')?.value;
    const priority = document.getElementById('order-priority')?.value;
    const cost = parseFloat(document.getElementById('order-cost')?.value) || 0;
    const comment = document.getElementById('order-comment')?.value;

    if (!clientId || !device || !issue) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }
    const result = await api('/orders', {
        method: 'POST',
        body: JSON.stringify({ clientId: parseInt(clientId), device, serial, issue, priority, cost, comment })
    });
    if (result) {
        showToast('Заказ создан!', 'success');
        closeModal();
        loadOrders();
        updateDashboard();
    }
}

export async function deleteOrder(id) {
    if (!confirm('Удалить заказ?')) return;
    const result = await api(`/orders/${id}`, { method: 'DELETE' });
    if (result !== null) { showToast('Заказ удалён', 'success'); loadOrders(); updateDashboard(); }
}

export async function openEditOrderModal(id) {
    const order = await api(`/orders/${id}`);
    if (!order) return;

    const clients = await api('/clients');
    const clientOpts = (clients || []).map(c =>
        `<option value="${c.id}" ${c.id === order.clientId ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    const statusOpts = STATUSES.map(s =>
        `<option value="${s}" ${order.status === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`
    ).join('');

    const priorityOpts = PRIORITIES.map(p =>
        `<option value="${p}" ${order.priority === p ? 'selected' : ''}>${PRIORITY_LABELS[p]}</option>`
    ).join('');

    const form = `
        <div class="form-group">
            <label>Клиент</label>
            <select id="edit-order-clientId">${clientOpts}</select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Устройство</label>
                <input type="text" id="edit-order-device" value="${order.device || ''}">
            </div>
            <div class="form-group">
                <label>Серийный №</label>
                <input type="text" id="edit-order-serial" value="${order.serial || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>Неисправность</label>
            <textarea id="edit-order-issue">${order.issue || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Диагноз</label>
            <textarea id="edit-order-diagnosis">${order.diagnosis || ''}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Статус</label>
                <select id="edit-order-status">${statusOpts}</select>
            </div>
            <div class="form-group">
                <label>Приоритет</label>
                <select id="edit-order-priority">${priorityOpts}</select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Стоимость</label>
                <input type="number" id="edit-order-cost" value="${order.cost}" step="0.01">
            </div>
            <div class="form-group">
                <label>Оплачено</label>
                <input type="number" id="edit-order-paid" value="${order.paid}" step="0.01">
            </div>
        </div>`;

    editOrderId = id;
    openModal('Редактирование заказа', form, saveEditOrder);
}

async function saveEditOrder() {
    const id = editOrderId;
    const body = {
        clientId: parseInt(document.getElementById('edit-order-clientId')?.value) || 0,
        device: document.getElementById('edit-order-device')?.value,
        serial: document.getElementById('edit-order-serial')?.value,
        issue: document.getElementById('edit-order-issue')?.value,
        diagnosis: document.getElementById('edit-order-diagnosis')?.value,
        status: document.getElementById('edit-order-status')?.value || 'New',
        priority: document.getElementById('edit-order-priority')?.value || 'Normal',
        cost: parseFloat(document.getElementById('edit-order-cost')?.value) || 0,
        paid: parseFloat(document.getElementById('edit-order-paid')?.value) || 0
    };
    const result = await api(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    if (result !== null) {
        showToast('Заказ обновлён', 'success');
        closeModal();
        loadOrders();
        updateDashboard();
    }
}

export async function searchOrders() {
    const query = document.getElementById('order-search').value.trim();
    _orderFilters.search = query || undefined;
    document.getElementById('order-search').value = _orderFilters.search || '';
    loadOrders();
}

export function openFilterPanel() {
    const selStatus = _orderFilters.status || '';
    const selPriority = _orderFilters.priority || '';
    const filters = `
        <div class="form-group">
            <label>Статус</label>
            <select id="filter-status">
                <option value="">Все статусы</option>
                ${STATUSES.map(s => `<option value="${s}" ${s === selStatus ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Приоритет</label>
            <select id="filter-priority">
                <option value="">Все приоритеты</option>
                ${PRIORITIES.map(p => `<option value="${p}" ${p === selPriority ? 'selected' : ''}>${PRIORITY_LABELS[p]}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Дата с</label>
                <input type="date" id="filter-date-from" value="${_orderFilters.dateFrom || ''}">
            </div>
            <div class="form-group">
                <label>Дата по</label>
                <input type="date" id="filter-date-to" value="${_orderFilters.dateTo || ''}">
            </div>
        </div>
        <button class="btn btn-secondary" onclick="resetFilters()" style="width:100%;margin-top:8px">Сбросить фильтры</button>`;
    openModal('Фильтры', filters, applyFilters);
}

export function applyFilters() {
    _orderFilters.status = document.getElementById('filter-status')?.value || '';
    _orderFilters.priority = document.getElementById('filter-priority')?.value || '';
    _orderFilters.dateFrom = document.getElementById('filter-date-from')?.value || '';
    _orderFilters.dateTo = document.getElementById('filter-date-to')?.value || '';

    if (!_orderFilters.status) delete _orderFilters.status;
    if (!_orderFilters.priority) delete _orderFilters.priority;
    if (!_orderFilters.dateFrom) delete _orderFilters.dateFrom;
    if (!_orderFilters.dateTo) delete _orderFilters.dateTo;

    closeModal();
    loadOrders();
}

export function resetFilters() {
    _orderFilters = {};
    document.getElementById('order-search').value = '';
    closeModal();
    loadOrders();
}
