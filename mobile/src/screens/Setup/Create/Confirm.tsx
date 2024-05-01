import {
  Box,
  Button,
  HStack,
  Icon,
  ScrollView,
  Text,
  VStack,
} from "native-base";
import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { RootState } from "../../../redux/store";
import PageButton from "../../../components/UI/PageButton";
import ButtonBox from "../../../components/UI/ButtonBox";
import { useColors } from "../../../context/ColorContex";

const Confirm: React.FC = () => {
  const { bgColor, textColor, main, gray } = useColors();
  const { seeds } = useSelector((state: RootState) => state.app);
  const [blurBackground, setBlurBackground] = useState(true);
  const [currentSeedIndex, setCurrentSeedIndex] = useState(0);
  const [selectedCorrect, setSelectedCorrect] = useState(false);

  const [step, setStep] = useState(1);
  const handleSeedSelect = (selectedSeed: string) => {
    if (seeds[currentSeedIndex] === selectedSeed) {
      setSelectedCorrect(true);
      if (currentSeedIndex < seeds.length - 1) {
        setTimeout(() => {
          setSelectedCorrect(false);
          setCurrentSeedIndex(currentSeedIndex + 1);
        }, 1200);
      }
    } else {
      setSelectedCorrect(false);
    }
  };

  const getDisplaySeeds = useMemo(() => {
    let seedOptions = [seeds[currentSeedIndex]];
    while (seedOptions.length < 6) {
      const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
      if (!seedOptions.includes(randomSeed)) {
        seedOptions.push(randomSeed);
      }
    }
    return seedOptions.sort(() => Math.random() - 0.5);
  }, [currentSeedIndex]);

  const handleNext = () => {
    if (step == 1) setStep(2);
  };

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
        <ScrollView flex={1}>
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
        <VStack flex={1}>
          <VStack space={5} pt={10}>
            <Text fontSize="2xl" color={main.jeansBlue} textAlign="center">
              Confirm Seed Phrase
            </Text>
            <Text textAlign="center" px={16}>
              Select each word in the order it was presented to you.
            </Text>
          </VStack>
          <VStack textAlign="center" p={8} flex={1}>
            <VStack flex={1} justifyContent={"center"} justifyItems={"center"}>
              <Text
                fontSize={"4xl"}
                color={main.crystalBlue}
                fontWeight="bold"
                py={10}
                textAlign="center"
              >
                {currentSeedIndex + 1}.{" "}
                {selectedCorrect && seeds[currentSeedIndex]}
              </Text>
            </VStack>
            <HStack
              space={4}
              flexWrap={"wrap"}
              p={4}
              justifyContent={"center"}
              borderColor={gray.gray80}
              borderWidth={2}
            >
              {getDisplaySeeds.map((seed, index) => (
                <Button
                  key={index}
                  bg={"gray.900"}
                  rounded="md"
                  px={4}
                  py={2}
                  my={2}
                  onPress={() => handleSeedSelect(seed)}
                >
                  {seed}
                </Button>
              ))}
            </HStack>
          </VStack>
        </VStack>
      )}
      <ButtonBox>
        <PageButton
          title="Next"
          type="primary"
          onPress={handleNext}
          isDisabled={step == 2 && currentSeedIndex != 23}
        />
      </ButtonBox>
    </VStack>
  );
};

export default Confirm;
