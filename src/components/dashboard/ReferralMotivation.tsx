import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { motion } from 'framer-motion';

interface ReferralMotivationProps {
  hasReferrals: boolean;
  onCopyLink: () => void;
}

export default function ReferralMotivation({ hasReferrals, onCopyLink }: ReferralMotivationProps) {
  if (hasReferrals) {
    return (
      <Card className="border-3 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-[0_5px_0_0_rgba(0,0,0,1)] rounded-2xl overflow-hidden mb-4">
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-3 bg-purple-500 rounded-xl border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
              <Icon name="TrendingUp" className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-purple-700 mb-1">💸 Увеличивай доход!</h3>
              <p className="text-sm font-bold text-gray-600">Приглашай больше курьеров</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-purple-200">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-300">
                <span className="text-lg font-black text-purple-600">💰</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">Зарабатывай с каждого реферала</p>
                <p className="text-xs font-semibold text-gray-500">Пассивный доход каждый месяц</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-purple-200">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center border-2 border-pink-300">
                <span className="text-lg font-black text-pink-600">🚀</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">Без ограничений по количеству</p>
                <p className="text-xs font-semibold text-gray-500">Чем больше рефералов — тем больше прибыль</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onCopyLink}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all font-black"
          >
            <Icon name="Share2" className="mr-2 h-5 w-5" />
            Поделиться ссылкой
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-3 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-[0_5px_0_0_rgba(0,0,0,1)] rounded-2xl overflow-hidden mb-4">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-3 bg-blue-500 rounded-xl border-2 border-black shadow-[0_3px_0_0_rgba(0,0,0,1)]">
            <Icon name="Gift" className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-blue-700 mb-1">🎁 Начни зарабатывать!</h3>
            <p className="text-sm font-bold text-gray-600">Приглашай курьеров и получай деньги</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-blue-200 mb-4">
          <h4 className="text-sm font-black text-gray-700 mb-3">Как это работает:</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-300">
                <span className="text-xs font-black text-blue-600">1</span>
              </div>
              <p className="text-xs font-bold text-gray-600 pt-0.5">Поделись своей реферальной ссылкой</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-300">
                <span className="text-xs font-black text-blue-600">2</span>
              </div>
              <p className="text-xs font-bold text-gray-600 pt-0.5">Твой друг регистрируется и начинает работать</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 border-2 border-green-300">
                <span className="text-xs font-black text-green-600">3</span>
              </div>
              <p className="text-xs font-bold text-gray-600 pt-0.5">Ты получаешь процент с его заказов постоянно!</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl border-3 border-black mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-black text-white">Потенциальный доход:</span>
            <Icon name="TrendingUp" className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white/90">5 рефералов ≈ <span className="text-yellow-300 font-black">15 000₽/мес</span></p>
            <p className="text-xs font-bold text-white/90">10 рефералов ≈ <span className="text-yellow-300 font-black">30 000₽/мес</span></p>
            <p className="text-xs font-bold text-white/90">20 рефералов ≈ <span className="text-yellow-300 font-black">60 000₽/мес</span></p>
          </div>
        </div>

        <Button
          onClick={onCopyLink}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all font-black"
        >
          <Icon name="Share2" className="mr-2 h-5 w-5" />
          Получить реферальную ссылку
        </Button>

        <p className="text-xs font-bold text-gray-500 text-center mt-3">
          💡 Чем больше рефералов — тем больше твой пассивный доход
        </p>
      </div>
    </Card>
  );
}
