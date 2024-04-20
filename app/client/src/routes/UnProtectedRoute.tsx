import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const UnprotectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};
