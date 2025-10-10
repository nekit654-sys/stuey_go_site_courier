import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import CourierEarningsCard from '@/components/CourierEarningsCard';

interface User {
  id: number;
  full_name: string;
  phone?: string;
  city?: string;
  referral_code: string;
}

interface PaymentsTabProps {
  user: User;
}

export default function PaymentsTab({ user }: PaymentsTabProps) {
  return (
    <div className="space-y-6">
      <CourierEarningsCard userId={user.id} />

      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle>Данные для партнерской программы</CardTitle>
          <CardDescription>Эти данные используются для автоматической сверки выплат</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Важно!</p>
                <p>Убедитесь, что эти данные совпадают с вашим профилем в Яндекс Про</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <label className="text-xs font-medium text-blue-600 uppercase">ФИО</label>
              <p className="text-2xl font-bold text-blue-900 mt-1">{user?.full_name}</p>
            </div>
            <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
              <label className="text-xs font-medium text-green-600 uppercase">Город</label>
              <p className="text-2xl font-bold text-green-900 mt-1">{user?.city || 'Не указан'}</p>
            </div>
            <div className="p-6 border-4 border-purple-500 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-[0_6px_0_0_rgba(168,85,247,0.8)]">
              <label className="text-xs font-bold text-purple-100 uppercase">📱 Номер телефона</label>
              <p className="text-3xl font-mono font-black text-white mt-1">
                {user?.phone || 'Не указан'}
              </p>
            </div>
            <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
              <label className="text-xs font-medium text-orange-600 uppercase">Реферальный код</label>
              <p className="text-3xl font-mono font-bold text-orange-900 mt-1">{user?.referral_code}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
