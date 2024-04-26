import React, { useRef } from "react";
import { Box, VStack, Image, Button } from "native-base";
import Swiper from "react-native-swiper";
import { useColors } from "../../context/ColorContex";


const Splash: React.FC = () => {
  const { bgColor, textColor, btnBgColor } = useColors();
  const swiperRef = useRef(null);
  return (
    <>
      <Swiper ref={swiperRef} loop={false}>
        <VStack
          space={10}
          alignItems="center"
          bgColor={bgColor}
          flex={1}
          justifyContent="center"
          justifyItems="center"
        >
          <Image
            source={require("../../../assets/images/01/01.png")}
            style={{ width: 214, height: 220 }}
            resizeMode="contain"
            alt="Splash Image"
          />
          <Image
            source={require("../../../assets/images/01/text01.png")}
            style={{height: 102 }}
            resizeMode="contain"
            alt="Splash Text"
          />
        </VStack>
        <VStack
          space={8}
          alignItems="center"
          bgColor={bgColor}
          flex={1}
          justifyContent="center"
          justifyItems="center"
        >
          <Image
            source={require("../../../assets/images/01/02.png")}
            style={{ width: 229, height: 251 }}
            resizeMode="contain"
            alt="Splash Image"
          />
          <Image
            source={require("../../../assets/images/01/text02.png")}
            style={{height: 102 }}
            resizeMode="contain"
            alt="Splash Text"
          />
        </VStack>
        <VStack
          space={8}
          alignItems="center"
          bgColor={bgColor}
          flex={1}
          justifyContent="center"
          justifyItems="center"
        >
          <Image
            source={require("../../../assets/images/01/03.png")}
            style={{ width: 190, height: 220 }}
            resizeMode="contain"
            alt="Splash Image"
          />
          <Image
            source={require("../../../assets/images/01/text03.png")}
            style={{height: 102 }}
            resizeMode="contain"
            alt="Splash Text"
          />
        </VStack>
      </Swiper>
      <Box px={5} pt={4} pb={8} bgColor={bgColor}>
        <Button
          bgColor={btnBgColor}
          color={textColor}
          rounded={"full"}
          onPress={() => {
            swiperRef.current?.scrollBy(1);
          }}
        >
          Get Started
        </Button>
      </Box>
    </>
  );
};

export default Splash;