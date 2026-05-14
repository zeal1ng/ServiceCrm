import { api } from './api.js';
import { showToast, openModal } from './utils.js';

export async function openHistoryModal() {
    const logs = await api('/activitylogs?limit=100');
    const actionLabels = {
        Login: 'Вход', Register: 'Регистрация',
        Create: 'Создание', Update: 'Изменение', Delete: 'Удаление'
    };
    if (!logs || logs.length === 0) {
        showToast('История пока пуста', 'info');
        return;
    }
    const rows = logs.map(l => {
        const date = new Date(l.createdAt).toLocaleString('ru-RU');
        const actionLabel = actionLabels[l.action] || l.action;
        return `<tr>
            <td style="white-space:nowrap;color:#4b5563">${date}</td>
            <td style="color:#1f2937">${l.userName}</td>
            <td><span style="color:#4caf50;font-weight:600">${actionLabel}</span></td>
            <td style="color:#4b5563">${l.entityType}${l.entityId ? ' #'+l.entityId : ''}</td>
            <td style="color:#4b5563">${l.details || '-'}</td>
        </tr>`;
    }).join('');

    openModal('История действий', `
        <div style="max-height:500px;overflow-y:auto">
            <table style="width:100%;border-collapse:collapse;font-size:12px">
                <thead>
                    <tr style="background:#f9fafb">
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Дата</th>
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Пользователь</th>
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Действие</th>
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Объект</th>
                        <th style="padding:10px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb">Детали</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `);
}
