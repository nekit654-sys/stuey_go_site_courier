import Icon from '@/components/ui/icon';

export default function SystemInfoCard() {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Как работает система:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li><strong>Автоматическое распознавание:</strong> Сначала ищем по сохранённому external_id, затем по коду, затем по ФИО</li>
            <li><strong>Сохранение связи:</strong> При успешном сопоставлении external_id автоматически сохраняется</li>
            <li><strong>Ручное связывание:</strong> Если система не распознала - можно связать вручную (сохранится навсегда)</li>
            <li><strong>Самобонус курьера:</strong> Первые 3000₽ за 30 заказов идут курьеру</li>
            <li><strong>После самобонуса:</strong> 60% рефереру (если есть), 40% администраторам</li>
            <li><strong>Без реферера:</strong> После самобонуса 100% администраторам</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
