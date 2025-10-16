import { useState, useCallback } from 'react';
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
  const formatInitialPhone = (phone: string) => {
    if (!phone) return '+7';
    if (phone.startsWith('+')) return phone;
    if (phone.length === 11 && phone.startsWith('7')) {
      return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9, 11)}`;
    }
    if (phone.length === 11) {
      return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9, 11)}`;
    }
    return '+7';
  };

  const [amount, setAmount] = useState('');
  const [sbpPhone, setSbpPhone] = useState(formatInitialPhone(userPhone));
  const [sbpBankName, setSbpBankName] = useState(userBankName);
  const [loading, setLoading] = useState(false);

  const formatPhoneInput = useCallback((value: string) => {
    let digits = value.replace(/\D/g, '');
    
    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }
    
    if (digits.startsWith('7')) {
      if (digits.length <= 1) return '+7';
      if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
      if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
      if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }
    
    if (digits.length === 0) return '+7';
    if (digits.length <= 3) return `+7 (${digits}`;
    if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setSbpPhone(formatted);
  };

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

    const phoneDigits = sbpPhone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 11) {
      toast.error('Укажите корректный номер телефона (11 цифр)');
      return;
    }

    if (!sbpBankName.trim()) {
      toast.error('Укажите название банка для СБП');
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
          sbp_phone: phoneDigits,
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
    <div>
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-400 border-2 border-black rounded-xl shadow-[0_3px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm font-bold text-black/70">Доступно для вывода:</span>
          <span className="text-xl sm:text-2xl font-extrabold text-black">{availableBalance.toFixed(2)} ₽</span>
        </div>
        <p className="text-xs font-bold text-black/70">Минимальная сумма вывода: 1000₽</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <Label htmlFor="amount" className="text-black font-extrabold mb-2 block text-sm">Сумма вывода (₽)</Label>
          <Input
            id="amount"
            type="number"
            min="1000"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Введите сумму"
            className="border-2 border-black rounded-xl h-11 sm:h-12 font-bold text-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] transition-all"
            required
          />
        </div>

        <div>
          <Label htmlFor="sbp_phone" className="text-black font-extrabold mb-2 block text-sm">Номер телефона СБП</Label>
          <Input
            id="sbp_phone"
            type="tel"
            value={sbpPhone}
            onChange={handlePhoneChange}
            placeholder="+7 (XXX) XXX-XX-XX"
            className="font-mono border-2 border-black rounded-xl h-11 sm:h-12 font-bold text-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] transition-all"
            required
          />
          <p className="text-xs font-bold text-black/70 mt-1">Номер, привязанный к СБП (начинается с +7)</p>
        </div>

        <div>
          <Label htmlFor="sbp_bank" className="text-black font-extrabold mb-2 block text-sm">Банк СБП</Label>
          <Input
            id="sbp_bank"
            type="text"
            value={sbpBankName}
            onChange={(e) => setSbpBankName(e.target.value)}
            placeholder="Например: Сбербанк, Тинькофф, Альфа-Банк"
            className="border-2 border-black rounded-xl h-11 sm:h-12 font-bold text-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] transition-all"
            required
          />
          <p className="text-xs font-bold text-black/70 mt-1">Укажите название вашего банка</p>
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full h-11 sm:h-12 bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none font-extrabold text-sm sm:text-base transition-all"
        >
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

        <div className="text-xs font-bold text-black/70 space-y-1 mt-3 sm:mt-4 p-3 bg-yellow-400/30 border border-black/20 rounded-xl">
          <p>ℹ️ Заявка будет рассмотрена в течение 1-3 рабочих дней</p>
          <p>ℹ️ Средства поступят на указанный номер телефона через СБП</p>
        </div>
      </form>
    </div>
  );
}
