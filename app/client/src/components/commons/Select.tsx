import React, { useState } from "react";

export interface SelectOption {
    value: string | boolean;
    label: string;
}

interface TokenSelectProps {
    options: SelectOption[];
    placeholder?: string;
    font?: "base" | "sm";
}

const Select: React.FC<TokenSelectProps> = ({
    options,
    placeholder,
    font = "base",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
        null
    );

    const toggleSelect = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: SelectOption) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    const defaultValue = placeholder ? placeholder : "Select item";

    const fontStyle = {
        base: "text-sm",
        sm: "text-xs",
    };

    return (
        <div className="relative w-max z-10">
            <div className="flex gap-3 items-center">
                <div
                    className={`w-max flex items-center px-4 py-3 rounded-xl cursor-pointer`}
                    onClick={toggleSelect}
                >
                    <span
                        className={`w-full font-Inter mr-2 ${fontStyle[font]}`}
                    >
                        {selectedOption?.label || defaultValue}
                    </span>

                    <img
                        src={"assets/images/ui/chevron-down-light.svg"}
                        alt="chevron-down"
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute w-full max-w-48 mt-2 rounded shadow bg-dark z-20">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`${fontStyle[font]} font-Inter px-3 py-2 cursor-pointer hover:bg-dark-gray-400 transition-colors duration-300`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Select;
