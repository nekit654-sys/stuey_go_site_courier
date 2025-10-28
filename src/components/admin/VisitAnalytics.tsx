import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const VISIT_TRACKING_URL = 'https://functions.poehali.dev/f52e1a9a-d1cb-41bf-a68f-5a795c41833c';

interface VisitSummary {
  total_visits: number;
  real_visits: number;
  suspected_bots: number;
  first_visits: number;
  repeat_visits: number;
  avg_score: number;
  avg_duration: number;
  avg_scroll: number;
  avg_mouse_movements: number;
  bot_percentage: number;
}

interface DailyStats {
  date: string;
  total: number;
  real: number;
  bots: number;
}

interface RepeatVisitor {
  ip: string;
  visits: number;
  last_visit: string;
  avg_score: number;
}

interface BotPattern {
  indicators: Record<string, any>;
  count: number;
}

interface AnalyticsData {
  summary: VisitSummary;
  daily_stats: DailyStats[];
  repeat_visitors: RepeatVisitor[];
  bot_patterns: BotPattern[];
}

interface VisitAnalyticsProps {
  authToken: string;
}

export default function VisitAnalytics({ authToken }: VisitAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${VISIT_TRACKING_URL}?days=${days}`, {
        method: 'GET',
        headers: {
          'X-Auth-Token': authToken
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, authToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Icon name="AlertCircle" size={20} />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const { summary, daily_stats, repeat_visitors, bot_patterns } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Статистика посещений</h2>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                days === d 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {d} дней
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon name="Users" size={16} />
              Всего визитов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_visits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              За последние {days} дней
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-500" />
              Настоящих
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.real_visits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.total_visits > 0 
                ? Math.round((summary.real_visits / summary.total_visits) * 100)
                : 0}% от общего числа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon name="Bot" size={16} className="text-red-500" />
              Подозрительных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.suspected_bots}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.bot_percentage}% ботов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Icon name="Repeat" size={16} />
              Повторных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.repeat_visits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Первых: {summary.first_visits}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">По дням</TabsTrigger>
          <TabsTrigger value="repeats">Повторные</TabsTrigger>
          <TabsTrigger value="bots">Боты</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>График посещений по дням</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={daily_stats.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8884d8" 
                    name="Всего"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="real" 
                    stroke="#22c55e" 
                    name="Настоящих"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bots" 
                    stroke="#ef4444" 
                    name="Ботов"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Средний балл</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summary.avg_score.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Из 100 возможных
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Среднее время</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summary.avg_duration.toFixed(0)}с
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  На сайте
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Средний скролл</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summary.avg_scroll.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Глубина прокрутки
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="repeats">
          <Card>
            <CardHeader>
              <CardTitle>Топ повторных посетителей</CardTitle>
            </CardHeader>
            <CardContent>
              {repeat_visitors.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Нет данных о повторных посещениях
                </p>
              ) : (
                <div className="space-y-3">
                  {repeat_visitors.map((visitor, idx) => (
                    <div 
                      key={visitor.ip}
                      className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-mono text-sm">{visitor.ip}</div>
                          <div className="text-xs text-muted-foreground">
                            Балл: {visitor.avg_score.toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{visitor.visits} визитов</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(visitor.last_visit).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bots">
          <Card>
            <CardHeader>
              <CardTitle>Паттерны ботов</CardTitle>
            </CardHeader>
            <CardContent>
              {bot_patterns.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="ShieldCheck" size={48} className="mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground">
                    Ботов не обнаружено! 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bot_patterns.map((pattern, idx) => (
                    <div key={idx} className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-red-600">
                          Обнаружено: {pattern.count} раз
                        </span>
                        <Icon name="AlertTriangle" size={20} className="text-red-500" />
                      </div>
                      <div className="text-sm space-y-1">
                        {Object.entries(pattern.indicators).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <Icon name="X" size={14} className="text-red-500" />
                            <span className="text-muted-foreground">
                              {key === 'short_user_agent' && 'Короткий User-Agent'}
                              {key === 'bot_keyword' && `Ключевое слово бота: ${value}`}
                              {key === 'too_fast' && 'Слишком быстрый визит'}
                              {key === 'no_mouse_activity' && 'Нет движений мыши'}
                              {key === 'no_scroll' && 'Нет скролла'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
