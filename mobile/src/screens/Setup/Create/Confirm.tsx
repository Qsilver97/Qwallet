import {
  Box,
  Button,
  HStack,
  Icon,
  ScrollView,
  Text,
  TextArea,
  VStack,
} from "native-base";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { RootState } from "../../../redux/store";
import PageButton from "../../../components/UI/PageButton";
import ButtonBox from "../../../components/UI/ButtonBox";
import { useColors } from "../../../context/ColorContex";
import { useNavigation } from "@react-navigation/native";

const Confirm: React.FC = () => {
  const { bgColor, textColor, main, gray } = useColors();
  const { seeds, seedType } = useSelector((state: RootState) => state.app);
  const [blurBackground, setBlurBackground] = useState(true);
  const [currentSeedIndex, setCurrentSeedIndex] = useState(0);
  const [isCorrectSeed, setIsCorrectSeed] = useState(false);
  const [seedValue, setSeedValue] = useState("");
  const [step, setStep] = useState(1);
  const navigation = useNavigation();
  const handleSeedTyping = (txt: string) => {
    setSeedValue(txt);
    if (txt == seeds) setIsCorrectSeed(true);
  };
  const handleSeedSelect = (selectedSeed: string) => {
    if (seeds[currentSeedIndex] === selectedSeed) {
      setIsCorrectSeed(true);
      if (currentSeedIndex < seeds.length - 1) {
        setTimeout(() => {
          setIsCorrectSeed(false);
          setCurrentSeedIndex(currentSeedIndex + 1);
        }, 1200);
      }
    } else {
      setIsCorrectSeed(false);
    }
  };

  const handleNext = () => {
    if (step == 1) setStep(2);
    else navigation.navigate("Login");
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
    } else {
      return (
        <HStack w="full" space={2} justifyContent="center">
          <TextArea
            value={seeds}
            type="text"
            autoCompleteType={() => {}}
            w={"full"}
            p={3}
            fontSize={"xl"}
            totalLines={6}
          ></TextArea>
        </HStack>
      );
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
      {seedType == "24words" && step == 1 && (
        <VStack flex={1}>
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
        </VStack>
      )}
      {seedType == "24words" && step == 2 && (
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
                {isCorrectSeed && seeds[currentSeedIndex]}
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
      {seedType == "55chars" && step == 1 && (
        <VStack flex={1} py={16}>
          <VStack space={5} pt={10}>
            <Text fontSize="2xl" color={main.jeansBlue} textAlign="center">
              Write Down Your Seed Phrase
            </Text>
            <Text textAlign="justify" px={10}>
              This is your seed chars. Write it down on a paper and keep it in a
              safe place. You'll be asked to re-enter this phrase (in order) on
              the next step.
            </Text>
          </VStack>
          <Box textAlign="center" py={20} px={8}>
            <VStack
              flexWrap="wrap"
              w="full"
              space={3}
              justifyItems="center"
              justifyContent="center"
            >
              {seedComponents}
            </VStack>
          </Box>
        </VStack>
      )}
      {seedType == "55chars" && step == 2 && (
        <VStack flex={1} py={16}>
          <VStack space={5} pt={10}>
            <Text fontSize="2xl" color={main.jeansBlue} textAlign="center">
              Enter your Seed Chars
            </Text>
            <Text textAlign="justify" px={10}>
              Please enter the seed chars you have saved.
            </Text>
          </VStack>
          <Box textAlign="center" py={20} px={8}>
            <VStack
              flexWrap="wrap"
              w="full"
              space={3}
              justifyItems="center"
              justifyContent="center"
            >
              <TextArea
                value={seedValue}
                onChangeText={handleSeedTyping}
                type="text"
                autoCompleteType={() => {}}
                w={"full"}
                p={3}
                fontSize={"xl"}
                totalLines={6}
              ></TextArea>
            </VStack>
          </Box>
        </VStack>
      )}
      <ButtonBox>
        <PageButton
          title="Next"
          type="primary"
          onPress={handleNext}
          isDisabled={
            (seedType == "24words" && step == 2 && currentSeedIndex != 23) ||
            (step == 2 && isCorrectSeed == false)
          }
        />
      </ButtonBox>
    </VStack>
  );
};

export default Confirm;
