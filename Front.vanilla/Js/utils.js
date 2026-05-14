export function validatePhone(phone) {
    return /^[\+\d\s\-\(\)]{6,20}$/.test(phone);
}

export function validateEmail(email) {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `<span style="font-size:18px">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fadeOut');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function showNotification(title) { showToast(`${title}: в разработке`, 'info'); }

export function toggleNotifications() { showToast('Уведомления: в разработке', 'info'); }

let currentOnSave = null;

export function openModal(title, content, onSave) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
    currentOnSave = onSave;
}

export function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modal-overlay').classList.remove('active');
    currentOnSave = null;
}

export function saveModal() {
    if (currentOnSave) currentOnSave();
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
});
