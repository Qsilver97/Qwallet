import React from 'react'
import { AssetItemProps } from '../../utils/interfaces'

interface TokensProps {
    tokens: AssetItemProps[]
    onSend: (token: AssetItemProps) => void
}

const TokenComponent: React.FC<TokensProps> = ({ tokens, onSend }) => {
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
                    {tokens.map((token, index) => (
                        <tr key={index}>
                            <td className="py-3">
                                <div className="flex items-center">
                                    <img
                                        src={token.icon} // Update with actual path
                                        alt={token.name}
                                        className="h-8 w-8 rounded-full mr-2"
                                    />
                                    <span className="font-Inter font-semibold text-white mb-[1.5px]">
                                        {token.name}
                                    </span>
                                </div>
                            </td>
                            <td className="text-white py-2">{token.amount}</td>
                            <td className="py-2 flex justify-center">
                                <button
                                    className=" px-3 py-1 bg-white/10 font-Inter font-medium rounded-md cursor-pointer hover:bg-dark-gray-400 transition-colors duration-200"
                                    onClick={() => onSend(token)}
                                >
                                    SEND
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TokenComponent
