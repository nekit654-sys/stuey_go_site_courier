import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const VISIT_TRACKING_URL = 'https://functions.poehali.dev/f52e1a9a-d1cb-41bf-a68f-5a795c41833c';
const CLEANUP_URL = 'https://functions.poehali.dev/12d56d01-19eb-4b20-9f70-7577f5547597';

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
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();

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

  const handleCleanup = async () => {
    if (!confirm('Удалить все визиты старше 90 дней? Это действие нельзя отменить.')) {
      return;
    }

    setIsCleaningUp(true);
    
    try {
      const response = await fetch(CLEANUP_URL, {
        method: 'POST',
        headers: {
          'X-Auth-Token': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка очистки данных');
      }

      const result = await response.json();
      
      toast({
        title: 'Очистка завершена',
        description: `Удалено записей: ${result.deleted_count}. Осталось: ${result.remaining_count}`,
      });

      fetchAnalytics();
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось очистить данные',
        variant: 'destructive',
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, authToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin" size={32} />
        <p className="text-sm text-muted-foreground mt-4">Загрузка статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Icon name="AlertCircle" size={20} />
        <AlertDescription>
          {error}
          <button 
            onClick={fetchAnalytics} 
            className="ml-2 underline hover:no-underline"
          >
            Повторить попытку
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const { summary, daily_stats, repeat_visitors, bot_patterns } = data;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Статистика посещений</h2>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <div className="flex gap-2 flex-1 sm:flex-none">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  days === d 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {d}д
              </button>
            ))}
          </div>
          <Button
            onClick={handleCleanup}
            disabled={isCleaningUp}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            {isCleaningUp ? (
              <>
                <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                Очистка...
              </>
            ) : (
              <>
                <Icon name="Trash2" className="mr-2" size={16} />
                Очистить старые
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
              <Icon name="Users" size={14} className="sm:w-4 sm:h-4" />
              <span className="truncate">Всего</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{summary.total_visits}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 hidden sm:block">
              За последние {days} дней
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
              <Icon name="CheckCircle" size={14} className="text-green-500 sm:w-4 sm:h-4" />
              <span className="truncate">Настоящих</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{summary.real_visits}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {summary.total_visits > 0 
                ? Math.round((summary.real_visits / summary.total_visits) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
              <Icon name="Bot" size={14} className="text-red-500 sm:w-4 sm:h-4" />
              <span className="truncate">Боты</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{summary.suspected_bots}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {summary.bot_percentage.toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
              <Icon name="Repeat" size={14} className="sm:w-4 sm:h-4" />
              <span className="truncate">Повторных</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-xl sm:text-2xl font-bold">{summary.repeat_visits}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              <span className="hidden sm:inline">Первых: </span>{summary.first_visits}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="daily" className="text-xs sm:text-sm py-2">По дням</TabsTrigger>
          <TabsTrigger value="repeats" className="text-xs sm:text-sm py-2">Повторные</TabsTrigger>
          <TabsTrigger value="bots" className="text-xs sm:text-sm py-2">Боты</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">График посещений по дням</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ResponsiveContainer width="100%" height={250}>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Топ повторных посетителей</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {repeat_visitors.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  Нет данных о повторных посещениях
                </p>
              ) : (
                <div className="space-y-2 sm:space-y-3 max-h-[500px] overflow-y-auto">
                  {repeat_visitors.map((visitor, idx) => (
                    <div 
                      key={visitor.ip}
                      className="flex items-center justify-between p-2 sm:p-3 bg-secondary/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono text-xs sm:text-sm truncate">{visitor.ip}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            Балл: {visitor.avg_score.toFixed(0)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-bold text-xs sm:text-sm">{visitor.visits}<span className="hidden sm:inline"> визитов</span></div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(visitor.last_visit).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
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
            <CardHeader className="px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Паттерны ботов</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {bot_patterns.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="ShieldCheck" size={36} className="sm:w-12 sm:h-12 mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Ботов не обнаружено! 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto">
                  {bot_patterns.map((pattern, idx) => (
                    <div key={idx} className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-red-600 text-xs sm:text-sm">
                          Обнаружено: {pattern.count} раз
                        </span>
                        <Icon name="AlertTriangle" size={16} className="sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                      </div>
                      <div className="text-xs sm:text-sm space-y-1">
                        {Object.entries(pattern.indicators).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <Icon name="X" size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground break-words">
                              {key === 'short_user_agent' && 'Короткий User-Agent'}
                              {key === 'bot_keyword' && `Бот: ${value}`}
                              {key === 'too_fast' && 'Слишком быстро'}
                              {key === 'no_mouse_activity' && 'Нет мыши'}
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