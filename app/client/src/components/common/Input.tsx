import React from 'react';


interface InputProps {
    // buttonValue: string;
    inputType?: string;
    disabled?: boolean;
    value?: string;
    placeHolder: string;
    onChange: (value: string) => void; // Defines the type of the onClick function prop
}

const Input: React.FC<InputProps> = ({ inputType, disabled, value, placeHolder, onChange }) => {
    return (
        <input
            type={inputType || 'text'}
            value={value}
            className="w-full p-[10px] border-b border-white bg-transparent outline-none text-white text-[16px] mb-[15px]"
            placeholder={placeHolder}
            required
            onChange={(e) => {onChange(e.target.value)}}
            disabled={(disabled ? true: false)}
        />
    )
}

export default Input;
