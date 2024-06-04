import React, { useEffect, useState } from "react";
import AssetItem from "./AssetItem";
import { useAuth } from "../../contexts/AuthContext";

const Assets: React.FC = () => {
    const { tokens, tokenBalances, tokenPrices, currentAddress } = useAuth();
    const [totalAmount, setTotalAmount] = useState<bigint>(0n);
    useEffect(() => {
        let _totalAmount = 0n;
        if (tokens && tokenBalances && currentAddress && tokenPrices) {
            tokens.forEach(token => {
                let amount = 0n;  // All amount amplified by 100000000
                if (tokenPrices[token][0] !== 0 && tokenBalances[token] && tokenPrices[token]) {
                    amount = (BigInt(tokenBalances[token][currentAddress] || 0)) * BigInt(tokenPrices[token][0] * 100000000);
                }
                _totalAmount += amount;
            })
        }
        setTotalAmount(_totalAmount);
    }, [tokens, tokenBalances, tokenPrices, currentAddress])

    return (
        <div className="rounded-lg bg-dark px-6 py-8 flex flex-col text-center">
            {tokens.map((token, idx) => {
                let percent = 0;
                let amount = 0n;
                if (token == 'QU' && tokenBalances[token]) {
                    amount = BigInt(tokenBalances[token][currentAddress] || 0) * 100000000n;
                }
                else if (tokenPrices?.[token]?.[0] !== 0 && tokenBalances?.[token] && tokenPrices?.[token]) {
                    amount = BigInt(tokenBalances?.[token]?.[currentAddress] || 0) * BigInt(tokenPrices?.[token]?.[0] * 100000000);
                }
                if (totalAmount !== 0n && tokenBalances[token]) {
                    percent = Number(amount * 10000n / totalAmount) / 100
                }
                return <AssetItem token={token} key={idx} percent={percent} />;
            })}
        </div>
    );
};

export default Assets;
