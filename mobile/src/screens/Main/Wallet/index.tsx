import React, { useRef, useState } from "react";
import Swiper from "react-native-swiper";
import AllAddresses from "./AllAddresses";
import Home from "./Home";

const Wallet: React.FC = () => {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

  const swip = (index: number) => {
    swiperRef.current?.scrollBy(index);
  };

  return (
    <Swiper
      ref={swiperRef}
      loop={false}
      onIndexChanged={(newIndex) => setIndex(newIndex)}
      showsButtons={false}
    >
      <Home/>
      <AllAddresses/>
    </Swiper>
  );
};

export default Wallet;
