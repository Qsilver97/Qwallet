import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MODES } from '../../utils/constants';

const SwitchButton: React.FC = () => {
    const [isMainnet, setIsMainnet] = useState(true);
    const { setMode } = useAuth();

    return (
        <div className="flex justify-center items-center">
            <div className="bg-white rounded-xl w-40">
                <button
                    className={`w-1/2 rounded-xl px-2 py-1 text-sm font-medium leading-5 focus:outline-none transition-colors duration-150 ease-in-out ${isMainnet ? 'text-white bg-celestialBlue' : 'text-black'
                        }`}
                    onClick={() => { setIsMainnet(true); setMode(MODES[0]) }}
                >
                    MAINNET
                </button>
                <button
                    className={`w-1/2 rounded-xl px-2 py-1 text-sm font-medium leading-5 focus:outline-none transition-colors duration-150 ease-in-out ${!isMainnet ? 'text-white bg-celestialBlue' : 'text-black'
                        }`}
                    onClick={() => { setIsMainnet(false); setMode(MODES[1]) }}
                >
                    TESTNET
                </button>
            </div>
        </div>
    );
};

export default SwitchButton;
