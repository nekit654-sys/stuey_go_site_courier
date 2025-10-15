import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const ADMIN_PANEL_URL = 'https://functions.poehali.dev/11e2050a-12a1-4797-9ba5-1f3b27437559';
const HASH_GEN_URL = 'https://functions.poehali.dev/367a9d53-4bd8-4e2c-94b2-0b1d114df77a';

const MASTER_PASSWORD = 'SuperAdmin2024!'; // Мастер-пароль для доступа к сбросу

export default function ResetAdminPasswordPage() {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReset = async () => {
    if (!username.trim() || !newPassword.trim() || !masterPassword.trim()) {
      toast.error('Заполните все поля');
      return;
    }

    if (masterPassword !== MASTER_PASSWORD) {
      toast.error('Неверный мастер-пароль!');
      setMasterPassword('');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов');
      return;
    }

    setIsProcessing(true);

    try {
      const hashResponse = await fetch(HASH_GEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      if (!hashResponse.ok) {
        throw new Error('Ошибка генерации хеша');
      }

      const { hash } = await hashResponse.json();

      const resetResponse = await fetch(ADMIN_PANEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          username: username.trim(),
          new_password_hash: hash
        })
      });

      const data = await resetResponse.json();

      if (data.success) {
        toast.success(`Пароль обновлён! Логин: ${username}`);
        setUsername('');
        setNewPassword('');
        setMasterPassword('');
      } else {
        toast.error(data.message || 'Ошибка сброса пароля');
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Ошибка сброса пароля');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">🔐 Сброс пароля</h1>
          <p className="text-gray-600">Административная панель</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-red-600 flex items-center gap-2">
              🔐 Мастер-пароль
            </label>
            <Input
              type="password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Введите мастер-пароль"
              disabled={isProcessing}
              className="border-red-300 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">Только для супер-админа</p>
          </div>

          <div className="h-px bg-gray-200"></div>

          <div>
            <label className="block text-sm font-medium mb-2">Логин админа</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nekit654"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Новый пароль</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              disabled={isProcessing}
              onKeyPress={(e) => e.key === 'Enter' && handleReset()}
            />
          </div>

          <Button
            onClick={handleReset}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isProcessing ? 'Обработка...' : 'Сбросить пароль'}
          </Button>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
            <p className="font-semibold mb-2">📝 Инструкция:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Введите мастер-пароль (для защиты)</li>
              <li>Укажите логин существующего админа</li>
              <li>Придумайте новый пароль (от 6 символов)</li>
              <li>Нажмите "Сбросить пароль"</li>
            </ol>
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <p className="font-semibold">⚠️ Безопасность:</p>
            <p className="mt-1">Мастер-пароль: <code className="bg-red-100 px-1 py-0.5 rounded">SuperAdmin2024!</code></p>
            <p className="mt-1 text-[10px] text-red-600">Храните мастер-пароль в безопасном месте</p>
          </div>
        </div>
      </Card>
    </div>
  );
}