import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

export type Theme = "stepwell" | "dusk";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme] = useState<Theme>("stepwell");

  const setTheme = useCallback((_newTheme: Theme) => {}, []);
  const toggleTheme = useCallback(() => {}, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("app_theme");
    }
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", "stepwell");
      document.documentElement.classList.remove("dusk");
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
