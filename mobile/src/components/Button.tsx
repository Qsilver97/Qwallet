import React from "react";
import { Pressable, Text } from "react-native";
import tw from "tailwind-react-native-classnames";

interface ButtonProps {
  disabled?: boolean;
  title: string;
  onPress: () => void;
}

const Button: React.FC<ButtonProps> = ({ disabled, title, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        tw`w-full py-2 mt-2 mb-2 rounded-lg items-center justify-center`,
        disabled ? tw`bg-blue-800` : tw`bg-blue-500`,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={tw`text-white text-lg`}>{title}</Text>
    </Pressable>
  );
};

export default Button;
