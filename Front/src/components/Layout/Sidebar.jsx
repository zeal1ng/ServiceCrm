import { useAuth } from '../../context/AuthContext';
import { ROLE_NAMES } from '../../constants';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { page: 'orders', label: 'Заказы', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
  { page: 'clients', label: 'Клиенты', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
  { page: 'accounting', label: 'Бухгалтерия', roles: ['Admin', 'Manager'], icon: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
  { page: 'warehouses', label: 'Склады', icon: 'M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z' },
  { page: 'employees', label: 'Сотрудники', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
];

const mainItem = { page: 'main', label: 'Главная', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' };

export default function Sidebar({ open, onClose }) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = location.pathname.slice(1) || 'orders';
  const role = currentUser?.role;

  const handleNav = (page) => {
    navigate(`/${page}`);
    if (onClose) onClose();
  };

  const visible = [mainItem, ...navItems].filter(item => {
    if (item.roles && (!role || !item.roles.includes(role))) return false;
    return true;
  });

  return (
    <>
      {open && <div className="sidebar-overlay active" onClick={onClose} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="user-profile">
          <div className="avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="user-info">
            <h3>{currentUser?.userName || currentUser?.username || 'Пользователь'}</h3>
            <p className="role">{ROLE_NAMES[role] || role}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {visible.map(item => (
            <a key={item.page} href={`/${item.page}`}
              className={`nav-item${currentPage === item.page || (currentPage === '' && item.page === 'orders') ? ' active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNav(item.page); }}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d={item.icon} /></svg>
              {item.label}
              {item.page !== 'main' && <span className="arrow">›</span>}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
