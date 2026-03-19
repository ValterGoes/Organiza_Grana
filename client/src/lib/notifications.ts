import { Bill } from '@/hooks/useBills';
import { calculateBillStatus } from './billUtils';

const LAST_CHECK_KEY = 'gerenciador-vencimentos-last-notification-check';
const MAX_NOTIFICATIONS = 3;

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function wasCheckedToday(): boolean {
  return localStorage.getItem(LAST_CHECK_KEY) === getTodayString();
}

function markCheckedToday(): void {
  localStorage.setItem(LAST_CHECK_KEY, getTodayString());
}

export function checkAndNotifyDueBills(bills: Bill[]): void {
  if (Notification.permission !== 'granted') return;
  if (wasCheckedToday()) return;

  markCheckedToday();

  const urgentBills = bills
    .filter((bill) => {
      if (bill.paid) return false;
      const status = calculateBillStatus(bill);
      return status.urgency === 'overdue' || status.urgency === 'urgent' || status.urgency === 'warning';
    })
    .sort((a, b) => {
      const sa = calculateBillStatus(a);
      const sb = calculateBillStatus(b);
      return sa.daysUntilDue - sb.daysUntilDue;
    });

  if (urgentBills.length === 0) return;

  // Mostrar até MAX_NOTIFICATIONS
  const toNotify = urgentBills.slice(0, MAX_NOTIFICATIONS);

  toNotify.forEach((bill, i) => {
    const status = calculateBillStatus(bill);

    setTimeout(() => {
      new Notification(
        status.isOverdue
          ? `Fatura vencida!`
          : status.daysUntilDue === 0
            ? `Fatura vence hoje!`
            : `Fatura vence em ${status.daysUntilDue} dia${status.daysUntilDue !== 1 ? 's' : ''}`,
        {
          body: bill.description,
          icon: '/icon.svg',
          tag: `bill-${bill.id}`,
        },
      );
    }, i * 500); // Espaçar notificações
  });

  if (urgentBills.length > MAX_NOTIFICATIONS) {
    setTimeout(() => {
      new Notification('Mais faturas pendentes', {
        body: `Você tem mais ${urgentBills.length - MAX_NOTIFICATIONS} fatura(s) próxima(s) do vencimento.`,
        icon: '/icon.svg',
        tag: 'bill-more',
      });
    }, MAX_NOTIFICATIONS * 500);
  }
}
