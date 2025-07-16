interface RegistrationBannerProps {
  isVisible: boolean;
}

const RegistrationBanner = ({ isVisible }: RegistrationBannerProps) => {
  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[54] transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="text-center font-semibold text-sm">
          📝 Регистрируйся до конца, заполняй ФИО, город, номер телефона!
        </div>
      </div>
    </div>
  );
};

export default RegistrationBanner;