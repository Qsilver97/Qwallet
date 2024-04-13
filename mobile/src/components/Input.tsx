import React from "react";
import { TextInput, TextInputProps } from "react-native";
import tw from "tailwind-react-native-classnames";

interface InputProps extends TextInputProps {
  placeholder: string;
  onChangeText: (value: string) => void;
}

const Input: React.FC<InputProps> = ({
  editable,
  value,
  placeholder,
  onChangeText,
  ...props
}) => {
  return (
    <TextInput
      style={tw`w-full px-4 py-2 border-b border-white bg-transparent text-white text-lg`}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      {...props}
    />
  );
};

export default Input;
