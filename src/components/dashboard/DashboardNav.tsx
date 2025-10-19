import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface DashboardNavProps {
  onSettings: () => void;
  onLogout: () => void;
}

export default function DashboardNav({ onSettings, onLogout }: DashboardNavProps) {
  return (
    <nav className="bg-yellow-400 border-b-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,0.3)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl border-3 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] flex items-center justify-center">
              <img 
                src="https://cdn.poehali.dev/files/b80ff2c7-bdf2-45f1-bd01-9d786ad0c249.png" 
                alt="Stuey Go Logo" 
                className="w-9 h-9 rounded object-cover"
              />
            </div>
            <span className="text-black font-rubik text-lg sm:text-xl font-black drop-shadow-[3px_3px_0_rgba(255,255,255,0.6)] hidden sm:block">
              Stuey.Go | Личный кабинет
            </span>
            <span className="text-black font-rubik text-lg font-black drop-shadow-[3px_3px_0_rgba(255,255,255,0.6)] sm:hidden">
              Stuey.Go
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Settings Button */}
            <Button
              onClick={onSettings}
              className="
                bg-white text-black font-extrabold px-3 sm:px-4 py-2 rounded-xl
                shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)]
                hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none
                transition-all duration-150
                border-3 border-black
                flex items-center gap-2
              "
            >
              <Icon name="Settings" size={18} />
              <span className="hidden sm:inline">Настройки</span>
            </Button>

            {/* Logout Button */}
            <Link to="/">
              <Button
                onClick={onLogout}
                className="
                  bg-gradient-to-b from-red-400 to-red-500
                  text-white font-extrabold px-3 sm:px-4 py-2 rounded-xl
                  shadow-[0_4px_0_0_rgba(0,0,0,1)] hover:shadow-[0_2px_0_0_rgba(0,0,0,1)]
                  hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none
                  transition-all duration-150
                  border-3 border-black
                  flex items-center gap-2
                "
              >
                <Icon name="LogOut" size={18} />
                <span className="hidden sm:inline">Выход</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
