import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Theme {
  mode: 'light' | 'dark' | 'auto';
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
    border: string;
    hover: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (mode: Theme['mode']) => void;
}

const defaultTheme: Theme = {
  mode: 'auto',
  colors: {
    background: '#ffffff',
    text: '#000000',
    accent: '#0066ff',
    secondary: '#666666',
    border: '#e0e0e0',
    hover: '#f5f5f5'
  }
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#1a1a1a',
    text: '#ffffff',
    accent: '#0099ff',
    secondary: '#aaaaaa',
    border: '#333333',
    hover: '#2a2a2a'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme['mode'];
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme = 'auto' }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (initialTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? darkTheme : defaultTheme;
    }
    return initialTheme === 'dark' ? darkTheme : defaultTheme;
  });

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev.mode === 'light') {
        return darkTheme;
      }
      return defaultTheme;
    });
  };

  const handleThemeChange = (mode: Theme['mode']) => {
    if (mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? darkTheme : defaultTheme);
    } else {
      setTheme(mode === 'dark' ? darkTheme : defaultTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};
