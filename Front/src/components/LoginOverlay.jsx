import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { submitPublicOrderApi } from '../api';

export default function LoginOverlay() {
  const { login, isAuthenticated } = useAuth();
  const showToast = useToast();
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [publicForm, setPublicForm] = useState({ clientName: '', clientPhone: '', device: '', serial: '', issue: '' });

  if (isAuthenticated) return null;

  const handleLogin = async () => {
    if (!name || !password) { setError('Введите имя и пароль'); return; }
    setError('');
    const ok = await login(name, password);
    if (ok) {
      showToast('Вход выполнен', 'success');
    }
  };

  const handlePublicOrder = async () => {
    const { clientName, clientPhone, device, serial, issue } = publicForm;
    if (!clientName || !clientPhone) { showToast('Заполните имя и телефон', 'error'); return; }
    const result = await submitPublicOrderApi({ clientName, clientPhone, device, serial, issue });
    if (result) {
      showToast(`Заказ №${result.orderId} принят!`, 'success');
      setPublicForm({ clientName: '', clientPhone: '', device: '', serial: '', issue: '' });
    }
  };

  return (
    <div className="login-overlay active">
      <div className="login-box">
        <div className="login-logo">
          <img src="/images/logo.png" height={60} alt="ServiceCRM" />
          <h1>ServiceCRM</h1>
        </div>
        {error && <div className="login-error">{error}</div>}
        <div className="login-tabs">
          <button className={`login-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>Вход</button>
          <button className={`login-tab${tab === 'order' ? ' active' : ''}`} onClick={() => setTab('order')}>Сделать заказ</button>
        </div>
        {tab === 'login' ? (
          <div>
            <div className="form-group">
              <input type="text" placeholder="Имя пользователя" value={name}
                onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <input type="password" placeholder="Пароль" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLogin}>Войти</button>
          </div>
        ) : (
          <div>
            <div className="form-row">
              <div className="form-group">
                <label style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'block' }}>Имя *</label>
                <input type="text" placeholder="Ваше имя" value={publicForm.clientName}
                  onChange={e => setPublicForm(p => ({ ...p, clientName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'block' }}>Телефон *</label>
                <input type="tel" placeholder="+375 (___) ___-__-__" value={publicForm.clientPhone}
                  onChange={e => setPublicForm(p => ({ ...p, clientPhone: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'block' }}>Устройство *</label>
                <input type="text" placeholder="iPhone 12" value={publicForm.device}
                  onChange={e => setPublicForm(p => ({ ...p, device: e.target.value }))} />
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'block' }}>Серийный №</label>
                <input type="text" placeholder="IMEI/SN" value={publicForm.serial}
                  onChange={e => setPublicForm(p => ({ ...p, serial: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'block' }}>Проблема</label>
              <textarea placeholder="Опишите проблему" value={publicForm.issue}
                onChange={e => setPublicForm(p => ({ ...p, issue: e.target.value }))}
                style={{ resize: 'vertical', minHeight: 60, width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handlePublicOrder}>Отправить заказ</button>
          </div>
        )}
      </div>
    </div>
  );
}
