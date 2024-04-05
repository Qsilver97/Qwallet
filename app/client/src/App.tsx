// import { useState, useEffect } from 'react'
// import { io } from 'socket.io-client'

import { SERVER_URL } from './utils/constants';
// import axios from 'axios';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NetworkProvider } from './context/NetworkContext';

function App() {
    return (
        <>
            <Provider store={store}>
                <AuthProvider>
                    <NetworkProvider defaultNetwork='mainnet'>
                        <SocketProvider wsUrl={SERVER_URL}>
                            <ThemeProvider>
                                <ToastContainer />
                                <AppRoutes />
                            </ThemeProvider>
                        </SocketProvider>
                    </NetworkProvider>
                </AuthProvider>
            </Provider>
        </>
    )
}

export default App
