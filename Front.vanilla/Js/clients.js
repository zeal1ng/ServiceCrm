import { api } from './api.js';
import { showToast, validatePhone, validateEmail, openModal, closeModal } from './utils.js';
import { currentUser } from './auth.js';

export async function loadClients() {
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

export function openCreateClientModal() {
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
    }
}

export async function deleteClient(id) {
    if (!confirm('Удалить клиента?')) return;
    const result = await api(`/clients/${id}`, { method: 'DELETE' });
    if (result !== false) {
        showToast('Клиент удалён', 'success');
        loadClients();
    }
}

export async function openEditClientModal(id) {
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
