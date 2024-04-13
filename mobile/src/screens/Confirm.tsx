import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { VStack, HStack, Input, Button, Text, Image, Box } from "native-base";
// import { RootState } from "../redux/store";

const Confirm: React.FC = () => {
  // const { seeds, seedType } = useSelector((state: RootState) => state.app);

  const [confirmSeeds, setConfirmSeeds] = useState<string | string[] | null>(
    null
  );
  const [matchStatus, setMatchStatus] = useState<boolean>(true);

  const navigation = useNavigation();

  // useEffect(() => {
  //   if (seedType === "24words") {
  //     setConfirmSeeds(Array(24).fill(""));
  //   } else if (seedType === "55chars") {
  //     setConfirmSeeds("");
  //   }
  // }, [seedType]);

  // useEffect(() => {
  //   const checkMatch = () => {
  //     if (Array.isArray(seeds) && Array.isArray(confirmSeeds)) {
  //       return (
  //         seeds.length === confirmSeeds.length &&
  //         seeds.every((value, index) => value === confirmSeeds[index])
  //       );
  //     } else {
  //       return seeds === confirmSeeds;
  //     }
  //   };
  //   setMatchStatus(!checkMatch());
  // }, [confirmSeeds, seeds]);

  const handleConfirmSeeds = (value: string, idx?: number) => {
    if (
      typeof confirmSeeds === "object" &&
      Array.isArray(confirmSeeds) &&
      typeof idx === "number"
    ) {
      const newSeeds = [...confirmSeeds];
      newSeeds[idx] = value;
      setConfirmSeeds(newSeeds);
    } else {
      setConfirmSeeds(value);
    }
  };

  return (
    <Box p="5" safeArea>
      <VStack space={5} alignItems="center">
        <Image source={{ uri: "images/logo.png" }} alt="Logo" size="100px" />
        <Text fontSize="xl" bold>
          Confirm Seeds
        </Text>
        <Text>Please enter the backup seeds you have saved.</Text>
        {/* {typeof seeds === "string" ? (
          <Input
            variant="underlined"
            placeholder="Input seeds you've just created."
            onChangeText={(value) => handleConfirmSeeds(value)}
          />
        ) : (
          seeds.map((_, idx) => (
            <Input
              key={idx}
              variant="underlined"
              placeholder={`${idx + 1}`}
              onChangeText={(value) => handleConfirmSeeds(value, idx)}
            />
          ))
        )} */}
        <Button.Group space={2} mt="4" w="80%">
          <Button onPress={() => navigation.goBack()} w="50%">
            Back
          </Button>
          <Button
            onPress={() => navigation.navigate("Dashboard")}
            isDisabled={matchStatus}
            variant="solid"
            w="50%"
          >
            Next
          </Button>
        </Button.Group>
      </VStack>
    </Box>
  );
};

export default Confirm;
