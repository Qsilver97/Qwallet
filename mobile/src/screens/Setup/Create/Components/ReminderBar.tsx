import React from "react";
import { Center, HStack } from "native-base";

interface IProps {
  strength: number;
}

const ReminderBar: React.FC<IProps> = ({ strength }) => {
  return (
    <HStack space="2" alignItems="center">
      {strength > 0 && (
        <Center bg="red.500" w={"1/4"} h={"5px"}>
          {" "}
        </Center>
      )}
      {strength > 1 && (
        <Center bg="yellow.500" w={"1/4"} h={"5px"}>
          {" "}
        </Center>
      )}
      {strength > 2 && (
        <Center bg="green.400" w={"1/4"} h={"5px"}>
          {" "}
        </Center>
      )}
      {strength > 3 && (
        <Center bg="green.600" w={"1/4"} h={"5px"}>
          {" "}
        </Center>
      )}
    </HStack>
  );
};

export default ReminderBar;
