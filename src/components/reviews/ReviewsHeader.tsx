export default function ReviewsHeader() {
  return (
    <div 
      className="bg-white rounded-xl md:rounded-2xl border-4 border-black p-6 md:p-8 mb-16 text-center" 
      style={{boxShadow: '6px 6px 0 0 rgba(0, 0, 0, 0.9)'}}
    >
      <h1 
        className="text-4xl md:text-6xl font-extrabold mb-6 font-rubik text-yellow-400" 
        style={{textShadow: '3px 3px 0 #000, 6px 6px 0 rgba(0,0,0,0.5)'}}
      >
        Отзывы курьеров
      </h1>
      <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto">
        Реальные истории людей, которые работают курьерами в Яндекс.Еда
      </p>
    </div>
  );
}
