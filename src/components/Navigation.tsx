import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { path: "/", label: "Главная", icon: "Home" },
    { path: "/hiring", label: "Процесс найма", icon: "Users" },
    { path: "/culture", label: "Корпоративная культура", icon: "Heart" },
    { path: "/reviews", label: "Отзывы сотрудников", icon: "MessageSquare" },
  ];

  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-gray-800 border-b-4 border-yellow-400 shadow-2xl sticky top-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-900/10 via-yellow-900/10 to-amber-900/10"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-gray-800" />
            </div>
            <span className="text-xl font-bold text-white font-rubik">
              Яндекс.Еда Карьера
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex flex-1 justify-evenly items-center ml-8">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={
                    location.pathname === item.path ? "default" : "ghost"
                  }
                  className={`
                    transition-all duration-200 hover:scale-105
                    ${
                      location.pathname === item.path
                        ? "bg-yellow-400 text-gray-800 hover:bg-yellow-500 shadow-lg ring-2 ring-yellow-300/50"
                        : "text-white hover:bg-yellow-400/20 hover:text-yellow-300"
                    }
                  `}
                >
                  <Icon name={item.icon as any} size={16} />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-white hover:bg-yellow-400/20 transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Icon
                name={isMenuOpen ? "X" : "Menu"}
                size={24}
                className="transition-transform duration-200"
              />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
        >
          <div className="py-4 space-y-2 border-t border-yellow-400/20">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuItemClick}
              >
                <Button
                  variant="ghost"
                  className={`
                    w-full justify-start transition-all duration-200 hover:scale-105
                    ${
                      location.pathname === item.path
                        ? "bg-yellow-400 text-gray-800 hover:bg-yellow-500 shadow-lg"
                        : "text-white hover:bg-yellow-400/20 hover:text-yellow-300"
                    }
                  `}
                >
                  <Icon name={item.icon as any} size={16} />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
