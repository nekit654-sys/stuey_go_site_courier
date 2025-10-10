import Icon from '@/components/ui/icon';

export default function ReviewsStats() {
  return (
    <div 
      className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl md:rounded-2xl p-6 md:p-8 text-center border-4 border-black" 
      style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}
    >
      <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon
          name="Users"
          size={32}
          className="text-yellow-400"
        />
      </div>
      <h2 
        className="text-2xl md:text-3xl font-extrabold text-black mb-4" 
        style={{textShadow: '2px 2px 0 rgba(255, 255, 255, 0.3)'}}
      >
        Станьте частью нашей команды
      </h2>
      <p className="text-gray-800 font-bold text-base md:text-lg mb-6 max-w-2xl mx-auto">
        Присоединяйтесь к тысячам курьеров, которые уже зарабатывают с
        Яндекс.Еда
      </p>
      <div className="grid md:grid-cols-3 gap-4 md:gap-6 text-center">
        <div 
          className="bg-white rounded-xl p-4 border-3 border-black" 
          style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}
        >
          <div className="text-3xl md:text-4xl font-extrabold text-black">4.8/5</div>
          <div className="text-gray-800 font-bold text-sm md:text-base mt-1">Средний рейтинг</div>
        </div>
        <div 
          className="bg-white rounded-xl p-4 border-3 border-black" 
          style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}
        >
          <div className="text-3xl md:text-4xl font-extrabold text-black">87%</div>
          <div className="text-gray-800 font-bold text-sm md:text-base mt-1">Рекомендуют работу</div>
        </div>
        <div 
          className="bg-white rounded-xl p-4 border-3 border-black" 
          style={{boxShadow: '3px 3px 0 0 rgba(0, 0, 0, 0.9)'}}
        >
          <div className="text-3xl md:text-4xl font-extrabold text-black">78K ₽</div>
          <div className="text-gray-800 font-bold text-sm md:text-base mt-1">Средний доход</div>
        </div>
      </div>
    </div>
  );
}
