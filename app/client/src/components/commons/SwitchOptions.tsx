import React, { useState } from "react";

type SwitchOptionsProps = {
    options: string[];
    switchStyle?: "base" | "rounded";
    defaultOption: number;
};

const SwitchOptions: React.FC<SwitchOptionsProps> = ({
    options,
    switchStyle = "base",
    defaultOption,
}) => {
    const [selectedOption, setSelectedOption] = useState(
        options[defaultOption]
    );

    const commonStyle =
        "px-2.5 py-1.5 font-Inter font-medium text-xs transition-colors duration-200 hover:opactity-80";
    const optionStyle = {
        base: {
            active: `bg-celestialBlue  rounded-lg ${commonStyle}`,
            inactive: `bg-transparent  rounded-lg text-inactive ${commonStyle}`,
        },
        rounded: {
            active: ` border-celestialBlue border rounded-3xl ${commonStyle}`,
            inactive: ` border-transparent border rounded-3xl text-inactive ${commonStyle}`,
        },
    };

    return (
        <nav className="w-full flex gap-2">
            {options.map((name) => {
                const isOptionActive = selectedOption === name;
                const style = isOptionActive
                    ? optionStyle[switchStyle].active
                    : optionStyle[switchStyle].inactive;

                return (
                    <button
                        className={style}
                        onClick={() => setSelectedOption(name)}
                    >
                        {name}
                    </button>
                );
            })}
        </nav>
    );
};

export default SwitchOptions;
