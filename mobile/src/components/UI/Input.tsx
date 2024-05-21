import React from "react";
import {
  Input as NInput,
  IInputProps,
  Icon,
  FormControl,
  WarningOutlineIcon,
  IFormControlProps,
  Text,
} from "native-base";
import { useColors } from "../../context/ColorContex";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

interface InputProps extends IInputProps {
  label?: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  helper?: string;
  parentProps?: IFormControlProps;
}

const Input: React.FC<InputProps> = ({
  label,
  editable,
  value,
  placeholder,
  onChangeText,
  type,
  error,
  helper,
  parentProps,
  ...props
}) => {
  const { textColor, gray } = useColors();
  const [show, setShow] = React.useState(type == "text");

  return (
    <FormControl
      {...parentProps}
      isInvalid={error !== "" && error !== undefined}
    >
      <FormControl.Label>
        <Text color={textColor}>{label}</Text>
      </FormControl.Label>
      <NInput
        w={{
          base: "75%",
          md: "25%",
        }}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        placeholderTextColor={textColor}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        color={textColor}
        borderColor={gray.gray80}
        rounded="lg"
        InputRightElement={
          type == "password" ? (
            <TouchableOpacity onPress={() => setShow(!show)}>
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
            </TouchableOpacity>
          ) : undefined
        }
        {...props}
      />
      {helper != "" && helper != undefined && (
        <FormControl.HelperText ml={3}>
          <Text color={textColor}>{helper}</Text>
        </FormControl.HelperText>
      )}
      {error !== "" && error != undefined && (
        <FormControl.ErrorMessage
          ml={3}
          leftIcon={<WarningOutlineIcon size="xs" />}
        >
          {error}
        </FormControl.ErrorMessage>
      )}
    </FormControl>
  );
};

export default Input;
