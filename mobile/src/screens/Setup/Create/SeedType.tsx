import React, { useEffect, useState } from "react";
import { Image, Radio, Text, VStack } from "native-base";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useAuth } from "@app/context/AuthContext";
import { create } from "@app/api/api";
import { useColors } from "@app/context/ColorContex";
import { setSeedType, setSeeds } from "@app/redux/appSlice";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import eventEmitter from "@app/api/eventEmitter";
import local from "@app/utils/locales";

const SeedType = () => {
  const { bgColor, textColor } = useColors();
  const { tempPassword } = useAuth();

  const [value, setValue] = useState<"24words" | "55chars">("24words");
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const lang = local.Create.SeedType;

  const handleCreate = () => {
    dispatch(setSeedType(value));
    let passwordPrefix = "";
    if (value == "55chars") passwordPrefix = "Q";
    create(`login ${passwordPrefix}${tempPassword}`);
  };

  useEffect(() => {
    const handleCreateEvent = (res: any) => {
      console.log(res);
      if (res.data?.value) {
        if (res.data.value.result == 0 && res.data.value.seedpage == 1) {
          Toast.show({
            type: "success",
            text1: lang.toast_SuccessCreate,
          });
          const seeds = res.data.value.display.split(" ");
          if (seeds.length == 1) {
            dispatch(setSeeds(seeds[0]));
          } else {
            dispatch(setSeeds(seeds));
          }
          navigation.navigate("Confirm");
        } else if (res.data.value.result == 0 && res.data.value.seedpage == 0) {
          Toast.show({
            type: "error",
            text1: "E23: " + lang.toast_PasswordExist,
          });
        } else {
          Toast.show({
            type: "error",
            text1: "E21: " + res.data.value.display,
          });
        }
      } else {
        Toast.show({ type: "error", text1: "E22: " + res.error });
      }
    };
    eventEmitter.on("S2C/create", handleCreateEvent);
    return () => {
      eventEmitter.off("S2C/create", handleCreateEvent);
    };
  }, []);
  return (
    <VStack
      space={10}
      alignItems="center"
      bgColor={bgColor}
      flex={1}
      justifyContent="center"
      justifyItems="center"
    >
      <VStack
        space={10}
        alignItems="center"
        flex={1}
        justifyContent="center"
        justifyItems="center"
      >
        <Image
          source={require("@assets/images/01/02.png")}
          style={{ width: 214, height: 220 }}
          resizeMode="contain"
          alt="Splash Image"
        />
        <Text fontSize={"3xl"}>{lang.ChooseSeedType}</Text>
        <Text>{lang.TwoWays}</Text>

        <Radio.Group
          name="RadioGroup"
          value={value}
          onChange={(val) => setValue(val)}
        >
          <Radio value="24words" my="2">
            {lang._24words}
          </Radio>
          <Radio value="55chars" my="2">
            {lang._55chars}
          </Radio>
        </Radio.Group>
      </VStack>
      <ButtonBox>
        <PageButton
          title={lang.CreatePassword}
          type="primary"
          onPress={handleCreate}
        />
      </ButtonBox>
    </VStack>
  );
};

export default SeedType;
