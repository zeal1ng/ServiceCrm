import { api, getToken, setToken } from './api.js';
import { showToast } from './utils.js';
import { ROLE_NAMES } from './constants.js';

export let currentUser = null;

export function checkAuth() {
    if (getToken()) {
        loadProfile();
        return;
    }
    document.getElementById('login-overlay').classList.add('active');
}

export async function login() {
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

export function switchLoginTab(tab) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.login-tab[onclick*="${tab}"]`).classList.add('active');
    document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('order-form').style.display = tab === 'order' ? 'block' : 'none';
    document.getElementById('login-error').textContent = '';
}

export async function submitPublicOrder() {
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

export function logout() {
    setToken(null);
    currentUser = null;
    document.getElementById('login-overlay').classList.add('active');
    showToast('Вы вышли из системы', 'info');
}

export async function loadProfile() {
    const user = await api('/profile/me');
    if (user) {
        currentUser = user;
        document.querySelector('.user-info h3').textContent = user.userName || user.username || 'Пользователь';
        document.querySelector('.user-info .role').textContent = ROLE_NAMES[user.role] || user.role;

        document.querySelectorAll('.nav-item[data-roles]').forEach(item => {
            const allowed = item.dataset.roles.split(',');
            if (!allowed.includes(user.role)) item.style.display = 'none';
        });

        const canManage = user.role === 'Admin' || user.role === 'Manager';
        const btnWarehouse = document.getElementById('btn-create-warehouse');
        const btnEmployee = document.getElementById('btn-create-employee');
        if (btnWarehouse) btnWarehouse.style.display = canManage ? '' : 'none';
        if (btnEmployee) btnEmployee.style.display = canManage ? '' : 'none';
    }
}
