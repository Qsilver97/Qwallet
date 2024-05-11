import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setTick, updateRichlist } from "@app/redux/appSlice";
import eventEmitter from "@app/api/eventEmitter";
import { useAuth } from "@app/context/AuthContext";

export const SocketCom: React.FC = () => {
  const dispatch = useDispatch();
  const { balances, setBalances } = useAuth();
  useEffect(() => {
    eventEmitter.on("S2C/live", (res) => {
      if (res.data.command == "CurrentTickInfo") {
        dispatch(setTick(res.data.tick));
      } else if (res.data.command == "EntityInfo") {
        // setBalances({ [res.data.address]: parseFloat(res.data.balance) });
      } else if (res.data.balances) {
        let tmp: string[] = [...balances];
        res.data.balances.map((itm: [number, string]) => {
          tmp[itm[0]] = itm[1];
        });
        setBalances(tmp);
      } else if (res.data.richlist) {
        dispatch(updateRichlist(res.data));
      } else if (res.data.marketcap) {
      }
    });
  }, []);

  return <></>;
};
