import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />;
      case 'dark':
        return <Moon className="w-5 h-5 text-indigo-400 animate-pulse" />;
      case 'system':
      default:
        return <Laptop className="w-5 h-5 text-slate-400" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
      default:
        return 'System Preferences';
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={cycleTheme}
        aria-label="Toggle visual theme"
        className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-black/5"
      >
        {getIcon()}
      </button>

      {/* Floating Glassmorphic Tooltip */}
      <span className="absolute top-full mt-2.5 right-0 scale-95 opacity-0 pointer-events-none group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 z-50 bg-slate-900/90 border border-white/10 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap backdrop-blur-md shadow-2xl">
        Theme: {getLabel()}
      </span>
    </div>
  );
};

export default ThemeToggle;
