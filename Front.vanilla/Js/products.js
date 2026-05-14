import { api } from './api.js';
import { showToast, openModal, closeModal } from './utils.js';
import { currentUser } from './auth.js';

export const warehouseFilterState = { value: null };

export async function loadProducts() {
    const filter = warehouseFilterState.value;
    const products = await api(filter ? `/products?warehouseId=${filter.id}` : '/products');
    const container = document.getElementById('page-products');
    const btn = document.getElementById('btn-create-product');
    if (btn) {
        btn.style.display = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Master') ? '' : 'none';
    }
    const backBtn = filter
        ? `<button class="btn" onclick="goBackToWarehouses()" style="margin-right:12px">← Назад к складам</button>`
        : '';
    const title = filter ? `Товары склада: ${filter.name}` : 'Товары';
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

export function openCreateProductModal() {
    const wh = warehouseFilterState.value;
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

export async function loadWarehouseSelect() {
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

export async function openEditProductModal(id) {
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

export async function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    const result = await api(`/products/${id}`, { method: 'DELETE' });
    if (result !== false) {
        showToast('Товар удалён', 'success');
        loadProducts();
    }
}
