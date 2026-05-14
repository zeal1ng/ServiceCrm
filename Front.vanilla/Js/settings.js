import { api } from './api.js';
import { showToast, openModal, closeModal } from './utils.js';

const SETTINGS_CACHE = {};

export async function loadSettings() {
    const settings = await api('/settings');
    return settings || [];
}

export async function getSetting(key) {
    if (SETTINGS_CACHE[key]) return SETTINGS_CACHE[key];
    const result = await api(`/settings/by-key/${key}`);
    if (result) SETTINGS_CACHE[key] = result;
    return result;
}

export function openSettingsModal(type) {
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
