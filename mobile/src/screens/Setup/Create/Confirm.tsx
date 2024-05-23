import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import { useColors } from "@app/context/ColorContex";
import { setCurrentSeedIndex } from "@app/redux/appSlice";
import { RootState } from "@app/redux/store";
import local from "@app/utils/locales";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
import { TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";

const Confirm: React.FC = () => {
  const { bgColor, textColor, main, gray, panelBgColor } = useColors();
  const { seeds, seedType, currentSeedIndex } = useSelector(
    (state: RootState) => state.app
  );
  const [blurBackground, setBlurBackground] = useState(true);
  const [isCorrectSeed, setIsCorrectSeed] = useState(false);
  const [seedValue, setSeedValue] = useState("");
  const [step, setStep] = useState(1);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const lang = local.Create.Confirm;
  const handleSeedTyping = (txt: string) => {
    setSeedValue(txt);
    if (txt == seeds) setIsCorrectSeed(true);
    else setIsCorrectSeed(false);
  };
  const handleSeedSelect = (selectedSeed: string) => {
    if (seeds[currentSeedIndex] === selectedSeed) {
      setIsCorrectSeed(true);
      if (currentSeedIndex < seeds.length - 1) {
        setTimeout(() => {
          setIsCorrectSeed(false);
          dispatch(setCurrentSeedIndex(currentSeedIndex + 1));
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
                px="1"
                py="2"
                bgColor={panelBgColor}
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
      bgColor={bgColor}
      color={textColor}
    >
      {seedType == "24words" && step == 1 && (
        <ScrollView flex={1}>
          <VStack space="3" pt={10}>
            <Text fontSize="3xl" color={textColor} textAlign="center" px={5}>
              {lang.WriteDownSeedPhrase}
            </Text>
            <Text textAlign="center" px={12}>
              {lang.Caption1}
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
                  left={-10}
                  right={-10}
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
      {seedType == "24words" && step == 2 && (
        <VStack flex={1}>
          <VStack space={5} pt={10}>
            <Text fontSize="2xl" color={textColor} textAlign="center" px={10}>
              {lang.ConfirmSeedPhrase}
            </Text>
            <Text textAlign="center" px={16}>
              {lang.Caption2}
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
              space={2}
              flexWrap={"wrap"}
              p={2}
              justifyContent={"center"}
              borderColor={gray.gray80}
              borderWidth={2}
            >
              {getDisplaySeeds.map((seed, index) => (
                <Button
                  key={index}
                  bg={panelBgColor}
                  _text={{ color: textColor }}
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
            <Text fontSize="2xl" color={textColor} textAlign="center" px={10}>
              {lang.WriteDownSeedPhrase}
            </Text>
            <Text textAlign="justify" px={10}>
              {lang.Caption3}
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
            <Text fontSize="2xl" color={textColor} textAlign="center" px={10}>
              {lang.EnterSeedChar}
            </Text>
            <Text textAlign="justify" px={10}>
              {lang.Caption4}
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
                borderColor={gray.gray80}
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
          title={lang.button_Next}
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
