import React from 'react';

import Token from './Token';
import TokenFormsModal from './TokenFormsModal';
import { AssetItemProps } from '../../../utils/interfaces';

type TokenModalProps = {
    onClose: (token: AssetItemProps | null) => void
    token: AssetItemProps | null
}

const TokenModal: React.FC<TokenModalProps> = ({onClose, token}) => {
    console.log(token)
    
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"></div>
            <div className="relative w-[500px] h-auto bg-dark p-8 rounded-2xl shadow-lg">
                <button
                    className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-800"
                    onClick={()  => onClose(null)}
                >
                    <img src="/assets/images/ui/button.svg" alt="Close" />
                </button>

                <div className='w-full px-14 py-5 space-y-6'>
                    <Token name={token?.name || ''} icon={token?.icon || ''} />

                    <TokenFormsModal tokenName={token?.name || ""} />

                    <button className='w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer' onClick={() => onClose(null)}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default TokenModal;