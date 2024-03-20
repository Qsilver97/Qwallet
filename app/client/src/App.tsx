import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

import { SERVER_URL } from './utils/constants';
import axios from 'axios';

function App() {
    const [socket, setSocket] = useState<any>(null);

    const testSocket = () => {
        axios.post(`${SERVER_URL}/api/ccall`, {command: 'login aa', flag: 'login'})
        if (socket) {
            socket.emit('test', 'hello')
            console.log('sent socket')
        }
    }

    useEffect(() => {
        const newSocket = io(SERVER_URL);
        setSocket(newSocket)
    }, []);

    return (
        <>
        <a onClick={testSocket}>testsocket</a>
            hello
        </>
    )
}

export default App
