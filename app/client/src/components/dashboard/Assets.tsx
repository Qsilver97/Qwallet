import React, { useEffect, useState } from "react";
import AssetItem from "./AssetItem";
import { useAuth } from "../../contexts/AuthContext";

const Assets: React.FC = () => {
    const { tokens, tokenBalances, tokenPrices, currentAddress } = useAuth();
    const [totalAmount, setTotalAmount] = useState<number>(0);
    useEffect(() => {
        let _totalAmount = 0;
        if (tokens && tokenBalances && currentAddress && tokenPrices) {
            tokens.forEach(token => {
                let amount = 0;
                if (tokenPrices[token][0] !== 0 && tokenBalances[token] && tokenPrices[token]) {
                    amount = (tokenBalances[token][currentAddress] || 0) * tokenPrices[token][1] / tokenPrices[token][0];
                }
                console.log(amount)
                _totalAmount += amount;
            })
        }
        setTotalAmount(_totalAmount);
    }, [tokens, tokenBalances, tokenPrices, currentAddress])

    return (
        <div className="rounded-lg bg-dark px-6 py-8 flex flex-col text-center">
            {tokens.map((token, idx) => {
                let percent = 0;
                let amount = 0;
                if (token == 'QU' && tokenBalances[token]) {
                    amount = (tokenBalances[token][currentAddress] || 0);
                }
                else if (tokenPrices[token][0] !== 0 && tokenBalances[token] && tokenPrices[token]) {
                    amount = (tokenBalances[token][currentAddress] || 0) * tokenPrices[token][1] / tokenPrices[token][0];
                }
                if (totalAmount !== 0 && tokenBalances[token]) {
                    percent = amount * 100 / totalAmount
                }
                return <AssetItem token={token} key={idx} percent={percent} />;
            })}
        </div>
    );
};

export default Assets;
