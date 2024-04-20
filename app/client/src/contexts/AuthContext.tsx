import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { sideBarItems } from '../utils/constants';

interface AuthContextType {
    isAuthenticated: boolean;
    activeTabIdx: number;
    login: () => void;
    logout: () => void;
    handleClickSideBar: (idx: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [activeTabIdx, setActiveTabIdx] = useState(0);

    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);

    const handleClickSideBar = (idx: number) => {
        console.log(idx)
        setActiveTabIdx(idx);
        navigate(sideBarItems[idx].link);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, activeTabIdx, handleClickSideBar, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
