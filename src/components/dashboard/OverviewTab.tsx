import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface User {
  referral_code: string;
  invited_by_user_id?: number;
  self_orders_count?: number;
  self_bonus_paid?: boolean;
}

interface OverviewTabProps {
  user: User;
  onCopyReferralLink: () => void;
}

export default function OverviewTab({ user, onCopyReferralLink }: OverviewTabProps) {
  const isSelfRegistered = !user?.invited_by_user_id;
  const selfOrdersProgress = user?.self_orders_count || 0;
  const selfBonusPaid = user?.self_bonus_paid || false;

  return (
    <div className="space-y-6">
      {isSelfRegistered && !selfBonusPaid && (
        <Card className="border-4 border-orange-500 bg-gradient-to-r from-orange-600 to-yellow-500 shadow-[0_8px_0_0_rgba(249,115,22,0.8)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-black text-xl">
              <Icon name="Gift" className="h-6 w-6" />
              🎁 Ваш бонус за 30 заказов
            </CardTitle>
            <CardDescription className="text-orange-100 font-semibold">Выполните 30 заказов и получите 3000₽</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-white">Прогресс: {selfOrdersProgress}/30</span>
                <span className="font-black text-white text-lg">{Math.round((selfOrdersProgress / 30) * 100)}%</span>
              </div>
              <Progress value={(selfOrdersProgress / 30) * 100} className="h-4 border-2 border-black" />
            </div>
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border-2 border-black">
              <div>
                <p className="text-sm text-white font-semibold">Осталось заказов:</p>
                <p className="text-3xl font-black text-white">{Math.max(0, 30 - selfOrdersProgress)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white font-semibold">Бонус:</p>
                <p className="text-4xl font-black text-white">3000 ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selfBonusPaid && (
        <Card className="border-4 border-green-500 bg-gradient-to-r from-green-600 to-emerald-600 shadow-[0_8px_0_0_rgba(34,197,94,0.8)]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Icon name="CheckCircle2" className="h-10 w-10 text-white" />
              <div>
                <p className="font-black text-white text-xl">✅ Бонус получен!</p>
                <p className="text-sm text-green-100 font-semibold">Вы успешно выполнили 30 заказов и получили 3000₽</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-4 border-purple-500 bg-white/10 backdrop-blur-sm shadow-[0_8px_0_0_rgba(168,85,247,0.6)]">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-4 border-black">
          <CardTitle className="flex items-center gap-2 text-white font-black text-xl">
            <Icon name="Share2" className="h-6 w-6" />
            🔗 Реферальная программа
          </CardTitle>
          <CardDescription className="text-purple-100 font-semibold">Приглашайте друзей и зарабатывайте на их заказах (до 150 заказов)</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
            <p className="text-sm text-purple-700 mb-2 font-medium">Ваша реферальная ссылка:</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white px-4 py-3 rounded-lg border-2 border-purple-300 text-sm font-mono">
                {window.location.origin}/auth?ref={user?.referral_code}
              </code>
              <Button onClick={onCopyReferralLink} className="bg-purple-600 hover:bg-purple-700">
                <Icon name="Copy" className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Icon name="DollarSign" className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700">Получайте 50₽ за каждый заказ реферала</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Icon name="Target" className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm text-green-700">До 7,500₽ с одного реферала (150 заказов)</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Icon name="Infinity" className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-sm text-purple-700">Неограниченное количество рефералов</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
