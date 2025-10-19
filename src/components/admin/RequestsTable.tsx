import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminRequest {
  id: number;
  name: string;
  phone: string;
  city: string;
  screenshot_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RequestsTableProps {
  requests: AdminRequest[];
  stats: {
    new: number;
  };
  autoRefresh: boolean;
  onUpdateStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  onViewImage?: (url: string) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  stats,
  autoRefresh,
  onUpdateStatus,
  onDelete,
  onViewImage
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Одобрена';
      case 'rejected': return 'Отклонена';
      default: return 'Новая';
    }
  };

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="List" size={18} className="sm:w-5 sm:h-5" />
            <span className="text-base sm:text-lg">Заявки курьеров</span>
            {stats.new > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                {stats.new} новых
              </span>
            )}
          </div>
          {autoRefresh && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Автообновление
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 py-3 sm:py-6">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Заявок пока нет</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">ФИО</th>
                    <th className="text-left py-3 px-4 font-semibold">Телефон</th>
                    <th className="text-left py-3 px-4 font-semibold">Город</th>
                    <th className="text-left py-3 px-4 font-semibold">Скриншот</th>
                    <th className="text-left py-3 px-4 font-semibold">Статус</th>
                    <th className="text-left py-3 px-4 font-semibold">Дата</th>
                    <th className="text-left py-3 px-4 font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr 
                      key={request.id} 
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium">{request.name}</td>
                      <td className="py-3 px-4">
                        <a href={`tel:${request.phone}`} className="text-blue-600 hover:underline">
                          {request.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4">{request.city}</td>
                      <td className="py-3 px-4">
                        {request.screenshot_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewImage?.(request.screenshot_url)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Icon name="Eye" size={14} className="mr-1" />
                            Просмотр
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">Нет</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(request.created_at).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {request.status === 'new' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => onUpdateStatus(request.id, 'approved')}
                                className="bg-green-500 hover:bg-green-600 text-white px-3"
                              >
                                <Icon name="Check" size={14} className="mr-1" />
                                Принять
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onUpdateStatus(request.id, 'rejected')}
                                className="text-red-600 border-red-600 hover:bg-red-50 px-3"
                              >
                                <Icon name="X" size={14} className="mr-1" />
                                Отклонить
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDelete(request.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3 px-3">
              {requests.map((request) => (
                <Card key={request.id} className="border-2">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1">{request.name}</div>
                        <a href={`tel:${request.phone}`} className="text-blue-600 text-sm">
                          {request.phone}
                        </a>
                        <div className="text-sm text-gray-600 mt-1">{request.city}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(request.created_at).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                      {request.screenshot_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewImage?.(request.screenshot_url)}
                          className="text-blue-600 border-blue-600 h-7 px-2"
                        >
                          <Icon name="Eye" size={14} className="mr-1" />
                          Скриншот
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      {request.status === 'new' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onUpdateStatus(request.id, 'approved')}
                            className="bg-green-500 hover:bg-green-600 text-white flex-1"
                          >
                            <Icon name="Check" size={14} className="mr-1" />
                            Принять
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(request.id, 'rejected')}
                            className="text-red-600 border-red-600 flex-1"
                          >
                            <Icon name="X" size={14} className="mr-1" />
                            Отклонить
                          </Button>
                        </>
                      ) : (
                        <div className="flex-1" />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(request.id)}
                        className="text-red-600 border-red-600"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsTable;