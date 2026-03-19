import { Bill } from '@/hooks/useBills';
import { calculateBillStatus, formatCurrency } from '@/lib/billUtils';
import { AlertCircle, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AlertNotificationProps {
  bills: Bill[];
}

export function AlertNotification({ bills }: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Encontrar faturas com urgência
  const urgentBills = bills.filter((bill) => {
    const status = calculateBillStatus(bill);
    return status.urgency === 'overdue' || status.urgency === 'urgent';
  });

  useEffect(() => {
    if (urgentBills.length > 0) {
      setIsVisible(true);
    }
  }, [urgentBills.length]);

  if (!isVisible || urgentBills.length === 0) {
    return null;
  }

  const totalUrgent = urgentBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-lg border-l-4 border-l-red-500 bg-red-50 p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-700" />
            <div>
              <h3 className="font-semibold text-red-900">
                {urgentBills.length} fatura{urgentBills.length !== 1 ? 's' : ''} urgente{urgentBills.length !== 1 ? 's' : ''}!
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Total: <span className="font-semibold">{formatCurrency(totalUrgent)}</span>
              </p>
              <div className="mt-2 space-y-1">
                {urgentBills.slice(0, 2).map((bill) => (
                  <div key={bill.id} className="flex items-center gap-2 text-xs text-red-600">
                    <Clock className="h-3 w-3" />
                    <span>{bill.description}</span>
                  </div>
                ))}
                {urgentBills.length > 2 && (
                  <p className="text-xs text-red-600">
                    +{urgentBills.length - 2} mais
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-red-700 hover:text-red-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
