import CollapsibleView from "@app/components/UI/CollapsibleView";
import { useColors } from "@app/context/ColorContex";
import { HStack, Icon, Text, VStack, useDisclose } from "native-base";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import ConfirmModal from "../components/ConfirmModal";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import local from "@app/utils/locales";
import { FontAwesome } from "@expo/vector-icons";

const data = [
  {
    title: "English (United States)",
    language: "en",
  },
  {
    title: "Chinese (China)",
    language: "zh",
  },
  {
    title: "Spanish (Spain)",
    language: "es",
  },
  {
    title: "French (France)",
    language: "fr",
  },
  {
    title: "Russian (Russia)",
    language: "ru",
  },
  {
    title: "Japanese (Japan)",
    language: "jp",
  },
];

const LanguageSelector: React.FC = () => {
  const { textColor } = useColors();
  const [currrentLanguage, setCurrentLanguage] = useState<string>("en");
  const { isOpen, onToggle } = useDisclose();

  return (
    <>
      <CollapsibleView
        title="Select Language"
        icon={
          <Icon as={FontAwesome} name="language" size="xl" color={textColor} />
        }
      >
        {data.map((dt, key) => {
          return (
            <TouchableOpacity
              key={key}
              onPress={() => {
                onToggle();
                setCurrentLanguage(dt.language);
              }}
            >
              <HStack
                w="full"
                rounded="md"
                bgColor={
                  currrentLanguage == dt.language
                    ? "blueGray.800"
                    : "blueGray.600"
                }
                p="3"
                color={textColor}
              >
                <Text fontSize="md">{dt.title}</Text>
              </HStack>
            </TouchableOpacity>
          );
        })}
      </CollapsibleView>
      <ConfirmModal
        icon={faCheck}
        isOpen={isOpen}
        onToggle={onToggle}
        onPress={() => {
          onToggle();
          local.setLanguage(currrentLanguage);
        }}
      >
        <Text textAlign="center" fontSize="md">
          Are you really want to change language to{" "}
          {data.find((d) => d.language == currrentLanguage)?.title}?
        </Text>
      </ConfirmModal>
    </>
  );
};

export default LanguageSelector;
