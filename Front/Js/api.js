import { showToast } from './utils.js';

export const API_BASE = 'http://localhost:5224/api';

export function getToken() { return localStorage.getItem('token'); }

export function setToken(token) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
}

export function authHeaders() {
    const t = getToken();
    return t ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function api(url, options = {}) {
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
