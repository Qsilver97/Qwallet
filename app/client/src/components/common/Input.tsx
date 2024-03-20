import React from 'react';


interface InputProps {
    // buttonValue: string;
    inputType?: string;
    placeHolder: string;
    onChange: (value: string) => void; // Defines the type of the onClick function prop
}

const Input: React.FC<InputProps> = ({ inputType, placeHolder, onChange }) => {
    return (
        <input
            type={inputType || 'text'}
            className="w-full p-[10px] mb-[30px] border-b border-white bg-transparent outline-none text-white text-[16px]"
            placeholder={placeHolder}
            required
            onChange={(e) => {onChange(e.target.value)}}
        />
    )
}

export default Input;
