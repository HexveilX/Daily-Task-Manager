import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'dark':
        return <Moon className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300 h-10 w-10 sm:h-8 sm:w-8 p-0 rounded-lg"
        >
          {getIcon()}
          <span className="sr-only">تغيير المظهر</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 cursor-pointer"
        >
          <Sun className="w-4 h-4 mr-3" />
          فاتح
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 cursor-pointer"
        >
          <Moon className="w-4 h-4 mr-3" />
          داكن
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange('system')}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 cursor-pointer"
        >
          <Monitor className="w-4 h-4 mr-3" />
          تلقائي
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;