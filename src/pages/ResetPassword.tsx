import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ResetPassword() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('https://functions.poehali.dev/35a9b8c7-7661-4f0a-9832-9dc67c299145', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'nekit654',
          password: 'nekit654nekit654',
          delete_username: 'danil654'
        }),
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-100">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Сброс пароля</h1>
          <p className="text-gray-600">Администратор: nekit654</p>
        </div>

        <Button 
          onClick={resetPassword} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-6 text-lg"
        >
          {loading ? '⏳ Сброс...' : '🚀 Сбросить пароль'}
        </Button>

        {result && (
          <div className={`p-6 rounded-lg border-2 ${result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
            {result.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">✅</span>
                  <h3 className="font-bold text-green-900 text-xl">Успешно!</h3>
                </div>
                <div className="space-y-2 text-sm bg-white p-4 rounded border border-green-200">
                  <p className="flex justify-between">
                    <span className="font-semibold text-gray-700">Логин:</span>
                    <span className="font-mono text-gray-900">{result.username}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="font-semibold text-gray-700">Пароль:</span>
                    <span className="font-mono text-gray-900">{result.password}</span>
                  </p>
                  {result.deleted_admin && (
                    <p className="flex justify-between text-red-600">
                      <span className="font-semibold">Удалён админ:</span>
                      <span className="font-mono">{result.deleted_admin}</span>
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-green-200">
                  <a 
                    href="/login" 
                    className="block text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    → Перейти к входу
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">❌</span>
                  <h3 className="font-bold text-red-900 text-xl">Ошибка</h3>
                </div>
                <p className="text-red-800 font-mono text-sm bg-white p-3 rounded">
                  {result.error || JSON.stringify(result)}
                </p>
              </div>
            )}
          </div>
        )}

        {!result && (
          <div className="text-center text-sm text-gray-500 space-y-2 pt-4 border-t">
            <p>При нажатии на кнопку будет:</p>
            <ul className="text-left space-y-1 max-w-xs mx-auto">
              <li>✓ Установлен новый пароль для nekit654</li>
              <li>✓ Удалён администратор danil654</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
