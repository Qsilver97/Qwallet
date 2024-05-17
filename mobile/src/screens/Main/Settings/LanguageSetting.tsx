import CollapsibleView from "@app/components/UI/CollapsibleView";
import { useColors } from "@app/context/ColorContex";
import { HStack, Icon, Text, useDisclose } from "native-base";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import ConfirmModal from "../components/ConfirmModal";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import local from "@app/utils/locales";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const data = [
  {
    language: "en",
    symbol: "En",
  },
  {
    language: "zh",
    symbol: "中",
  },
  {
    language: "es",
    symbol: "Es",
  },
  {
    language: "fr",
    symbol: "Fr",
  },
  {
    language: "de",
    symbol: "De",
  },
  {
    language: "ru",
    symbol: "Ру",
  },
  {
    language: "ja",
    symbol: "日",
  },
];

const LanguageSetting: React.FC = () => {
  const { textColor } = useColors();
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    local.getLanguage()
  );
  const { isOpen, onToggle } = useDisclose();
  const lang = local.Main.Settings;

  return (
    <>
      <CollapsibleView
        title={lang.LanguageSetting}
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
                  local.getLanguage() == dt.language
                    ? "blueGray.800"
                    : "blueGray.600"
                }
                p="3"
                color={textColor}
                alignItems="center"
                space="3"
              >
                <Text fontSize="xl" fontWeight="bold">
                  {dt.symbol}
                </Text>
                <Text fontSize="md">{lang.Languages[dt.language]}</Text>
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
          local.setLanguage(currentLanguage);
          AsyncStorage.setItem(
            "lang",
            data.find((d) => d.language == currentLanguage)?.language as string
          );
        }}
      >
        <Text textAlign="center" fontSize="md">
          {lang.ConfirmLanguageChange.replace(
            "{language}",
            //@ts-ignore
            lang.Languages[currentLanguage]
          )}
        </Text>
      </ConfirmModal>
    </>
  );
};

export default LanguageSetting;
