// context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | undefined;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): Socket | undefined => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context.socket;
};

interface SocketProviderProps {
    children: ReactNode;
    wsUrl: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, wsUrl }) => {
    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        const newSocket = io(wsUrl);
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [wsUrl]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
