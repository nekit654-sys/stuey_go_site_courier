import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import ImageUploader from './ImageUploader';

interface AnimationConfig {
  fallingImage?: string;
  fallingCount?: number;
  fallingSpeed?: number;
}

interface HeroConfig {
  id?: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  animationType: string;
  animationConfig?: AnimationConfig;
}

interface StoriesTabProps {
  authToken: string;
}

export default function HeroEditorTab({ authToken }: StoriesTabProps) {
  const [heroConfig, setHeroConfig] = useState<HeroConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<HeroConfig>({
    title: 'Свобода выбора — ваш ключ к успеху!',
    subtitle: 'От 1 500₽ до 6 200₽ в день — ваш график, ваш транспорт, ваши правила!',
    imageUrl: '',
    buttonText: 'Начать зарабатывать',
    buttonLink: '/auth',
    animationType: 'none',
    animationConfig: {
      fallingImage: '',
      fallingCount: 20,
      fallingSpeed: 100,
    },
  });

  useEffect(() => {
    fetchHeroConfig();
  }, []);

  const fetchHeroConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://functions.poehali.dev/a9101bf0-537a-4c04-833d-6ace7003a1ba', {
        headers: {
          'X-Auth-Token': authToken
        }
      });
      const data = await response.json();
      
      if (data.success && data.hero) {
        const hero = data.hero;
        const mappedHero: HeroConfig = {
          id: hero.id,
          title: hero.title || 'Свобода выбора — ваш ключ к успеху!',
          subtitle: hero.subtitle || 'От 1 500₽ до 6 200₽ в день — ваш график, ваш транспорт, ваши правила!',
          imageUrl: hero.image_url || '',
          buttonText: hero.button_text || 'Начать зарабатывать',
          buttonLink: hero.button_link || '/auth',
          animationType: hero.animation_type || 'none',
          animationConfig: typeof hero.animation_config === 'string' 
            ? JSON.parse(hero.animation_config) 
            : (hero.animation_config || { fallingImage: '', fallingCount: 20, fallingSpeed: 100 })
        };
        
        setHeroConfig(mappedHero);
        setFormData(mappedHero);
        console.log('Hero config loaded:', mappedHero);
      }
    } catch (error) {
      console.error('Ошибка загрузки Hero:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('Saving hero data:', formData);
    
    try {
      const response = await fetch('https://functions.poehali.dev/a9101bf0-537a-4c04-833d-6ace7003a1ba', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('Save response:', result);

      if (response.ok && result.success) {
        toast.success('Hero-блок обновлён');
        await fetchHeroConfig();
      } else {
        toast.error('Ошибка сохранения: ' + (result.error || 'неизвестная ошибка'));
        console.error('Save failed:', result);
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error('Save error:', error);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Редактор Hero-блока</h2>
          <p className="text-sm text-muted-foreground">Настройте фон и анимацию главного блока</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Фоновое изображение</label>
            <ImageUploader
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            />
            
            {formData.imageUrl && (
              <div className="mt-4 space-y-4">
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Icon name="Info" size={16} />
                    Предпросмотр на разных устройствах
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">📱 Телефон (375x667)</p>
                      <div className="border rounded overflow-hidden bg-background">
                        <div 
                          className="w-full h-32 bg-cover bg-center"
                          style={{ backgroundImage: `url(${formData.imageUrl})` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">💻 Ноутбук (1366x768)</p>
                      <div className="border rounded overflow-hidden bg-background">
                        <div 
                          className="w-full h-32 bg-cover bg-center"
                          style={{ backgroundImage: `url(${formData.imageUrl})` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">🖥️ Монитор (1920x1080)</p>
                      <div className="border rounded overflow-hidden bg-background">
                        <div 
                          className="w-full h-32 bg-cover bg-center"
                          style={{ backgroundImage: `url(${formData.imageUrl})` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-blue-200 bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Icon name="Lightbulb" size={14} />
                    Рекомендации
                  </h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Рекомендуемый размер: <strong>1920x1080</strong> (Full HD)</li>
                    <li>• Формат: <strong>16:9</strong> для лучшей совместимости</li>
                    <li>• Важные элементы размещайте по центру</li>
                    <li>• Края могут обрезаться на мобильных устройствах</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Анимация падающих элементов</label>
            <Select
              value={formData.animationType}
              onValueChange={(value) => setFormData({ ...formData, animationType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без анимации</SelectItem>
                <SelectItem value="falling">Падающие элементы</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.animationType === 'falling' && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Изображение для падения</label>
                <ImageUploader
                  value={formData.animationConfig?.fallingImage || ''}
                  onChange={(url) =>
                    setFormData({
                      ...formData,
                      animationConfig: { ...formData.animationConfig, fallingImage: url },
                    })
                  }
                />
                {formData.animationConfig?.fallingImage && (
                  <div className="mt-3 border border-amber-200 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Icon name="ImageIcon" size={14} className="mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Предпросмотр:</strong></p>
                        <div className="flex gap-2 items-center">
                          <img 
                            src={formData.animationConfig.fallingImage} 
                            alt="Preview" 
                            className="max-w-[60px] max-h-[60px] object-contain border rounded"
                          />
                          <div>
                            <p>• Изображение будет падать с сохранением пропорций</p>
                            <p>• Размер автоматически подстраивается</p>
                            <p>• Лучше использовать PNG с прозрачностью</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Количество элементов ({formData.animationConfig?.fallingCount})
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={formData.animationConfig?.fallingCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      animationConfig: {
                        ...formData.animationConfig,
                        fallingCount: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Скорость падения ({formData.animationConfig?.fallingSpeed}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={formData.animationConfig?.fallingSpeed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      animationConfig: {
                        ...formData.animationConfig,
                        fallingSpeed: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        <Button onClick={handleSave} className="w-full mt-6">
          <Icon name="Save" className="mr-2" />
          Сохранить изменения
        </Button>
      </Card>
    </div>
  );
}