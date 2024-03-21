import React from 'react';

interface RadioButtonProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
}

const Radio: React.FC<RadioButtonProps> = ({
  label,
  name,
  value,
  checked,
  onChange,
}) => {
  return (
    <label htmlFor={value} className="inline-flex items-center cursor-pointer space-x-2">
      <input
        type="radio"
        id={value}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="radio radio-primary w-6 h-6 text-blue-600 bg-gray-100 border-none"
      />
      <span className="text-light dark:text-dark">{label}</span>
    </label>
  );
};

export default Radio;
