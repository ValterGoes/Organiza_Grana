import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bill, RecurrenceInput } from '@/hooks/useBills';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const billSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number({ error: 'Informe um valor válido' }).positive('Valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  category: z.enum(['fatura', 'boleto', 'cobranca']),
  alertDays: z.number().int().min(0, 'Deve ser 0 ou mais'),
  notes: z.string().default(''),
  paid: z.boolean(),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.enum(['monthly', 'weekly', 'biweekly']).default('monthly'),
  recurrenceInstallments: z.number().int().min(2, 'Mínimo 2 parcelas').max(60, 'Máximo 60 parcelas').default(12),
});

type BillFormData = z.infer<typeof billSchema>;

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id' | 'createdAt'>, recurrence?: RecurrenceInput) => void;
  initialBill?: Bill;
}

export function BillModal({ isOpen, onClose, onSave, initialBill }: BillModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema) as any,
    defaultValues: {
      description: '',
      amount: undefined,
      dueDate: '',
      category: 'fatura',
      alertDays: 7,
      notes: '',
      paid: false,
      isRecurring: false,
      recurrenceFrequency: 'monthly',
      recurrenceInstallments: 12,
    },
  });

  const category = watch('category');
  const paid = watch('paid');
  const isRecurring = watch('isRecurring');
  const isEditingRecurring = !!initialBill?.recurrence;

  useEffect(() => {
    if (initialBill) {
      reset({
        description: initialBill.description,
        amount: initialBill.amount,
        dueDate: initialBill.dueDate,
        category: initialBill.category,
        alertDays: initialBill.alertDays,
        notes: initialBill.notes || '',
        paid: initialBill.paid,
        isRecurring: false,
        recurrenceFrequency: initialBill.recurrence?.frequency || 'monthly',
        recurrenceInstallments: initialBill.recurrence?.totalInstallments || 12,
      });
    } else {
      reset({
        description: '',
        amount: undefined,
        dueDate: '',
        category: 'fatura',
        alertDays: 7,
        notes: '',
        paid: false,
        isRecurring: false,
        recurrenceFrequency: 'monthly',
        recurrenceInstallments: 12,
      });
    }
  }, [initialBill, isOpen, reset]);

  const onSubmit = (data: BillFormData) => {
    const billData: Omit<Bill, 'id' | 'createdAt'> = {
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate,
      category: data.category,
      alertDays: data.alertDays,
      notes: data.notes || undefined,
      paid: data.paid,
    };

    const recurrence: RecurrenceInput | undefined =
      data.isRecurring && !initialBill
        ? { frequency: data.recurrenceFrequency, totalInstallments: data.recurrenceInstallments }
        : undefined;

    onSave(billData, recurrence);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialBill ? 'Editar Fatura' : 'Nova Fatura'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="Ex: Conta de água"
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={(value) => setValue('category', value as BillFormData['category'])}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fatura">Fatura</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="cobranca">Cobrança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="alertDays">Alertar com (dias) *</Label>
              <Input
                id="alertDays"
                type="number"
                placeholder="7"
                {...register('alertDays', { valueAsNumber: true })}
              />
              {errors.alertDays && (
                <p className="mt-1 text-xs text-red-600">{errors.alertDays.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="paid">Status</Label>
            <Select value={paid ? 'paid' : 'pending'} onValueChange={(value) => setValue('paid', value === 'paid')}>
              <SelectTrigger id="paid">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recorrência - apenas ao criar nova fatura */}
          {!initialBill && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="isRecurring" className="cursor-pointer">Fatura Recorrente</Label>
                <Switch
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setValue('isRecurring', checked)}
                />
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label htmlFor="recurrenceFrequency" className="text-xs">Frequência</Label>
                    <Select
                      value={watch('recurrenceFrequency')}
                      onValueChange={(value) => setValue('recurrenceFrequency', value as BillFormData['recurrenceFrequency'])}
                    >
                      <SelectTrigger id="recurrenceFrequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recurrenceInstallments" className="text-xs">Parcelas</Label>
                    <Input
                      id="recurrenceInstallments"
                      type="number"
                      min={2}
                      max={60}
                      {...register('recurrenceInstallments', { valueAsNumber: true })}
                    />
                    {errors.recurrenceInstallments && (
                      <p className="mt-1 text-xs text-red-600">{errors.recurrenceInstallments.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Indicador de recorrência ao editar */}
          {isEditingRecurring && initialBill?.recurrence && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {initialBill.recurrence.paidInstallments}/{initialBill.recurrence.totalInstallments} parcelas pagas
              {' · '}
              {initialBill.recurrence.totalInstallments - initialBill.recurrence.paidInstallments} restantes
              {' · '}
              {initialBill.recurrence.frequency === 'monthly' && 'Mensal'}
              {initialBill.recurrence.frequency === 'weekly' && 'Semanal'}
              {initialBill.recurrence.frequency === 'biweekly' && 'Quinzenal'}
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Adicione notas sobre esta fatura..."
              {...register('notes')}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialBill ? 'Atualizar' : 'Criar'} Fatura
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
