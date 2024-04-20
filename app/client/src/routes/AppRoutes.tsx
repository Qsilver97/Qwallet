import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { UnprotectedRoute } from './UnProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import Loading from '../components/commons/Loading';

const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Accounts = React.lazy(() => import('../pages/Accounts/Accounts'));
const Trading = React.lazy(() => import('../pages/Trading'));
const Activity = React.lazy(() => import('../pages/Activity/Activity'));
const Settings = React.lazy(() => import('../pages/Settings'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Login = React.lazy(() => import('../pages/Login/Login'));
const SignUp = React.lazy(() => import('../pages/SignUp/SignUp'));
const AccountOptions = React.lazy(() => import('../pages/SignUp/AccountOptions'));
const SignUpSeeds = React.lazy(() => import('../pages/SignUp/SignUpSeeds'));
const SignUpChars = React.lazy(() => import('../pages/SignUp/SignUpChars'));

const AppRoutes: React.FC = () => (
    <BrowserRouter>
        <AuthProvider>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route element={<UnprotectedRoute />}>
                        <Route path='/login' element={<Login />} />
                        <Route path='/signup' element={<SignUp />} />
                        <Route path='/signup/options' element={<AccountOptions />} />
                        <Route path='/signup/words' element={<SignUpSeeds />} />
                        <Route path='/signup/chars' element={<SignUpChars />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route path='/' element={<Dashboard />} />
                        <Route path='/dashboard' element={<Navigate to={'/'} />} />
                        <Route path='/trading' element={<Trading />} />
                        <Route path='/accounts' element={<Accounts />} />
                        <Route path='/activity' element={<Activity />} />
                        <Route path='/settings' element={<Settings />} />
                        <Route path='/profile' element={<Profile />} />
                    </Route>
                </Routes>
            </Suspense>
        </AuthProvider>
    </BrowserRouter>
);

export default AppRoutes;
