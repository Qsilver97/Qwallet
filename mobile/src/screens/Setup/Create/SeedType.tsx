import React, { useEffect, useState } from "react";
import { Checkbox, Image, Radio, Text, VStack } from "native-base";
import { useColors } from "@app/context/ColorContex";
import { setSeedType, setSeeds } from "@app/redux/appSlice";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import eventEmitter from "@app/api/eventEmitter";
import Toast from "react-native-toast-message";
import { useAuth } from "@app/context/AuthContext";
import { create } from "@app/api/api";

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
          Toast.show({ type: "success", text1: "Create Wallet Successly!" });
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
      <Text fontSize={"3xl"}>Choose Seed Type</Text>
      <Text>There are two ways to secure your wallet</Text>

      <Radio.Group
        name="RadioGroup"
        value={value}
        onChange={(val) => setValue(val)}
      >
        <Radio value="24words" my="2">
          24 words
        </Radio>
        <Radio value="55chars" my="2">
          55 chars
        </Radio>
      </Radio.Group>

      <ButtonBox>
        <PageButton
          title="Create Password"
          type="primary"
          onPress={handleCreate}
        />
      </ButtonBox>
    </VStack>
  );
};

export default SeedType;
