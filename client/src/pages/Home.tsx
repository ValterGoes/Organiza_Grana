import { useState, useMemo, useEffect } from 'react';
import { useBills, Bill, RecurrenceInput } from '@/hooks/useBills';
import { BillCard } from '@/components/BillCard';
import { BillModal } from '@/components/BillModal';
import { Dashboard } from '@/components/Dashboard';
import { NotificationPrompt } from '@/components/NotificationPrompt';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sortBillsByUrgency, filterBillsByStatus, filterBillsByMonth } from '@/lib/billUtils';
import { checkAndNotifyDueBills } from '@/lib/notifications';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Design Philosophy: Minimalismo Funcional com Urgência Visual
 * - Cores como linguagem: Vermelho (vencido), Amarelo (próximo), Verde (em dia)
 * - Interface limpa e sem distrações
 * - Cards com barra lateral colorida indicando urgência
 * - Transições suaves (150ms)
 */

export default function Home() {
  const { bills, isLoading, addBill, updateBill, deleteBill, markAsPaid } = useBills();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | undefined>();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  // Checar notificações de vencimento ao abrir o app
  useEffect(() => {
    if (bills.length > 0) {
      checkAndNotifyDueBills(bills);
    }
  }, [bills]);

  const monthBills = useMemo(
    () => filterBillsByMonth(bills, selectedMonth),
    [bills, selectedMonth]
  );

  // IDs de faturas projetadas (parcela futura, não a próxima a vencer)
  const projectedIds = useMemo(() => {
    const set = new Set<string>();
    const originalMap = new Map(bills.map((b) => [b.id, b.dueDate]));
    for (const mb of monthBills) {
      const original = originalMap.get(mb.id);
      if (original && mb.dueDate !== original) {
        set.add(mb.id);
      }
    }
    return set;
  }, [bills, monthBills]);

  const filteredAndSortedBills = useMemo(() => {
    const filtered = filterBillsByStatus(monthBills, filterStatus);
    return sortBillsByUrgency(filtered);
  }, [monthBills, filterStatus]);

  const handleSaveBill = (billData: Omit<Bill, 'id' | 'createdAt'>, recurrence?: RecurrenceInput) => {
    if (editingBill) {
      updateBill(editingBill.id, billData);
      toast.success('Fatura atualizada com sucesso!');
    } else if (recurrence) {
      addBill(billData, recurrence);
      toast.success(`Fatura recorrente criada com ${recurrence.totalInstallments} parcelas!`);
    } else {
      addBill(billData);
      toast.success('Fatura criada com sucesso!');
    }
    setEditingBill(undefined);
  };

  const handleDeleteBill = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta fatura?')) {
      deleteBill(id);
      toast.success('Fatura deletada com sucesso!');
    }
  };


  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleOpenNewBill = () => {
    setEditingBill(undefined);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#3BA36C] mx-auto"></div>
          <p className="text-gray-600">Carregando faturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Permission Prompt */}
      <NotificationPrompt />

      {/* Header */}
      <header className="border-b border-gray-200 bg-gradient-to-r from-[#3BA36C] to-[#2d8a56] shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/Logo.webp" alt="Organiza Grana" className="h-10 sm:h-12 w-auto" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Faturas a Vencer</h1>
                <p className="text-xs sm:text-sm text-white/75">
                  Acompanhe suas faturas, boletos e cobranças
                </p>
              </div>
            </div>
            <Button
              onClick={handleOpenNewBill}
              className="gap-2 w-full sm:w-auto bg-[#F79030] hover:bg-[#e07d20] text-white border-0"
            >
              <Plus className="h-5 w-5" />
              <span>Nova Fatura</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Dashboard */}
        <section className="mb-8">
          <Dashboard bills={monthBills} allBills={bills} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        </section>

        {/* Filters */}
        <section className="mb-6">
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Faturas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="paid">Pagas</SelectItem>
              <SelectItem value="overdue">Vencidas</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {/* Bills List */}
        <section>
          {filteredAndSortedBills.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 sm:p-12 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                {bills.length === 0
                  ? 'Nenhuma fatura cadastrada. Clique em "Nova Fatura" para começar!'
                  : 'Nenhuma fatura encontrada com os filtros selecionados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Exibindo {filteredAndSortedBills.length} de {monthBills.length} fatura{monthBills.length !== 1 ? 's' : ''} do mês
              </p>
              {filteredAndSortedBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onMarkAsPaid={markAsPaid}
                  onDelete={handleDeleteBill}
                  onEdit={handleEditBill}
                  isProjected={projectedIds.has(bill.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      <BillModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBill(undefined);
        }}
        onSave={handleSaveBill}
        initialBill={editingBill}
      />
    </div>
  );
}
