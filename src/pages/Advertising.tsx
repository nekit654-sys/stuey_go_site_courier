import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Icon from "@/components/ui/icon";

const Advertising = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Информация о рекламе и партнерской программе
            </h1>
            <p className="text-xl text-gray-600">
              Важная информация для участников программы Яндекс.Еда
            </p>
          </div>

          <div className="grid gap-8">
            {/* Правовые аспекты */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="Scale" size={24} className="text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Правовые аспекты
                </h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Важные уведомления:</strong> Участие в партнерской
                  программе регулируется действующим законодательством РФ.
                  Доходы от деятельности курьера облагаются налогом согласно
                  Налоговому кодексу РФ.
                </p>
                <p>
                  Все споры решаются в соответствии с законодательством РФ.
                  Использование сайта означает согласие с политикой
                  конфиденциальности и условиями использования.
                </p>
              </div>
            </div>

            {/* Условия заработка */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="TrendingUp" size={24} className="text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Условия заработка
                </h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Яндекс.Еда не гарантирует определенный уровень дохода.
                  Заработок зависит от количества выполненных заказов, времени
                  работы и других факторов.
                </p>
                <p>Доходы курьера формируются на основе:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Количества выполненных заказов</li>
                  <li>Времени и дней работы</li>
                  <li>Сезонных коэффициентов</li>
                  <li>Региональных особенностей</li>
                </ul>
              </div>
            </div>

            {/* Налогообложение */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="Calculator" size={24} className="text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Налогообложение
                </h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Курьеры обязаны самостоятельно декларировать доходы и
                  уплачивать налоги в соответствии с Налоговым кодексом РФ.
                </p>
                <p>Рекомендуется:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ведение учета доходов</li>
                  <li>Консультации с налоговыми консультантами</li>
                  <li>Своевременная подача деклараций</li>
                </ul>
              </div>
            </div>

            {/* Персональные данные */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="UserCheck" size={24} className="text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Обработка персональных данных
                </h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Регистрируясь по партнерской ссылке, вы соглашаетесь с
                  условиями обработки персональных данных и получения
                  информационных сообщений от сервиса.
                </p>
                <p>
                  Ваши данные обрабатываются в соответствии с Федеральным
                  законом "О персональных данных" №152-ФЗ.
                </p>
              </div>
            </div>

            {/* Отказ от ответственности */}
            <div className="bg-orange-50 rounded-xl p-8 border border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <Icon
                  name="AlertTriangle"
                  size={24}
                  className="text-orange-600"
                />
                <h2 className="text-2xl font-bold text-gray-900">
                  Отказ от ответственности
                </h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <p>
                  Информация на сайте не является публичной офертой. Актуальные
                  условия уточняйте в приложении Яндекс.Еда.
                </p>
                <p>
                  Информация может быть изменена без предварительного
                  уведомления. Администрация сайта не несет ответственности за
                  возможные убытки, связанные с использованием предоставленной
                  информации.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Advertising;
