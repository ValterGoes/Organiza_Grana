import { useState } from 'react';
import { Bill } from '@/hooks/useBills';
import { calculateSummary, calculateBillStatus, formatCurrency } from '@/lib/billUtils';
import { AlertCircle, CheckCircle2, DollarSign, TrendingUp, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  bills: Bill[];
  allBills: Bill[];
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
}

function formatMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
}

function shiftMonth(yearMonth: string, offset: number): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function Dashboard({ bills, allBills, selectedMonth, onMonthChange }: DashboardProps) {
  const summary = calculateSummary(bills);
  const isCurrentMonth = selectedMonth === getCurrentMonth();
  const [showOverdue, setShowOverdue] = useState(false);

  // Faturas vencidas de QUALQUER mês (não pagas e com data passada)
  const overdueBills = allBills.filter((bill) => {
    const status = calculateBillStatus(bill);
    return status.isOverdue;
  });

  const overdueTotal = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);

  const stats = [
    {
      label: 'Total do Mês',
      value: formatCurrency(summary.total),
      icon: DollarSign,
      color: 'bg-[#3BA36C]/10 text-[#2d7a50] border-l-[#3BA36C]',
    },
    {
      label: 'Pendente',
      value: formatCurrency(summary.pending),
      icon: TrendingUp,
      color: 'bg-[#F79030]/10 text-[#c06a1a] border-l-[#F79030]',
    },
    {
      label: 'Pago',
      value: formatCurrency(summary.paid),
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700 border-l-green-500',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(shiftMonth(selectedMonth, -1))}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="text-center">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
            {formatMonthLabel(selectedMonth)}
          </h2>
          {!isCurrentMonth && (
            <button
              onClick={() => onMonthChange(getCurrentMonth())}
              className="text-xs text-[#3BA36C] hover:underline"
            >
              Voltar ao mês atual
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(shiftMonth(selectedMonth, 1))}
          className="gap-1"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats do mês */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`flex flex-col gap-2 rounded-lg border-l-4 p-3 sm:p-4 ${stat.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium opacity-75">{stat.label}</span>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Faturas vencidas (global, colapsável) */}
      {overdueBills.length > 0 && (
        <div className="rounded-lg border-l-4 border-l-red-500 bg-red-50">
          <button
            onClick={() => setShowOverdue(!showOverdue)}
            className="flex w-full items-center justify-between p-3 sm:p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-700" />
              <div className="text-left">
                <h3 className="font-semibold text-red-900 text-sm sm:text-base">
                  {overdueBills.length} fatura{overdueBills.length !== 1 ? 's' : ''} vencida{overdueBills.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-xs sm:text-sm text-red-700">
                  Total: <span className="font-semibold">{formatCurrency(overdueTotal)}</span>
                </p>
              </div>
            </div>
            {showOverdue ? (
              <ChevronUp className="h-5 w-5 text-red-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-red-500" />
            )}
          </button>

          {showOverdue && (
            <div className="border-t border-red-200 px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="mt-2 space-y-2">
                {overdueBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between rounded-md bg-white/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-red-900 truncate">{bill.description}</p>
                      <p className="text-xs text-red-600">
                        Venceu em {new Date(bill.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-red-800 ml-3 flex-shrink-0">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
