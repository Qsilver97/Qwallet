import React, { useRef, useState } from "react";
import Swiper from "react-native-swiper";
import AllAddresses from "./AllAddresses";
import Home from "./Home";
import { Fab, Icon, useDisclose } from "native-base";
import TransferModal from "../components/TransferModal";
import { FontAwesome5 } from "@expo/vector-icons";
import { useColors } from "@app/context/ColorContex";

const Wallet: React.FC = () => {
  const { textColor, main } = useColors();
  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

  const swip = (index: number) => {
    swiperRef.current?.scrollBy(index);
  };

  const { isOpen, onToggle } = useDisclose();
  const handleTransfer = () => {};

  return (
    <>
      <Swiper
        ref={swiperRef}
        loop={false}
        onIndexChanged={(newIndex) => setIndex(newIndex)}
        showsButtons={false}
      >
        <Home />
        <AllAddresses />
      </Swiper>
      <Fab
        renderInPortal={false}
        shadow={2}
        size="sm"
        bgColor={main.celestialBlue}
        icon={
          <Icon as={FontAwesome5} color="white" name="share" size="xl"></Icon>
        }
        onPress={onToggle}
      />
      <TransferModal
        isOpen={isOpen}
        onToggle={onToggle}
        onPress={handleTransfer}
      />
    </>
  );
};

export default Wallet;
