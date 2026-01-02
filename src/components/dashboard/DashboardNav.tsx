import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface DashboardNavProps {
  onSettings: () => void;
  onLogout: () => void;
}

export default function DashboardNav({ onSettings, onLogout }: DashboardNavProps) {
  return (
    <nav className="glass-effect border-b border-cyber-cyan/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,240,255,0.2)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 cyber-card rounded-xl flex items-center justify-center cyber-glow transform group-hover:rotate-6 transition-transform duration-300">
              <img 
                src="https://cdn.poehali.dev/files/b80ff2c7-bdf2-45f1-bd01-9d786ad0c249.png" 
                alt="Stuey Go Logo" 
                className="w-9 h-9 rounded object-cover"
              />
            </div>
            <span className="text-cyber-cyan font-rubik text-lg sm:text-xl font-black neon-text hidden sm:block">
              Stuey.Go | Личный кабинет
            </span>
            <span className="text-cyber-cyan font-rubik text-lg font-black neon-text sm:hidden">
              Stuey.Go
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Settings Button */}
            <Button
              onClick={onSettings}
              className="
                neon-border bg-gradient-to-r from-cyber-cyan/20 to-cyber-blue/20 text-cyber-cyan font-extrabold px-3 sm:px-4 py-2 rounded-xl
                hover:from-cyber-cyan/30 hover:to-cyber-blue/30
                transition-all duration-300
                flex items-center gap-2
                cyber-glow
              "
            >
              <Icon name="Settings" size={18} className="cyber-glow" />
              <span className="hidden sm:inline">Настройки</span>
            </Button>

            {/* Logout Button */}
            <Link to="/">
              <Button
                onClick={onLogout}
                className="
                  neon-border bg-gradient-to-r from-cyber-pink/20 to-red-500/20
                  text-cyber-pink font-extrabold px-3 sm:px-4 py-2 rounded-xl
                  hover:from-cyber-pink/30 hover:to-red-500/30
                  transition-all duration-300
                  flex items-center gap-2
                  cyber-glow
                "
              >
                <Icon name="LogOut" size={18} className="cyber-glow" />
                <span className="hidden sm:inline">Выход</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}