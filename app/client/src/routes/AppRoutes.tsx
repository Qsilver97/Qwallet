import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Create from '../pages/Create';
import Backup from '../pages/Backup';
import Confirm from '../pages/Confirm';
import ProtectedRoute from './ProtectedRoute';
import Restore from '../pages/Restore';
import Cli from '../pages/Cli';

const AppRoutes: React.FC = () => (
    <Router>
        <Routes>
            <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path='/dashboard' element={<Navigate to={'/'} />} />
            <Route path='/login' element={<Login />} />
            <Route path='/create' element={<Create />} />
            <Route path='/backup' element={<Backup />} />
            <Route path='/confirm' element={<Confirm />} />
            <Route path='/restore' element={<Restore />} />
            <Route path='/cli' element={<Cli />} />
            {/* Add more routes as needed */}
        </Routes>
    </Router>
);

export default AppRoutes;
