import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bill } from '@/hooks/useBills';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const billSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.number({ error: 'Informe um valor válido' }).positive('Valor deve ser maior que zero'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  category: z.enum(['fatura', 'boleto', 'cobranca']),
  alertDays: z.number().int().min(0, 'Deve ser 0 ou mais'),
  notes: z.string().default(''),
  paid: z.boolean(),
});

type BillFormData = z.infer<typeof billSchema>;

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
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
    },
  });

  const category = watch('category');
  const paid = watch('paid');

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
      });
    }
  }, [initialBill, isOpen, reset]);

  const onSubmit = (data: BillFormData) => {
    onSave({
      description: data.description,
      amount: data.amount,
      dueDate: data.dueDate,
      category: data.category,
      alertDays: data.alertDays,
      notes: data.notes || undefined,
      paid: data.paid,
    });
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
