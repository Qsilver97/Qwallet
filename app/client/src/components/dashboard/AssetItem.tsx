import React from 'react';
import { assetsItems } from '../../utils/constants';

const AssetItem: React.FC<{ token: string }> = ({ token }) => {
    const item = assetsItems.find((k) => k.name == token) || assetsItems[0]
    return (
        <div className="flex flex-col items-center justify-between pb-3 text-white">
            <div className="flex items-center justify-between w-full">
                <div className='flex items-center gap-3'>
                    <img src={item.icon} alt={`${token} logo`} className="w-8 h-8" />
                    <div className="font-semibold">{token}</div>
                </div>
                <div>{item.amount}</div>
            </div>
            <div className='flex w-full items-center'>
                <div className="w-full bg-[#353535] rounded-full h-2">
                    <div
                        className={`${item.colorClassName} h-2 rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                    ></div>
                </div>
                <div className="ml-4">
                    <span className="text-sm font-semibold">{item.percentage.toFixed(2)}%</span>
                </div>
            </div>
        </div>
    );
};

export default AssetItem;
