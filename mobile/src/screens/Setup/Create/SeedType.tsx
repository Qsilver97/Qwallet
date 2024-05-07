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

  const handleCreate = () => {
    dispatch(setSeedType(value));
    let passwordPrefix = "";
    if (value == "55chars") passwordPrefix = "Q";
    create(`login ${passwordPrefix}${tempPassword}`);
  };

  useEffect(() => {
    eventEmitter.on("S2C/create", (res) => {
      if (res.data?.value) {
        if (res.data.value.result >= 0) {
          Toast.show({
            type: "success",
            text1: local.Create.SeedType.toast_SuccessCreate,
          });
          const seeds = res.data.value.display.split(" ");
          if (seeds.length == 1) {
            dispatch(setSeeds(seeds[0]));
          } else {
            dispatch(setSeeds(seeds));
          }
          navigation.navigate("Confirm");
        } else {
          Toast.show({ type: "error", text1: res.data.value.display });
        }
      } else {
        Toast.show({ type: "error", text1: res.error });
      }
    });
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
      <Image
        source={require("@assets/images/01/02.png")}
        style={{ width: 214, height: 220 }}
        resizeMode="contain"
        alt="Splash Image"
      />
      <Text fontSize={"3xl"}>{local.Create.SeedType.ChooseSeedType}</Text>
      <Text>{local.Create.SeedType.TwoWays}</Text>

      <Radio.Group
        name="RadioGroup"
        value={value}
        onChange={(val) => setValue(val)}
      >
        <Radio value="24words" my="2">
          {local.Create.SeedType._24words}
        </Radio>
        <Radio value="55chars" my="2">
          {local.Create.SeedType._55chars}
        </Radio>
      </Radio.Group>

      <ButtonBox>
        <PageButton
          title={local.Create.SeedType.CreatePassword}
          type="primary"
          onPress={handleCreate}
        />
      </ButtonBox>
    </VStack>
  );
};

export default SeedType;
