import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

type AccountGridProps = {
    data: {
        address: string
        balance: number
    }[]
    currentPage: number
}

const AccountGrid: React.FC<AccountGridProps> = ({ data }) => {
    console.log(data)
    const { tokenBalances, tokens, accountInfo } = useAuth();
    return (
        <div className="flex flex-col">
            <div className="-m-1.5 overflow-x-auto">
                <div className="p-1.5 min-w-full inline-block align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Address</th>
                                    {
                                        tokens.map((token) => {
                                            return <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">{token}</th>
                                        })
                                    }
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700 font-Montserrat">
                                {accountInfo?.addresses.map((address, idx) => {
                                    if (address != "")
                                        return <tr key={idx}>
                                            <td className="px-1 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{address}</td>
                                            {
                                                tokens.map((token) => {
                                                    return <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 font-mono">{tokenBalances[token] ? tokenBalances[token][address] : 0}</td>
                                                })
                                            }
                                        </tr>
                                })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountGrid;