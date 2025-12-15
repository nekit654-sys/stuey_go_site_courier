import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/config/api';

interface MusicTabProps {
  authToken: string;
}

interface MusicSettings {
  url: string;
  enabled: boolean;
  volume: number;
}

export default function MusicTab({ authToken }: MusicTabProps) {
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [settings, setSettings] = useState<MusicSettings>({
    url: '',
    enabled: false,
    volume: 0.3
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}?route=content&action=get_music`, {
        headers: {
          'X-Auth-Token': authToken,
        },
      });
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек музыки:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите аудио файл (MP3, WAV, OGG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 2 МБ. Используйте сжатый MP3 файл.',
        variant: 'destructive',
      });
      return;
    }

    setMusicFile(file);
  };

  const handleUpload = async () => {
    if (!musicFile) return;

    setIsUploading(true);
    try {
      console.log('🎵 Начинаем загрузку файла:', musicFile.name, 'размер:', musicFile.size);
      
      // Конвертируем файл в base64
      const reader = new FileReader();
      reader.readAsDataURL(musicFile);
      
      await new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            console.log('📦 Base64 данные готовы, размер:', base64Data.length);
            
            // Отправляем base64 через JSON
            console.log('🚀 Отправляем запрос на сервер...');
            const response = await fetch(`${API_URL}?route=content&action=upload_music`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': authToken,
              },
              body: JSON.stringify({
                file: base64Data,
                filename: musicFile.name
              }),
            });

            console.log('✅ Ответ получен, status:', response.status);
            
            // Обработка ошибки 413 - файл слишком большой
            if (response.status === 413) {
              reject(new Error('Файл слишком большой. Используйте файл до 2 МБ или сожмите MP3.'));
              return;
            }
            
            const data = await response.json();
            console.log('📄 Данные ответа:', data);

            if (data.success && data.url) {
              setSettings({ ...settings, url: data.url });
              setMusicFile(null);
              toast({
                title: 'Успешно',
                description: 'Музыка загружена',
              });
              loadSettings();
              resolve();
            } else {
              reject(new Error(data.error || 'Ошибка загрузки'));
            }
          } catch (error) {
            console.error('❌ Ошибка в обработчике:', error);
            reject(error);
          }
        };
        reader.onerror = (error) => {
          console.error('❌ Ошибка чтения файла:', error);
          reject(error);
        };
      });
    } catch (error: any) {
      console.error('❌ Общая ошибка загрузки:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось загрузить музыку',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`${API_URL}?route=content&action=save_music`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken,
        },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Настройки сохранены',
        });
      } else {
        throw new Error(data.error || 'Ошибка сохранения');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMusic = async () => {
    if (!confirm('Удалить музыку?')) return;

    try {
      const response = await fetch(`${API_URL}?route=content&action=delete_music`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': authToken,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSettings({ ...settings, url: '', enabled: false });
        toast({
          title: 'Успешно',
          description: 'Музыка удалена',
        });
        loadSettings();
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить музыку',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icon name="Loader2" className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Music" size={20} />
            Фоновая музыка сайта
          </CardTitle>
          <CardDescription>
            Загрузите музыку, которая будет играть на всем сайте
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Загрузка файла */}
          <div className="space-y-2">
            <Label htmlFor="music-file">Загрузить музыку (MP3, до 2 МБ)</Label>
            <div className="flex gap-2">
              <Input
                id="music-file"
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button
                onClick={handleUpload}
                disabled={!musicFile || isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" className="mr-2 h-4 w-4" />
                    Загрузить
                  </>
                )}
              </Button>
            </div>
            {musicFile && (
              <p className="text-sm text-gray-600">
                Выбран файл: {musicFile.name} ({(musicFile.size / 1024 / 1024).toFixed(2)} МБ)
              </p>
            )}
          </div>

          {/* Текущая музыка */}
          {settings.url && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Music" size={20} className="text-green-600" />
                  <span className="font-medium">Текущая музыка загружена</span>
                </div>
                <Button
                  onClick={handleDeleteMusic}
                  variant="destructive"
                  size="sm"
                >
                  <Icon name="Trash2" className="mr-2 h-4 w-4" />
                  Удалить
                </Button>
              </div>

              {/* Плеер для прослушивания */}
              <audio controls className="w-full" src={settings.url}>
                Ваш браузер не поддерживает аудио
              </audio>

              {/* Настройки */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="music-enabled">Включить музыку на сайте</Label>
                  <input
                    id="music-enabled"
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="music-volume">
                    Громкость: {Math.round(settings.volume * 100)}%
                  </Label>
                  <input
                    id="music-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.volume}
                    onChange={(e) => setSettings({ ...settings, volume: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Icon name="Save" className="mr-2 h-4 w-4" />
                  Сохранить настройки
                </Button>
              </div>
            </div>
          )}

          {!settings.url && (
            <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed">
              <Icon name="Music" size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Музыка не загружена</p>
              <p className="text-sm text-gray-500 mt-2">
                Загрузите MP3 файл для фоновой музыки
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}