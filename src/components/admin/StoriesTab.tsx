import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { createInitialStories } from '@/utils/createInitialStories';
import ImageUploader from './ImageUploader';
import StoryAnimations from '@/components/StoryAnimations';

interface AnimationConfig {
  fallingImage?: string;
  fallingCount?: number;
  fallingSpeed?: number;
  jumpingImage?: string;
  jumpingPosition?: string;
}

interface Story {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  position: number;
  animationType?: string;
  animationConfig?: AnimationConfig;
  createdAt: string;
  updatedAt: string;
}

export default function StoriesTab() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    position: 0,
    animationType: 'none',
    animationConfig: {
      fallingImage: '',
      fallingCount: 15,
      fallingSpeed: 100,
      jumpingImage: '',
      jumpingPosition: 'bottom-left',
    },
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://functions.poehali.dev/687c4b0c-583b-4365-9d89-755ef27059e3?admin=true');
      const data = await response.json();
      
      const allStories = data.stories || [];
      allStories.sort((a: Story, b: Story) => a.position - b.position);
      setStories(allStories);
    } catch (error) {
      toast.error('Ошибка загрузки историй');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.imageUrl) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/687c4b0c-583b-4365-9d89-755ef27059e3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('История создана');
        resetForm();
        fetchStories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка создания истории');
        console.error('Create error:', errorData);
      }
    } catch (error) {
      toast.error('Ошибка создания истории');
      console.error('Create exception:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingStory) return;

    try {
      const response = await fetch('https://functions.poehali.dev/f225856e-0853-4f67-92e5-4ff2a716193e', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingStory.id,
          ...formData,
        }),
      });

      if (response.ok) {
        toast.success('История обновлена');
        resetForm();
        fetchStories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка обновления истории');
        console.error('Update error:', errorData);
      }
    } catch (error) {
      toast.error('Ошибка обновления истории');
      console.error('Update exception:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить историю?')) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/687c4b0c-583b-4365-9d89-755ef27059e3?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('История удалена');
        fetchStories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка удаления истории');
        console.error('Delete error:', errorData);
      }
    } catch (error) {
      toast.error('Ошибка удаления истории');
      console.error('Delete exception:', error);
    }
  };

  const handleToggleActive = async (story: Story) => {
    try {
      const response = await fetch('https://functions.poehali.dev/f225856e-0853-4f67-92e5-4ff2a716193e', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: story.id,
          title: story.title,
          description: story.description,
          imageUrl: story.imageUrl,
          buttonText: story.buttonText,
          buttonLink: story.buttonLink,
          position: story.position,
          animationType: story.animationType,
          animationConfig: story.animationConfig,
          isActive: !story.isActive,
        }),
      });

      if (response.ok) {
        toast.success(story.isActive ? 'История скрыта' : 'История показана');
        fetchStories();
      } else {
        toast.error('Ошибка обновления истории');
      }
    } catch (error) {
      toast.error('Ошибка обновления истории');
      console.error(error);
    }
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    
    const config = story.animationConfig || {};
    
    setFormData({
      title: story.title,
      description: story.description,
      imageUrl: story.imageUrl,
      buttonText: story.buttonText || '',
      buttonLink: story.buttonLink || '',
      position: story.position,
      animationType: story.animationType || 'none',
      animationConfig: {
        fallingImage: config.fallingImage || '',
        fallingCount: config.fallingCount || 15,
        fallingSpeed: config.fallingSpeed || 100,
        jumpingImage: config.jumpingImage || '',
        jumpingPosition: config.jumpingPosition || 'bottom-left',
      },
    });
    setShowCreateForm(true);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      buttonText: '',
      buttonLink: '',
      position: 0,
      animationType: 'none',
      animationConfig: {
        fallingImage: '',
        fallingCount: 15,
        fallingSpeed: 100,
        jumpingImage: '',
        jumpingPosition: 'bottom-left',
      },
    });
    setShowCreateForm(false);
    setEditingStory(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold">Истории</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Управление историями на главной странице
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={async () => {
              await createInitialStories();
              fetchStories();
              toast.success('5 историй созданы!');
            }}
            className="w-full sm:w-auto bg-green-400 hover:bg-green-500 text-black font-extrabold border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
          >
            <Icon name="Sparkles" size={20} className="mr-2" />
            Создать 5 готовых историй
          </Button>
          
          <Button
            onClick={() => {
              if (showCreateForm) {
                resetForm();
              } else {
                setShowCreateForm(true);
              }
            }}
            className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
          >
            <Icon name={showCreateForm ? 'X' : 'Plus'} size={20} className="mr-2" />
            {showCreateForm ? 'Отмена' : 'Создать историю'}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className={`p-4 sm:p-6 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] bg-white ${editingStory ? 'ring-4 ring-blue-400' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
              {editingStory ? '✏️ Редактировать историю' : '➕ Новая история'}
            </h3>
            {editingStory && (
              <span className="bg-blue-400 text-black px-3 py-1 rounded-full text-sm font-bold border-2 border-black">
                Режим редактирования
              </span>
            )}
          </div>
          <div className="space-y-3 sm:space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-black">
              <h4 className="font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2">
                <Icon name="FileText" size={20} className="text-purple-600" />
                Основная информация
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">
                    <Icon name="Heading" size={16} className="inline mr-1" />
                    Заголовок <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Бонус 3000₽!"
                    className="border-3 border-black focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">
                    <Icon name="AlignLeft" size={16} className="inline mr-1" />
                    Описание
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Подробное описание акции или предложения"
                    className="border-3 border-black focus:ring-2 focus:ring-purple-400"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border-2 border-black">
              <h4 className="font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2">
                <Icon name="Image" size={20} className="text-green-600" />
                Главное изображение <span className="text-red-500">*</span>
              </h4>
              <ImageUploader
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                label="Загрузить главное фото"
                previewClassName="w-48 h-32"
              />
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="или вставьте URL: https://cdn.poehali.dev/files/..."
                className="border-3 border-black mt-2"
              />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-black">
              <h4 className="font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2">
                <Icon name="MousePointerClick" size={20} className="text-blue-600" />
                Кнопка внутри истории
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">
                    <Icon name="Type" size={16} className="inline mr-1" />
                    Надпись на кнопке
                  </label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Например: Подать заявку"
                    className="border-3 border-black focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">
                    <Icon name="Link" size={16} className="inline mr-1" />
                    Куда ведёт ссылка
                  </label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="/career или https://..."
                    className="border-3 border-black focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Icon name="Info" size={14} />
                Это кнопка, которую увидят пользователи внутри истории
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">
                <Icon name="Hash" size={16} className="inline mr-1" />
                Позиция (порядок показа)
              </label>
              <Input
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                className="border-3 border-black w-32"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Истории с меньшим номером показываются первыми</p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-black">
              <h4 className="font-extrabold text-base sm:text-lg mb-4 flex items-center gap-2">
                <Icon name="Sparkles" size={20} className="text-yellow-600" />
                Анимация (необязательно)
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">Тип анимации</label>
                  <Select
                    value={formData.animationType}
                    onValueChange={(value) => setFormData({ ...formData, animationType: value })}
                  >
                    <SelectTrigger className="border-3 border-black">
                      <SelectValue placeholder="Без анимации" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без анимации</SelectItem>
                      <SelectItem value="falling">Падающие элементы</SelectItem>
                      <SelectItem value="jumping">Прыгающий персонаж</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.animationType === 'falling' && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">Изображение падающих элементов</label>
                      <ImageUploader
                        value={formData.animationConfig.fallingImage || ''}
                        onChange={(url) => setFormData({
                          ...formData,
                          animationConfig: { ...formData.animationConfig, fallingImage: url }
                        })}
                        label="Загрузить картинку эффекта"
                        previewClassName="w-16 h-16"
                      />
                      <Input
                        value={formData.animationConfig.fallingImage}
                        onChange={(e) => setFormData({
                          ...formData,
                          animationConfig: { ...formData.animationConfig, fallingImage: e.target.value }
                        })}
                        placeholder="или вставьте URL"
                        className="border-3 border-black mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">Количество</label>
                        <Input
                          type="number"
                          value={formData.animationConfig.fallingCount}
                          onChange={(e) => setFormData({
                            ...formData,
                            animationConfig: { ...formData.animationConfig, fallingCount: parseInt(e.target.value) || 15 }
                          })}
                          className="border-3 border-black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">Скорость (мс)</label>
                        <Input
                          type="number"
                          value={formData.animationConfig.fallingSpeed}
                          onChange={(e) => setFormData({
                            ...formData,
                            animationConfig: { ...formData.animationConfig, fallingSpeed: parseInt(e.target.value) || 100 }
                          })}
                          className="border-3 border-black"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.animationType === 'jumping' && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">Изображение персонажа</label>
                      <ImageUploader
                        value={formData.animationConfig.jumpingImage || ''}
                        onChange={(url) => setFormData({
                          ...formData,
                          animationConfig: { ...formData.animationConfig, jumpingImage: url }
                        })}
                        label="Загрузить персонажа"
                        previewClassName="w-24 h-24"
                      />
                      <Input
                        value={formData.animationConfig.jumpingImage}
                        onChange={(e) => setFormData({
                          ...formData,
                          animationConfig: { ...formData.animationConfig, jumpingImage: e.target.value }
                        })}
                        placeholder="или вставьте URL"
                        className="border-3 border-black mt-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-bold mb-2 text-gray-900">Позиция персонажа</label>
                      <Select
                        value={formData.animationConfig.jumpingPosition}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          animationConfig: { ...formData.animationConfig, jumpingPosition: value }
                        })}
                      >
                        <SelectTrigger className="border-3 border-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-left">Снизу слева</SelectItem>
                          <SelectItem value="bottom-right">Снизу справа</SelectItem>
                          <SelectItem value="bottom-center">Снизу по центру</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-3 border-black">
              <Button
                onClick={() => setShowPreview(true)}
                variant="outline"
                className="w-full sm:w-auto border-3 border-black font-extrabold hover:bg-blue-50"
              >
                <Icon name="Eye" size={20} className="mr-2" />
                Предпросмотр
              </Button>
              <Button
                onClick={editingStory ? handleUpdate : handleCreate}
                className="w-full sm:flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-black font-extrabold border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all"
              >
                <Icon name="Check" size={20} className="mr-2" />
                {editingStory ? '💾 Сохранить изменения' : '✨ Создать историю'}
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full sm:w-auto border-3 border-black font-extrabold hover:bg-red-50"
              >
                <Icon name="X" size={20} className="mr-2" />
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">
          <Icon name="Loader2" className="animate-spin mx-auto" size={32} />
        </div>
      ) : stories.length === 0 ? (
        <Card className="p-4 sm:p-8 text-center border-3 border-black">
          <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Нет историй</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {stories.map((story) => (
            <Card
              key={story.id}
              className="border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] overflow-hidden"
            >
              <div className="relative h-32 bg-gray-100">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="bg-white px-2 py-1 rounded text-xs font-bold border-2 border-black">
                    #{story.position}
                  </span>
                  {!story.isActive && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold border-2 border-black">
                      Скрыто
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-extrabold text-base sm:text-lg mb-2 break-words">{story.title}</h3>
                {story.description && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 break-words">{story.description}</p>
                )}
                <div className="flex flex-col gap-1 mb-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Icon name="Calendar" size={12} />
                    <span>Создано: {new Date(story.createdAt).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  {story.updatedAt !== story.createdAt && (
                    <div className="flex items-center gap-1">
                      <Icon name="RefreshCw" size={12} />
                      <span>Обновлено: {new Date(story.updatedAt).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
                  <Button
                    onClick={() => handleEdit(story)}
                    size="sm"
                    className="flex-1 bg-blue-400 hover:bg-blue-500 text-black font-bold border-2 border-black"
                  >
                    <Icon name="Edit" size={16} className="mr-1" />
                    Изменить
                  </Button>
                  <Button
                    onClick={() => handleToggleActive(story)}
                    size="sm"
                    className={`border-2 border-black font-bold ${
                      story.isActive 
                        ? 'bg-orange-400 hover:bg-orange-500 text-black' 
                        : 'bg-green-400 hover:bg-green-500 text-black'
                    }`}
                  >
                    <Icon name={story.isActive ? 'EyeOff' : 'Eye'} size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(story.id)}
                    size="sm"
                    variant="destructive"
                    className="border-2 border-black font-bold"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showPreview && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="relative w-full max-w-md aspect-[9/16] bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full border-2 border-black shadow-lg hover:bg-white"
            >
              <Icon name="X" size={20} />
            </button>

            <div className="relative w-full h-full">
              <img
                src={formData.imageUrl || 'https://via.placeholder.com/400x700?text=No+Image'}
                alt={formData.title}
                className="w-full h-full object-cover"
              />

              {/* Animations */}
              <StoryAnimations 
                animationType={formData.animationType}
                animationConfig={formData.animationConfig}
              />

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
                <h3 className="text-white text-2xl font-extrabold mb-2">{formData.title || 'Без заголовка'}</h3>
                {formData.description && (
                  <p className="text-white/90 text-sm mb-4">{formData.description}</p>
                )}
                {formData.buttonText && (
                  <button className="w-full bg-white text-black font-extrabold py-3 px-6 rounded-full border-2 border-black shadow-lg">
                    {formData.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}