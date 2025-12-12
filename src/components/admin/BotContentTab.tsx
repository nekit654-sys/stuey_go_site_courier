import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface BotContent {
  welcome_message: string;
  start_message: string;
  bonus_title: string;
  bonus_description: string;
  bonus_conditions: string;
  referral_title: string;
  referral_description: string;
  referral_conditions: string;
  faq_earnings: string;
  faq_withdrawal: string;
  faq_support: string;
  profile_header: string;
  stats_header: string;
  help_message: string;
}

interface BotContentTabProps {
  authToken: string;
}

export default function BotContentTab({ authToken }: BotContentTabProps) {
  const [content, setContent] = useState<BotContent>({
    welcome_message: '',
    start_message: '',
    bonus_title: '',
    bonus_description: '',
    bonus_conditions: '',
    referral_title: '',
    referral_description: '',
    referral_conditions: '',
    faq_earnings: '',
    faq_withdrawal: '',
    faq_support: '',
    profile_header: '',
    stats_header: '',
    help_message: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/11e2050a-12a1-4797-9ba5-1f3b27437559',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken,
          },
          body: JSON.stringify({ action: 'get_bot_content' }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setContent(data.content);
          setLastUpdate(data.content.updated_at);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки контента:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/11e2050a-12a1-4797-9ba5-1f3b27437559',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken,
          },
          body: JSON.stringify({
            action: 'update_bot_content',
            content: content,
          }),
        }
      );

      if (response.ok) {
        alert('✅ Контент бота успешно обновлён!');
        loadContent();
      } else {
        alert('❌ Ошибка при сохранении');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('❌ Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof BotContent, value: string) => {
    setContent({ ...content, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-2">
            <Icon name="MessageSquare" size={24} />
            Контент Telegram-бота
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Изменения применяются мгновенно во всех сообщениях бота
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <Icon name="Loader2" className="animate-spin mr-2" size={16} />
          ) : (
            <Icon name="Save" size={16} className="mr-2" />
          )}
          Сохранить все изменения
        </Button>
      </div>

      {lastUpdate && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Icon name="Clock" size={14} />
          Последнее обновление: {new Date(lastUpdate).toLocaleString('ru-RU')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Приветственные сообщения */}
        <Card className="border-3 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Wave" size={20} />
              Приветствие
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="welcome_message">Приветственное сообщение</Label>
              <Textarea
                id="welcome_message"
                value={content.welcome_message}
                onChange={(e) => handleChange('welcome_message', e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="start_message">Стартовое сообщение</Label>
              <Textarea
                id="start_message"
                value={content.start_message}
                onChange={(e) => handleChange('start_message', e.target.value)}
                rows={2}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Самобонус */}
        <Card className="border-3 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Gift" size={20} />
              Самобонус
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bonus_title">Заголовок</Label>
              <Textarea
                id="bonus_title"
                value={content.bonus_title}
                onChange={(e) => handleChange('bonus_title', e.target.value)}
                rows={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bonus_description">Описание</Label>
              <Textarea
                id="bonus_description"
                value={content.bonus_description}
                onChange={(e) => handleChange('bonus_description', e.target.value)}
                rows={2}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bonus_conditions">Условия</Label>
              <Textarea
                id="bonus_conditions"
                value={content.bonus_conditions}
                onChange={(e) => handleChange('bonus_conditions', e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Рефералы */}
        <Card className="border-3 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Реферальная программа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="referral_title">Заголовок</Label>
              <Textarea
                id="referral_title"
                value={content.referral_title}
                onChange={(e) => handleChange('referral_title', e.target.value)}
                rows={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="referral_description">Описание</Label>
              <Textarea
                id="referral_description"
                value={content.referral_description}
                onChange={(e) => handleChange('referral_description', e.target.value)}
                rows={2}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="referral_conditions">Условия</Label>
              <Textarea
                id="referral_conditions"
                value={content.referral_conditions}
                onChange={(e) => handleChange('referral_conditions', e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border-3 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="HelpCircle" size={20} />
              FAQ (Частые вопросы)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="faq_earnings">О заработке</Label>
              <Textarea
                id="faq_earnings"
                value={content.faq_earnings}
                onChange={(e) => handleChange('faq_earnings', e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="faq_withdrawal">О выплатах</Label>
              <Textarea
                id="faq_withdrawal"
                value={content.faq_withdrawal}
                onChange={(e) => handleChange('faq_withdrawal', e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="faq_support">О поддержке</Label>
              <Textarea
                id="faq_support"
                value={content.faq_support}
                onChange={(e) => handleChange('faq_support', e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Команды */}
        <Card className="border-3 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Terminal" size={20} />
              Команды бота
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="profile_header">Заголовок профиля</Label>
              <Textarea
                id="profile_header"
                value={content.profile_header}
                onChange={(e) => handleChange('profile_header', e.target.value)}
                rows={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="stats_header">Заголовок статистики</Label>
              <Textarea
                id="stats_header"
                value={content.stats_header}
                onChange={(e) => handleChange('stats_header', e.target.value)}
                rows={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="help_message">Сообщение помощи</Label>
              <Textarea
                id="help_message"
                value={content.help_message}
                onChange={(e) => handleChange('help_message', e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Превью */}
        <Card className="border-3 border-blue-500 bg-blue-50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Eye" size={20} />
              Как будет выглядеть в боте
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4 space-y-4 max-w-md mx-auto border-2 border-blue-300">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Icon name="Bot" size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold">Бот-рекрутер</p>
                  <p className="text-xs text-green-600">● онлайн</p>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{content.welcome_message}</p>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{content.start_message}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="bg-blue-500 text-white py-2 px-4 rounded text-sm font-medium">
                  💰 Мой баланс
                </button>
                <button className="bg-blue-500 text-white py-2 px-4 rounded text-sm font-medium">
                  🎁 Самобонус
                </button>
                <button className="bg-blue-500 text-white py-2 px-4 rounded text-sm font-medium">
                  👥 Рефералы
                </button>
                <button className="bg-blue-500 text-white py-2 px-4 rounded text-sm font-medium">
                  ℹ️ Помощь
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <Icon name="Loader2" className="animate-spin mr-2" size={16} />
          ) : (
            <Icon name="Save" size={16} className="mr-2" />
          )}
          Сохранить все изменения
        </Button>
      </div>
    </div>
  );
}
