import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Courier {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  referral_code: string;
  total_orders: number;
  total_earnings: number;
  is_active: boolean;
  external_id?: string;
}

interface EditCourierModalProps {
  courier: Courier;
  onClose: () => void;
  onSave: (courierId: number, data: Partial<Courier>) => Promise<void>;
}

export default function EditCourierModal({ courier, onClose, onSave }: EditCourierModalProps) {
  const [formData, setFormData] = useState({
    full_name: courier.full_name || '',
    phone: courier.phone || '',
    city: courier.city || '',
    email: courier.email || '',
    external_id: courier.external_id || '',
    total_orders: courier.total_orders || 0,
    total_earnings: courier.total_earnings || 0,
    is_active: courier.is_active,
    referral_code_input: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'valid' | 'invalid' | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');

  const checkReferralCode = async (code: string) => {
    if (!code.trim()) {
      setCodeStatus(null);
      setReferrerName('');
      return;
    }

    setIsCheckingCode(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=referrals&action=check_code&code=${encodeURIComponent(code.toUpperCase())}`
      );
      const data = await response.json();

      if (data.success && data.exists) {
        setCodeStatus('valid');
        setReferrerName(data.referrer_name || 'Курьер');
        toast.success(`Реферальный код найден: ${data.referrer_name}`);
      } else {
        setCodeStatus('invalid');
        setReferrerName('');
        toast.error('Реферальный код не найден');
      }
    } catch (error) {
      console.error('Ошибка проверки кода:', error);
      setCodeStatus('invalid');
      toast.error('Ошибка проверки кода');
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error('ФИО обязательно для заполнения');
      return;
    }

    if (formData.referral_code_input && codeStatus !== 'valid') {
      toast.error('Проверьте реферальный код перед сохранением');
      return;
    }

    console.log('📝 МОДАЛКА: Отправляем данные курьера:', {
      courier_id: courier.id,
      formData
    });

    setIsSaving(true);
    try {
      await onSave(courier.id, formData);
      console.log('✅ МОДАЛКА: Сохранение успешно');
      toast.success('Данные курьера обновлены');
      onClose();
    } catch (error) {
      console.error('❌ МОДАЛКА: Ошибка сохранения:', error);
      toast.error('Ошибка при сохранении данных');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <Icon name="UserCog" size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Редактирование курьера</h2>
                <p className="text-white/90 font-medium">ID: #{courier.id}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 border border-white/30 hover:bg-white/30"
            >
              <Icon name="X" size={24} className="text-white" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="full_name" className="text-base font-semibold text-gray-900">
              ФИО *
            </Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="mt-2 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-base font-semibold text-gray-900">
                Телефон
              </Label>
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-base font-semibold text-gray-900">
                Город
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-base font-semibold text-gray-900">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-2 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px]"
            />
          </div>

          <div>
            <Label htmlFor="external_id" className="text-base font-semibold text-gray-900">
              External ID
            </Label>
            <Input
              id="external_id"
              type="text"
              value={formData.external_id}
              onChange={(e) => setFormData({ ...formData, external_id: e.target.value })}
              className="mt-2 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px]"
            />
          </div>

          <div>
            <Label htmlFor="referral_code_input" className="text-base font-semibold text-gray-900">
              Реферальный код (кто пригласил)
            </Label>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 relative">
                <Input
                  id="referral_code_input"
                  type="text"
                  value={formData.referral_code_input}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setFormData({ ...formData, referral_code_input: value });
                    setCodeStatus(null);
                    setReferrerName('');
                  }}
                  placeholder="Введите код реферера"
                  className={`border shadow-sm focus:ring-2 focus:ring-blue-500 ${
                    codeStatus === 'valid' ? 'bg-green-50 border-green-500' : 
                    codeStatus === 'invalid' ? 'bg-red-50 border-red-500' : 'border-gray-300'
                  }`}
                />
                {codeStatus === 'valid' && referrerName && (
                  <div className="absolute top-full left-0 mt-1 text-xs text-green-600 font-semibold flex items-center gap-1">
                    <Icon name="CheckCircle" size={12} />
                    {referrerName}
                  </div>
                )}
                {codeStatus === 'invalid' && (
                  <div className="absolute top-full left-0 mt-1 text-xs text-red-600 font-semibold flex items-center gap-1">
                    <Icon name="XCircle" size={12} />
                    Код не найден
                  </div>
                )}
              </div>
              <Button
                type="button"
                onClick={() => checkReferralCode(formData.referral_code_input)}
                disabled={!formData.referral_code_input.trim() || isCheckingCode}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-700 shadow-sm"
              >
                {isCheckingCode ? (
                  <Icon name="Loader2" size={18} className="animate-spin" />
                ) : (
                  <Icon name="Search" size={18} />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Оставьте пустым, если курьер не был приглашён
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_orders" className="text-base font-semibold text-gray-900">
                Всего заказов
              </Label>
              <Input
                id="total_orders"
                type="number"
                value={formData.total_orders}
                onChange={(e) => setFormData({ ...formData, total_orders: parseInt(e.target.value) || 0 })}
                className="mt-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="total_earnings" className="text-base font-semibold text-gray-900">
                Всего заработано (₽)
              </Label>
              <Input
                id="total_earnings"
                type="number"
                value={formData.total_earnings}
                onChange={(e) => setFormData({ ...formData, total_earnings: parseFloat(e.target.value) || 0 })}
                className="mt-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 border border-gray-300 rounded"
            />
            <Label htmlFor="is_active" className="text-base font-semibold text-gray-900 cursor-pointer">
              Активен
            </Label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 border border-gray-300 shadow-sm hover:bg-gray-50"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold border border-blue-700 shadow-sm transition-colors"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2 h-5 w-5" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}