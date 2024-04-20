import React from 'react';

type TokenProps = {
    name: string
    icon: string
}

const Token: React.FC<TokenProps> = ({name, icon}) => {
    return (
        <div className='w-full px-6 py-4 rounded-2xl flex justify-between bg-dark-gray-400 cursor-pointer'>
            <div className='flex items-center gap-4'>
                <img src={icon} alt="Token Icon"/>

                <p className='font-Inter font-semibold text-lg'>{name}</p>
            </div>
                
            <img src="/assets/images/ui/chevron-right.svg" alt="chevron right" />
        </div>
    );
};

export default Token;