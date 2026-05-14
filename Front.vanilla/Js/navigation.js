import { updateDashboard } from './dashboard.js';
import { loadOrders } from './orders.js';
import { loadClients } from './clients.js';
import { loadProducts } from './products.js';
import { loadWarehouses } from './warehouses.js';
import { loadEmployees } from './employees.js';
import { loadAccounting } from './accounting.js';
import { currentUser } from './auth.js';

export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

function loadPageData(pageName) {
    const allowed = {
        accounting: ['Admin', 'Manager'],
        settings: ['Admin']
    };
    if (allowed[pageName] && (!currentUser || !allowed[pageName].includes(currentUser.role))) {
        document.querySelector('.nav-item[data-page="main"]').click();
        return;
    }
    switch (pageName) {
        case 'main': updateDashboard(); break;
        case 'orders': loadOrders(); break;
        case 'clients': loadClients(); break;
        case 'products': loadProducts(); break;
        case 'warehouses': loadWarehouses(); break;
        case 'employees': loadEmployees(); break;
        case 'accounting': loadAccounting(); break;
    }
}

export function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebar-overlay');
                if (sidebar) sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            }
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const pageName = this.dataset.page;
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            const targetPage = document.getElementById(`page-${pageName}`);
            if (targetPage) targetPage.classList.add('active');
            loadPageData(pageName);
        });
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const tabName = this.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            const targetContent = document.getElementById(`tab-${tabName}`);
            if (targetContent) targetContent.classList.add('active');
        });
    });
}
