import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const Contacts = () => {
  const contactMethods = [
    {
      title: "HR-отдел",
      description: "Вопросы по трудоустройству и карьере",
      icon: "Users",
      contact: "hr@yandex-eda.ru",
      action: "mailto:hr@yandex-eda.ru",
    },
    {
      title: "Техподдержка",
      description: "Помощь с приложением и заказами",
      icon: "Headphones",
      contact: "8 (800) 333-00-03",
      action: "tel:88003330003",
    },
    {
      title: "Telegram",
      description: "Быстрые ответы на вопросы",
      icon: "MessageCircle",
      contact: "@StueyGoBot",
      action: "https://t.me/StueyGoBot",
    },
    {
      title: "Центры поддержки",
      description: "Личная консультация в офисе",
      icon: "MapPin",
      contact: "Адреса в приложении",
      action: null,
    },
  ];

  const cities = [
    {
      name: "Москва",
      address: "ул. Льва Толстого, 16",
      phone: "+7 (495) 739-70-00",
    },
    {
      name: "Санкт-Петербург",
      address: "Невский проспект, 25",
      phone: "+7 (812) 336-55-01",
    },
    {
      name: "Екатеринбург",
      address: "ул. Малышева, 42",
      phone: "+7 (343) 385-45-67",
    },
    {
      name: "Новосибирск",
      address: "ул. Ленина, 86",
      phone: "+7 (383) 330-28-90",
    },
    { name: "Казань", address: "ул. Баумана, 15", phone: "+7 (843) 570-45-32" },
    {
      name: "Ростов-на-Дону",
      address: "пр. Ворошиловский, 33",
      phone: "+7 (863) 310-67-89",
    },
  ];

  const handleContact = (action: string | null) => {
    if (action) {
      if (
        action.startsWith("mailto:") ||
        action.startsWith("tel:") ||
        action.startsWith("https:")
      ) {
        window.open(action, "_blank");
      }
    }
  };

  const handleApply = () => {
    window.open(
      "https://reg.eda.yandex.ru/?advertisement_campaign=forms_for_agents&user_invite_code=f123426cfad648a1afadad700e3a6b6b&utm_content=blank",
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50">
      <Navigation />

      <div className="pt-24 pb-16 md:pt-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-rubik text-black drop-shadow-[2px_2px_0_rgba(251,191,36,0.3)]">
              Наши <span className="text-yellow-400">контакты</span>
            </h1>
            <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto">
              Свяжитесь с нами удобным способом. Мы всегда готовы помочь!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-150 text-center"
              >
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)]">
                  <Icon
                    name={method.icon as any}
                    size={28}
                    className="text-gray-800"
                  />
                </div>
                <h3 className="text-xl font-extrabold text-gray-800 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-700 font-medium text-sm mb-4">
                  {method.description}
                </p>
                <div className="font-extrabold text-gray-800 mb-4">
                  {method.contact}
                </div>
                {method.action && (
                  <Button
                    onClick={() => handleContact(method.action)}
                    className="bg-yellow-400 text-black font-extrabold border-3 border-black rounded-xl shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-150"
                  >
                    Связаться
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] mb-16">
            <h2 className="text-3xl font-extrabold text-black drop-shadow-[2px_2px_0_rgba(251,191,36,0.3)] mb-8 text-center">
              Центры поддержки курьеров
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-150"
                >
                  <h3 className="text-xl font-extrabold text-gray-800 mb-3 flex items-center">
                    <Icon
                      name="MapPin"
                      size={20}
                      className="mr-2 text-yellow-400"
                    />
                    {city.name}
                  </h3>
                  <p className="text-gray-700 font-medium mb-2 flex items-start">
                    <Icon
                      name="Home"
                      size={16}
                      className="mr-2 mt-1 text-gray-400"
                    />
                    {city.address}
                  </p>
                  <p className="text-gray-700 font-medium flex items-center">
                    <Icon
                      name="Phone"
                      size={16}
                      className="mr-2 text-gray-400"
                    />
                    {city.phone}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-white border-3 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)] text-center">
            <Icon
              name="Clock"
              size={48}
              className="mx-auto mb-6 text-yellow-400"
            />
            <h2 className="text-3xl font-extrabold mb-4">Время работы поддержки</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-extrabold text-yellow-400 mb-2">
                  Телефон и чат
                </h3>
                <p className="text-gray-300 font-medium">Круглосуточно, 7 дней в неделю</p>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-yellow-400 mb-2">
                  Центры поддержки
                </h3>
                <p className="text-gray-300 font-medium">
                  Пн-Пт: 9:00-18:00, Сб-Вс: 10:00-16:00
                </p>
              </div>
            </div>
            <Button
              onClick={handleApply}
              className="bg-yellow-400 text-black font-extrabold border-3 border-black rounded-xl shadow-[0_6px_0_0_rgba(0,0,0,1)] hover:shadow-[0_3px_0_0_rgba(0,0,0,1)] hover:translate-y-[3px] transition-all duration-150 px-8 py-4 text-lg"
            >
              <Icon name="Send" size={20} className="mr-2" />
              Подать заявку на работу
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contacts;