import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProducts, getWarehouses, createProduct, updateProduct, deleteProduct as apiDeleteProduct } from '../api';
import Modal from '../components/Modal';

export default function Products() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';
  const showToast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const warehouseId = searchParams.get('warehouseId');
  const warehouseName = searchParams.get('warehouseName');
  const canManage = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Master');

  const load = useCallback(async () => {
    const data = await getProducts(warehouseId);
    if (data) setProducts(data);
    setLoading(false);
  }, [warehouseId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = async () => {
    const warehouses = await getWarehouses();
    setModal({ type: 'create', title: 'Добавление товара', warehouses: warehouses || [] });
  };

  const openEdit = async (id) => {
    const all = await getProducts();
    const p = (all || []).find(x => x.id === id);
    if (!p) return;
    const warehouses = await getWarehouses();
    setModal({ type: 'edit', title: 'Редактирование товара', product: p, warehouses: warehouses || [] });
  };

  const handleSave = async () => {
    const isEdit = modal.type === 'edit';
    const p = isEdit ? modal.product : null;
    const prefix = isEdit ? 'edit-' : '';
    const name = document.getElementById(`${prefix}product-name`)?.value;
    const quantity = parseInt(document.getElementById(`${prefix}product-quantity`)?.value) || 0;
    const wid = parseInt(document.getElementById(`${prefix}product-warehouse`)?.value) || null;
    if (!name || !quantity) { showToast('Заполните обязательные поля', 'error'); return; }

    if (isEdit) {
      const result = await updateProduct(p.id, { name, quantity, warehouseId: wid });
      if (result !== false) { showToast('Товар обновлён', 'success'); setModal(null); load(); }
    } else {
      const result = await createProduct({ name, quantity, warehouseId: wid });
      if (result) { showToast('Товар добавлен!', 'success'); setModal(null); load(); }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return;
    const result = await apiDeleteProduct(id);
    if (result !== false) { showToast('Товар удалён', 'success'); load(); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {warehouseId && <button className="btn" onClick={() => navigate('/warehouses')} style={{ marginRight: 12 }}>← Назад к складам</button>}
          {warehouseName ? `Товары склада: ${warehouseName}` : 'Товары'}
        </h1>
        {canManage && <button className="btn btn-create" onClick={openCreate}>Добавить товар</button>}
      </div>
      {loading ? <div className="empty-data"><h2>Загрузка...</h2></div> : !products || products.length === 0 ? (
        <div className="empty-data">
          <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
          <h2>Товаров пока нет</h2>
          <p>Добавьте первый товар</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="orders-table">
            <thead><tr>{isAdmin && <th>№</th>}<th>Название</th><th>Количество</th><th>Склад</th>{canManage && <th></th>}</tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  {isAdmin && <td>{p.id}</td>}<td>{p.name}</td><td>{p.quantity}</td><td>{p.warehouseName || '-'}</td>
                  {canManage && <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn-table" onClick={() => openEdit(p.id)}>✎</button>
                    <button className="btn-table" onClick={() => handleDelete(p.id)} style={{ color: '#f44336' }}>✕</button>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={modal.title} onSave={handleSave} onClose={() => setModal(null)}>
          <div className="form-group"><label>Название товара *</label><input type="text" id={`${modal.type === 'edit' ? 'edit-' : ''}product-name`} defaultValue={modal.product?.name || ''} placeholder="Дисплей iPhone 12" /></div>
          <div className="form-row">
            <div className="form-group"><label>Количество *</label><input type="number" id={`${modal.type === 'edit' ? 'edit-' : ''}product-quantity`} defaultValue={modal.product?.quantity || 1} min="0" /></div>
            <div className="form-group">
              <label>Склад</label>
              <select id={`${modal.type === 'edit' ? 'edit-' : ''}product-warehouse`}>
                <option value="">Без склада</option>
                {modal.warehouses.map(w => (
                  <option key={w.id} value={w.id} selected={modal.product?.warehouseId === w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
