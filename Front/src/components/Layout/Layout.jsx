import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Modal from '../Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getSettingByKey, createSetting, updateSetting } from '../../api';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const { currentUser, logout } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHistory = () => {
    navigate('/history');
  };

  const handleSaveSettings = async () => {
    const keys = ['company_name', 'company_phone', 'company_address', 'working_hours'];
    for (const key of keys) {
      const value = document.getElementById(`setting-${key}`)?.value || '';
      const existing = await getSettingByKey(key);
      if (existing) {
        await updateSetting(existing.id, { value, description: key });
      } else {
        await createSetting({ keyName: key, value, description: key });
      }
    }
    showToast('Настройки сохранены!', 'success');
    setSettingsModal(false);
  };

  return (
    <div className="container">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <TopBar
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onHistory={handleHistory}
          onSettings={currentUser?.role === 'Admin' ? () => setSettingsModal(true) : undefined}
          onLogout={handleLogout}
        />
        <div className="content">
          <Outlet />
        </div>
      </main>
      {settingsModal && (
        <Modal title="Общие настройки" onSave={handleSaveSettings} onClose={() => setSettingsModal(false)}>
          <div className="form-group"><label>Название компании</label><input type="text" id="setting-company_name" defaultValue="ServiceCRM" /></div>
          <div className="form-group"><label>Телефон</label><input type="tel" id="setting-company_phone" placeholder="+375 (___) ___-__-__" /></div>
          <div className="form-group"><label>Адрес</label><textarea id="setting-company_address" /></div>
          <div className="form-group"><label>Режим работы</label><input type="text" id="setting-working_hours" placeholder="Пн-Пт 9:00-18:00" /></div>
        </Modal>
      )}
    </div>
  );
}
