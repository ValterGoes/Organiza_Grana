import { Bill } from '@/hooks/useBills';
import { calculateSummary, formatCurrency } from '@/lib/billUtils';
import { AlertCircle, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardProps {
  bills: Bill[];
}

export function Dashboard({ bills }: DashboardProps) {
  const summary = calculateSummary(bills);
  const overdueBills = bills.filter((bill) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && !bill.paid;
  });

  const stats = [
    {
      label: 'Total',
      value: formatCurrency(summary.total),
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-700 border-l-blue-500',
    },
    {
      label: 'Pendente',
      value: formatCurrency(summary.pending),
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-700 border-l-amber-500',
    },
    {
      label: 'Pago',
      value: formatCurrency(summary.paid),
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700 border-l-green-500',
    },
    {
      label: 'Vencido',
      value: formatCurrency(summary.overdue),
      icon: AlertCircle,
      color: 'bg-red-50 text-red-700 border-l-red-500',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-lg sm:text-2xl font-bold break-words">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {overdueBills.length > 0 && (
        <div className="rounded-lg border-l-4 border-l-red-500 bg-red-50 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-700" />
            <div className="min-w-0">
              <h3 className="font-semibold text-red-900 text-sm sm:text-base">
                {overdueBills.length} fatura{overdueBills.length !== 1 ? 's' : ''} vencida{overdueBills.length !== 1 ? 's' : ''}!
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-red-700">
                Total: <span className="font-semibold">{formatCurrency(summary.overdue)}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
