import React, { useState } from "react";

export interface SelectOption {
    value: string | boolean;
    label: string;
}

interface TokenSelectProps {
    options: SelectOption[];
    placeholder?: string;
    font?: "base" | "sm";
    isBorderStyle?: boolean;
}

const Select: React.FC<TokenSelectProps> = ({
    options,
    placeholder,
    font = "base",
    isBorderStyle,
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

    const style = isBorderStyle
        ? {
              icon: "assets/images/ui/chevron-down.svg",
              container: "px-7 py-1.5 border border-white rounded-md",
              option: `px-7 py-1.5 ${fontStyle["sm"]}`,
          }
        : {
              icon: "assets/images/ui/chevron-down-light.svg",
              container: "px-4 py-3 rounded-xl",
              option: `px-3 py-2 ${fontStyle[font]}`,
          };

    return (
        <div className="relative w-max z-10">
            <div className="flex gap-3 items-center">
                <div
                    className={`w-max flex items-center cursor-pointer ${style.container}`}
                    onClick={toggleSelect}
                >
                    <span
                        className={`w-full font-Inter mr-2 ${
                            isBorderStyle ? fontStyle["sm"] : fontStyle[font]
                        }`}
                    >
                        {selectedOption?.label || defaultValue}
                    </span>

                    <img src={style.icon} alt="chevron-down" />
                </div>
            </div>

            {isOpen && (
                <div className="absolute w-full max-w-48 mt-2 rounded shadow bg-dark z-20">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`${style.option} font-Inter font-medium cursor-pointer hover:bg-dark-gray-400 transition-colors duration-300`}
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
