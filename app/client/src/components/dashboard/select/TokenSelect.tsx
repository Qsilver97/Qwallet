import React, { useState } from "react";

import { assetsItems } from "../../../utils/constants";
import { SelectOption } from "../../commons/Select";

interface TokenSelectProps {
    options: SelectOption[];
    showTokenDescription?: boolean;
}

const TokenSelect: React.FC<TokenSelectProps> = ({
    options,
    showTokenDescription,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption>(
        options[0]
    );

    const toggleSelect = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: SelectOption) => {
        setSelectedOption(option);
        setIsOpen(false);
    };
    const selectedToken = assetsItems.find((item) => {
        return selectedOption.value === item.name;
    });

    const style = showTokenDescription
        ? {
              container: "px-4 py-3 rounded-xl",
              img: "w-6 h-6",
              chevronIcon: "assets/images/ui/chevron-down-light.svg",
          }
        : {
              container: "px-3 py-2 rounded-3xl",
              img: "w-4 h-4",
              chevronIcon: "assets/images/ui/chevron-down.svg",
          };

    return (
        <div className="relative">
            <div className="flex gap-3 items-center">
                <div
                    className={`w-max bg-black/40 rounded flex items-center ${style.container} cursor-pointer`}
                    onClick={toggleSelect}
                >
                    <img
                        src={selectedOption.label}
                        alt="Selected Option"
                        className={`${style.img} mr-2`}
                    />

                    <div className="flex flex-wrap gap-[2px] items-center">
                        <span className="w-full font-Inter font-medium text-xs mr-2">
                            {selectedOption.value}
                        </span>
                        {showTokenDescription && (
                            <span className="font-Inter font-medium text-[10px] text-inactive">
                                OPTIONS CONTRACTS
                            </span>
                        )}
                    </div>

                    <img src={style.chevronIcon} alt="chevron-down" />
                </div>

                {!showTokenDescription && (
                    <span className="font-Inter font-bold text-2xl">
                        ${selectedToken?.amount}
                    </span>
                )}
            </div>

            {isOpen && (
                <div className="absolute mt-2 rounded shadow bg-dark z-10">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className="px-3 py-2 cursor-pointer hover:bg-dark-gray-400 transition-colors duration-300"
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.value}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TokenSelect;
