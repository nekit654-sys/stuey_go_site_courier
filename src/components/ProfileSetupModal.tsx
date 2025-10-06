import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
}

interface ProfileSetupModalProps {
  user: User;
  token: string;
  onComplete: () => void;
  onUpdateUser?: (userData: Partial<User>) => void;
}

export default function ProfileSetupModal({ user, token, onComplete, onUpdateUser }: ProfileSetupModalProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    city: user.city || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isProfileComplete = user.phone && user.city && user.full_name;

  useEffect(() => {
    if (isProfileComplete) {
      onComplete();
    }
  }, [isProfileComplete]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'ФИО обязательно для заполнения';
    } else if (formData.full_name.trim().split(' ').length < 2) {
      newErrors.full_name = 'Укажите полное ФИО (Фамилия Имя Отчество)';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен для заполнения';
    } else if (phoneDigits.length < 11) {
      newErrors.phone = 'Введите полный номер телефона (11 цифр)';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Город обязателен для заполнения';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://functions.poehali.dev/5f6f6889-3ab3-49f0-865b-fcffd245d858?route=profile&action=update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          city: formData.city.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Профиль успешно заполнен!');
        
        const updatedData = {
          full_name: formData.full_name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          city: formData.city.trim(),
        };
        
        if (onUpdateUser) {
          onUpdateUser(updatedData);
        }
        
        onComplete();
      } else {
        toast.error(data.error || 'Ошибка сохранения профиля');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Не удалось сохранить профиль');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7 (${digits}`;
    if (digits.length <= 4) return `+7 (${digits.slice(1, 4)}`;
    if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}`;
    if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData({ ...formData, phone: formatted });
    if (errors.phone) setErrors({ ...errors, phone: '' });
  };

  if (isProfileComplete) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Icon name="UserCog" size={32} />
            </div>
            <div>
              <CardTitle className="text-2xl">Заполните профиль</CardTitle>
              <CardDescription className="text-blue-100">
                Это необходимо для корректной работы системы выплат
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-bold mb-2">⚠️ ВАЖНО! Заполняйте данные ТОЧНО как в Яндекс Про:</p>
                <ul className="space-y-1 list-disc list-inside ml-4">
                  <li><strong>ФИО</strong> — в том же порядке и написании (Иванов Иван Иванович)</li>
                  <li><strong>Телефон</strong> — тот же номер, что привязан к Яндекс Про</li>
                  <li><strong>Город</strong> — точное название города из профиля Яндекс Про</li>
                </ul>
                <p className="mt-2 font-medium text-red-700">
                  📌 От точности данных зависит автоматическая сверка выплат!
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="full_name" className="text-base font-semibold flex items-center gap-2">
                <Icon name="User" size={18} className="text-blue-600" />
                ФИО (как в Яндекс Про)
              </Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => {
                  setFormData({ ...formData, full_name: e.target.value });
                  if (errors.full_name) setErrors({ ...errors, full_name: '' });
                }}
                placeholder="Иванов Иван Иванович"
                className={`mt-2 text-lg ${errors.full_name ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.full_name && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <Icon name="XCircle" size={14} />
                  {errors.full_name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Проверьте в приложении Яндекс Про → Профиль → ФИО
              </p>
            </div>

            <div>
              <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                <Icon name="Phone" size={18} className="text-green-600" />
                Телефон (как в Яндекс Про)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+7 (XXX) XXX-XX-XX"
                className={`mt-2 text-lg font-mono ${errors.phone ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <Icon name="XCircle" size={14} />
                  {errors.phone}
                </p>
              )}
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-800 flex items-center gap-1">
                  <Icon name="Lightbulb" size={12} />
                  <strong>Совет:</strong> Используйте тот же номер, на который приходят заказы в Яндекс Про
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="city" className="text-base font-semibold flex items-center gap-2">
                <Icon name="MapPin" size={18} className="text-purple-600" />
                Город (как в Яндекс Про)
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => {
                  setFormData({ ...formData, city: e.target.value });
                  if (errors.city) setErrors({ ...errors, city: '' });
                }}
                placeholder="Москва"
                className={`mt-2 text-lg ${errors.city ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <Icon name="XCircle" size={14} />
                  {errors.city}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Icon name="Info" size={12} />
                Проверьте в Яндекс Про → Профиль → Город работы
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Зачем это нужно?</p>
                    <p>
                      Система автоматически сопоставляет вас с данными из партнерской программы
                      по <strong>ФИО + город + последние 4 цифры телефона</strong>.
                      Если данные совпадут — выплата придет автоматически!
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-5 w-5 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Save" className="mr-2 h-5 w-5" />
                    Сохранить и продолжить
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              🔒 Ваши данные защищены и используются только для идентификации при выплатах
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}