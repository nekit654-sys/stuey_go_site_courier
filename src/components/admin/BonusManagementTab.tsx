import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BonusManagementTabProps {
  authToken: string;
}

interface BonusUser {
  user_id: number;
  name: string;
  phone: string;
  bonus_amount: number;
  granted_at: string;
  expires_at: string;
  is_used: boolean;
}

export default function BonusManagementTab({ authToken }: BonusManagementTabProps) {
  const [bonusUsers, setBonusUsers] = useState<BonusUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total_granted: 0,
    total_used: 0,
    total_active: 0,
    total_expired: 0
  });

  const fetchBonusUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.yandexcloud.net/d4e7hka0qfaobbhk4vj6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          action: 'get_bonus_users'
        })
      });

      const data = await response.json();
      if (data.users) {
        setBonusUsers(data.users);
        setStats(data.stats || {
          total_granted: 0,
          total_used: 0,
          total_active: 0,
          total_expired: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch bonus users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBonusUsers();
  }, [authToken]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Icon name="Gift" className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего выдано</p>
              <p className="text-2xl font-bold">{stats.total_granted}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Icon name="CheckCircle" className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Использовано</p>
              <p className="text-2xl font-bold">{stats.total_used}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Icon name="Clock" className="text-yellow-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Активных</p>
              <p className="text-2xl font-bold">{stats.total_active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Icon name="XCircle" className="text-red-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Истекло</p>
              <p className="text-2xl font-bold">{stats.total_expired}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Пользователи с бонусом 3000₽</h3>
          <Button onClick={fetchBonusUsers} variant="outline" size="sm">
            <Icon name="RefreshCw" size={16} className={isLoading ? 'animate-spin' : ''} />
            Обновить
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        ) : bonusUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Gift" size={48} className="mx-auto mb-2 opacity-50" />
            <p>Пока никто не получил бонус 3000₽</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Имя</th>
                  <th className="text-left py-3 px-2">Телефон</th>
                  <th className="text-right py-3 px-2">Сумма</th>
                  <th className="text-left py-3 px-2">Выдан</th>
                  <th className="text-left py-3 px-2">Истекает</th>
                  <th className="text-center py-3 px-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {bonusUsers.map((user) => (
                  <tr key={user.user_id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">{user.name}</td>
                    <td className="py-3 px-2 font-mono text-sm">{user.phone}</td>
                    <td className="py-3 px-2 text-right font-semibold">{user.bonus_amount}₽</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {formatDate(user.granted_at)}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">
                      {formatDate(user.expires_at)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {user.is_used ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                          <Icon name="CheckCircle" size={14} />
                          Использован
                        </span>
                      ) : isExpired(user.expires_at) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
                          <Icon name="XCircle" size={14} />
                          Истёк
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-medium">
                          <Icon name="Clock" size={14} />
                          Активен
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
