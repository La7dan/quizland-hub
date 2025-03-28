
import { Toggle } from '@/components/ui/toggle';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
      
      <Toggle
        aria-label="Toggle theme"
        pressed={theme === "dark"}
        onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Toggle>
    </div>
  );
}
