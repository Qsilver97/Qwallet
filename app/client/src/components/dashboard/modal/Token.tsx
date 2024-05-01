import React, { useState } from "react";
import { assetsItems } from "../../../utils/constants";
import { SelectOption } from "../../../utils/interfaces";

type TokenProps = {
    selectedToken: SelectOption;
    setSelectedToken: React.Dispatch<React.SetStateAction<SelectOption>>;
};

const Token: React.FC<TokenProps> = ({ selectedToken, setSelectedToken }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <div
                className="w-full px-6 py-4 rounded-2xl flex justify-between bg-dark-gray-400 cursor-pointer hover:bg-dark-gray-400/80 transition-all duration-200"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <img
                        src={selectedToken.iconUrl}
                        alt="Token Icon"
                        className="w-9 h-9"
                    />

                    <p className="font-Inter font-semibold text-lg">
                        {selectedToken.name}
                    </p>
                </div>

                <img
                    src="/assets/images/ui/chevron-right.svg"
                    alt="chevron right"
                />
            </div>
            <div className="absolute top-20">
                {isOpen &&
                    assetsItems.map((item) => {
                        if (item.name === selectedToken.name) return;

                        const handleSelectedToken = () => {
                            setSelectedToken({
                                name: item.name,
                                iconUrl: item.icon,
                            });
                            setIsOpen(false);
                        };

                        return (
                            <div
                                className="w-full px-6 py-4 flex justify-between bg-dark-gray-400 cursor-pointer hover:bg-dark-gray-500 transition-all duration-200"
                                onClick={() => handleSelectedToken()}
                            >
                                <div className="flex items-center gap-4">
                                    <img src={item.icon} alt="Token Icon" />

                                    <p className="font-Inter font-semibold text-lg">
                                        {item.name}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default Token;
