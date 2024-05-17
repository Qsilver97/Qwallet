import React from "react";
import { FormControl, IFormControlProps, Text } from "native-base";
import { useColors } from "@app/context/ColorContex";

interface IProps extends IFormControlProps {
  label: string;
  value: string;
}

const FormLabel: React.FC<IProps> = ({ label, value, ...props }) => {
  const { textColor } = useColors();
  return (
    <FormControl {...props}>
      <FormControl.Label color={textColor}>{label}</FormControl.Label>
      <Text ml={3}>{value}</Text>
    </FormControl>
  );
};

export default FormLabel;
