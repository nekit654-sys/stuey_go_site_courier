import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { UnmatchedCourier } from './types';

interface UnmatchedCouriersCardProps {
  unmatchedCouriers: UnmatchedCourier[];
  linkingCourier: { external_id: string; courier_id: number } | null;
  onLinkCourier: (external_id: string, courier_id: number) => void;
}

export default function UnmatchedCouriersCard({
  unmatchedCouriers,
  linkingCourier,
  onLinkCourier
}: UnmatchedCouriersCardProps) {
  if (!unmatchedCouriers || unmatchedCouriers.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader className="bg-orange-50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="AlertTriangle" className="h-5 w-5 text-orange-600" />
          Требуется ручное сопоставление ({unmatchedCouriers.length})
        </CardTitle>
        <CardDescription>
          Система не смогла автоматически сопоставить следующих курьеров. Выберите подходящего из списка:
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {unmatchedCouriers.map((unmatched) => (
          <div key={unmatched.external_id} className="border rounded-lg p-4 bg-white">
            <div className="mb-3">
              <div className="font-bold text-gray-900">{unmatched.full_name}</div>
              <div className="text-sm text-gray-600">
                {unmatched.phone} • {unmatched.city} • ID: <code className="text-xs bg-gray-100 px-1 rounded">{unmatched.external_id}</code>
              </div>
            </div>
            
            {unmatched.suggested_couriers.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Похожие курьеры:</div>
                {unmatched.suggested_couriers.map((courier) => {
                  const matchScore = courier.match_score || 0;
                  const scoreColor = matchScore >= 80 ? 'text-green-600 bg-green-50' : matchScore >= 50 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
                  const scoreBorder = matchScore >= 80 ? 'border-green-200' : matchScore >= 50 ? 'border-yellow-200' : 'border-red-200';
                  
                  return (
                    <div key={courier.id} className={`flex items-center justify-between p-3 border-2 rounded ${scoreBorder} bg-gray-50`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium">{courier.full_name}</div>
                          <Badge className={`${scoreColor} border-0 text-xs`}>
                            {matchScore}% совпадение
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          {courier.phone} • {courier.city} • Код: {courier.referral_code}
                        </div>
                        {courier.matches && courier.matches.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {courier.matches.map((match: string, idx: number) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                ✓ {match}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onLinkCourier(unmatched.external_id, courier.id)}
                        disabled={linkingCourier?.external_id === unmatched.external_id && linkingCourier?.courier_id === courier.id}
                        className="ml-3"
                      >
                        {linkingCourier?.external_id === unmatched.external_id && linkingCourier?.courier_id === courier.id ? (
                          <>
                            <Icon name="Loader2" className="mr-1 h-3 w-3 animate-spin" />
                            Связываем...
                          </>
                        ) : (
                          <>
                            <Icon name="Link" className="mr-1 h-3 w-3" />
                            Связать
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Похожие курьеры не найдены. Возможно, курьер ещё не зарегистрирован в системе.
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
