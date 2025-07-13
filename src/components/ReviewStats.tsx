import Icon from "@/components/ui/icon";

const ReviewStats = () => {
  return (
    <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl p-8 text-center shadow-2xl">
      <Icon
        name="Users"
        size={48}
        className="mx-auto mb-6 text-gray-800"
      />
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Станьте частью нашей команды
      </h2>
      <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
        Присоединяйтесь к тысячам курьеров, которые уже зарабатывают с
        Яндекс.Еда
      </p>
      <div className="grid md:grid-cols-3 gap-6 text-center mb-8">
        <div>
          <div className="text-3xl font-bold text-gray-800">4.8/5</div>
          <div className="text-gray-700">Средний рейтинг</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-800">87%</div>
          <div className="text-gray-700">Рекомендуют работу</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-800">78K ₽</div>
          <div className="text-gray-700">Средний доход</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;