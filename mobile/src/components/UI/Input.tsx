import React from "react";
import { Input as NInput, IInputProps, Pressable, Icon } from "native-base";
import tw from "tailwind-react-native-classnames";
import { useColors } from "../../context/ColorContex";
import { MaterialIcons } from "@expo/vector-icons";

interface InputProps extends IInputProps {
  placeholder: string;
  onChangeText: (value: string) => void;
}

const Input: React.FC<InputProps> = ({
  editable,
  value,
  placeholder,
  onChangeText,
  type,
  ...props
}) => {
  const { textColor, gray } = useColors();
  const [show, setShow] = React.useState(type == "text");

  return (
    <>
      <NInput
        w={{
          base: "75%",
          md: "25%",
        }}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        placeholderTextColor={gray.gray20}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        color={textColor}
        borderColor={gray.gray80}
        rounded="lg"
        InputRightElement={
          type == "password" ? (
            <Pressable onPress={() => setShow(!show)}>
              <Icon
                as={
                  <MaterialIcons
                    name={show ? "visibility-off" : "visibility"}
                  />
                }
                size={5}
                mr="2"
                color={textColor}
              />
            </Pressable>
          ) : undefined
        }
        {...props}
      />
    </>
  );
};

export default Input;
