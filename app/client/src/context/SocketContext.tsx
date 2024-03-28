// context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { setBalances, setTick } from '../redux/appSlice';

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

    const dispatch = useDispatch();

    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        const newSocket = io(wsUrl);
        setSocket(newSocket);

        newSocket.on('live', (data) => {
            console.log(data);
            if (data.command == 'CurrentTickInfo') {
                dispatch(setTick(data.tick));
            } else if (data.command == 'EntityInfo') {
                // dispatch(setBalances({ [data.address]: parseFloat(data.balance) }));
            } else if (data.balances) {
                data.balances.map((item: [number, string]) => {
                    dispatch(setBalances({ index: item[0], balance: item[1] }));
                })
            }
        })

        return () => {
            newSocket.close();
        };
    }, [wsUrl]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
