import { View, Text } from "react-native";
import React from "react";
import { Box, VStack } from "native-base";
import Input from "../../../components/UI/Input";

const Restore: React.FC = () => {
  return (
    <VStack>
      <Box>
        <Input
          onChangeText={(text) => {
            console.log(text);
          }}
          placeholder="Seed Phrase"
        ></Input>
      </Box>
      <Box>
        <Input
          onChangeText={(text) => {
            console.log(text);
          }}
          placeholder="New Password"
        ></Input>
      </Box>
      <Box>
        <Input
          onChangeText={(text) => {
            console.log(text);
          }}
          placeholder="Confirm Password"
        ></Input>
      </Box>
    </VStack>
  );
};

export default Restore;
