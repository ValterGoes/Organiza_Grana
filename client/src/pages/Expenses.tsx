import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency, formatDate } from '@/lib/billUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ShoppingBag, CalendarDays, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Expenses() {
  const {
    isLoading,
    addExpense,
    deleteExpense,
    todayExpenses,
    yesterdayExpenses,
    todayTotal,
    yesterdayTotal,
    monthTotal,
    dailyTotals,
  } = useExpenses();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleAdd = () => {
    const trimmed = description.trim();
    const value = parseFloat(amount);
    if (!trimmed) {
      toast.error('Informe o nome do gasto');
      return;
    }
    if (!value || value <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    addExpense(trimmed, value);
    setDescription('');
    setAmount('');
    toast.success('Gasto registrado!');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 mx-auto" />
          <p className="text-gray-600">Carregando gastos...</p>
        </div>
      </div>
    );
  }

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gastos Diários</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">
            Registre seus gastos do dia a dia
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-blue-700 opacity-75">Hoje</span>
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-blue-700 break-words">{formatCurrency(todayTotal)}</p>
            <p className="text-xs text-blue-600">{todayExpenses.length} gasto{todayExpenses.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-amber-700 opacity-75">Ontem</span>
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-amber-700 break-words">{formatCurrency(yesterdayTotal)}</p>
            <p className="text-xs text-amber-600">{yesterdayExpenses.length} gasto{yesterdayExpenses.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border-l-4 border-l-green-500 bg-green-50 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-green-700 opacity-75 capitalize">{monthName}</span>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-700" />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-green-700 break-words">{formatCurrency(monthTotal)}</p>
          </div>
        </section>

        {/* Quick Add */}
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Novo Gasto</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="exp-desc" className="sr-only">Descrição</Label>
              <Input
                id="exp-desc"
                placeholder="Ex: Padaria, Uber, Mercado..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="w-full sm:w-32">
              <Label htmlFor="exp-amount" className="sr-only">Valor</Label>
              <Input
                id="exp-amount"
                type="number"
                step="0.01"
                placeholder="R$ 0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </section>

        {/* Today's Expenses */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Gastos de Hoje ({todayExpenses.length})
          </h2>
          {todayExpenses.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-500">Nenhum gasto registrado hoje</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        deleteExpense(expense.id);
                        toast.success('Gasto removido');
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end border-t border-gray-200 pt-2">
                <span className="text-sm font-bold text-gray-700">
                  Total: {formatCurrency(todayTotal)}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Yesterday's Expenses */}
        {yesterdayExpenses.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Gastos de Ontem ({yesterdayExpenses.length})
            </h2>
            <div className="space-y-2">
              {yesterdayExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 opacity-75"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-700 truncate">{expense.description}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-end border-t border-gray-200 pt-2">
                <span className="text-sm font-bold text-gray-700">
                  Total: {formatCurrency(yesterdayTotal)}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Monthly History */}
        {dailyTotals.length > 0 && (
          <section>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <span className="text-sm font-semibold text-gray-700 capitalize">
                Resumo do mês · {monthName}
              </span>
              {showHistory ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {showHistory && (
              <div className="mt-2 space-y-1">
                {dailyTotals.map(({ date, total }) => (
                  <div
                    key={date}
                    className="flex items-center justify-between rounded-lg bg-white px-4 py-2 text-sm"
                  >
                    <span className="text-gray-600">{formatDate(date)}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
                  </div>
                ))}
                <div className="flex justify-end border-t border-gray-200 pt-2 px-4">
                  <span className="text-sm font-bold text-green-700">
                    Total do mês: {formatCurrency(monthTotal)}
                  </span>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
