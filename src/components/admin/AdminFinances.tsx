import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const ADMIN_FINANCES_URL = 'https://functions.poehali.dev/034c46b8-1c81-490b-95eb-6348433770a8';

interface AdminFinance {
  id: number;
  username: string;
  ad_spend: number;
  percentage: number;
  expected_earnings: number;
  roi: number;
  is_super_admin: boolean;
}

interface FinancesStats {
  admins: AdminFinance[];
  total_ad_spend: number;
  total_admin_earnings: number;
  overall_roi: number;
}

interface AdminFinancesProps {
  authToken: string;
}

export default function AdminFinances({ authToken }: AdminFinancesProps) {
  const [stats, setStats] = useState<FinancesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [spends, setSpends] = useState<Record<number, string>>({});

  useEffect(() => {
    loadFinancesStats();
  }, []);

  const loadFinancesStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${ADMIN_FINANCES_URL}?action=stats`, {
        headers: {
          'X-Auth-Token': authToken,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data);
        
        const initialSpends: Record<number, string> = {};
        data.admins.forEach((admin: AdminFinance) => {
          initialSpends[admin.id] = admin.ad_spend.toString();
        });
        setSpends(initialSpends);
      }
    } catch (error) {
      console.error('Error loading finances:', error);
      toast.error('Ошибка загрузки финансов');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSpends = async () => {
    if (!stats) return;

    try {
      const spendsArray = stats.admins.map((admin) => ({
        admin_id: admin.id,
        amount: parseFloat(spends[admin.id] || '0'),
        note: `Обновление расходов ${new Date().toLocaleDateString()}`,
      }));

      const response = await fetch(ADMIN_FINANCES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken,
        },
        body: JSON.stringify({
          action: 'update_spends',
          spends: spendsArray,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          period_end: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Расходы обновлены');
        setEditMode(false);
        loadFinancesStats();
      } else {
        toast.error('Ошибка сохранения');
      }
    } catch (error) {
      console.error('Error saving spends:', error);
      toast.error('Ошибка сохранения');
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Icon name="Loader2" className="animate-spin h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          Нет данных о финансах
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="TrendingUp" className="h-6 w-6" />
              <span>Общая статистика</span>
            </div>
            {!editMode && (
              <Button
                onClick={() => setEditMode(true)}
                variant="secondary"
                size="sm"
              >
                <Icon name="Edit" className="h-4 w-4 mr-2" />
                Изменить расходы
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm opacity-90">Всего потрачено</div>
              <div className="text-3xl font-bold mt-1">
                {formatMoney(stats.total_ad_spend)}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-90">Всего заработано</div>
              <div className="text-3xl font-bold mt-1">
                {formatMoney(stats.total_admin_earnings)}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-90">ROI</div>
              <div className="text-3xl font-bold mt-1">{stats.overall_roi.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" className="h-5 w-5" />
            Распределение по админам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{admin.username}</span>
                    {admin.is_super_admin && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        Супер-админ
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[120px]">
                    <Label className="text-xs text-gray-500">Расходы</Label>
                    {editMode ? (
                      <Input
                        type="number"
                        value={spends[admin.id]}
                        onChange={(e) =>
                          setSpends({ ...spends, [admin.id]: e.target.value })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-bold text-lg">
                        {formatMoney(admin.ad_spend)}
                      </div>
                    )}
                  </div>

                  <div className="text-center min-w-[80px]">
                    <Label className="text-xs text-gray-500">Доля</Label>
                    <div className="font-bold text-lg">{admin.percentage.toFixed(1)}%</div>
                  </div>

                  <div className="text-center min-w-[120px]">
                    <Label className="text-xs text-gray-500">Заработано</Label>
                    <div className="font-bold text-lg text-green-600">
                      {formatMoney(admin.expected_earnings)}
                    </div>
                  </div>

                  <div className="text-center min-w-[80px]">
                    <Label className="text-xs text-gray-500">ROI</Label>
                    <div
                      className={`font-bold text-lg ${
                        admin.roi > 100 ? 'text-green-600' : 'text-orange-600'
                      }`}
                    >
                      {admin.roi.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editMode && (
            <div className="flex gap-3 mt-6 justify-end">
              <Button
                onClick={() => {
                  setEditMode(false);
                  const initialSpends: Record<number, string> = {};
                  stats.admins.forEach((admin) => {
                    initialSpends[admin.id] = admin.ad_spend.toString();
                  });
                  setSpends(initialSpends);
                }}
                variant="outline"
              >
                Отмена
              </Button>
              <Button onClick={handleSaveSpends}>
                <Icon name="Save" className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
