import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { vehicleOptions } from './types';

interface User {
  full_name: string;
  phone?: string;
  city?: string;
  referral_code: string;
  invited_by_user_id?: number;
}

interface ProfileTabProps {
  user: User;
  selectedVehicle: string;
  inviterCode: string;
  submittingInviter: boolean;
  onShowProfileSetup: () => void;
  onVehicleChange: (vehicle: string) => void;
  onInviterCodeChange: (code: string) => void;
  onSetInviter: () => void;
}

export default function ProfileTab({
  user,
  selectedVehicle,
  inviterCode,
  submittingInviter,
  onShowProfileSetup,
  onVehicleChange,
  onInviterCodeChange,
  onSetInviter,
}: ProfileTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Мой профиль</CardTitle>
              <CardDescription>Ваши данные и настройки</CardDescription>
            </div>
            <Button variant="outline" onClick={onShowProfileSetup}>
              <Icon name="Edit" className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-2 rounded-lg">
              <label className="text-sm font-medium text-gray-500">ФИО</label>
              <p className="text-lg font-semibold mt-1">{user?.full_name}</p>
            </div>
            <div className="p-4 border-2 rounded-lg">
              <label className="text-sm font-medium text-gray-500">Телефон</label>
              <p className="text-lg font-semibold font-mono mt-1">{user?.phone}</p>
            </div>
            <div className="p-4 border-2 rounded-lg">
              <label className="text-sm font-medium text-gray-500">Город</label>
              <p className="text-lg font-semibold mt-1">{user?.city}</p>
            </div>
            <div className="p-4 border-2 rounded-lg bg-purple-50">
              <label className="text-sm font-medium text-purple-600">Реферальный код</label>
              <p className="text-2xl font-mono font-bold text-purple-900 mt-1">{user?.referral_code}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Bike" className="h-5 w-5" />
              Транспорт
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {vehicleOptions.map((vehicle) => (
                <button
                  key={vehicle.value}
                  onClick={() => onVehicleChange(vehicle.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedVehicle === vehicle.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <Icon name={vehicle.icon as any} className={`h-8 w-8 mx-auto mb-2 ${
                    selectedVehicle === vehicle.value ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    selectedVehicle === vehicle.value ? 'text-blue-900' : 'text-gray-600'
                  }`}>
                    {vehicle.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Меня пригласили</CardTitle>
          <CardDescription>Если вы забыли указать реферальный код при регистрации</CardDescription>
        </CardHeader>
        <CardContent>
          {user?.invited_by_user_id ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <Icon name="CheckCircle" className="h-5 w-5" />
                <p className="font-medium">Вы уже привязаны к реферу</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Введите реферальный код"
                  value={inviterCode}
                  onChange={(e) => onInviterCodeChange(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2 border-2 rounded-lg"
                />
                <Button onClick={onSetInviter} disabled={submittingInviter}>
                  {submittingInviter ? <Icon name="Loader2" className="h-4 w-4 animate-spin" /> : 'Применить'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
