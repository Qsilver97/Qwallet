import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Create from '../pages/Create';

const AppRoutes: React.FC = () => (
    <Router>
        <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/login' element={<Login />} />
            <Route path='/create' element={<Create />} />
            {/* Add more routes as needed */}
        </Routes>
    </Router>
);

export default AppRoutes;
