import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUsers, getUser, createUser, updateUser, deleteUser as apiDeleteUser } from '../api';
import { ROLE_NAMES } from '../constants';
import Modal from '../components/Modal';

export default function Employees() {
  const { currentUser } = useAuth();
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const isAdmin = currentUser?.role === 'Admin';

  const load = useCallback(async () => {
    const data = await getUsers();
    if (data) setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => setModal({ type: 'create', title: 'Добавление сотрудника' });
  const openEdit = async (id) => {
    const u = await getUser(id);
    if (u) setModal({ type: 'edit', title: 'Редактирование сотрудника', user: u });
  };

  const handleSave = async () => {
    const isEdit = modal.type === 'edit';
    const u = isEdit ? modal.user : null;
    const getName = (suffix) => document.getElementById(`${isEdit ? 'edit-' : ''}user-${suffix}`)?.value;

    if (isEdit) {
      const body = {
        name: getName('name'),
        phone: getName('phone'),
        email: getName('email'),
        role: isAdmin ? (document.getElementById('edit-user-role')?.value || 'Manager') : undefined,
        specialization: getName('specialization'),
        comission_percent: parseInt(document.getElementById('edit-user-comission_percent')?.value) || 10
      };
      if (!body.name) { showToast('Введите имя', 'error'); return; }
      const result = await updateUser(u.id, body);
      if (result !== null) { showToast('Данные сохранены!', 'success'); setModal(null); load(); }
    } else {
      const name = document.getElementById('employee-name')?.value;
      const phone = document.getElementById('employee-phone')?.value;
      const email = document.getElementById('employee-email')?.value;
      const password = document.getElementById('employee-password')?.value;
      const role = document.getElementById('employee-role')?.value;
      const specialization = document.getElementById('employee-specialization')?.value;
      const comission_percent = parseInt(document.getElementById('employee-comission_percent')?.value) || 10;
      if (!name || !password || !role) { showToast('Заполните обязательные поля', 'error'); return; }
      const result = await createUser({ name, phone, email, password, role, specialization, comission_percent });
      if (result) { showToast('Сотрудник добавлен!', 'success'); setModal(null); load(); }
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Удалить сотрудника "${name}"?`)) return;
    const result = await apiDeleteUser(id);
    if (result !== null) { showToast(`Сотрудник "${name}" удалён`, 'success'); load(); }
  };

  const filtered = isAdmin ? users : (users || []).filter(u => u.role !== 'Admin');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Сотрудники</h1>
        <button className="btn btn-create" onClick={openCreate}>Добавить сотрудника</button>
      </div>
      {loading ? <div className="empty-data"><h2>Загрузка...</h2></div> : filtered.length === 0 ? (
        <div className="empty-data">
          <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
          <h2>Сотрудников пока нет</h2>
          <p>Добавьте первого сотрудника</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="orders-table">
            <thead><tr>{isAdmin && <th>№</th>}<th>Имя</th><th>Телефон</th><th>Email</th><th>Роль</th><th>Специализация</th><th>%</th><th></th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  {isAdmin && <td>{u.id}</td>}<td>{u.name}</td><td>{u.phone || '-'}</td><td>{u.email || '-'}</td>
                  <td>{ROLE_NAMES[u.role] || u.role}</td><td>{u.specialization || '-'}</td><td>{u.comission_percent}%</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {(isAdmin || currentUser?.id === u.id) && <button className="btn-table" onClick={() => openEdit(u.id)}>✎</button>}
                    {isAdmin && currentUser?.id !== u.id && <button className="btn-table" onClick={() => handleDelete(u.id, u.name)} style={{ color: '#f44336' }}>✕</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal.title} onSave={handleSave} onClose={() => setModal(null)}>
          {modal.type === 'create' ? (
            <>
              <div className="form-group"><label>ФИО *</label><input type="text" id="employee-name" placeholder="Иванов Иван Иванович" /></div>
              <div className="form-row">
                <div className="form-group"><label>Телефон</label><input type="tel" id="employee-phone" placeholder="+375 (___) ___-__-__" /></div>
                <div className="form-group"><label>Email</label><input type="email" id="employee-email" placeholder="email@example.com" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Пароль *</label><input type="password" id="employee-password" placeholder="Пароль для входа" /></div>
                <div className="form-group"><label>Должность *</label>
                  <select id="employee-role">
                    <option value="Manager">Менеджер</option>
                    <option value="Master">Мастер</option>
                    <option value="Admin">Администратор</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Специализация</label><input type="text" id="employee-specialization" placeholder="iPhone, Android, MacBook..." /></div>
              <div className="form-group"><label>Процент от заказов</label><input type="number" id="employee-comission_percent" placeholder="10" min="0" max="100" /></div>
            </>
          ) : (
            <>
              <div className="form-group"><label>ФИО *</label><input type="text" id="edit-user-name" defaultValue={modal.user.name} /></div>
              <div className="form-row">
                <div className="form-group"><label>Телефон</label><input type="tel" id="edit-user-phone" defaultValue={modal.user.phone || ''} /></div>
                <div className="form-group"><label>Email</label><input type="email" id="edit-user-email" defaultValue={modal.user.email || ''} /></div>
              </div>
              {isAdmin && (
                <div className="form-group"><label>Должность</label>
                  <select id="edit-user-role">
                    {['Manager', 'Master', 'Admin'].map(r => (
                      <option key={r} value={r} selected={modal.user.role === r}>
                        {r === 'Manager' ? 'Менеджер' : r === 'Master' ? 'Мастер' : 'Администратор'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group"><label>Специализация</label><input type="text" id="edit-user-specialization" defaultValue={modal.user.specialization || ''} /></div>
              <div className="form-group"><label>Процент от заказов</label><input type="number" id="edit-user-comission_percent" defaultValue={modal.user.comission_percent} min="0" max="100" /></div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
