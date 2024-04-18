import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setBalances, setTick, updateRichlist } from "../redux/appSlice";
import eventEmitter from "../api/eventEmitter";

export const SocketCom: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    eventEmitter.on("S2C/live", (res) => {
      console.log(res.data);
      if (res.data.command == "CurrentTickInfo") {
        dispatch(setTick(res.data.tick));
      } else if (res.data.command == "EntityInfo") {
        // dispatch(setBalances({ [res.data.address]: parseFloat(res.data.balance) }));
      } else if (res.data.balances) {
        res.data.balances.map((item: [number, string]) => {
          dispatch(setBalances({ index: item[0], balance: item[1] }));
        });
      } else if (res.data.richlist) {
        dispatch(updateRichlist(res.data));
      } else if (res.data.marketcap) {
      }
    });
  }, []);

  return <></>;
};
