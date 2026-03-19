import { useState, useEffect, useCallback, useMemo } from 'react';
import { nanoid } from 'nanoid';
import * as secureStorage from '@/lib/secureStorage';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

const STORAGE_KEY = 'gerenciador-vencimentos-expenses';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar do storage criptografado
  useEffect(() => {
    let cancelled = false;
    secureStorage
      .load(STORAGE_KEY)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setExpenses(data as Expense[]);
        }
      })
      .catch((err) => console.error('Erro ao carregar gastos:', err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Salvar no storage criptografado
  useEffect(() => {
    if (!isLoading) {
      secureStorage.save(STORAGE_KEY, expenses).catch((err) => {
        console.error('Erro ao salvar gastos:', err);
      });
    }
  }, [expenses, isLoading]);

  const addExpense = useCallback((description: string, amount: number) => {
    const newExpense: Expense = {
      id: nanoid(),
      description,
      amount,
      date: getToday(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const today = getToday();
  const yesterday = getYesterday();
  const currentMonth = getCurrentMonth();

  const todayExpenses = useMemo(
    () => expenses.filter((e) => e.date === today),
    [expenses, today]
  );

  const yesterdayExpenses = useMemo(
    () => expenses.filter((e) => e.date === yesterday),
    [expenses, yesterday]
  );

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(currentMonth)),
    [expenses, currentMonth]
  );

  const todayTotal = useMemo(
    () => todayExpenses.reduce((sum, e) => sum + e.amount, 0),
    [todayExpenses]
  );

  const yesterdayTotal = useMemo(
    () => yesterdayExpenses.reduce((sum, e) => sum + e.amount, 0),
    [yesterdayExpenses]
  );

  const monthTotal = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses]
  );

  // Agrupar por dia para histórico
  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExpenses) {
      map.set(e.date, (map.get(e.date) || 0) + e.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, total]) => ({ date, total }));
  }, [monthExpenses]);

  return {
    expenses,
    isLoading,
    addExpense,
    deleteExpense,
    todayExpenses,
    yesterdayExpenses,
    monthExpenses,
    todayTotal,
    yesterdayTotal,
    monthTotal,
    dailyTotals,
  };
}
