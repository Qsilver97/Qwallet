import React from 'react';


interface ButtonProps {
    buttonValue: string;
    onClick: () => void; // Defines the type of the onClick function prop
}

const Button: React.FC<ButtonProps> = ({ buttonValue, onClick }) => {
    return (
        <input
            type="button"
            value={buttonValue}
            className="w-[100%] p-[10px] mt-[10px] mb-[10px] border-none bg-[#5468ff] outline-none text-white text-[18px] cursor-pointer rounded-[5px] transition-colors duration-300 hover:bg-[#4356b4]"
            onClick={onClick}
        />
    )
}

export default Button;
