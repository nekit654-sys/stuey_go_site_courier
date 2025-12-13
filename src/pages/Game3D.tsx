import { CityDeliveryRush } from '@/components/game/CityDeliveryRush';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center border-4 border-black shadow-2xl">
        <div className="text-6xl mb-4">😢</div>
        <h1 className="text-2xl font-bold mb-4 text-black">Ошибка загрузки игры</h1>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl border-3 border-black"
        >
          🔄 Перезагрузить
        </button>
      </div>
    </div>
  );
}

export default function Game3D() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CityDeliveryRush />
    </ErrorBoundary>
  );
}
