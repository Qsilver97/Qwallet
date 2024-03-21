import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { darkIcon, lightIcon } from '../../utils/svgs';

const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-5 right-5 p-3 bg-gray-200 rounded-full text-xl shadow-lg cursor-pointer transition-colors"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? darkIcon : lightIcon}
        </button>
    );
};

export default ThemeToggle;