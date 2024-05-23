import { useDisclose } from "native-base";
import React, { useRef, useState } from "react";
import Swiper from "react-native-swiper";
import TransferModal from "../components/TransferModal";
import AllAddresses from "./AllAddresses";
import Home from "./Home";
import TransferButtonFab from "./TransferButtonFab";

const Wallet: React.FC = () => {
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
      <TransferButtonFab onToggle={onToggle} />
      <TransferModal
        isOpen={isOpen}
        onToggle={onToggle}
        onPress={handleTransfer}
      />
    </>
  );
};

export default Wallet;
