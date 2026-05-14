// ==================== API ====================
const API_BASE = 'http://localhost:5224/api';
let currentUser = null;

const STATUSES = ['New', 'Diagnostics', 'Repair', 'Ready', 'Issued'];
const STATUS_LABELS = { New: 'Новый', Diagnostics: 'На диагностике', Repair: 'В ремонте', Ready: 'Готов', Issued: 'Выдан' };
const PRIORITIES = ['Normal', 'High', 'VIP'];
const PRIORITY_LABELS = { Normal: 'Обычный', High: 'Срочно', VIP: 'VIP' };
const PRIORITY_COLORS = { Normal: '', High: '#ff9800', VIP: '#f44336' };
const ROLE_NAMES = { Admin: 'Администратор', Master: 'Мастер', Manager: 'Менеджер' };

function validatePhone(phone) {
    return /^[\+\d\s\-\(\)]{6,20}$/.test(phone);
}
function validateEmail(email) {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getToken() { return localStorage.getItem('token'); }
function setToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
}
function authHeaders() {
    const t = getToken();
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}
async function api(url, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers: { ...authHeaders(), ...options.headers }
        });
        if (res.status === 401) {
            showToast('Сессия истекла, войдите снова', 'error');
            setToken(null);
            return null;
        }
        if (!res.ok) {
            const err = await res.text().catch(() => 'Ошибка запроса');
            showToast(err, 'error');
            return null;
        }
        if (res.status === 204) return true;
        return await res.json();
    } catch (e) {
        showToast('Ошибка соединения с сервером', 'error');
        return null;
    }
}

// ==================== АВТОРИЗАЦИЯ ====================
function checkAuth() {
    if (getToken()) {
        loadProfile();
        return;
    }
    document.getElementById('login-overlay').classList.add('active');
}

async function login() {
    const name = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-password').value;
    if (!name || !password) { showToast('Введите имя и пароль', 'error'); return; }

    const result = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ name, password })
    });
    if (result && result.token) {
        setToken(result.token);
        document.getElementById('login-overlay').classList.remove('active');
        showToast('Вход выполнен', 'success');
        loadProfile();
    }
}

function switchLoginTab(tab) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.login-tab[onclick*="${tab}"]`).classList.add('active');
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('order-form').style.display = tab === 'order' ? 'block' : 'none';
    document.getElementById('login-error').textContent = '';
}

async function submitPublicOrder() {
    const name = document.getElementById('public-client-name').value.trim();
    const phone = document.getElementById('public-client-phone').value.trim();
    const device = document.getElementById('public-device').value.trim();
    const serial = document.getElementById('public-serial').value.trim();
    const issue = document.getElementById('public-issue').value.trim();
    if (!name || !phone) { showToast('Заполните имя и телефон', 'error'); return; }
    const result = await api('/public/order', {
        method: 'POST',
        body: JSON.stringify({ clientName: name, clientPhone: phone, device, serial, issue })
    });
    if (result) {
        showToast(`Заказ №${result.orderId} принят!`, 'success');
        document.getElementById('public-client-name').value = '';
        document.getElementById('public-client-phone').value = '';
        document.getElementById('public-device').value = '';
        document.getElementById('public-serial').value = '';
        document.getElementById('public-issue').value = '';
    }
}

async function register() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    if (!name || !password) { showToast('Заполните имя и пароль', 'error'); return; }

    const result = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
    if (result && result.token) {
        setToken(result.token);
        document.getElementById('login-overlay').classList.remove('active');
        showToast('Регистрация успешна', 'success');
        loadProfile();
    }
}

function logout() {
    setToken(null);
    currentUser = null;
    document.getElementById('login-overlay').classList.add('active');
    showToast('Вы вышли из системы', 'info');
}

async function loadProfile() {
    const user = await api('/profile/me');
    if (user) {
        currentUser = user;
        document.querySelector('.user-info h3').textContent = user.userName || user.username || 'Пользователь';
        document.querySelector('.user-info .role').textContent = ROLE_NAMES[user.role] || user.role;

        document.querySelectorAll('.nav-item[data-roles]').forEach(item => {
            const allowed = item.dataset.roles.split(',');
            if (!allowed.includes(user.role)) item.style.display = 'none';
        });
    }
}

// ==================== НАВИГАЦИЯ ====================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        const pageName = this.dataset.page;
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) targetPage.classList.add('active');
        loadPageData(pageName);
    });
});

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const tabName = this.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        const targetContent = document.getElementById(`tab-${tabName}`);
        if (targetContent) targetContent.classList.add('active');
    });
});

// ==================== МОДАЛЬНЫЕ ОКНА ====================
function openModal(title, content, onSave) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
    window.currentOnSave = onSave;
}
function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-overlay').classList.remove('active');
    window.currentOnSave = null;
}
function saveModal() {
    if (window.currentOnSave) window.currentOnSave();
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});

// ==================== ДАШБОРД ====================
async function updateDashboard() {
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
        document.getElementById('dash-month-revenue').textContent = revenue + ' Br';
    }
}

// ==================== ЗАКАЗЫ ====================
async function loadOrders() {
    const orders = await api('/orders');
    const container = document.getElementById('tab-client-orders');
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-data">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                <h2>Заказов пока нет</h2>
                <p>Создайте первый заказ</p>
            </div>`;
        return;
    }
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
                            <td>${o.cost} Br</td>
                            <td>${o.paid} Br</td>
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

function openCreateOrderModal() {
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

async function loadClientSelect() {
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

async function deleteOrder(id) {
    if (!confirm('Удалить заказ?')) return;
    const result = await api(`/orders/${id}`, { method: 'DELETE' });
    if (result !== null) { showToast('Заказ удалён', 'success'); loadOrders(); updateDashboard(); }
}

async function openEditOrderModal(id) {
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

    window._editOrderId = id;
    openModal('Редактирование заказа', form, saveEditOrder);
}

async function saveEditOrder() {
    const id = window._editOrderId;
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

// ==================== КЛИЕНТЫ ====================
async function loadClients() {
    const clients = await api('/clients');
    const container = document.getElementById('page-clients');
    const btn = document.getElementById('btn-create-client');
    if (btn) {
        btn.style.display = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager') ? '' : 'none';
    }
    const content = container.querySelector('.page-header')?.nextElementSibling || container.querySelector('.empty-data');
    if (!clients || clients.length === 0) {
        if (content && content.classList.contains('empty-data')) return;
        container.innerHTML += `
            <div class="empty-data">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                <h2>Клиентов пока нет</h2>
                <p>Добавьте первого клиента</p>
            </div>`;
        return;
    }
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const canEdit = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager');
    const header = container.querySelector('.page-header')?.outerHTML || '';
    container.innerHTML = header + `
        <div style="overflow-x:auto">
            <table class="orders-table">
                <thead><tr><th>№</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Комментарий</th><th>Дата</th>${canEdit ? '<th></th>' : ''}</tr></thead>
                <tbody>
                    ${clients.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.name}</td>
                            <td>${c.phone || '-'}</td>
                            <td>${c.email || '-'}</td>
                            <td>${c.comment || '-'}</td>
                            <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                            <td>${canEdit ? `<button class="btn-table" onclick="openEditClientModal(${c.id})">✎</button>${isAdmin ? `<button class="btn-table" onclick="deleteClient(${c.id})" style="color:#f44336">✕</button>` : ''}` : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

function openCreateClientModal() {
    const form = `
        <div class="form-group">
            <label>ФИО *</label>
            <input type="text" id="client-name" placeholder="Иванов Иван Иванович">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Телефон *</label>
                <input type="tel" id="client-phone" placeholder="+375 (___) ___-__-__">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="client-email" placeholder="email@example.com">
            </div>
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="client-comment" placeholder="Дополнительная информация"></textarea>
        </div>`;
    openModal('Добавление клиента', form, saveClient);
}

async function saveClient() {
    const name = document.getElementById('client-name')?.value;
    const phone = document.getElementById('client-phone')?.value;
    const email = document.getElementById('client-email')?.value;
    const comment = document.getElementById('client-comment')?.value;
    if (!name || !phone) { showToast('Заполните обязательные поля', 'error'); return; }
    if (!validatePhone(phone)) { showToast('Неверный формат телефона', 'error'); return; }
    if (!validateEmail(email)) { showToast('Неверный формат email', 'error'); return; }
    const result = await api('/clients', {
        method: 'POST',
        body: JSON.stringify({ name, phone, email, comment })
    });
    if (result) {
        showToast('Клиент добавлен!', 'success');
        closeModal();
        loadClients();
        updateDashboard();
    }
}

async function deleteClient(id) {
    if (!confirm('Удалить клиента?')) return;
    const result = await api(`/clients/${id}`, { method: 'DELETE' });
    if (result !== false) {
        showToast('Клиент удалён', 'success');
        loadClients();
        updateDashboard();
    }
}

async function openEditClientModal(id) {
    const clients = await api('/clients');
    const client = clients.find(c => c.id === id);
    if (!client) return;
    const form = `
        <div class="form-group">
            <label>ФИО *</label>
            <input type="text" id="edit-client-name" value="${client.name}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="edit-client-phone" value="${client.phone || ''}">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="edit-client-email" value="${client.email || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="edit-client-comment">${client.comment || ''}</textarea>
        </div>`;
    openModal('Редактирование клиента', form, () => saveEditClient(id));
}

async function saveEditClient(id) {
    const name = document.getElementById('edit-client-name')?.value;
    const phone = document.getElementById('edit-client-phone')?.value;
    const email = document.getElementById('edit-client-email')?.value;
    const comment = document.getElementById('edit-client-comment')?.value;
    if (!name) { showToast('Введите имя клиента', 'error'); return; }
    if (phone && !validatePhone(phone)) { showToast('Неверный формат телефона', 'error'); return; }
    if (!validateEmail(email)) { showToast('Неверный формат email', 'error'); return; }
    const result = await api(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, phone, email, comment })
    });
    if (result !== false) {
        showToast('Клиент обновлён', 'success');
        closeModal();
        loadClients();
    }
}

// ==================== ТОВАРЫ ====================
async function loadProducts() {
    const warehouseFilter = window._warehouseFilter;
    const products = await api(warehouseFilter ? `/products?warehouseId=${warehouseFilter.id}` : '/products');
    const container = document.getElementById('page-products');
    const btn = document.getElementById('btn-create-product');
    if (btn) {
        btn.style.display = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Master') ? '' : 'none';
    }
    const backBtn = warehouseFilter
        ? `<button class="btn" onclick="goBackToWarehouses()" style="margin-right:12px">← Назад к складам</button>`
        : '';
    const title = warehouseFilter ? `Товары склада: ${warehouseFilter.name}` : 'Товары';
    const header = `<div class="page-header"><h1 class="page-title">${backBtn}${title}</h1>${btn ? btn.outerHTML : ''}</div>`;
    if (!products || products.length === 0) {
        container.innerHTML = header + `
            <div class="empty-data">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                <h2>Товаров пока нет</h2>
                <p>Добавьте первый товар</p>
            </div>`;
        return;
    }
    container.innerHTML = header + `
        <div style="overflow-x:auto">
            <table class="orders-table">
                <thead><tr><th>№</th><th>Название</th><th>Количество</th><th>Склад</th><th></th></tr></thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${p.name}</td>
                            <td>${p.quantity}</td>
                            <td>${p.warehouseName || '-'}</td>
                            <td style="white-space:nowrap">${currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Master') ? `
                                <button class="btn-table" onclick="openEditProductModal(${p.id})">✎</button>
                                <button class="btn-table" onclick="deleteProduct(${p.id})" style="color:#f44336">✕</button>
                            ` : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

function openCreateProductModal() {
    const wh = window._warehouseFilter;
    const whSelected = wh ? wh.id : '';
    const form = `
        <div class="form-group">
            <label>Название товара *</label>
            <input type="text" id="product-name" placeholder="Дисплей iPhone 12">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Количество *</label>
                <input type="number" id="product-quantity" placeholder="1" min="0">
            </div>
            <div class="form-group">
                <label>Склад</label>
                <select id="product-warehouse">
                    <option value="">Без склада</option>
                </select>
            </div>
        </div>`;
    openModal('Добавление товара', form, saveProduct);
    setTimeout(() => {
        loadWarehouseSelect();
        if (whSelected) document.getElementById('product-warehouse').value = whSelected;
    }, 100);
}

async function loadWarehouseSelect() {
    const warehouses = await api('/warehouses');
    const sel = document.getElementById('product-warehouse');
    if (warehouses) {
        sel.innerHTML = '<option value="">Без склада</option>' +
            warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    }
}

async function saveProduct() {
    const name = document.getElementById('product-name')?.value;
    const quantity = parseInt(document.getElementById('product-quantity')?.value) || 0;
    const warehouseId = parseInt(document.getElementById('product-warehouse')?.value) || null;
    if (!name || !quantity) { showToast('Заполните обязательные поля', 'error'); return; }
    const result = await api('/products', {
        method: 'POST',
        body: JSON.stringify({ name, quantity, warehouseId })
    });
    if (result) {
        showToast('Товар добавлен!', 'success');
        closeModal();
        loadProducts();
    }
}

async function openEditProductModal(id) {
    const products = await api('/products');
    const p = products.find(x => x.id === id);
    if (!p) return;
    const warehouses = await api('/warehouses');
    const whOpts = '<option value="">Без склада</option>' +
        (warehouses || []).map(w => `<option value="${w.id}" ${w.id === p.warehouseId ? 'selected' : ''}>${w.name}</option>`).join('');
    const form = `
        <div class="form-group">
            <label>Название товара *</label>
            <input type="text" id="edit-product-name" value="${p.name}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Количество *</label>
                <input type="number" id="edit-product-quantity" value="${p.quantity}" min="0">
            </div>
            <div class="form-group">
                <label>Склад</label>
                <select id="edit-product-warehouse">${whOpts}</select>
            </div>
        </div>`;
    openModal('Редактирование товара', form, () => saveEditProduct(id));
}

async function saveEditProduct(id) {
    const name = document.getElementById('edit-product-name')?.value;
    const quantity = parseInt(document.getElementById('edit-product-quantity')?.value) || 0;
    const warehouseId = parseInt(document.getElementById('edit-product-warehouse')?.value) || null;
    if (!name || !quantity) { showToast('Заполните обязательные поля', 'error'); return; }
    const result = await api(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, quantity, warehouseId })
    });
    if (result !== false) {
        showToast('Товар обновлён', 'success');
        closeModal();
        loadProducts();
    }
}

async function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    const result = await api(`/products/${id}`, { method: 'DELETE' });
    if (result !== false) {
        showToast('Товар удалён', 'success');
        loadProducts();
    }
}

// ==================== СКЛАДЫ ====================
async function loadWarehouses() {
    const warehouses = await api('/warehouses');
    const container = document.getElementById('page-warehouses');
    const header = container.querySelector('.page-header')?.outerHTML || '';
    if (!warehouses || warehouses.length === 0) {
        container.innerHTML = header + `
            <div class="empty-data">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                <h2>Складов пока нет</h2>
                <p>Добавьте первый склад</p>
            </div>`;
        return;
    }
    container.innerHTML = header + `
        <div style="overflow-x:auto">
            <table class="orders-table">
                <thead><tr><th>№</th><th>Название</th><th>Адрес</th><th>Ответственный</th></tr></thead>
                <tbody>
                    ${warehouses.map(w => `
                        <tr onclick="showWarehouseProducts(${w.id},'${w.name}')" style="cursor:pointer">
                            <td>${w.id}</td>
                            <td>${w.name}</td>
                            <td>${w.address || '-'}</td>
                            <td>${w.managerName || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

function showWarehouseProducts(warehouseId, warehouseName) {
    window._warehouseFilter = { id: warehouseId, name: warehouseName };
    document.querySelector('.nav-item[data-page="products"]').click();
}

function goBackToWarehouses() {
    window._warehouseFilter = null;
    document.querySelector('.nav-item[data-page="warehouses"]').click();
}

function openCreateWarehouseModal() {
    const form = `
        <div class="form-group">
            <label>Название склада *</label>
            <input type="text" id="warehouse-name" placeholder="Основной склад">
        </div>
        <div class="form-group">
            <label>Адрес</label>
            <textarea id="warehouse-address" placeholder="Город, улица..."></textarea>
        </div>
        <div class="form-group">
            <label>Ответственный</label>
            <select id="warehouse-userId">
                <option value="">Выберите ответственного</option>
            </select>
        </div>`;
    openModal('Добавление склада', form, saveWarehouse);
    loadManagerSelect();
}

async function loadManagerSelect() {
    const users = await api('/users');
    const sel = document.getElementById('warehouse-userId');
    if (users) {
        sel.innerHTML = '<option value="">Выберите ответственного</option>' +
            users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }
}

async function saveWarehouse() {
    const name = document.getElementById('warehouse-name')?.value;
    const address = document.getElementById('warehouse-address')?.value;
    const userId = parseInt(document.getElementById('warehouse-userId')?.value) || 0;
    if (!name) { showToast('Введите название склада', 'error'); return; }
    const result = await api('/warehouses', {
        method: 'POST',
        body: JSON.stringify({ name, address, userId })
    });
    if (result) {
        showToast('Склад добавлен!', 'success');
        closeModal();
        loadWarehouses();
    }
}

// ==================== СОТРУДНИКИ ====================
async function loadEmployees() {
    if (!currentUser) await loadProfile();
    const users = await api('/users');
    const container = document.getElementById('page-employees');
    const header = container.querySelector('.page-header')?.outerHTML || '';
    if (!users || users.length === 0) {
        container.innerHTML = header + `
            <div class="empty-data">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                <h2>Сотрудников пока нет</h2>
                <p>Добавьте первого сотрудника</p>
            </div>`;
        return;
    }
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const filtered = isAdmin ? users : users.filter(u => u.role !== 'Admin');
    container.innerHTML = header + `
        <div style="overflow-x:auto">
            <table class="orders-table">
                <thead><tr><th>№</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Роль</th><th>Специализация</th><th>%</th><th></th></tr></thead>
                <tbody>
                    ${filtered.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.name}</td>
                            <td>${u.phone || '-'}</td>
                            <td>${u.email || '-'}</td>
                            <td>${ROLE_NAMES[u.role] || u.role}</td>
                            <td>${u.specialization || '-'}</td>
                            <td>${u.comission_percent}%</td>
                            <td style="white-space:nowrap">
                                ${isAdmin || currentUser?.id == u.id ? `<button class="btn-table" onclick="openEditEmployeeModal(${u.id})">✎</button>` : ''}
                                ${isAdmin && currentUser?.id != u.id ? `<button class="btn-table" onclick="deleteEmployee(${u.id},'${u.name}')" style="color:#f44336">✕</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

function openCreateEmployeeModal() {
    const form = `
        <div class="form-group">
            <label>ФИО *</label>
            <input type="text" id="employee-name" placeholder="Иванов Иван Иванович">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="employee-phone" placeholder="+375 (___) ___-__-__">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="employee-email" placeholder="email@example.com">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Пароль *</label>
                <input type="password" id="employee-password" placeholder="Пароль для входа">
            </div>
            <div class="form-group">
                <label>Должность *</label>
                <select id="employee-role">
                    <option value="Manager">Менеджер</option>
                    <option value="Master">Мастер</option>
                    <option value="Admin">Администратор</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Специализация</label>
            <input type="text" id="employee-specialization" placeholder="iPhone, Android, MacBook...">
        </div>
        <div class="form-group">
            <label>Процент от заказов</label>
            <input type="number" id="employee-comission_percent" placeholder="10" min="0" max="100">
        </div>`;
    openModal('Добавление сотрудника', form, saveEmployee);
}

async function saveEmployee() {
    const name = document.getElementById('employee-name')?.value;
    const phone = document.getElementById('employee-phone')?.value;
    const email = document.getElementById('employee-email')?.value;
    const password = document.getElementById('employee-password')?.value;
    const role = document.getElementById('employee-role')?.value;
    const specialization = document.getElementById('employee-specialization')?.value;
    const comission_percent = parseInt(document.getElementById('employee-comission_percent')?.value) || 10;
    if (!name || !password || !role) { showToast('Заполните обязательные поля', 'error'); return; }
    const result = await api('/users', {
        method: 'POST',
        body: JSON.stringify({ name, phone, email, password, role, specialization, comission_percent })
    });
    if (result) {
        showToast('Сотрудник добавлен!', 'success');
        closeModal();
        loadEmployees();
    }
}

async function openEditEmployeeModal(id) {
    const user = await api(`/users/${id}`);
    if (!user) return;
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const roleOpts = ['Manager', 'Master', 'Admin'].map(r =>
        `<option value="${r}" ${user.role === r ? 'selected' : ''}>${r === 'Manager' ? 'Менеджер' : r === 'Master' ? 'Мастер' : 'Администратор'}</option>`
    ).join('');
    const form = `
        <div class="form-group">
            <label>ФИО *</label>
            <input type="text" id="edit-user-name" value="${user.name}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="edit-user-phone" value="${user.phone || ''}">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="edit-user-email" value="${user.email || ''}">
            </div>
        </div>
        ${isAdmin ? `
        <div class="form-group">
            <label>Должность</label>
            <select id="edit-user-role">${roleOpts}</select>
        </div>` : ''}
        <div class="form-group">
            <label>Специализация</label>
            <input type="text" id="edit-user-specialization" value="${user.specialization || ''}">
        </div>
        <div class="form-group">
            <label>Процент от заказов</label>
            <input type="number" id="edit-user-comission_percent" value="${user.comission_percent}" min="0" max="100">
        </div>`;
    window._editUserId = id;
    openModal('Редактирование сотрудника', form, saveEditEmployee);
}

async function saveEditEmployee() {
    const id = window._editUserId;
    const isAdmin = currentUser && currentUser.role === 'Admin';
    const body = {
        name: document.getElementById('edit-user-name')?.value,
        phone: document.getElementById('edit-user-phone')?.value,
        email: document.getElementById('edit-user-email')?.value,
        role: isAdmin ? (document.getElementById('edit-user-role')?.value || 'Manager') : undefined,
        specialization: document.getElementById('edit-user-specialization')?.value,
        comission_percent: parseInt(document.getElementById('edit-user-comission_percent')?.value) || 10
    };
    if (!body.name) { showToast('Введите имя', 'error'); return; }
    const result = await api(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    if (result !== null) {
        showToast('Данные сохранены!', 'success');
        closeModal();
        loadEmployees();
    }
}

async function deleteEmployee(id, name) {
    if (!confirm(`Удалить сотрудника "${name}"?`)) return;
    const result = await api(`/users/${id}`, { method: 'DELETE' });
    if (result !== null) {
        showToast(`Сотрудник "${name}" удалён`, 'success');
        loadEmployees();
    }
}

// ==================== НАСТРОЙКИ ====================
async function loadSettings() {
    const settings = await api('/settings');
    return settings || [];
}

const SETTINGS_CACHE = {};
async function getSetting(key) {
    if (SETTINGS_CACHE[key]) return SETTINGS_CACHE[key];
    const result = await api(`/settings/by-key/${key}`);
    if (result) SETTINGS_CACHE[key] = result;
    return result;
}

function openSettingsModal(type) {
    const titles = {
        general: 'Общие настройки',
        service: 'Настройки сервиса'
    };
    let content = '';
    if (type === 'general') {
        content = `
            <div class="form-group">
                <label>Название компании</label>
                <input type="text" id="setting-company_name" value="ServiceCRM">
            </div>
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="setting-company_phone" placeholder="+375 (___) ___-__-__">
            </div>
            <div class="form-group">
                <label>Адрес</label>
                <textarea id="setting-company_address"></textarea>
            </div>
            <div class="form-group">
                <label>Режим работы</label>
                <input type="text" id="setting-working_hours" placeholder="Пн-Пт 9:00-18:00">
            </div>`;
    } else if (type === 'service') {
        content = `
            <div class="form-group">
                <label>Email для уведомлений</label>
                <input type="email" id="setting-notification_email" placeholder="notifications@example.com">
            </div>
            <div class="form-group">
                <label>Время на ремонт (часы)</label>
                <input type="number" id="setting-repair_time" placeholder="24">
            </div>`;
    }
    openModal(titles[type], content, () => saveSettings(type));
}

async function saveSettings(type) {
    const prefix = type === 'general' ? 'company' : 'service';
    const keys = type === 'general'
        ? ['company_name', 'company_phone', 'company_address', 'working_hours']
        : ['notification_email', 'repair_time'];
    for (const key of keys) {
        const value = document.getElementById(`setting-${key}`)?.value || '';
        const existing = await getSetting(key);
        if (existing) {
            await api(`/settings/${existing.id}`, {
                method: 'PUT',
                body: JSON.stringify({ value, description: key })
            });
        } else {
            await api('/settings', {
                method: 'POST',
                body: JSON.stringify({ keyName: key, value, description: key })
            });
        }
    }
    showToast('Настройки сохранены!', 'success');
    closeModal();
}

// ==================== ПОИСК И ФИЛЬТРЫ ====================
function searchOrders() {
    const query = document.getElementById('order-search').value.trim();
    if (!query) { showToast('Введите поисковый запрос', 'warning'); return; }
    showToast(`Поиск: "${query}"`, 'info');
}

function openFilterPanel() {
    const filters = `
        <div class="form-group">
            <label>Статус</label>
            <select id="filter-status">
                <option value="">Все статусы</option>
                ${STATUSES.map(s => `<option value="${s}">${STATUS_LABELS[s]}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Дата с</label>
                <input type="date" id="filter-date-from">
            </div>
            <div class="form-group">
                <label>Дата по</label>
                <input type="date" id="filter-date-to">
            </div>
        </div>`;
    openModal('Фильтры', filters, applyFilters);
}

function applyFilters() {
    showToast('Фильтры применены', 'success');
    closeModal();
    loadOrders();
}

// ==================== БУХГАЛТЕРИЯ ====================
async function loadAccounting() {
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
    const totalDebt = totalCost - totalRevenue;
    const completed = orders.filter(o => o.status === 'Completed' || o.status === 'Ready').length;
    const inWork = orders.filter(o => o.status === 'In Progress' || o.status === 'Pending').length;

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

// ==================== СТРАНИЦЫ ====================
function loadPageData(pageName) {
    const allowed = {
        accounting: ['Admin', 'Manager'],
        settings: ['Admin']
    };
    if (allowed[pageName] && (!currentUser || !allowed[pageName].includes(currentUser.role))) {
        document.querySelector('.nav-item[data-page="main"]').click();
        return;
    }
    switch (pageName) {
        case 'main': updateDashboard(); break;
        case 'orders': loadOrders(); break;
        case 'clients': loadClients(); break;
        case 'products': loadProducts(); break;
        case 'warehouses': loadWarehouses(); break;
        case 'employees': loadEmployees(); break;
        case 'accounting': loadAccounting(); break;
    }
}

// ==================== УВЕДОМЛЕНИЯ ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `<span style="font-size:18px">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fadeOut');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
function showNotification(title) { showToast(`${title}: в разработке`, 'info'); }
function toggleNotifications() { showToast('Уведомления: в разработке', 'info'); }

// ==================== ИСТОРИЯ ДЕЙСТВИЙ ====================
async function openHistoryModal() {
    const logs = await api('/activitylogs?limit=100');
    const actionLabels = {
        Login: 'Вход', Register: 'Регистрация',
        Create: 'Создание', Update: 'Изменение', Delete: 'Удаление'
    };
    if (!logs || logs.length === 0) {
        showToast('История пока пуста', 'info');
        return;
    }
    const rows = logs.map(l => {
        const date = new Date(l.createdAt).toLocaleString('ru-RU');
        const actionLabel = actionLabels[l.action] || l.action;
        return `<tr>
            <td style="white-space:nowrap;color:#4b5563">${date}</td>
            <td style="color:#1f2937">${l.userName}</td>
            <td><span style="color:#4caf50;font-weight:600">${actionLabel}</span></td>
            <td style="color:#4b5563">${l.entityType}${l.entityId ? ' #'+l.entityId : ''}</td>
            <td style="color:#4b5563">${l.details || '-'}</td>
        </tr>`;
    }).join('');

    openModal('История действий', `
        <div style="max-height:500px;overflow-y:auto">
            <table style="width:100%;border-collapse:collapse;font-size:12px">
                <thead>
                    <tr style="background:#f9fafb">
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Дата</th>
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Пользователь</th>
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Действие</th>
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Объект</th>
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Детали</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `);
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initParticles();
});

// ==================== АНИМАЦИЯ ЧАСТИЦ ====================
function initParticles() {
    const container = document.createElement('div');
    container.className = 'bg-particles';
    document.body.appendChild(container);
    const colors = ['#1a5c63', '#4caf50', '#217a82', '#66bb6a'];
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 80 + 20;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            left:${Math.random() * 100}%;
            animation-duration:${Math.random() * 20 + 15}s;
            animation-delay:-${Math.random() * 20}s`;
        container.appendChild(p);
    }
}
