import axios from 'axios';
import { createContext, useContext, ReactNode, useState } from 'react';
import { useAuth } from './AuthContext';

interface NetworkConfig {
    rpcUrl: string;
    wssUrl: string;
    chainId: number;
    explorerUrl: string;
}

const mainnetConfig: NetworkConfig = {
    rpcUrl: "https://mainnet.rpc.qsilver.org",
    wssUrl: "wss://qsilver.org:5555",
    chainId: 1,
    explorerUrl: "https://mainnet.qsilver.org",
};

const testnetConfig: NetworkConfig = {
    rpcUrl: "https://testnet.rpc.qsilver.org",
    wssUrl: "ws://93.190.141.12:5678",
    chainId: 2,
    explorerUrl: "https://testnet.qsilver.com",
};

export const networks = {
    mainnet: mainnetConfig,
    testnet: testnetConfig,
};

type NetworkType = 'mainnet' | 'testnet';
interface NetworkContextType {
    network: NetworkType;
    config: typeof networks.testnet;
    switchingStatus: boolean;
    switchNetwork: (network: NetworkType) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider = ({ children, defaultNetwork }: { children: ReactNode, defaultNetwork: 'mainnet' | 'testnet' }) => {
    const [network, setNetwork] = useState<NetworkType>(defaultNetwork);
    const [switchingStatus, setSwitchingStatus] = useState(false);

    const auth = useAuth();

    const switchNetwork = (network: NetworkType) => {
        console.log(network)
        setSwitchingStatus(true);
        // axios.post(
        //     `${SERVER_URL}/api/switch-network`,
        //     {
        //         password: auth.user?.password,
        //         socketUrl: networks[network].wssUrl
        //     }
        // ).then((resp) => {
        //     auth.login(resp.data);
        //     setNetwork(network);
        // }).catch(() => {
            
        // }).finally(() => {
        //     setSwitchingStatus(false);
        // })
    };

    const value = {
        network,
        config: networks[network],
        switchingStatus,
        switchNetwork,
    };

    return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};
