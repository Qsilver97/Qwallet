import React from 'react'
import { AssetItemProps } from '../../utils/interfaces'
import { useAuth } from '../../contexts/AuthContext'
import { assetsItems } from "../../utils/constants";

interface TokensProps {
    onSend: (token: AssetItemProps) => void
}

const TokenComponent: React.FC<TokensProps> = ({ onSend }) => {
    const { tokenBalances, currentAddress, tokens } = useAuth();
    return (
        <div className="overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="text-left">
                        <th className="font-Inter font-medium text-sm text-dark-gray-500">
                            Name
                        </th>
                        <th className="font-Inter font-medium text-sm text-dark-gray-500">
                            Balance
                        </th>
                        <th className="font-Inter font-medium text-sm text-center text-dark-gray-500">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tokens.map((token, index) => {
                        const item = assetsItems.find((k) => k.name == token) || assetsItems[0]
                        return (
                            <tr key={index}>
                                <td className="py-3">
                                    <div className="flex items-center">
                                        <img
                                            src={item.icon} // Update with actual path
                                            alt={item.name}
                                            className="h-8 w-8 rounded-full mr-2"
                                        />
                                        <span className="font-Inter font-semibold text-white mb-[1.5px]">
                                            {token}
                                        </span>
                                    </div>
                                </td>
                                {
                                    tokenBalances[item.name] ?
                                        <td className="text-white py-2">{tokenBalances?.[token]?.[currentAddress]?.toString() || '0'}</td> :
                                        <td className="text-white py-2">0</td>
                                }
                                <td className="py-2 flex justify-center">
                                    <button
                                        className=" px-3 py-1 bg-white/10 font-Inter font-medium rounded-md cursor-pointer hover:bg-dark-gray-400 transition-colors duration-200"
                                        onClick={() => onSend(item)}
                                    >
                                        SEND
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default TokenComponent
