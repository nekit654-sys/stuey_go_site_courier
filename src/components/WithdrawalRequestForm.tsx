import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

interface WithdrawalRequestFormProps {
  userId: number;
  availableBalance: number;
  userPhone?: string;
  userBankName?: string;
  onSuccess: () => void;
}

export default function WithdrawalRequestForm({
  userId,
  availableBalance,
  userPhone = '',
  userBankName = '',
  onSuccess
}: WithdrawalRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [sbpPhone, setSbpPhone] = useState(userPhone);
  const [sbpBankName, setSbpBankName] = useState(userBankName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount < 1000) {
      toast.error('Минимальная сумма для вывода — 1000₽');
      return;
    }

    if (withdrawAmount > availableBalance) {
      toast.error(`Недостаточно средств. Доступно: ${availableBalance.toFixed(2)}₽`);
      return;
    }

    if (!sbpPhone.trim() || !sbpBankName.trim()) {
      toast.error('Укажите номер телефона и банк для СБП');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}?route=withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          sbp_phone: sbpPhone.trim(),
          sbp_bank_name: sbpBankName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Заявка на вывод создана');
        setAmount('');
        onSuccess();
      } else {
        toast.error(data.error || 'Ошибка при создании заявки');
      }
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast.error('Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Icon name="Wallet" className="text-green-600" />
        Вывод средств
      </h3>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-800">Доступно для вывода:</span>
          <span className="text-2xl font-bold text-blue-900">{availableBalance.toFixed(2)} ₽</span>
        </div>
        <p className="text-xs text-blue-700">Минимальная сумма вывода: 1000₽</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="amount">Сумма вывода (₽)</Label>
          <Input
            id="amount"
            type="number"
            min="1000"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введите сумму"
            required
          />
        </div>

        <div>
          <Label htmlFor="sbp_phone">Номер телефона СБП</Label>
          <Input
            id="sbp_phone"
            type="tel"
            value={sbpPhone}
            onChange={(e) => setSbpPhone(e.target.value)}
            placeholder="+7 900 123-45-67"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Номер, привязанный к системе быстрых платежей</p>
        </div>

        <div>
          <Label htmlFor="sbp_bank">Банк СБП</Label>
          <Input
            id="sbp_bank"
            type="text"
            value={sbpBankName}
            onChange={(e) => setSbpBankName(e.target.value)}
            placeholder="Например: Сбербанк, Тинькофф, Альфа-Банк"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Укажите название вашего банка</p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Icon name="Send" className="mr-2 h-4 w-4" />
              Подать заявку на вывод
            </>
          )}
        </Button>

        <div className="text-xs text-gray-600 space-y-1 mt-4 p-3 bg-gray-50 rounded">
          <p>ℹ️ Заявка будет рассмотрена в течение 1-3 рабочих дней</p>
          <p>ℹ️ Средства поступят на указанный номер телефона через СБП</p>
        </div>
      </form>
    </Card>
  );
}
