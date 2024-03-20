import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

// Create a context for the theme
const ThemeContext = createContext<[string, (theme: string) => void]>(['dark', () => { }]);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState('dark');
    const bodyClass = 'bg-[url("/images/landing.png")]  bg-no-repeat bg-center bg-fixed bg-cover h-screen flex justify-center items-center m-0 relative';
    useEffect(() => {
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `
            body::after {
                content: 'Qwallet';
                position: absolute;
                font-family: Arial, sans-serif;
                top: 0;
                bottom: 0;
                color: white;
                width: 100%;
                background-color: rgba(2, 18, 37, 0.3215686275);
                z-index: -1;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 64px;
            }
        `;
        document.head.appendChild(styleEl);
        return () => {
            document.head.removeChild(styleEl);
        };
    }, [])
    useEffect(() => {
        document.body.className = `${bodyClass} ${theme}`;
    }, [theme]);

    return (
        <div>
            <ThemeContext.Provider value={[theme, setTheme]}>{children}</ThemeContext.Provider>
        </div>
    );
};
