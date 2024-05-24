import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setMarketcap,
  setTick,
  setTokenprices,
  updateRichlist,
} from "@app/redux/appSlice";
import eventEmitter from "@app/api/eventEmitter";
import { useAuth } from "@app/context/AuthContext";

export const SocketCom: React.FC = () => {
  const dispatch = useDispatch();
  const {
    setBalances,
    setTokenBalances,
    allAddresses,
    balances,
    setPrevBalances,
  } = useAuth();
  useEffect(() => {
    eventEmitter.on("S2C/live", (res) => {
      if (res.data.command == "CurrentTickInfo") {
        dispatch(setTick(res.data.tick));
      } else if (res.data.command == "EntityInfo") {
        // setBalances({ [res.data.address]: parseFloat(res.data.balance) });
        if (res.data.address)
          if (res.data.tokens) {
            res.data.tokens.length &&
              res.data.tokens.map((item: [string, string]) => {
                setTokenBalances((prev) => {
                  return {
                    ...prev,
                    [item[0]]: { [res.data.address]: parseInt(item[1]) },
                  };
                });
              });
          }

        if (res.data.balance) {
          setBalances((prev) => {
            setPrevBalances(prev);
            return {
              ...prev,
              [res.data.address]: parseFloat(res.data.balance),
            };
          });
        }
      } else if (res.data.balances) {
        res.data.balances.map((balance: [number, string]) => {
          if (balance[0] < allAddresses.length)
            setBalances((prev) => {
              setPrevBalances(prev);
              return {
                ...prev,
                [allAddresses[balance[0]]]: parseFloat(balance[1]),
              };
            });
        });
      } else if (res.data.richlist) {
        // dispatch(updateRichlist(res.data));
      } else if (res.data.price) {
        // This maybe changed by server
        dispatch(setMarketcap(res.data));
      }
      if (res.data) {
        const allEntriesAreArraysOfLengthTwo = Object.values(res.data).every(
          (entry) => Array.isArray(entry) && entry.length === 2
        );

        if (allEntriesAreArraysOfLengthTwo) {
          dispatch(setTokenprices(res.data));
        }
      }
    });
  }, []);

  return <></>;
};
