import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { API_URL } from '@/config/api';

export default function ResetAdminPassword() {
  const [password, setPassword] = useState('admin654654');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?route=reset-admin-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
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
        <h1 className="text-2xl font-bold">Сброс пароля админов</h1>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Новый пароль:</label>
          <Input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите новый пароль"
          />
        </div>

        <Button onClick={resetPassword} disabled={loading} className="w-full">
          {loading ? 'Обновление...' : 'Сбросить пароль для nekit654 и danil654'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </Card>
    </div>
  );
}
