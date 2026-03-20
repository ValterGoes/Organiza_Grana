import { Bill, calculateNextDueDate } from '@/hooks/useBills';

export type UrgencyLevel = 'overdue' | 'urgent' | 'warning' | 'normal' | 'paid';

export interface BillStatus {
  urgency: UrgencyLevel;
  daysUntilDue: number;
  isOverdue: boolean;
  displayText: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
}

export function calculateBillStatus(bill: Bill): BillStatus {
  if (bill.paid) {
    return {
      urgency: 'paid',
      daysUntilDue: 0,
      isOverdue: false,
      displayText: 'Pago',
      color: 'text-green-700',
      backgroundColor: 'bg-green-50',
      borderColor: 'border-l-green-500',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let urgency: UrgencyLevel;
  let displayText: string;
  let color: string;
  let backgroundColor: string;
  let borderColor: string;

  if (daysUntilDue < 0) {
    urgency = 'overdue';
    const daysOverdue = Math.abs(daysUntilDue);
    displayText = `Vencido há ${daysOverdue} dia${daysOverdue !== 1 ? 's' : ''}`;
    color = 'text-red-700';
    backgroundColor = 'bg-red-50';
    borderColor = 'border-l-red-500';
  } else if (daysUntilDue === 0) {
    urgency = 'urgent';
    displayText = 'Vence hoje!';
    color = 'text-red-700';
    backgroundColor = 'bg-red-50';
    borderColor = 'border-l-red-500';
  } else if (daysUntilDue <= bill.alertDays) {
    urgency = 'warning';
    displayText = `Vence em ${daysUntilDue} dia${daysUntilDue !== 1 ? 's' : ''}`;
    color = 'text-amber-700';
    backgroundColor = 'bg-amber-50';
    borderColor = 'border-l-amber-500';
  } else {
    urgency = 'normal';
    displayText = `Vence em ${daysUntilDue} dias`;
    color = 'text-blue-700';
    backgroundColor = 'bg-blue-50';
    borderColor = 'border-l-blue-500';
  }

  return {
    urgency,
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
    displayText,
    color,
    backgroundColor,
    borderColor,
  };
}

export function getUrgencyIcon(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'overdue':
      return '\u26A0\uFE0F';
    case 'urgent':
      return '\uD83D\uDD34';
    case 'warning':
      return '\uD83D\uDFE1';
    case 'normal':
    case 'paid':
      return '\u2713';
    default:
      return '\u2022';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function sortBillsByUrgency(bills: Bill[]): Bill[] {
  return [...bills].sort((a, b) => {
    const statusA = calculateBillStatus(a);
    const statusB = calculateBillStatus(b);

    const urgencyOrder = { overdue: 0, urgent: 1, warning: 2, normal: 3, paid: 4 };
    const orderDiff = urgencyOrder[statusA.urgency] - urgencyOrder[statusB.urgency];

    if (orderDiff !== 0) return orderDiff;

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function filterBillsByStatus(
  bills: Bill[],
  filter: 'all' | 'pending' | 'paid' | 'overdue'
): Bill[] {
  return bills.filter((bill) => {
    if (filter === 'all') return true;
    if (filter === 'paid') return bill.paid;
    if (filter === 'pending') return !bill.paid;
    if (filter === 'overdue') {
      const status = calculateBillStatus(bill);
      return status.isOverdue;
    }
    return true;
  });
}

/**
 * Filtra bills por mês. Para faturas recorrentes, projeta a data de vencimento
 * da parcela correspondente ao mês selecionado.
 */
export function filterBillsByMonth(bills: Bill[], yearMonth: string): Bill[] {
  const result: Bill[] = [];

  for (const bill of bills) {
    // Fatura simples ou já quitada: checar se o vencimento cai no mês
    if (!bill.recurrence) {
      if (bill.dueDate.startsWith(yearMonth)) {
        result.push(bill);
      }
      continue;
    }

    // Fatura recorrente já totalmente paga: mostrar no mês do último vencimento
    if (bill.paid) {
      if (bill.dueDate.startsWith(yearMonth)) {
        result.push(bill);
      }
      continue;
    }

    // Fatura recorrente: checar se alguma parcela restante cai no mês
    // Iterar a partir da primeira parcela não paga (offset = paidInstallments)
    for (let i = bill.recurrence.paidInstallments; i < bill.recurrence.totalInstallments; i++) {
      const futureDate = calculateNextDueDate(bill.dueDate, bill.recurrence.frequency, i);
      if (futureDate.startsWith(yearMonth)) {
        // Retorna o bill com a dueDate projetada para esse mês
        // e o número da parcela correspondente
        result.push({
          ...bill,
          dueDate: futureDate,
          recurrence: {
            ...bill.recurrence,
            // Mostrar qual parcela é neste mês
            paidInstallments: i,
          },
        });
        break;
      }
      // Otimização: se já passou do mês alvo, parar
      if (futureDate > yearMonth + '-31') {
        break;
      }
    }
  }

  return result;
}

export function calculateSummary(bills: Bill[]) {
  const total = bills.reduce((sum, bill) => sum + bill.amount, 0);

  const paid = bills
    .filter((bill) => bill.paid)
    .reduce((sum, bill) => sum + bill.amount, 0);

  const overdue = bills
    .filter((bill) => {
      const status = calculateBillStatus(bill);
      return status.isOverdue;
    })
    .reduce((sum, bill) => sum + bill.amount, 0);

  // Pendente = não paga E não vencida (dentro do prazo)
  const pending = bills
    .filter((bill) => {
      if (bill.paid) return false;
      const status = calculateBillStatus(bill);
      return !status.isOverdue;
    })
    .reduce((sum, bill) => sum + bill.amount, 0);

  return { total, pending, paid, overdue };
}
