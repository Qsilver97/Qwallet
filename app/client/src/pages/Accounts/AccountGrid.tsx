import React from 'react';

type AccountGridProps = {
    data: {
        address: string
        balance: number
    }[]
    currentPage: number
}

const AccountGrid: React.FC<AccountGridProps> = ({data}) => {
    return (
        <div className='space-y-6'>
            <div className='w-full grid grid-cols-[1fr_minmax(100px,auto)]'>
                <p className="font-medium font-Inter text-sm text-dark-gray mr-auto">Address</p>
                <p className="font-medium font-Inter text-sm text-dark-gray text-center">Balance</p>
            </div>

            <div className='space-y-5'>
                {data.map(({address, balance}, index) => {
                    return (
                        <div key={index} className='w-full grid grid-cols-[1fr_minmax(100px,auto)]'>
                            <p className="font-semibold font-Inter text-base mr-auto">{address}</p>
                            <p className="font-semibold font-Inter text-base text-center">{balance}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default AccountGrid;