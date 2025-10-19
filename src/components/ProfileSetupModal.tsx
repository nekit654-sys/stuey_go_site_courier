import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

interface User {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  invited_by_user_id?: number;
}

interface ProfileSetupModalProps {
  user: User;
  token: string;
  onComplete: () => void;
  onUpdateUser?: (userData: Partial<User>) => void;
  forceOpen?: boolean;
  onClose?: () => void;
  allowReferralCode?: boolean;
}

export default function ProfileSetupModal({ user, token, onComplete, onUpdateUser, forceOpen = false, onClose, allowReferralCode = false }: ProfileSetupModalProps) {
  // Форматируем телефон при инициализации
  const formatInitialPhone = (phone: string) => {
    if (!phone) return '+7';
    if (phone.startsWith('+')) return phone;
    if (phone.length === 11 && phone.startsWith('7')) {
      return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9, 11)}`;
    }
    return '+7';
  };

  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone: formatInitialPhone(user.phone || ''),
    city: user.city || '',
    referral_code_input: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [referralCodeStatus, setReferralCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [referrerName, setReferrerName] = useState<string>('');

  const isProfileComplete = user.phone && user.city && user.full_name;

  useEffect(() => {
    if (isProfileComplete && !forceOpen) {
      onComplete();
    }
  }, [isProfileComplete, forceOpen]);

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

    // Проверяем реферальный код, если он введён
    if (formData.referral_code_input && referralCodeStatus === 'invalid') {
      toast.error('Реферальный код не существует. Проверьте правильность ввода или оставьте поле пустым.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Отправка данных профиля:', {
        full_name: formData.full_name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        city: formData.city.trim(),
      });

      const response = await fetch(`${API_URL}?route=profile&action=update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          city: formData.city.trim(),
          referral_code_input: formData.referral_code_input.trim() || undefined,
        }),
      });

      console.log('Статус ответа:', response.status);
      const data = await response.json();
      console.log('Данные ответа:', data);

      if (data.success) {
        toast.success('Профиль успешно заполнен!');
        
        if (onUpdateUser && data.user) {
          onUpdateUser(data.user);
        } else if (onUpdateUser) {
          const updatedData = {
            full_name: formData.full_name.trim(),
            phone: formData.phone.replace(/\D/g, ''),
            city: formData.city.trim(),
          };
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

  const formatPhoneInput = useCallback((value: string) => {
    let digits = value.replace(/\D/g, '');
    
    // Если начинается с 8, заменяем на 7
    if (digits.startsWith('8')) {
      digits = '7' + digits.slice(1);
    }
    
    // Если начинается с 7, форматируем
    if (digits.startsWith('7')) {
      if (digits.length <= 1) return '+7';
      if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
      if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
      if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }
    
    // Если начинается не с 7, автоматически добавляем +7
    if (digits.length === 0) return '+7';
    if (digits.length <= 3) return `+7 (${digits}`;
    if (digits.length <= 6) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 8) return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  }, [errors.phone, formatPhoneInput]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, full_name: e.target.value }));
    if (errors.full_name) setErrors(prev => ({ ...prev, full_name: '' }));
  }, [errors.full_name]);

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, city: e.target.value }));
    if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
  }, [errors.city]);

  const checkReferralCode = useCallback(async (code: string) => {
    if (!code || code.length < 3) {
      setReferralCodeStatus('idle');
      setReferrerName('');
      return;
    }

    setReferralCodeStatus('checking');

    try {
      const response = await fetch(`${API_URL}?route=referrals&action=check_code&code=${encodeURIComponent(code)}`);
      const data = await response.json();

      if (data.success && data.exists) {
        setReferralCodeStatus('valid');
        setReferrerName(data.referrer_name || '');
      } else {
        setReferralCodeStatus('invalid');
        setReferrerName('');
      }
    } catch (error) {
      console.error('Error checking referral code:', error);
      setReferralCodeStatus('idle');
      setReferrerName('');
    }
  }, []);

  const handleReferralCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, referral_code_input: code }));
    
    // Проверяем код с задержкой
    if (code.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkReferralCode(code);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setReferralCodeStatus('idle');
    }
  }, [checkReferralCode]);

  if (isProfileComplete && !forceOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)]">
        <CardHeader className="bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 border-b-4 border-black">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-black/10 rounded-2xl border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
                <Icon name="UserCog" size={32} className="text-black" />
              </div>
              <div>
                <CardTitle className="text-2xl font-extrabold text-black">Заполните профиль</CardTitle>
                <CardDescription className="text-black/80 font-bold">
                  Это необходимо для корректной работы системы выплат
                </CardDescription>
              </div>
            </div>
            {forceOpen && onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="bg-black/10 hover:bg-black/20 border-2 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[0_1px_0_0_rgba(0,0,0,1)]"
              >
                <Icon name="X" size={24} className="text-black" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="mb-6 p-4 bg-yellow-400/30 border-3 border-black rounded-xl shadow-[0_4px_0_0_rgba(0,0,0,1)]">
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
              <Label htmlFor="full_name" className="text-base font-extrabold flex items-center gap-2 text-black">
                <Icon name="User" size={18} className="text-black" />
                ФИО (как в Яндекс Про)
              </Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleNameChange}
                placeholder="Иванов Иван Иванович"
                className={`mt-2 text-lg border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px] ${errors.full_name ? 'border-red-500' : ''}`}
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
              <Label htmlFor="phone" className="text-base font-extrabold flex items-center gap-2 text-black">
                <Icon name="Phone" size={18} className="text-black" />
                Телефон (как в Яндекс Про)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+7 (XXX) XXX-XX-XX"
                className={`mt-2 text-lg font-mono border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px] ${errors.phone ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <Icon name="XCircle" size={14} />
                  {errors.phone}
                </p>
              )}
              <div className="mt-2 p-2 bg-yellow-400/20 rounded-lg border-2 border-black/20">
                <p className="text-xs text-blue-800 flex items-center gap-1">
                  <Icon name="Lightbulb" size={12} />
                  <strong>Совет:</strong> Используйте тот же номер, на который приходят заказы в Яндекс Про
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="city" className="text-base font-extrabold flex items-center gap-2 text-black">
                <Icon name="MapPin" size={18} className="text-black" />
                Город (как в Яндекс Про)
              </Label>
              <Input
                id="city"
                type="text"
                value={formData.city}
                onChange={handleCityChange}
                placeholder="Москва"
                className={`mt-2 text-lg border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px] ${errors.city ? 'border-red-500' : ''}`}
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

            {allowReferralCode && (
              <div className="pt-4 border-t">
                {user.invited_by_user_id ? (
                  <div className="p-4 bg-yellow-400/20 border-2 border-black/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">У вас уже есть пригласивший</p>
                        <p className="text-xs">Вы уже привязаны к реферальной программе другого курьера</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Label htmlFor="referral_code_input" className="text-base font-extrabold flex items-center gap-2 text-black">
                      <Icon name="Gift" size={18} className="text-black" />
                      Реферальный код (необязательно)
                    </Label>
                    <div className="relative">
                  <Input
                    id="referral_code_input"
                    type="text"
                    value={formData.referral_code_input}
                    onChange={handleReferralCodeChange}
                    placeholder="ABC123"
                    className={`mt-2 text-lg font-mono uppercase pr-10 border-3 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)] focus:shadow-[0_1px_0_0_rgba(0,0,0,1)] focus:translate-y-[2px] ${
                      referralCodeStatus === 'valid' ? 'border-green-500' :
                      referralCodeStatus === 'invalid' ? 'border-red-500' : ''
                    }`}
                    disabled={isSubmitting}
                    maxLength={10}
                  />
                  {referralCodeStatus === 'checking' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Icon name="Loader2" size={18} className="animate-spin text-gray-400" />
                    </div>
                  )}
                  {referralCodeStatus === 'valid' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Icon name="CheckCircle" size={18} className="text-green-600" />
                    </div>
                  )}
                  {referralCodeStatus === 'invalid' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Icon name="XCircle" size={18} className="text-red-600" />
                    </div>
                  )}
                </div>
                {referralCodeStatus === 'valid' && (
                  <div className="mt-2 p-3 bg-green-400/20 rounded-lg border-2 border-green-600">
                    <p className="text-green-700 text-sm font-medium flex items-center gap-1">
                      <Icon name="CheckCircle" size={14} />
                      Реферальный код действителен!
                    </p>
                    {referrerName && (
                      <p className="text-green-600 text-xs mt-1">
                        Вас пригласил: <strong>{referrerName}</strong>
                      </p>
                    )}
                  </div>
                )}
                {referralCodeStatus === 'invalid' && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <Icon name="XCircle" size={14} />
                    Такого реферального кода не существует
                  </p>
                )}
                    {referralCodeStatus === 'idle' && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Icon name="Info" size={12} />
                        Если вас пригласил другой курьер, введите его реферальный код
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="bg-green-400/20 border-2 border-green-600 rounded-lg p-4 mb-4">
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
                className="w-full text-lg bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold border-3 border-black shadow-[0_5px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[5px] active:shadow-none transition-all"
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

          <div className="mt-6 p-3 bg-black/5 rounded-lg border-2 border-black/20">
            <p className="text-xs text-gray-600 text-center">
              🔒 Ваши данные защищены и используются только для идентификации при выплатах
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}