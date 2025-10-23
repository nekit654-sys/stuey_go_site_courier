import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/icon';

interface RevenueChartProps {
  authToken: string;
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
  courier_payouts: number;
  referrer_payouts: number;
  profit: number;
}

export default function RevenueChart({ authToken }: RevenueChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChartData();
  }, [authToken]);

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://functions.poehali.dev/11e2050a-12a1-4797-9ba5-1f3b27437559?action=revenue_chart',
        {
          headers: {
            'X-Auth-Token': authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных графика');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ru-RU')}₽`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Динамика доходов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Icon name="AlertCircle" size={20} />
            Ошибка загрузки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} />
            Доходы и прибыль (30 дней)
          </CardTitle>
          <CardDescription>Общий доход, выплаты и чистая прибыль по дням</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                tickFormatter={(value) => `${value}₽`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={formatDate}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stackId="1"
                stroke="#8884d8" 
                fill="#8884d8" 
                name="Доход"
              />
              <Area 
                type="monotone" 
                dataKey="courier_payouts" 
                stackId="2"
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name="Курьерам"
              />
              <Area 
                type="monotone" 
                dataKey="referrer_payouts" 
                stackId="2"
                stroke="#ffc658" 
                fill="#ffc658" 
                name="Рефералам"
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stackId="3"
                stroke="#ff7c7c" 
                fill="#ff7c7c" 
                name="Прибыль"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ShoppingCart" size={20} />
            Количество заказов (30 дней)
          </CardTitle>
          <CardDescription>Динамика количества обработанных заказов</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
              />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value: number) => [`${value} шт`, 'Заказы']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Заказы"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
