import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NewCourierNotificationProps {
  onDismiss: () => void;
}

export default function NewCourierNotification({ onDismiss }: NewCourierNotificationProps) {
  const referralLink = 'https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank';
  
  const handleOpenGuide = () => {
    window.open(referralLink, '_blank');
  };

  return (
    <Card className="bg-gradient-to-br from-red-500 to-red-600 border-4 border-black shadow-[0_8px_0_0_rgba(0,0,0,1)] p-6 mb-6 relative overflow-hidden animate-pulse">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/30 rounded-full blur-2xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-700/20 rounded-full blur-xl -ml-12 -mb-12" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center animate-bounce">
              <Icon name="AlertCircle" size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-xl drop-shadow-lg">
                ⚠️ Важно! Зарегистрируйся сейчас
              </h3>
              <p className="text-white/90 text-sm font-bold">
                Это обязательный шаг для получения бонусов
              </p>
            </div>
          </div>
          
          <button
            onClick={onDismiss}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-3 border-black mb-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-black">
                <span className="font-extrabold text-black text-sm">1</span>
              </div>
              <div>
                <p className="font-bold text-black text-sm">
                  Зарегистрируйся по нашей реферальной ссылке
                </p>
                <p className="text-black/60 text-xs">
                  Только так ты получишь бонусы от Stuey.Go
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-black">
                <span className="font-extrabold text-black text-sm">2</span>
              </div>
              <div>
                <p className="font-bold text-black text-sm">
                  Начни принимать заказы
                </p>
                <p className="text-black/60 text-xs">
                  Выбирай удобное время и зарабатывай
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-black">
                <span className="font-extrabold text-black text-sm">3</span>
              </div>
              <div>
                <p className="font-bold text-black text-sm">
                  Получи бонус после первых заказов
                </p>
                <p className="text-black/60 text-xs">
                  Мы отслеживаем твой прогресс автоматически
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleOpenGuide}
          className="w-full bg-white hover:bg-white/90 text-red-600 font-extrabold text-lg border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] active:translate-y-[6px] active:shadow-none transition-all mb-3 py-6"
        >
          <Icon name="Rocket" size={24} className="mr-2" />
          Зарегистрироваться сейчас
        </Button>

        <Button
          onClick={onDismiss}
          variant="outline"
          className="w-full bg-black/20 hover:bg-black/30 text-white font-bold border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          Позже
        </Button>

        <div className="mt-4 flex items-center gap-2 text-xs text-white/90">
          <Icon name="Info" size={14} />
          <p>
            Это уведомление скроется автоматически после первого заказа
          </p>
        </div>
      </div>
    </Card>
  );
}