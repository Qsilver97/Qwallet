import React, { useState } from 'react'
import { assetsItems } from '../../../utils/constants'

interface SelectOption {
    value: string
    label: string
}

interface TokenSelectProps {
    options: SelectOption[]
}

const TokenSelect: React.FC<TokenSelectProps> = ({ options }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState<SelectOption>(
        options[0]
    )

    const toggleSelect = () => {
        setIsOpen(!isOpen)
    }

    const handleOptionClick = (option: SelectOption) => {
        setSelectedOption(option)
        setIsOpen(false)
    }
    const selectedToken = assetsItems.find((item) => {
        return selectedOption.value === item.name
    })

    return (
        <div className="relative">
            <div className="flex gap-3 items-center">
                <div
                    className="w-max bg-black/40 rounded-3xl flex items-center px-3 py-2 cursor-pointer"
                    onClick={toggleSelect}
                >
                    <img
                        src={selectedOption.label}
                        alt="Selected Option"
                        className="w-4 h-4 mr-2"
                    />
                    <span className="font-Inter font-medium text-xs mr-2">
                        {selectedOption.value}
                    </span>
                    <img
                        src="assets/images/ui/chevron-down.svg"
                        alt="chevron-down"
                    />
                </div>
                <span className="font-Inter font-bold text-2xl">
                    ${selectedToken?.amount}
                </span>
            </div>

            {isOpen && (
                <div className="absolute mt-2 rounded shadow bg-dark z-10">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="px-3 py-2 cursor-pointer hover:bg-dark-gray-400 transition-colors duration-300"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.value}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TokenSelect
