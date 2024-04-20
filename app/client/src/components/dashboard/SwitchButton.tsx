import React, { useState } from 'react';

const SwitchButton: React.FC = () => {
    const [isMainnet, setIsMainnet] = useState(true);

    return (
        <div className="flex justify-center items-center">
            <div className="bg-white rounded-xl w-40">
                <button
                    className={`w-1/2 rounded-xl px-2 py-1 text-sm font-medium leading-5 focus:outline-none transition-colors duration-150 ease-in-out ${isMainnet ? 'text-white bg-celestialBlue' : 'text-black'
                        }`}
                    onClick={() => setIsMainnet(true)}
                >
                    MAINNET
                </button>
                <button
                    className={`w-1/2 rounded-xl px-2 py-1 text-sm font-medium leading-5 focus:outline-none transition-colors duration-150 ease-in-out ${!isMainnet ? 'text-white bg-celestialBlue' : 'text-black'
                        }`}
                    onClick={() => setIsMainnet(false)}
                >
                    TESTNET
                </button>
            </div>
        </div>
    );
};

export default SwitchButton;
