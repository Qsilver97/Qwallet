import {
  Box,
  Checkbox,
  HStack,
  Icon,
  ScrollView,
  Text,
  VStack,
} from "native-base";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { RootState } from "../../../redux/store";
import Button from "../../../components/UI/Button";
import ButtonBox from "../../../components/UI/ButtonBox";
import { useColors } from "../../../context/ColorContex";

const Confirm: React.FC = () => {
  const { bgColor, textColor, main, gray } = useColors();
  const { seeds } = useSelector((state: RootState) => state.app);
  const [blurBackground, setBlurBackground] = useState(true);
  const [step, setStep] = useState(1);

  const seedComponents = useMemo(() => {
    if (typeof seeds !== "string") {
      return seeds.map((seed, index) => {
        // Only render every third seed
        if (index % 3 !== 0) return null;
        return (
          <HStack w="full" key={index} space={2} justifyContent="center">
            {Array.from({ length: 3 }).map((_, i) => (
              <Text
                key={index + i}
                w="24"
                bg="gray.900"
                rounded="md"
                textAlign="center"
                p={2}
              >
                {index + i + 1}.{seeds[index + i]}
              </Text>
            ))}
          </HStack>
        );
      });
    }
  }, [seeds]);

  return (
    <VStack
      flex={1}
      justifyItems="center"
      justifyContent="end"
      space={5}
      bgColor={bgColor}
      color={textColor}
    >
      {step == 1 && (
        <ScrollView>
          <VStack space={5} pt={10}>
            <Text fontSize="2xl" color={main.jeansBlue} textAlign="center">
              Write Down Your Seed Phrase
            </Text>
            <Text textAlign="center" px={16}>
              This is your seed phrase. Write it down on a paper and keep it in
              a safe place. You'll be asked to re-enter this phrase (in order)
              on the next step.
            </Text>
          </VStack>
          <Box textAlign="center" p={8}>
            <VStack
              flexWrap="wrap"
              w="full"
              space={3}
              justifyItems="center"
              justifyContent="center"
            >
              {seedComponents}
              {blurBackground && (
                <VStack
                  position={"absolute"}
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  flex={1}
                  justifyContent={"center"}
                  justifyItems={"center"}
                  bgColor={gray.gray80}
                >
                  <TouchableOpacity
                    onPress={() => setBlurBackground(!blurBackground)}
                    style={{ marginLeft: "auto", marginRight: "auto" }}
                  >
                    <Icon
                      as={<MaterialIcons name={"visibility"} />}
                      size={10}
                      mr="2"
                      color={textColor}
                    />
                  </TouchableOpacity>
                </VStack>
              )}
            </VStack>
          </Box>
        </ScrollView>
      )}
      {step == 2 && (
        <ScrollView>
          <VStack space={5} pt={10}>
            <Text fontSize="2xl" color={main.jeansBlue} textAlign="center">
              Confirm Seed Phrase
            </Text>
            <Text textAlign="center" px={16}>
              Select each word in the order it was presented to you.
            </Text>
          </VStack>
          <Box textAlign="center" p={8}>
            <VStack
              flexWrap="wrap"
              w="full"
              space={3}
              justifyItems="center"
              justifyContent="center"
            >
              {seedComponents}
              {blurBackground && (
                <VStack
                  position={"absolute"}
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  flex={1}
                  justifyContent={"center"}
                  justifyItems={"center"}
                  bgColor={gray.gray80}
                >
                  <TouchableOpacity
                    onPress={() => setBlurBackground(!blurBackground)}
                    style={{ marginLeft: "auto", marginRight: "auto" }}
                  >
                    <Icon
                      as={<MaterialIcons name={"visibility"} />}
                      size={10}
                      mr="2"
                      color={textColor}
                    />
                  </TouchableOpacity>
                </VStack>
              )}
            </VStack>
          </Box>
        </ScrollView>
      )}
      <ButtonBox>
        <Button title="Next" type="primary" onPress={() => {}} />
      </ButtonBox>
    </VStack>
  );
};

export default Confirm;
