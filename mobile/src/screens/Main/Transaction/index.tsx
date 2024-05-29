import React, { useRef, useState } from "react";
import Swiper from "react-native-swiper";
import QuTx from "./QuTx";
import QxTx from "./QxTx";

const Transaction: React.FC = () => {
  const [index, setIndex] = useState(0);
  const swiperRef = useRef(null);

  const swip = (index: number) => {
    swiperRef.current?.scrollBy(index);
  };

  return (
    <>
      <Swiper
        ref={swiperRef}
        loop={false}
        onIndexChanged={(newIndex) => setIndex(newIndex)}
        showsButtons={false}
      >
        <QuTx />
        <QxTx />
      </Swiper>
    </>
  );
};

export default Transaction;
