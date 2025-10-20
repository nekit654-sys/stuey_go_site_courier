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
    is_active: courier.is_active
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) {
      toast.error('ФИО обязательно для заполнения');
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
      <div className="bg-white rounded-2xl border-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 border-b-4 border-black p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-black/10 rounded-2xl border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="UserCog" size={32} className="text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-black">Редактирование курьера</h2>
                <p className="text-black/80 font-bold">ID: #{courier.id}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-black/10 hover:bg-black/20 border-2 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)]"
            >
              <Icon name="X" size={24} className="text-black" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="full_name" className="text-base font-extrabold text-black">
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
              <Label htmlFor="phone" className="text-base font-extrabold text-black">
                Телефон
              </Label>
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-2 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px]"
              />
            </div>
            <div>
              <Label htmlFor="city" className="text-base font-extrabold text-black">
                Город
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-2 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-base font-extrabold text-black">
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
            <Label htmlFor="external_id" className="text-base font-extrabold text-black">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total_orders" className="text-base font-extrabold text-black">
                Всего заказов
              </Label>
              <Input
                id="total_orders"
                type="number"
                value={formData.total_orders}
                onChange={(e) => setFormData({ ...formData, total_orders: parseInt(e.target.value) || 0 })}
                className="mt-2 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px]"
              />
            </div>
            <div>
              <Label htmlFor="total_earnings" className="text-base font-extrabold text-black">
                Всего заработано (₽)
              </Label>
              <Input
                id="total_earnings"
                type="number"
                value={formData.total_earnings}
                onChange={(e) => setFormData({ ...formData, total_earnings: parseFloat(e.target.value) || 0 })}
                className="mt-2 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 border-3 border-black"
            />
            <Label htmlFor="is_active" className="text-base font-extrabold text-black cursor-pointer">
              Активен
            </Label>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-black/20">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px]"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold border-3 border-black shadow-[0_5px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[5px] active:shadow-none transition-all"
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