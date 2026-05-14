import { api } from './api.js';
import { showToast, openModal, closeModal } from './utils.js';
import { ROLE_NAMES } from './constants.js';
import { currentUser, loadProfile } from './auth.js';

let editUserId = null;

export async function loadEmployees() {
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

export function openCreateEmployeeModal() {
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

export async function openEditEmployeeModal(id) {
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
    editUserId = id;
    openModal('Редактирование сотрудника', form, saveEditEmployee);
}

async function saveEditEmployee() {
    const id = editUserId;
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

export async function deleteEmployee(id, name) {
    if (!confirm(`Удалить сотрудника "${name}"?`)) return;
    const result = await api(`/users/${id}`, { method: 'DELETE' });
    if (result !== null) {
        showToast(`Сотрудник "${name}" удалён`, 'success');
        loadEmployees();
    }
}
