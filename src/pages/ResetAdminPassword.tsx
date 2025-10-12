import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { API_URL } from '@/config/api';

export default function ResetAdminPassword() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?route=reset-admin-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold">Создание супер-админа</h1>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Логин:</label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите логин"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Пароль:</label>
          <Input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
          />
        </div>

        <Button onClick={createAdmin} disabled={loading} className="w-full">
          {loading ? 'Создание...' : 'Создать/Обновить админа'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded border border-green-200">
            <h3 className="font-bold text-green-800 mb-2">✅ Готово!</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Логин:</strong> {result.username}</p>
              <p><strong>Пароль:</strong> {result.password}</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">Используй эти данные для входа в заглушку и админ-панель</p>
          </div>
        )}
      </Card>
    </div>
  );
}