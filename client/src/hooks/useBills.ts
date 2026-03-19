import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import * as secureStorage from '@/lib/secureStorage';

export interface Recurrence {
  frequency: 'monthly' | 'weekly' | 'biweekly';
  totalInstallments: number;
  currentInstallment: number;
  seriesId: string;
}

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: 'fatura' | 'boleto' | 'cobranca';
  paid: boolean;
  alertDays: number;
  notes?: string;
  recurrence?: Recurrence;
  createdAt: string;
}

export interface RecurrenceInput {
  frequency: 'monthly' | 'weekly' | 'biweekly';
  totalInstallments: number;
}

const STORAGE_KEY = 'gerenciador-vencimentos-bills';
const NOTIFICATION_SCHEDULE_KEY = 'gerenciador-vencimentos-notifications-schedule';

function calculateNextDueDate(baseDate: string, frequency: RecurrenceInput['frequency'], offset: number): string {
  const date = new Date(baseDate + 'T12:00:00');
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + offset * 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + offset * 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + offset);
      break;
  }
  return date.toISOString().split('T')[0];
}

function updateNotificationSchedule(bills: Bill[]) {
  // Armazena apenas dados mínimos (sem valores financeiros) para o Service Worker
  const schedule = bills
    .filter((bill) => !bill.paid)
    .map((bill) => ({
      id: bill.id,
      description: bill.description,
      dueDate: bill.dueDate,
      alertDays: bill.alertDays,
    }));
  localStorage.setItem(NOTIFICATION_SCHEDULE_KEY, JSON.stringify(schedule));
}

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar bills do storage criptografado
  useEffect(() => {
    let cancelled = false;

    secureStorage
      .load(STORAGE_KEY)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setBills(data as Bill[]);
        }
      })
      .catch((err) => {
        console.error('Erro ao carregar bills:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Salvar bills no storage criptografado
  useEffect(() => {
    if (!isLoading) {
      secureStorage.save(STORAGE_KEY, bills).catch((err) => {
        console.error('Erro ao salvar bills:', err);
      });
      updateNotificationSchedule(bills);
    }
  }, [bills, isLoading]);

  const addBill = useCallback((bill: Omit<Bill, 'id' | 'createdAt'>, recurrenceInput?: RecurrenceInput) => {
    if (recurrenceInput && recurrenceInput.totalInstallments > 1) {
      const seriesId = nanoid();
      const newBills: Bill[] = [];

      for (let i = 0; i < recurrenceInput.totalInstallments; i++) {
        newBills.push({
          ...bill,
          id: nanoid(),
          dueDate: calculateNextDueDate(bill.dueDate, recurrenceInput.frequency, i),
          recurrence: {
            frequency: recurrenceInput.frequency,
            totalInstallments: recurrenceInput.totalInstallments,
            currentInstallment: i + 1,
            seriesId,
          },
          createdAt: new Date().toISOString(),
        });
      }

      setBills((prev) => [...newBills, ...prev]);
      return newBills[0];
    }

    const newBill: Bill = {
      ...bill,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    setBills((prev) => [newBill, ...prev]);
    return newBill;
  }, []);

  const updateBill = useCallback((id: string, updates: Partial<Bill>) => {
    setBills((prev) =>
      prev.map((bill) => (bill.id === id ? { ...bill, ...updates } : bill))
    );
  }, []);

  const deleteBill = useCallback((id: string) => {
    setBills((prev) => prev.filter((bill) => bill.id !== id));
  }, []);

  const deleteRecurrenceSeries = useCallback((seriesId: string) => {
    setBills((prev) => prev.filter((bill) => bill.recurrence?.seriesId !== seriesId));
  }, []);

  const markSeriesAsPaid = useCallback((seriesId: string) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.recurrence?.seriesId === seriesId ? { ...bill, paid: true } : bill
      )
    );
  }, []);

  const markAsPaid = useCallback((id: string) => {
    updateBill(id, { paid: true });
  }, [updateBill]);

  return {
    bills,
    isLoading,
    addBill,
    updateBill,
    deleteBill,
    deleteRecurrenceSeries,
    markAsPaid,
    markSeriesAsPaid,
  };
}
