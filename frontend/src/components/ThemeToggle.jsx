import { Moon, Sun } from 'lucide-react';
import useTheme from '../hooks/useTheme.js';

export default function ThemeToggle({ className = '' }) {
  const [theme, toggle] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
