import Icon from '@/components/ui/icon';
import { MatchedCourier } from './types';

interface MatchingResultsTableProps {
  couriers: MatchedCourier[];
}

export default function MatchingResultsTable({ couriers }: MatchingResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Город</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тел.</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Выплата</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Точность</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {couriers.map((courier) => (
            <tr 
              key={courier.id} 
              className={`hover:bg-gray-50 ${
                courier.confidence === 'high' ? 'bg-green-50' :
                courier.confidence === 'medium' ? 'bg-yellow-50' :
                courier.matched ? 'bg-orange-50' : 'bg-red-50'
              }`}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {courier.matched ? (
                  <Icon 
                    name={courier.confidence === 'high' ? 'CheckCircle2' : 
                          courier.confidence === 'medium' ? 'AlertCircle' : 'HelpCircle'} 
                    size={18} 
                    className={
                      courier.confidence === 'high' ? 'text-green-600' :
                      courier.confidence === 'medium' ? 'text-yellow-600' : 'text-orange-600'
                    }
                  />
                ) : (
                  <Icon name="XCircle" size={18} className="text-red-600" />
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{courier.full_name}</div>
                {courier.matched && courier.match_reason && (
                  <div className="text-xs text-gray-500">{courier.match_reason}</div>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {courier.city || '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  {courier.phone?.slice(-4) || '—'}
                </code>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                  {courier.referral_code}
                </code>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                {courier.partner_bonus !== undefined ? (
                  <span className="font-bold text-green-600">
                    {courier.partner_bonus.toFixed(2)} ₽
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {courier.matched ? (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    courier.confidence === 'high' ? 'bg-green-100 text-green-800' :
                    courier.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {courier.confidence === 'high' ? 'Высокая' :
                     courier.confidence === 'medium' ? 'Средняя' : 'Низкая'}
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Не найден
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
