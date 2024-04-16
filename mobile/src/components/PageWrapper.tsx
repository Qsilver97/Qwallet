import { View, Text } from "react-native";
import React from "react";
import { ScrollView, VStack } from "native-base";
import tw from "tailwind-react-native-classnames";

const PageWrapper:React.FC = ({children}) => {
  return (
    <ScrollView contentContainerStyle={{ padding: 4 }}>
      <VStack
        space={5}
        w="90%"
        maxW="300px"
        style={tw`items-center mx-auto pt-16`}
      >
        {children}
      </VStack>
    </ScrollView>
  );
};

export default PageWrapper;
