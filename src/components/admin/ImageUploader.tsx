import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  preview?: boolean;
  previewClassName?: string;
}

export default function ImageUploader({ 
  value, 
  onChange, 
  label = 'Загрузить изображение',
  preview = true,
  previewClassName = 'w-32 h-20'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Можно загружать только изображения');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);

    try {
      // Конвертируем файл в base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        // Отправляем на сервер
        const response = await fetch('https://functions.poehali.dev/0f7e5013-5153-45a9-b6e6-b974b2006fda', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            filename: file.name,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки');
        }

        const data = await response.json();
        onChange(data.url);
        toast.success('Изображение загружено');
      };

      reader.onerror = () => {
        toast.error('Ошибка чтения файла');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка загрузки изображения');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        variant="outline"
        className="border-3 border-black shadow-[0_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] transition-all"
      >
        <Icon name={uploading ? 'Loader2' : 'Upload'} size={16} className={uploading ? 'animate-spin' : ''} />
        {uploading ? 'Загрузка...' : label}
      </Button>

      {preview && value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Превью"
            className={`${previewClassName} object-cover rounded border-2 border-black`}
          />
        </div>
      )}
    </div>
  );
}
