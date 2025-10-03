import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
}

const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  stats,
  autoRefresh,
  onUpdateStatus,
  onDelete
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');

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
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="List" size={20} />
            Заявки курьеров
            {stats.new > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                {stats.new} новых
              </span>
            )}
          </div>
          {autoRefresh && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Автообновление
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Заявок пока нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedImage(request.screenshot_url)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Icon name="Eye" size={14} className="mr-1" />
                              Просмотр
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Скриншот от {request.name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                              <img
                                src={request.screenshot_url}
                                alt="Скриншот заявки"
                                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
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
        )}
      </CardContent>
    </Card>
  );
};

export default RequestsTable;
