import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

import { SERVER_URL } from './utils/constants';
import axios from 'axios';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/theme/ThemeToggle';

function App() {
    const [socket, setSocket] = useState<any>(null);

    const testSocket = () => {
        axios.post(`${SERVER_URL}/api/ccall`, { command: 'login aa', flag: 'login' })
        if (socket) {
            socket.emit('test', 'hello')
            console.log('sent socket')
        }
    }

    useEffect(() => {
        testSocket()
        const newSocket = io(SERVER_URL);
        setSocket(newSocket)
    }, []);

    return (
        <>
            <ThemeProvider>
                <ThemeToggle />
                <AppRoutes />
            </ThemeProvider>
        </>
    )
}

export default App
