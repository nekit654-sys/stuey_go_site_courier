import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';

interface SelfBonus {
  orders_completed: number;
  bonus_earned: number;
  bonus_paid: number;
  is_completed: boolean;
  completed_at: string | null;
}

interface Earning {
  id: number;
  full_name: string;
  orders_count: number;
  total_amount: number;
  payment_amount: number;
  recipient_type: string;
  payment_status: string;
  upload_date: string;
}

interface Summary {
  self_total: number;
  referrer_total: number;
  paid_total: number;
  pending_total: number;
}

interface CourierEarningsCardProps {
  userId: number;
}

function CourierEarningsCard({ userId }: CourierEarningsCardProps) {
  const [selfBonus, setSelfBonus] = useState<SelfBonus | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout;
    
    const loadData = async () => {
      try {
        timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`${API_URL}?route=payments&action=courier_payments`, {
          headers: {
            'X-User-Id': userId.toString()
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (data.success) {
          setSelfBonus(data.self_bonus);
          setEarnings(data.earnings || []);
          setSummary(data.summary);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('Failed to load earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const SELF_BONUS_TARGET = 5000;
  const selfBonusProgress = selfBonus 
    ? Math.min((selfBonus.bonus_earned / SELF_BONUS_TARGET) * 100, 100) 
    : 0;

  const getRecipientTypeLabel = (type: string) => {
    switch (type) {
      case 'courier_self': return 'Бонус';
      case 'courier_referrer': return 'От рефералов';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800">Выплачено</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Ожидает</Badge>;
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Wallet" className="h-6 w-6 text-purple-600" />
            Мои выплаты от рефералов
          </div>
          {summary && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Всего к выплате</div>
              <div className="text-2xl font-bold text-purple-700">
                {(summary.self_total + summary.referrer_total).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Отслеживайте свой прогресс самобонуса и доходы от приглашённых курьеров
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Бонус */}
        {selfBonus && !selfBonus.is_completed && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 rounded-full p-3">
                  <Icon name="Target" className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Бонус 5к₽</h3>
                  <p className="text-sm text-gray-600">За первые 150 заказов ваших рефералов</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-700">
                  {selfBonus.bonus_earned.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-sm text-gray-600">из 5,000₽</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Прогресс</span>
                <span className="font-bold text-blue-700">{selfBonusProgress.toFixed(1)}%</span>
              </div>
              <Progress value={selfBonusProgress} className="h-3" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="TrendingUp" size={16} />
                <span>
                  Осталось {(SELF_BONUS_TARGET - selfBonus.bonus_earned).toLocaleString('ru-RU')} ₽ 
                  до завершения бонуса!
                </span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Как это работает:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Вы получаете 100% от доходов ваших рефералов</li>
                    <li>После 5,000₽ бонус завершается</li>
                    <li>Далее вы получаете % с каждого вашего реферала постоянно</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {selfBonus && selfBonus.is_completed && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-3">
                <Icon name="CheckCircle" className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">Бонус завершён!</h3>
                <p className="text-sm text-gray-600">
                  Вы получили {selfBonus.bonus_earned.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className="text-right">
                <Badge className="bg-green-600 text-white">Completed</Badge>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <Icon name="Gift" size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Теперь вы получаете % от доходов всех ваших рефералов постоянно!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Статистика */}
        {summary && (summary.self_total > 0 || summary.referrer_total > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Wallet" size={18} className="text-blue-600" />
                <div className="text-sm font-medium text-gray-700">Бонус</div>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {summary.self_total.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Users" size={18} className="text-purple-600" />
                <div className="text-sm font-medium text-gray-700">От рефералов</div>
              </div>
              <div className="text-2xl font-bold text-purple-700">
                {summary.referrer_total.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="CheckCircle" size={18} className="text-green-600" />
                <div className="text-sm font-medium text-gray-700">Выплачено</div>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {summary.paid_total.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
        )}

        {/* История выплат */}
        {earnings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Icon name="History" size={20} />
                История выплат
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <Icon name="ChevronUp" size={16} className="mr-1" />
                    Скрыть
                  </>
                ) : (
                  <>
                    <Icon name="ChevronDown" size={16} className="mr-1" />
                    Показать все ({earnings.length})
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {(expanded ? earnings : earnings.slice(0, 3)).map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{earning.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {earning.orders_count} заказов
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{getRecipientTypeLabel(earning.recipient_type)}</span>
                      <span>•</span>
                      <span>{new Date(earning.upload_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600 mb-1">
                      +{earning.payment_amount.toLocaleString('ru-RU')} ₽
                    </div>
                    {getStatusBadge(earning.payment_status)}
                  </div>
                </div>
              ))}
            </div>

            {!expanded && earnings.length > 3 && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(true)}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  Показать ещё {earnings.length - 3} выплат
                </Button>
              </div>
            )}
          </div>
        )}

        {earnings.length === 0 && !selfBonus && (
          <div className="text-center py-8">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-2">Пока нет данных о выплатах</p>
            <p className="text-sm text-gray-500">
              Приглашайте курьеров по вашей реферальной ссылке и начинайте зарабатывать!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(CourierEarningsCard);