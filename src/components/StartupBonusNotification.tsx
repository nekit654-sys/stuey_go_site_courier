import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';

interface StartupBonusNotificationProps {
  userId: number;
  onOpenPayoutModal: () => void;
}

export default function StartupBonusNotification({ userId, onOpenPayoutModal }: StartupBonusNotificationProps) {
  const [eligible, setEligible] = useState(false);
  const [ordersCompleted, setOrdersCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEligibility();
  }, [userId]);

  const checkEligibility = async () => {
    try {
      const response = await fetch(`${API_URL}?route=startup-notification`, {
        headers: {
          'X-User-Id': userId.toString(),
        },
      });

      const data = await response.json();

      if (data.success) {
        setEligible(data.eligible);
        setOrdersCompleted(data.orders_completed);
      }
    } catch (error) {
      console.error('Error checking startup bonus eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await fetch(`${API_URL}?route=startup-notification`, {
        method: 'POST',
        headers: {
          'X-User-Id': userId.toString(),
        },
      });

      setEligible(false);
      toast.success('Уведомление скрыто');
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleOpenModal = () => {
    handleDismiss();
    onOpenPayoutModal();
  };

  if (loading || !eligible) {
    return null;
  }

  return (
    <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-green-700">
          <div className="p-2 bg-green-500 rounded-full">
            <Icon name="Trophy" className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Поздравляем! 🎉</div>
            <div className="text-sm font-normal text-gray-600 mt-1">
              Вы выполнили {ordersCompleted} заказов
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <Icon name="Gift" className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">
                Вам доступна стартовая выплата 5000₽!
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Заполните заявку на выплату, чтобы получить свой стартовый бонус
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleOpenModal}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Icon name="DollarSign" className="h-4 w-4 mr-2" />
            Заполнить заявку
          </Button>
          <Button 
            onClick={handleDismiss}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            Позже
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}