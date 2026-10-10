import React, { createContext, useContext, useEffect, useState } from 'react';









const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      // Q-07 FIX: Read both key variants to match index.html anti-flash script.
      // index.html reads 'arx_theme' then 'arx_theme'; we mirror that priority here.
      const saved = localStorage.getItem('arx_theme') || localStorage.getItem('arx_theme');
      if (saved === 'dark') return 'dark';
      if (saved === 'light') return 'light';
    } catch {

      // ignore
    } // Default to Light mode on first visit
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }
    try {
      // Q-07 FIX: Write to the canonical key that index.html also reads first.
      localStorage.setItem('arx_theme', theme);
      // Keep legacy key in sync so old sessions don't flash.
      localStorage.setItem('arx_theme', theme);
    } catch {

      // ignore
    }}, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>);

};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};