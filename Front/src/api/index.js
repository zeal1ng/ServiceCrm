const API_BASE = 'http://localhost:5224/api';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

function authHeaders() {
  const t = getToken();
  return t
    ? { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

let toastCallback = null;
export function setToastCallback(cb) { toastCallback = cb; }

async function api(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { ...authHeaders(), ...options.headers }
    });
    if (res.status === 401) {
      if (toastCallback) toastCallback('Сессия истекла, войдите снова', 'error');
      setToken(null);
      return null;
    }
    if (!res.ok) {
      const err = await res.text().catch(() => 'Ошибка запроса');
      if (toastCallback) toastCallback(err, 'error');
      return null;
    }
    if (res.status === 204) return true;
    return await res.json();
  } catch (e) {
    if (toastCallback) toastCallback('Ошибка соединения с сервером', 'error');
    return null;
  }
}

// Auth
export function loginApi(credentials) {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}
export function submitPublicOrderApi(data) {
  return api('/public/order', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
export function getProfile() {
  return api('/profile/me');
}

// Orders
export function getOrders(query = '') {
  return api(query ? `/orders?${query}` : '/orders');
}
export function getOrder(id) {
  return api(`/orders/${id}`);
}
export function createOrder(data) {
  return api('/orders', { method: 'POST', body: JSON.stringify(data) });
}
export function updateOrder(id, data) {
  return api(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteOrder(id) {
  return api(`/orders/${id}`, { method: 'DELETE' });
}

// Clients
export function getClients() {
  return api('/clients');
}
export function createClient(data) {
  return api('/clients', { method: 'POST', body: JSON.stringify(data) });
}
export function updateClient(id, data) {
  return api(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteClient(id) {
  return api(`/clients/${id}`, { method: 'DELETE' });
}

// Products
export function getProducts(warehouseId) {
  return api(warehouseId ? `/products?warehouseId=${warehouseId}` : '/products');
}
export function createProduct(data) {
  return api('/products', { method: 'POST', body: JSON.stringify(data) });
}
export function updateProduct(id, data) {
  return api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteProduct(id) {
  return api(`/products/${id}`, { method: 'DELETE' });
}

// Warehouses
export function getWarehouses() {
  return api('/warehouses');
}
export function createWarehouse(data) {
  return api('/warehouses', { method: 'POST', body: JSON.stringify(data) });
}

// Users / Employees
export function getUsers() {
  return api('/users');
}
export function getUser(id) {
  return api(`/users/${id}`);
}
export function createUser(data) {
  return api('/users', { method: 'POST', body: JSON.stringify(data) });
}
export function updateUser(id, data) {
  return api(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}
export function deleteUser(id) {
  return api(`/users/${id}`, { method: 'DELETE' });
}

// Settings
export function getSettings() {
  return api('/settings');
}
export function getSettingByKey(key) {
  return api(`/settings/by-key/${key}`);
}
export function createSetting(data) {
  return api('/settings', { method: 'POST', body: JSON.stringify(data) });
}
export function updateSetting(id, data) {
  return api(`/settings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

// Transactions
export function getTransactions() {
  return api('/transactions');
}

// Activity logs
export function getActivityLogs() {
  return api('/activitylogs?limit=100');
}

export { getToken, setToken, api as default };
