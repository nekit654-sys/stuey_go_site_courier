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
    <Card className="border-4 border-black bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 shadow-[0_8px_0_0_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b-4 border-black">
        <CardTitle className="flex items-center gap-3">
          <div className="p-3 bg-yellow-400 rounded-2xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
            <Icon name="Trophy" className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="text-2xl font-black text-black drop-shadow-md">Поздравляем! 🎉</div>
            <div className="text-sm font-extrabold text-black/80 mt-1">
              Вы выполнили {ordersCompleted} заказов
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-start gap-3">
            <Icon name="Gift" className="h-6 w-6 text-green-700 mt-0.5" />
            <div>
              <p className="font-black text-black text-lg">
                Вам доступна стартовая выплата 5000₽!
              </p>
              <p className="text-sm font-bold text-gray-700 mt-1">
                Заполните заявку на выплату, чтобы получить свой стартовый бонус
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleOpenModal}
            className="flex-1 bg-black text-yellow-400 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none font-extrabold transition-all h-11"
          >
            <Icon name="DollarSign" className="h-4 w-4 mr-2" />
            Заполнить заявку
          </Button>
          <Button 
            onClick={handleDismiss}
            variant="outline"
            className="bg-white text-black border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none font-extrabold transition-all h-11"
          >
            Позже
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}