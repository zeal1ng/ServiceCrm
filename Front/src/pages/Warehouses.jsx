import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getWarehouses, getUsers, createWarehouse } from '../api';
import Modal from '../components/Modal';

export default function Warehouses() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';
  const showToast = useToast();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    const data = await getWarehouses();
    if (data) setWarehouses(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = async () => {
    const users = await getUsers();
    setModal({ type: 'create', title: 'Добавление склада', users: users || [] });
  };

  const handleSave = async () => {
    const name = document.getElementById('warehouse-name')?.value;
    const address = document.getElementById('warehouse-address')?.value;
    const userId = parseInt(document.getElementById('warehouse-userId')?.value) || 0;
    if (!name) { showToast('Введите название склада', 'error'); return; }
    const result = await createWarehouse({ name, address, userId });
    if (result) { showToast('Склад добавлен!', 'success'); setModal(null); load(); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Склады</h1>
        {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Manager') &&
          <button className="btn btn-create" onClick={openCreate}>Добавить склад</button>}
      </div>
      {loading ? <div className="empty-data"><h2>Загрузка...</h2></div> : !warehouses || warehouses.length === 0 ? (
        <div className="empty-data">
          <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /></svg>
          <h2>Складов пока нет</h2>
          <p>Добавьте первый склад</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="orders-table">
            <thead><tr>{isAdmin && <th>№</th>}<th>Название</th><th>Адрес</th><th>Ответственный</th></tr></thead>
            <tbody>
              {warehouses.map(w => (
                <tr key={w.id} onClick={() => navigate(`/products?warehouseId=${w.id}&warehouseName=${encodeURIComponent(w.name)}`)} style={{ cursor: 'pointer' }}>
                  {isAdmin && <td>{w.id}</td>}<td>{w.name}</td><td>{w.address || '-'}</td><td>{w.managerName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal.title} onSave={handleSave} onClose={() => setModal(null)}>
          <div className="form-group"><label>Название склада *</label><input type="text" id="warehouse-name" placeholder="Основной склад" /></div>
          <div className="form-group"><label>Адрес</label><textarea id="warehouse-address" placeholder="Город, улица..." /></div>
          <div className="form-group">
            <label>Ответственный</label>
            <select id="warehouse-userId">
              <option value="">Выберите ответственного</option>
              {modal.users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
