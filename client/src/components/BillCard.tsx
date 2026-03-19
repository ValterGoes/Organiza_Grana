import { Bill } from '@/hooks/useBills';
import { calculateBillStatus, formatCurrency, formatDate, getUrgencyIcon } from '@/lib/billUtils';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trash2, Edit2, Repeat } from 'lucide-react';

interface BillCardProps {
  bill: Bill;
  onMarkAsPaid: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (bill: Bill) => void;
  /** True when this card shows a future projected installment (not the next due) */
  isProjected?: boolean;
}

export function BillCard({ bill, onMarkAsPaid, onDelete, onEdit, isProjected }: BillCardProps) {
  const status = calculateBillStatus(bill);
  const rec = bill.recurrence;
  const remaining = rec ? rec.totalInstallments - rec.paidInstallments : 0;

  return (
    <div
      className={`flex flex-col gap-4 rounded-lg border-l-4 p-4 transition-all duration-150 ${status.backgroundColor} ${status.borderColor} hover:shadow-md`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg flex-shrink-0">{getUrgencyIcon(status.urgency)}</span>
            <h3 className="font-semibold text-gray-900 break-words">{bill.description}</h3>
          </div>
          <p className={`mt-1 text-sm font-medium ${status.color}`}>
            {status.displayText}
          </p>
        </div>
        <div className="text-right sm:whitespace-nowrap">
          <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
          <p className="text-xs text-gray-500">{formatDate(bill.dueDate)}</p>
        </div>
      </div>

      {/* Barra de progresso para recorrentes */}
      {rec && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-blue-700">
              <Repeat className="h-3 w-3" />
              {rec.frequency === 'monthly' && 'Mensal'}
              {rec.frequency === 'weekly' && 'Semanal'}
              {rec.frequency === 'biweekly' && 'Quinzenal'}
            </span>
            <span className="text-gray-600">
              {rec.paidInstallments}/{rec.totalInstallments} pagas · {remaining} restante{remaining !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(rec.paidInstallments / rec.totalInstallments) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700">
            {bill.category === 'fatura' && 'Fatura'}
            {bill.category === 'boleto' && 'Boleto'}
            {bill.category === 'cobranca' && 'Cobrança'}
          </span>
          {rec && !bill.paid && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
              Parcela {rec.paidInstallments + 1} de {rec.totalInstallments}
            </span>
          )}
          {bill.paid && (
            <span className="inline-block rounded-full bg-green-200 px-2 py-1 text-xs font-medium text-green-700">
              {rec ? 'Quitado' : 'Pago'}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!bill.paid && !isProjected && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkAsPaid(bill.id)}
              className="gap-1 flex-1 sm:flex-none"
              title={rec ? `Pagar parcela ${rec.paidInstallments + 1}` : 'Marcar como pago'}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">
                {rec ? `Pagar ${rec.paidInstallments + 1}ª` : 'Pagar'}
              </span>
            </Button>
          )}
          {isProjected && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
              Futura
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(bill)}
            className="gap-1 flex-1 sm:flex-none"
            title="Editar fatura"
          >
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(bill.id)}
            className="gap-1 flex-1 sm:flex-none text-red-600 hover:bg-red-50"
            title="Deletar fatura"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Deletar</span>
          </Button>
        </div>
      </div>

      {bill.notes && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Notas:</span> {bill.notes}
          </p>
        </div>
      )}
    </div>
  );
}
