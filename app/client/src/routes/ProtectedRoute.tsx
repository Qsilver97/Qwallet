import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setIsAuthenticated } from '../redux/appSlice';
import { Audio } from 'react-loader-spinner';

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.app)
    const { login, user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.post(`${SERVER_URL}/api/fetch-user`);
                login(response.data);
                dispatch(setIsAuthenticated(response.data.isAuthenticated));
            } catch (error) {
                dispatch(setIsAuthenticated(false));
            }
        };

        if (user === null) {
            fetchUser();
        }
    }, [user, login]);

    if (isAuthenticated === null) {
        return <div className='flex w-full justify-center items-center text-center text-white'>
            <Audio
                height="80"
                width="100"
                color="rgb(0 14 31)"
                ariaLabel="loading" />
        </div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
