import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { API_URL } from '@/config/api';

interface PaymentDistribution {
  id: number;
  earning_id: number;
  recipient_type: 'courier_self' | 'courier_referrer' | 'admin';
  recipient_id: number;
  recipient_name: string;
  amount: number;
  percentage: number;
  payment_status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
  earning_period?: string;
  courier_name?: string;
}

interface PaymentDistributionsTabProps {
  authToken: string;
}

export default function PaymentDistributionsTab({ authToken }: PaymentDistributionsTabProps) {
  const [distributions, setDistributions] = useState<PaymentDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [filterType, setFilterType] = useState<'all' | 'courier_self' | 'courier_referrer' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDistributions();
  }, [authToken]);

  const fetchDistributions = async () => {
    try {
      const response = await fetch(`${API_URL}?route=admin&action=payment_distributions`, {
        headers: {
          'X-Auth-Token': authToken,
        },
      });
      const data = await response.json();

      if (data.success) {
        setDistributions(data.distributions || []);
      }
    } catch (error) {
      console.error('Error fetching distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDistributions = distributions.filter((d) => {
    if (filterStatus !== 'all' && d.payment_status !== filterStatus) return false;
    if (filterType !== 'all' && d.recipient_type !== filterType) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        d.recipient_name?.toLowerCase().includes(query) ||
        d.courier_name?.toLowerCase().includes(query) ||
        d.id.toString().includes(query)
      );
    }
    
    return true;
  });

  const stats = {
    total: distributions.length,
    pending: distributions.filter((d) => d.payment_status === 'pending').length,
    paid: distributions.filter((d) => d.payment_status === 'paid').length,
    totalPending: distributions
      .filter((d) => d.payment_status === 'pending')
      .reduce((sum, d) => sum + d.amount, 0),
    totalPaid: distributions
      .filter((d) => d.payment_status === 'paid')
      .reduce((sum, d) => sum + d.amount, 0),
  };

  const typeConfig = {
    courier_self: { label: 'Самобонус курьера', color: 'bg-green-100 text-green-800', icon: 'User' },
    courier_referrer: { label: 'Реферер (60%)', color: 'bg-blue-100 text-blue-800', icon: 'Users' },
    admin: { label: 'Админ (40%)', color: 'bg-purple-100 text-purple-800', icon: 'Shield' },
  };

  const statusConfig = {
    pending: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-800' },
    paid: { label: 'Выплачено', color: 'bg-green-100 text-green-800' },
  };

  const exportToExcel = () => {
    // Конвертируем данные в CSV формат
    const csvRows = [
      ['ID', 'Тип', 'Получатель', 'Курьер', 'Сумма', 'Процент', 'Статус', 'Дата создания', 'Дата выплаты'].join(',')
    ];

    filteredDistributions.forEach((dist) => {
      const row = [
        dist.id,
        typeConfig[dist.recipient_type].label,
        `"${dist.recipient_name || `ID ${dist.recipient_id}`}"`,
        `"${dist.courier_name || '-'}"`,
        dist.amount.toFixed(2),
        dist.percentage.toFixed(1),
        statusConfig[dist.payment_status].label,
        new Date(dist.created_at).toLocaleDateString('ru-RU'),
        dist.paid_at ? new Date(dist.paid_at).toLocaleDateString('ru-RU') : '-'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_distributions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon name="Loader2" className="h-12 w-12 mx-auto text-gray-300 animate-spin mb-4" />
          <p className="text-gray-500">Загрузка распределений...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Icon name="FileText" className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего записей</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Icon name="Clock" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ожидает выплаты</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-500">{stats.totalPending.toFixed(2)} ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon name="Check" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Выплачено</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-xs text-gray-500">{stats.totalPaid.toFixed(2)} ₽</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon name="Users" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Рефереры</p>
                <p className="text-2xl font-bold">
                  {distributions.filter((d) => d.recipient_type === 'courier_referrer').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Icon name="Shield" className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Админам</p>
                <p className="text-2xl font-bold">
                  {distributions.filter((d) => d.recipient_type === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Filter" className="text-blue-600" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Статус</label>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="pending">Ожидает</SelectItem>
                  <SelectItem value="paid">Выплачено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Тип получателя</label>
              <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="courier_self">Самобонус</SelectItem>
                  <SelectItem value="courier_referrer">Рефереры</SelectItem>
                  <SelectItem value="admin">Админы</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Поиск</label>
              <Input
                placeholder="Имя, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица распределений */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Database" className="text-green-600" />
              История распределений ({filteredDistributions.length})
            </CardTitle>
            <Button
              onClick={exportToExcel}
              variant="outline"
              className="flex items-center gap-2"
              disabled={filteredDistributions.length === 0}
            >
              <Icon name="Download" size={16} />
              Экспорт в Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDistributions.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Inbox" className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Нет записей</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-600">ID</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Тип</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Получатель</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Курьер</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600">Сумма</th>
                    <th className="text-right p-3 text-sm font-medium text-gray-600">%</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Статус</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributions.map((dist) => {
                    const typeConf = typeConfig[dist.recipient_type];
                    const statusConf = statusConfig[dist.payment_status];

                    return (
                      <tr key={dist.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-900">#{dist.id}</td>
                        <td className="p-3">
                          <Badge className={typeConf.color}>
                            <Icon name={typeConf.icon as any} className="mr-1 h-3 w-3" />
                            {typeConf.label}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm font-medium text-gray-900">
                          {dist.recipient_name || `ID ${dist.recipient_id}`}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {dist.courier_name || '-'}
                        </td>
                        <td className="p-3 text-right text-sm font-bold text-green-600">
                          {dist.amount.toFixed(2)} ₽
                        </td>
                        <td className="p-3 text-right text-sm text-gray-600">
                          {dist.percentage.toFixed(1)}%
                        </td>
                        <td className="p-3">
                          <Badge className={statusConf.color}>{statusConf.label}</Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {dist.paid_at
                            ? new Date(dist.paid_at).toLocaleDateString('ru-RU')
                            : new Date(dist.created_at).toLocaleDateString('ru-RU')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}