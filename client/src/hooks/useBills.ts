import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import * as secureStorage from '@/lib/secureStorage';

export interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: 'fatura' | 'boleto' | 'cobranca';
  paid: boolean;
  alertDays: number;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'gerenciador-vencimentos-bills';
const NOTIFICATION_SCHEDULE_KEY = 'gerenciador-vencimentos-notifications-schedule';

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

  const addBill = useCallback((bill: Omit<Bill, 'id' | 'createdAt'>) => {
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

  const markAsPaid = useCallback((id: string) => {
    updateBill(id, { paid: true });
  }, [updateBill]);

  return {
    bills,
    isLoading,
    addBill,
    updateBill,
    deleteBill,
    markAsPaid,
  };
}
