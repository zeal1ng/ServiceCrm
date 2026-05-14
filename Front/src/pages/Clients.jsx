import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getClients, createClient, updateClient, deleteClient as apiDeleteClient } from '../api';
import Modal from '../components/Modal';

export default function Clients() {
  const { currentUser } = useAuth();
  const showToast = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const isAdmin = currentUser?.role === 'Admin';
  const canEdit = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager');

  const load = useCallback(async () => {
    const data = await getClients();
    if (data) setClients(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setModal({ type: 'create', title: 'Добавление клиента' });
  const openEdit = (client) => setModal({ type: 'edit', title: 'Редактирование клиента', client });

  const handleSave = async () => {
    const isEdit = modal.type === 'edit';
    const prefix = isEdit ? 'edit-' : '';
    const name = document.getElementById(`${prefix}client-name`)?.value;
    const phone = document.getElementById(`${prefix}client-phone`)?.value;
    const email = document.getElementById(`${prefix}client-email`)?.value;
    const comment = document.getElementById(`${prefix}client-comment`)?.value;
    if (!name || (!isEdit && !phone)) { showToast('Заполните обязательные поля', 'error'); return; }
    if (phone && !/^[\+\d\s\-\(\)]{6,20}$/.test(phone)) { showToast('Неверный формат телефона', 'error'); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Неверный формат email', 'error'); return; }

    if (isEdit) {
      const result = await updateClient(modal.client.id, { name, phone, email, comment });
      if (result !== false) { showToast('Клиент обновлён', 'success'); setModal(null); load(); }
    } else {
      const result = await createClient({ name, phone, email, comment });
      if (result) { showToast('Клиент добавлен!', 'success'); setModal(null); load(); }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить клиента?')) return;
    const result = await apiDeleteClient(id);
    if (result !== false) { showToast('Клиент удалён', 'success'); load(); }
  };

  const form = (isEdit, client) => {
    const v = (key) => isEdit ? (client[key] || '') : '';
    return (<>
      <div className="form-group"><label>ФИО *</label><input type="text" id={`${isEdit ? 'edit-' : ''}client-name`} defaultValue={v('name')} placeholder="Иванов Иван Иванович" /></div>
      <div className="form-row">
        <div className="form-group"><label>Телефон *</label><input type="tel" id={`${isEdit ? 'edit-' : ''}client-phone`} defaultValue={v('phone')} placeholder="+375 (___) ___-__-__" /></div>
        <div className="form-group"><label>Email</label><input type="email" id={`${isEdit ? 'edit-' : ''}client-email`} defaultValue={v('email')} placeholder="email@example.com" /></div>
      </div>
      <div className="form-group"><label>Комментарий</label><textarea id={`${isEdit ? 'edit-' : ''}client-comment`} defaultValue={v('comment')} placeholder="Дополнительная информация" /></div>
    </>);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Клиенты</h1>
        {canEdit && <button className="btn btn-create" onClick={openCreate}>Добавить клиента</button>}
      </div>
      {loading ? <div className="empty-data"><h2>Загрузка...</h2></div> : !clients || clients.length === 0 ? (
        <div className="empty-data">
          <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
          <h2>Клиентов пока нет</h2>
          <p>Добавьте первого клиента</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="orders-table">
            <thead><tr>{isAdmin && <th>№</th>}<th>Имя</th><th>Телефон</th><th>Email</th><th>Комментарий</th><th>Дата</th>{canEdit && <th></th>}</tr></thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  {isAdmin && <td>{c.id}</td>}<td>{c.name}</td><td>{c.phone || '-'}</td><td>{c.email || '-'}</td>
                  <td>{c.comment || '-'}</td><td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
                  {canEdit && <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn-table" onClick={() => openEdit(c)}>✎</button>
                    {isAdmin && <button className="btn-table" onClick={() => handleDelete(c.id)} style={{ color: '#f44336' }}>✕</button>}
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && <Modal title={modal.title} onSave={handleSave} onClose={() => setModal(null)}>{form(modal.type === 'edit', modal.client)}</Modal>}
    </div>
  );
}
