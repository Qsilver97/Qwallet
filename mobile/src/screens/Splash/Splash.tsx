import React, { useRef, useState } from "react";
import { VStack, Image } from "native-base";
import Swiper from "react-native-swiper";
import { useNavigation } from "@react-navigation/native";
import { useColors } from "@app/context/ColorContex";
import ButtonBox from "@app/components/UI/ButtonBox";
import PageButton from "@app/components/UI/PageButton";

const slides = [
  {
    image: require("@assets/images/01/01.png"),
    text: require("@assets/images/01/text01.png"),
  },
  {
    image: require("@assets/images/01/02.png"),
    text: require("@assets/images/01/text02.png"),
  },
  {
    image: require("@assets/images/01/03.png"),
    text: require("@assets/images/01/text03.png"),
  },
];

const Splash: React.FC = () => {
  const { bgColor } = useColors();
  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);
  const navigation = useNavigation();

  const handlePress = () => {
    if (index < slides.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      navigation.navigate("WalletSetup");
    }
  };

  return (
    <>
      <Swiper
        ref={swiperRef}
        loop={false}
        onIndexChanged={(newIndex) => setIndex(newIndex)}
      >
        {slides.map((slide, key) => {
          return (
            <VStack
              space={10}
              alignItems="center"
              bgColor={bgColor}
              flex={1}
              justifyContent="center"
              justifyItems="center"
              key={key}
            >
              <Image
                source={slide.image}
                style={{ width: 214, height: 220 }}
                resizeMode="contain"
                alt="Splash Image"
              />
              <Image
                source={slide.text}
                style={{ height: 102 }}
                resizeMode="contain"
                alt="Splash Text"
              />
            </VStack>
          );
        })}
      </Swiper>
      <ButtonBox>
        <PageButton
          title="Get Stated"
          onPress={handlePress}
          type="primary"
        ></PageButton>
      </ButtonBox>
    </>
  );
};

export default Splash;
