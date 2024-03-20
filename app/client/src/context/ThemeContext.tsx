import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

// Create a context for the theme
const ThemeContext = createContext<[string, (theme: string) => void]>(['light', () => { }]);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState('light');

    // Effect to apply the theme class to the body
    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    return <ThemeContext.Provider value={[theme, setTheme]}>{children}</ThemeContext.Provider>;
};
