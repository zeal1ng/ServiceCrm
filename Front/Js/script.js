// ==================== НАВИГАЦИЯ ====================
// Мобильное меню
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

// Закрытие меню при клике на пункт (мобильный)
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        // Закрыть мобильное меню
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

// Переключение вкладок
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

// Переключение типа заказов
function switchOrderType(btn, type) {
    document.querySelectorAll('.action-buttons .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showToast(`Переключено на: ${type === 'repair' ? 'Ремонты' : 'Продажи'}`, 'success');
}

// ==================== ПОИСК И ФИЛЬТРЫ ====================
function searchOrders() {
    const query = document.getElementById('order-search').value;
    if (query.trim()) {
        showToast(`Поиск: "${query}"`, 'info');
        // Здесь будет fetch к API: fetch(`/api/orders/search?q=${query}`)
    } else {
        showToast('Введите поисковый запрос', 'warning');
    }
}

function openFilterPanel() {
    const filters = `
        <div class="form-group">
            <label>Статус</label>
            <select id="filter-status">
                <option value="">Все статусы</option>
                <option value="new">Новый</option>
                <option value="diagnostics">На диагностике</option>
                <option value="repair">В ремонте</option>
                <option value="ready">Готов</option>
                <option value="issued">Выдан</option>
            </select>
        </div>
        <div class="form-group">
            <label>Мастер</label>
            <select id="filter-master">
                <option value="">Все мастера</option>
                <option value="1">Иванов В.</option>
                <option value="2">Ермаков А.</option>
                <option value="3">Попов А.</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Дата с</label>
                <input type="date" id="filter-date-from">
            </div>
            <div class="form-group">
                <label>Дата по</label>
                <input type="date" id="filter-date-to">
            </div>
        </div>
    `;
    openModal('Фильтры', filters, applyFilters);
}

function applyFilters() {
    const status = document.getElementById('filter-status')?.value;
    const master = document.getElementById('filter-master')?.value;
    showToast('Фильтры применены', 'success');
    closeModal();
    // Здесь будет fetch с параметрами фильтрации
}

// ==================== МОДАЛЬНЫЕ ОКНА ====================
function openModal(title, content, onSave) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
    window.currentOnSave = onSave;
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-overlay').classList.remove('active');
    window.currentOnSave = null;
}

function saveModal() {
    if (window.currentOnSave) {
        window.currentOnSave();
    }
}

// ==================== СОЗДАНИЕ ЗАКАЗА ====================
function openCreateOrderModal() {
    const form = `
        <div class="form-group">
            <label>Тип заказа *</label>
            <select id="order-type">
                <option value="repair">Ремонт</option>
                <option value="sale">Продажа</option>
            </select>
        </div>
        <div class="form-group">
            <label>Клиент *</label>
            <select id="order-client">
                <option value="">Выберите клиента</option>
                <option value="1">Иванов Иван</option>
                <option value="2">Петров Петр</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Устройство *</label>
                <input type="text" id="order-device" placeholder="iPhone 12">
            </div>
            <div class="form-group">
                <label>Серийный номер</label>
                <input type="text" id="order-serial" placeholder="IMEI/SN">
            </div>
        </div>
        <div class="form-group">
            <label>Неисправность *</label>
            <textarea id="order-issue" placeholder="Опишите проблему"></textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Приоритет</label>
                <select id="order-priority">
                    <option value="normal">Обычный</option>
                    <option value="high">Срочно</option>
                    <option value="vip">VIP</option>
                </select>
            </div>
            <div class="form-group">
                <label>Мастер</label>
                <select id="order-master">
                    <option value="">Не назначен</option>
                    <option value="1">Иванов В.</option>
                    <option value="2">Ермаков А.</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="order-comment" placeholder="Дополнительная информация"></textarea>
        </div>
    `;
    openModal('Создание заказа', form, saveOrder);
}

function saveOrder() {
    const orderData = {
        type: document.getElementById('order-type')?.value,
        client: document.getElementById('order-client')?.value,
        device: document.getElementById('order-device')?.value,
        serial: document.getElementById('order-serial')?.value,
        issue: document.getElementById('order-issue')?.value,
        priority: document.getElementById('order-priority')?.value,
        master: document.getElementById('order-master')?.value,
        comment: document.getElementById('order-comment')?.value
    };
    
    // Валидация
    if (!orderData.client || !orderData.device || !orderData.issue) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }
    
    console.log('Сохранение заказа:', orderData);
    // Здесь будет fetch('/api/orders', { method: 'POST', body: JSON.stringify(orderData) })
    
    showToast('Заказ создан!', 'success');
    closeModal();
    updateDashboard();
}

// ==================== СОЗДАНИЕ КЛИЕНТА ====================
function openCreateClientModal() {
    const form = `
        <div class="form-group">
            <label>ФИО *</label>
            <input type="text" id="client-name" placeholder="Иванов Иван Иванович">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Телефон *</label>
                <input type="tel" id="client-phone" placeholder="+7 (___) ___-__-__">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="client-email" placeholder="email@example.com">
            </div>
        </div>
        <div class="form-group">
            <label>Адрес</label>
            <textarea id="client-address" placeholder="Город, улица, дом..."></textarea>
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="client-comment" placeholder="Дополнительная информация"></textarea>
        </div>
    `;
    openModal('Добавление клиента', form, saveClient);
}

function saveClient() {
    const clientData = {
        name: document.getElementById('client-name')?.value,
        phone: document.getElementById('client-phone')?.value,
        email: document.getElementById('client-email')?.value,
        address: document.getElementById('client-address')?.value,
        comment: document.getElementById('client-comment')?.value
    };
    
    if (!clientData.name || !clientData.phone) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }
    
    console.log('Сохранение клиента:', clientData);
    showToast('Клиент добавлен!', 'success');
    closeModal();
}

// ==================== СОЗДАНИЕ ТОВАРА ====================
function openCreateProductModal() {
    const form = `
        <div class="form-group">
            <label>Название *</label>
            <input type="text" id="product-name" placeholder="Дисплей iPhone 12">
        </div>
        <div class="form-group">
            <label>Категория</label>
            <select id="product-category">
                <option value="">Выберите категорию</option>
                <option value="displays">Дисплеи</option>
                <option value="batteries">Аккумуляторы</option>
                <option value="cases">Корпуса</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Закупочная цена</label>
                <input type="number" id="product-buy" placeholder="0">
            </div>
            <div class="form-group">
                <label>Розничная цена *</label>
                <input type="number" id="product-sell" placeholder="0">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Количество *</label>
                <input type="number" id="product-qty" placeholder="0">
            </div>
            <div class="form-group">
                <label>Склад</label>
                <select id="product-warehouse">
                    <option value="1">Основной</option>
                    <option value="2">Дополнительный</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Артикул</label>
            <input type="text" id="product-sku" placeholder="ART-001">
        </div>
    `;
    openModal('Добавление товара', form, saveProduct);
}

function saveProduct() {
    const productData = {
        name: document.getElementById('product-name')?.value,
        category: document.getElementById('product-category')?.value,
        buyPrice: document.getElementById('product-buy')?.value,
        sellPrice: document.getElementById('product-sell')?.value,
        qty: document.getElementById('product-qty')?.value,
        warehouse: document.getElementById('product-warehouse')?.value,
        sku: document.getElementById('product-sku')?.value
    };
    
    if (!productData.name || !productData.sellPrice || !productData.qty) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }
    
    console.log('Сохранение товара:', productData);
    showToast('Товар добавлен!', 'success');
    closeModal();
}

// ==================== СОЗДАНИЕ СКЛАДА ====================
function openCreateWarehouseModal() {
    const form = `
        <div class="form-group">
            <label>Название склада *</label>
            <input type="text" id="warehouse-name" placeholder="Основной склад">
        </div>
        <div class="form-group">
            <label>Адрес</label>
            <textarea id="warehouse-address" placeholder="Город, улица..."></textarea>
        </div>
        <div class="form-group">
            <label>Ответственный</label>
            <select id="warehouse-manager">
                <option value="">Выберите ответственного</option>
                <option value="1">Иванов В.</option>
                <option value="2">Петров А.</option>
            </select>
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="warehouse-comment"></textarea>
        </div>
    `;
    openModal('Добавление склада', form, saveWarehouse);
}

function saveWarehouse() {
    const data = {
        name: document.getElementById('warehouse-name')?.value,
        address: document.getElementById('warehouse-address')?.value,
        manager: document.getElementById('warehouse-manager')?.value,
        comment: document.getElementById('warehouse-comment')?.value
    };
    
    if (!data.name) {
        showToast('Введите название склада', 'error');
        return;
    }
    
    showToast('Склад добавлен!', 'success');
    closeModal();
}

// ==================== СОЗДАНИЕ КАТЕГОРИИ ====================
function openCreateCategoryModal() {
    const form = `
        <div class="form-group">
            <label>Название категории *</label>
            <input type="text" id="category-name" placeholder="Дисплеи">
        </div>
        <div class="form-group">
            <label>Родительская категория</label>
            <select id="category-parent">
                <option value="">Без родительской</option>
                <option value="1">Запчасти</option>
                <option value="2">Аксессуары</option>
            </select>
        </div>
        <div class="form-group">
            <label>Описание</label>
            <textarea id="category-description"></textarea>
        </div>
    `;
    openModal('Добавление категории', form, saveCategory);
}

function saveCategory() {
    const data = {
        name: document.getElementById('category-name')?.value,
        parent: document.getElementById('category-parent')?.value,
        description: document.getElementById('category-description')?.value
    };
    
    if (!data.name) {
        showToast('Введите название категории', 'error');
        return;
    }
    
    showToast('Категория добавлена!', 'success');
    closeModal();
}

// ==================== СОЗДАНИЕ СОТРУДНИКА ====================
function openCreateEmployeeModal() {
    const form = `
        <div class="form-group">
            <label>ФИО *</label>
            <input type="text" id="employee-name" placeholder="Иванов Иван Иванович">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="employee-phone" placeholder="+7 (___) ___-__-__">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="employee-email" placeholder="email@example.com">
            </div>
        </div>
        <div class="form-group">
            <label>Должность *</label>
            <select id="employee-position">
                <option value="">Выберите должность</option>
                <option value="master">Мастер</option>
                <option value="manager">Менеджер</option>
                <option value="admin">Администратор</option>
            </select>
        </div>
        <div class="form-group">
            <label>Специализация</label>
            <input type="text" id="employee-specialization" placeholder="iPhone, Android, MacBook...">
        </div>
        <div class="form-group">
            <label>Процент от заказов</label>
            <input type="number" id="employee-percent" placeholder="10" min="0" max="100">
        </div>
    `;
    openModal('Добавление сотрудника', form, saveEmployee);
}

function saveEmployee() {
    const data = {
        name: document.getElementById('employee-name')?.value,
        phone: document.getElementById('employee-phone')?.value,
        email: document.getElementById('employee-email')?.value,
        position: document.getElementById('employee-position')?.value,
        specialization: document.getElementById('employee-specialization')?.value,
        percent: document.getElementById('employee-percent')?.value
    };
    
    if (!data.name || !data.position) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }
    
    showToast('Сотрудник добавлен!', 'success');
    closeModal();
}

// ==================== НАСТРОЙКИ ====================
function openSettingsModal(type) {
    const titles = {
        general: 'Общие настройки',
        users: 'Пользователи и доступ',
        service: 'Настройки сервиса',
        integrations: 'Интеграции'
    };
    
    let content = '';
    
    if (type === 'general') {
        content = `
            <div class="form-group">
                <label>Название компании</label>
                <input type="text" id="setting-company" value="ServiceCRM">
            </div>
            <div class="form-group">
                <label>Телефон</label>
                <input type="tel" id="setting-phone" placeholder="+7 (___) ___-__-__">
            </div>
            <div class="form-group">
                <label>Адрес</label>
                <textarea id="setting-address"></textarea>
            </div>
            <div class="form-group">
                <label>Режим работы</label>
                <input type="text" id="setting-hours" placeholder="Пн-Пт 9:00-18:00">
            </div>
        `;
    } else if (type === 'users') {
        content = `
            <div class="form-group">
                <label>Новый пользователь</label>
                <input type="text" placeholder="ФИО">
            </div>
            <div class="form-group">
                <label>Роль</label>
                <select>
                    <option>Администратор</option>
                    <option>Менеджер</option>
                    <option>Мастер</option>
                </select>
            </div>
            <p style="color: #6b7280; font-size: 13px;">Список пользователей загрузится из БД</p>
        `;
    } else if (type === 'service') {
        content = `
            <div class="form-group">
                <label>Статусы заказов</label>
                <textarea placeholder="Новый, На диагностике, В ремонте..."></textarea>
            </div>
            <div class="form-group">
                <label>Приоритеты</label>
                <textarea placeholder="Обычный, Срочно, VIP"></textarea>
            </div>
            <div class="form-group">
                <label>Уведомления (email)</label>
                <input type="email" placeholder="notifications@example.com">
            </div>
        `;
    } else if (type === 'integrations') {
        content = `
            <div class="form-group">
                <label>API ключ</label>
                <input type="text" placeholder="sk_...">
            </div>
            <div class="form-group">
                <label>Webhook URL</label>
                <input type="url" placeholder="https://...">
            </div>
            <div class="form-group">
                <label>Telegram бот токен</label>
                <input type="text" placeholder="bot_token">
            </div>
        `;
    }
    
    openModal(titles[type], content, saveSettings);
}

function saveSettings() {
    showToast('Настройки сохранены!', 'success');
    closeModal();
}

// ==================== УВЕДОМЛЕНИЯ ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `<span style="font-size: 18px;">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fadeOut');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showNotification(title) {
    showToast(`${title}: в разработке`, 'info');
}

function toggleNotifications() {
    showToast('Уведомления: в разработке', 'info');
}

// ==================== ДАШБОРД ====================
function loadPageData(pageName) {
    console.log(`Загрузка данных для: ${pageName}`);
    if (pageName === 'main') updateDashboard();
}

function updateDashboard() {
    // Здесь будут реальные данные из БД
    document.getElementById('dash-active-orders').textContent = '0';
    document.getElementById('dash-completed-today').textContent = '0';
    document.getElementById('dash-total-clients').textContent = '0';
    document.getElementById('dash-month-revenue').textContent = '0 Br';
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('ServiceCRM готов');
    console.log('Подключите базу данных для работы функций');
    updateDashboard();
    initParticles();
});

// ==================== АНИМАЦИЯ ЧАСТИЦ ФОНА ====================
function initParticles() {
    const container = document.createElement('div');
    container.className = 'bg-particles';
    document.body.appendChild(container);

    const colors = ['#1a5c63', '#4caf50', '#217a82', '#66bb6a'];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const size = Math.random() * 80 + 20;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 20;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: -${delay}s;
        `;

        container.appendChild(particle);
    }
}

// Закрытие модального окна по ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});
