import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Create from '../pages/Create';
import Backup from '../pages/Backup';
import Confirm from '../pages/Confirm';

const AppRoutes: React.FC = () => (
    <Router>
        <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/login' element={<Login />} />
            <Route path='/create' element={<Create />} />
            <Route path='/backup' element={<Backup />} />
            <Route path='/confirm' element={<Confirm />} />
            {/* Add more routes as needed */}
        </Routes>
    </Router>
);

export default AppRoutes;
