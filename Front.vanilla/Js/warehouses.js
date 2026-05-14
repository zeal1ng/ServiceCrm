import { api } from './api.js';
import { showToast, openModal, closeModal } from './utils.js';
import { warehouseFilterState } from './products.js';

export async function loadWarehouses() {
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

export function showWarehouseProducts(warehouseId, warehouseName) {
    warehouseFilterState.value = { id: warehouseId, name: warehouseName };
    document.querySelector('.nav-item[data-page="products"]').click();
}

export function goBackToWarehouses() {
    warehouseFilterState.value = null;
    document.querySelector('.nav-item[data-page="warehouses"]').click();
}

export function openCreateWarehouseModal() {
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

export async function loadManagerSelect() {
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
