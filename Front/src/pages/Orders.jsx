import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getOrders, getOrder, getClients, createOrder, updateOrder, deleteOrder as apiDeleteOrder } from '../api';
import { STATUSES, STATUS_LABELS, PRIORITIES, PRIORITY_LABELS, PRIORITY_COLORS } from '../constants';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function Orders() {
  const { currentUser } = useAuth();
  const showToast = useToast();

  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const isAdmin = currentUser?.role === 'Admin';
  const canEdit = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager');

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    const data = await getOrders(qs);
    if (data) setOrders(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const loadClients = async () => {
    const data = await getClients();
    if (data) setClients(data);
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: search || undefined }));
  };

  const hasFilters = Object.keys(filters).length > 0;

  const openCreateModal = () => {
    loadClients();
    setModal({ type: 'create', title: 'Создание заказа' });
  };

  const openEditModal = async (id) => {
    const order = await getOrder(id);
    if (!order) return;
    await loadClients();
    setModal({ type: 'edit', title: 'Редактирование заказа', order, id });
  };

  const handleSave = async () => {
    if (modal.type === 'create') {
      const clientId = document.getElementById('order-clientId')?.value;
      const device = document.getElementById('order-device')?.value;
      const serial = document.getElementById('order-serial')?.value;
      const issue = document.getElementById('order-issue')?.value;
      const priority = document.getElementById('order-priority')?.value;
      const cost = parseFloat(document.getElementById('order-cost')?.value) || 0;
      const comment = document.getElementById('order-comment')?.value;
      if (!clientId || !device || !issue) { showToast('Заполните обязательные поля', 'error'); return; }
      const result = await createOrder({ clientId: parseInt(clientId), device, serial, issue, priority, cost, comment });
      if (result) { showToast('Заказ создан!', 'success'); setModal(null); loadOrders(); }
    } else {
      const id = modal.id;
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
      const result = await updateOrder(id, body);
      if (result !== null) { showToast('Заказ обновлён', 'success'); setModal(null); loadOrders(); }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить заказ?')) return;
    const result = await apiDeleteOrder(id);
    if (result !== null) { showToast('Заказ удалён', 'success'); loadOrders(); }
  };

  const openFilterModal = () => {
    setModal({ type: 'filter', title: 'Фильтры' });
  };

  const applyFilters = () => {
    const newFilters = {};
    const status = document.getElementById('filter-status')?.value;
    const priority = document.getElementById('filter-priority')?.value;
    const dateFrom = document.getElementById('filter-date-from')?.value;
    const dateTo = document.getElementById('filter-date-to')?.value;
    if (status) newFilters.status = status;
    if (priority) newFilters.priority = priority;
    if (dateFrom) newFilters.dateFrom = dateFrom;
    if (dateTo) newFilters.dateTo = dateTo;
    setFilters(newFilters);
    setModal(null);
  };

  const resetFilters = () => {
    setFilters({});
    setSearch('');
    setModal(null);
  };

  const OrderForm = ({ isEdit, order }) => {
    const clientOpts = clients.map(c =>
      `<option value="${c.id}" ${order && c.id === order.clientId ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    const statusOpts = isEdit ? STATUSES.map(s =>
      `<option value="${s}" ${order?.status === s ? 'selected' : ''}>${STATUS_LABELS[s]}</option>`
    ).join('') : '';
    const priorityOpts = PRIORITIES.map(p =>
      `<option value="${p}" ${order?.priority === p ? 'selected' : ''}>${PRIORITY_LABELS[p]}</option>`
    ).join('');

    if (isEdit) {
      return (
        <>
          <div className="form-group"><label>Клиент</label><select id="edit-order-clientId" dangerouslySetInnerHTML={{ __html: clientOpts }} /></div>
          <div className="form-row">
            <div className="form-group"><label>Устройство</label><input type="text" id="edit-order-device" defaultValue={order?.device || ''} /></div>
            <div className="form-group"><label>Серийный №</label><input type="text" id="edit-order-serial" defaultValue={order?.serial || ''} /></div>
          </div>
          <div className="form-group"><label>Неисправность</label><textarea id="edit-order-issue" defaultValue={order?.issue || ''} /></div>
          <div className="form-group"><label>Диагноз</label><textarea id="edit-order-diagnosis" defaultValue={order?.diagnosis || ''} /></div>
          <div className="form-row">
            <div className="form-group"><label>Статус</label><select id="edit-order-status" dangerouslySetInnerHTML={{ __html: statusOpts }} /></div>
            <div className="form-group"><label>Приоритет</label><select id="edit-order-priority" dangerouslySetInnerHTML={{ __html: priorityOpts }} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Стоимость</label><input type="number" id="edit-order-cost" defaultValue={order?.cost || 0} step="0.01" /></div>
            <div className="form-group"><label>Оплачено</label><input type="number" id="edit-order-paid" defaultValue={order?.paid || 0} step="0.01" /></div>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="form-group"><label>Клиент *</label><select id="order-clientId"><option value="">Выберите клиента</option></select></div>
        <div className="form-row">
          <div className="form-group"><label>Устройство *</label><input type="text" id="order-device" placeholder="iPhone 12" /></div>
          <div className="form-group"><label>Серийный номер</label><input type="text" id="order-serial" placeholder="IMEI/SN" /></div>
        </div>
        <div className="form-group"><label>Неисправность *</label><textarea id="order-issue" placeholder="Опишите проблему" /></div>
        <div className="form-row">
          <div className="form-group"><label>Приоритет</label><select id="order-priority" dangerouslySetInnerHTML={{ __html: priorityOpts }} /></div>
          <div className="form-group"><label>Стоимость</label><input type="number" id="order-cost" placeholder="0" step="0.01" /></div>
        </div>
        <div className="form-group"><label>Комментарий</label><textarea id="order-comment" placeholder="Дополнительная информация" /></div>
      </>
    );
  };

  const FilterForm = () => (
    <>
      <div className="form-group">
        <label>Статус</label>
        <select id="filter-status">
          <option value="">Все статусы</option>
          {STATUSES.map(s => <option key={s} value={s} selected={filters.status === s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Приоритет</label>
        <select id="filter-priority">
          <option value="">Все приоритеты</option>
          {PRIORITIES.map(p => <option key={p} value={p} selected={filters.priority === p}>{PRIORITY_LABELS[p]}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Дата с</label><input type="date" id="filter-date-from" defaultValue={filters.dateFrom || ''} /></div>
        <div className="form-group"><label>Дата по</label><input type="date" id="filter-date-to" defaultValue={filters.dateTo || ''} /></div>
      </div>
      <button className="btn btn-secondary" onClick={resetFilters} style={{ width: '100%', marginTop: 8 }}>Сбросить фильтры</button>
    </>
  );

  const renderModalBody = () => {
    if (!modal) return null;
    if (modal.type === 'filter') return <FilterForm />;
    return <OrderForm isEdit={modal.type === 'edit'} order={modal.order} />;
  };

  const handleModalSave = () => {
    if (modal.type === 'filter') applyFilters();
    else handleSave();
  };

  // Populate select after render
  useEffect(() => {
    if (modal?.type === 'create' && clients.length > 0) {
      const sel = document.getElementById('order-clientId');
      if (sel) sel.innerHTML = '<option value="">Выберите клиента</option>' + clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
  }, [modal, clients]);

  return (
    <>
      <div className="tabs">
        <button className="tab active" data-tab="client-orders">Заказы клиентов</button>
      </div>
      <div className="action-bar">
        <div className="search-bar">
          <button className={`btn btn-filter${hasFilters ? ' active' : ''}`} onClick={openFilterModal}>
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" /></svg>
            <span>{hasFilters ? 'Фильтры активны' : 'Фильтровать'}</span>
          </button>
          <div className="search-input-wrapper">
            <input type="text" placeholder="Поиск..." className="search-input" value={search}
              onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-search" onClick={handleSearch}>Искать</button>
          </div>
        </div>
        {canEdit && <button className="btn btn-create" onClick={openCreateModal}>Создать заказ</button>}
      </div>

      {loading ? <div className="empty-data"><h2>Загрузка...</h2></div> : !orders || orders.length === 0 ? (
        <div className="empty-data">
          <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
          <h2>{hasFilters ? 'Ничего не найдено' : 'Заказов пока нет'}</h2>
          <p>{hasFilters ? 'Попробуйте изменить параметры фильтрации' : 'Создайте первый заказ'}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="orders-table">
            <thead>
              <tr>
                {isAdmin && <th>№</th>}<th>Клиент</th><th>Устройство</th><th>Серийный №</th><th>Статус</th>
                <th>Приоритет</th><th>Мастер</th><th>Сумма</th><th>Оплачено</th><th>Дата</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  {isAdmin && <td>{o.id}</td>}
                  <td>{o.clientName || '-'}</td>
                  <td>{o.device || '-'}</td>
                  <td>{o.serial || '-'}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td style={{ color: PRIORITY_COLORS[o.priority] || '', fontWeight: 600 }}>{PRIORITY_LABELS[o.priority] || o.priority}</td>
                  <td>{o.executorName || '-'}</td>
                  <td>{o.cost} Byn</td>
                  <td>{o.paid} Byn</td>
                  <td>{o.status === 'Ready' || o.status === 'Issued'
                    ? (o.completedAt ? new Date(o.completedAt).toLocaleDateString() : '-')
                    : (o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-')}</td>
                  {canEdit && <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn-table" onClick={() => openEditModal(o.id)}>✎</button>
                    {isAdmin && <button className="btn-table" onClick={() => handleDelete(o.id)} style={{ color: '#f44336' }}>✕</button>}
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && modal.type !== 'filter' && modal.type !== 'create' && modal.type !== 'edit' ? null : null}
      {modal && (
        <Modal title={modal.title} onSave={handleModalSave} onClose={() => setModal(null)}>
          {renderModalBody()}
        </Modal>
      )}
    </>
  );
}
