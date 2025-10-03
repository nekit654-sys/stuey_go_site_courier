import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Admin {
  id: number;
  username: string;
  created_at: string;
}

interface IncomeEntry {
  id: string;
  amount: number;
  date: string;
  description: string;
}

interface AdminIncome {
  adminId: number;
  username: string;
  joinDate: string;
  totalIncome: number;
}

interface IncomeTabProps {
  admins: Admin[];
  onLoadAdmins: () => void;
}

const IncomeTab: React.FC<IncomeTabProps> = ({ admins, onLoadAdmins }) => {
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [newIncome, setNewIncome] = useState({ amount: '', description: '' });
  const [adminIncomes, setAdminIncomes] = useState<AdminIncome[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('courier_income_entries');
    if (saved) {
      setIncomeEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('courier_income_entries', JSON.stringify(incomeEntries));
    calculateAdminIncomes();
  }, [incomeEntries, admins]);

  const calculateAdminIncomes = () => {
    if (admins.length === 0) return;

    const adminIncomesMap = new Map<number, AdminIncome>();

    admins.forEach(admin => {
      adminIncomesMap.set(admin.id, {
        adminId: admin.id,
        username: admin.username,
        joinDate: admin.created_at,
        totalIncome: 0
      });
    });

    incomeEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      
      const eligibleAdmins = admins.filter(admin => {
        const adminJoinDate = new Date(admin.created_at);
        return adminJoinDate <= entryDate;
      });

      if (eligibleAdmins.length > 0) {
        const sharePerAdmin = entry.amount / eligibleAdmins.length;
        
        eligibleAdmins.forEach(admin => {
          const current = adminIncomesMap.get(admin.id);
          if (current) {
            current.totalIncome += sharePerAdmin;
          }
        });
      }
    });

    setAdminIncomes(Array.from(adminIncomesMap.values()));
  };

  const addIncome = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(newIncome.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    if (admins.length === 0) {
      alert('Сначала загрузите список администраторов');
      return;
    }

    const entry: IncomeEntry = {
      id: Date.now().toString(),
      amount,
      date: new Date().toISOString(),
      description: newIncome.description || 'Доход с курьеров'
    };

    setIncomeEntries([entry, ...incomeEntries]);
    setNewIncome({ amount: '', description: '' });
  };

  const deleteIncome = (id: string) => {
    if (confirm('Удалить запись о доходе?')) {
      setIncomeEntries(incomeEntries.filter(entry => entry.id !== id));
    }
  };

  const clearAllData = () => {
    if (confirm('Удалить всю историю доходов? Это действие нельзя отменить!')) {
      setIncomeEntries([]);
      localStorage.removeItem('courier_income_entries');
    }
  };

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Plus" size={20} />
              Добавить доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addIncome} className="space-y-4">
              <div>
                <Label htmlFor="incomeAmount">Сумма (₽)</Label>
                <Input
                  id="incomeAmount"
                  type="number"
                  step="0.01"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                  placeholder="Введите сумму"
                  required
                />
              </div>
              <div>
                <Label htmlFor="incomeDescription">Описание (необязательно)</Label>
                <Input
                  id="incomeDescription"
                  type="text"
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                  placeholder="Например: Доход за неделю"
                />
              </div>
              <Button type="submit" className="w-full">
                <Icon name="PlusCircle" size={16} className="mr-2" />
                Добавить доход
              </Button>
            </form>

            {admins.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon name="AlertCircle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Загрузите список администраторов</p>
                    <p className="mt-1">Перейдите на вкладку "Админы" и нажмите "Обновить"</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Общая статистика
              </div>
              {admins.length > 0 && (
                <Button
                  size="sm"
                  onClick={onLoadAdmins}
                  variant="outline"
                >
                  <Icon name="RefreshCw" size={14} className="mr-1" />
                  Обновить админов
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Всего получено</div>
                <div className="text-3xl font-bold text-green-700">
                  {totalIncome.toLocaleString('ru-RU')} ₽
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Активных администраторов</div>
                <div className="text-3xl font-bold text-blue-700">
                  {admins.length}
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">Записей о доходах</div>
                <div className="text-3xl font-bold text-purple-700">
                  {incomeEntries.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Распределение доходов между администраторами
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminIncomes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Загрузите список администраторов для расчета</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Администратор</th>
                    <th className="text-left py-3 px-4 font-semibold">Дата присоединения</th>
                    <th className="text-right py-3 px-4 font-semibold">Заработано (₽)</th>
                    <th className="text-right py-3 px-4 font-semibold">Доля (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {adminIncomes.map((income) => (
                    <tr key={income.adminId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{income.username}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(income.joinDate).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        {income.totalIncome.toLocaleString('ru-RU', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {totalIncome > 0 
                          ? ((income.totalIncome / totalIncome) * 100).toFixed(1)
                          : '0.0'
                        }%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="py-3 px-4" colSpan={2}>Итого:</td>
                    <td className="py-3 px-4 text-right text-green-700">
                      {adminIncomes.reduce((sum, a) => sum + a.totalIncome, 0).toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="History" size={20} />
              История доходов
            </div>
            {incomeEntries.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearAllData}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Icon name="Trash2" size={14} className="mr-1" />
                Очистить историю
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incomeEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-300" />
              <p>История доходов пуста</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomeEntries.map((entry) => {
                const entryDate = new Date(entry.date);
                const eligibleAdminsCount = admins.filter(admin => 
                  new Date(admin.created_at) <= entryDate
                ).length;
                const sharePerAdmin = eligibleAdminsCount > 0 ? entry.amount / eligibleAdminsCount : 0;

                return (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-green-600">
                          +{entry.amount.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-sm text-gray-500">
                          {entryDate.toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      {entry.description && (
                        <div className="text-sm text-gray-600 mt-1">{entry.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Разделено между {eligibleAdminsCount} админ. → 
                        по {sharePerAdmin.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ каждому
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteIncome(entry.id)}
                      className="text-red-600 border-red-600 hover:bg-red-50 ml-4"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Как работает распределение:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Доход делится поровну между всеми администраторами</li>
              <li>Новые администраторы получают долю только с момента добавления</li>
              <li>Данные хранятся локально в браузере</li>
              <li>При удалении записи пересчитывается весь доход</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeTab;
