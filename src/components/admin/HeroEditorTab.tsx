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
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<HeroConfig>({
    title: 'Зарабатывай на приглашении курьеров',
    subtitle: 'Получай 15% с каждого заказа твоих рефералов навсегда',
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
      const response = await fetch('https://functions.poehali.dev/HERO_FUNCTION_URL', {
        headers: {
          'X-Auth-Token': authToken
        }
      });
      const data = await response.json();
      
      if (data.success && data.hero) {
        setHeroConfig(data.hero);
        setFormData(data.hero);
      }
    } catch (error) {
      console.error('Ошибка загрузки Hero:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.subtitle) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/HERO_FUNCTION_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Hero-блок обновлён');
        fetchHeroConfig();
      } else {
        toast.error('Ошибка сохранения');
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
      console.error(error);
    }
  };

  const handleImageUpload = async (file: File, field: 'imageUrl' | 'fallingImage') => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await fetch('https://functions.poehali.dev/4b0df5ab-4eb6-49c6-a55b-2c4f8cdf4e5f', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.url) {
        if (field === 'imageUrl') {
          setFormData({ ...formData, imageUrl: data.url });
        } else if (field === 'fallingImage') {
          setFormData({
            ...formData,
            animationConfig: {
              ...formData.animationConfig,
              fallingImage: data.url,
            },
          });
        }
        toast.success('Изображение загружено');
      } else {
        toast.error('Ошибка загрузки изображения');
      }
    } catch (error) {
      toast.error('Ошибка загрузки изображения');
      console.error(error);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Редактор Hero-блока</h2>
            <p className="text-sm text-muted-foreground">Настройте главный блок лендинга</p>
          </div>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
          >
            <Icon name={showPreview ? 'EyeOff' : 'Eye'} className="mr-2" />
            {showPreview ? 'Скрыть' : 'Превью'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Заголовок *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Основной заголовок"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Подзаголовок *</label>
              <Textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Описание под заголовком"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Текст кнопки</label>
              <Input
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Начать зарабатывать"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ссылка кнопки</label>
              <Input
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                placeholder="/auth"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Тип анимации</label>
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
                    currentImageUrl={formData.animationConfig?.fallingImage}
                    onImageSelect={(file) => handleImageUpload(file, 'fallingImage')}
                    onImageUrlChange={(url) =>
                      setFormData({
                        ...formData,
                        animationConfig: { ...formData.animationConfig, fallingImage: url },
                      })
                    }
                  />
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

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Фоновое изображение</label>
              <ImageUploader
                currentImageUrl={formData.imageUrl}
                onImageSelect={(file) => handleImageUpload(file, 'imageUrl')}
                onImageUrlChange={(url) => setFormData({ ...formData, imageUrl: url })}
              />
            </div>

            {showPreview && (
              <Card className="p-4 bg-gradient-to-br from-yellow-400 via-orange-400 to-yellow-500 relative overflow-hidden min-h-[400px]">
                <div className="relative z-10 text-center py-12">
                  <h1 className="text-4xl font-black text-black mb-4">{formData.title}</h1>
                  <p className="text-xl font-bold text-black/80 mb-6">{formData.subtitle}</p>
                  <Button className="bg-black text-yellow-400 font-bold px-8 py-6 text-lg">
                    {formData.buttonText}
                  </Button>
                </div>

                {formData.animationType === 'falling' && formData.animationConfig?.fallingImage && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: formData.animationConfig.fallingCount || 20 }).map((_, i) => (
                      <img
                        key={i}
                        src={formData.animationConfig!.fallingImage}
                        alt=""
                        className="absolute w-12 h-12 opacity-70 animate-fall"
                        style={{
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 5}s`,
                          animationDuration: `${10 / ((formData.animationConfig.fallingSpeed || 100) / 100)}s`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Hero background"
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                  />
                )}
              </Card>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="flex-1">
            <Icon name="Save" className="mr-2" />
            Сохранить изменения
          </Button>
        </div>
      </Card>
    </div>
  );
}
