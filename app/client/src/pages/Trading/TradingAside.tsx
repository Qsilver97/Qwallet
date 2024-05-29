import Button from "../../components/commons/Button";
import Input from "../../components/commons/Input";
import Section from "../../components/commons/Section";
import React from "react";
import TokenSelect from "../../components/dashboard/select/TokenSelect";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import TxModal from "../../components/dashboard/modal/TxModal";
import { TokenOption } from "../../components/commons/Select";
import { isNaturalNumber, isPositiveNumber } from "../../utils/helper";

interface TradingAsidePrpos {
    options: TokenOption[];
    quantity: string;
    price: string;
    setQuantity: React.Dispatch<React.SetStateAction<string>>;
    setPrice: React.Dispatch<React.SetStateAction<string>>;
    setCommand: React.Dispatch<React.SetStateAction<'buy' | 'sell' | 'cancelbuy' | 'cancelsell' | undefined>>;
    handleBuySell: () => void;
}

const TradingAside = ({ options, quantity, price, setQuantity, setPrice, setCommand, handleBuySell }: TradingAsidePrpos) => {
    const { txStatus, setTxStatus, tokenBalances, currentAddress, currentToken } = useAuth();

    const handleChangeQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(e.target.value);
    }

    const handleChangePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(e.target.value);
    }

    const actionValidate = (command: 'buy' | 'sell' | 'cancelbuy' | 'cancelsell'): boolean => {
        if (!quantity || !price || !isPositiveNumber(quantity) || !isNaturalNumber(price)) {
            toast.error('Input valid quantity or price.');
            return false;
        }
        if (command == 'buy' && tokenBalances['QU'][currentAddress] < parseInt(price) * parseInt(quantity)) {
            toast.error('Not enough QU balance');
            return false;
        }
        if (command == 'sell') {
            const balance = tokenBalances[currentToken.value as string] ? (tokenBalances[currentToken.value as string][currentAddress] || 0) : 0;
            if (balance < parseInt(quantity)) {
                toast.error(`Not enough ${currentToken.value} balance`);
                return false
            }
        }
        return true
    }

    const handleAction = (command: 'buy' | 'sell' | 'cancelbuy' | 'cancelsell') => {
        if (!actionValidate(command)) {
            return;
        }
        if (command == 'buy' && parseInt(price) > tokenBalances['QU'][currentAddress]) {
            toast.error('Input valid QU amount.');
            return;
        }
        if (command == 'sell' && parseInt(quantity) > tokenBalances[currentToken.value as string][currentAddress]) {
            toast.error(`Input valid ${currentToken.value} amount.`);
            return;
        }
        setTxStatus('confirm');
        setCommand(command);
    }


    return (
        <Section>
            {txStatus != "" &&
                <TxModal handleBuySell={handleBuySell} quantity={quantity} price={price} />
            }
            <main className="flex flex-col gap-5">
                <TokenSelect
                    options={options}
                    showSelectDescription
                    hideTokenValue
                />
                <div className="flex flex-col gap-5">
                    <Input inputId="quantity" label="Quantity" placeholder="0" value={quantity} onChange={handleChangeQuantity} gapVariant="xs" />
                    <Input inputId="price" label="Price" placeholder="0" value={price} onChange={handleChangePrice} gapVariant="xs" />
                </div>
                <div className="flex gap-2.5">
                    <Button variant="primary" font="regular" onClick={() => handleAction('buy')}>
                        Buy
                    </Button>
                    <Button variant="primary" font="regular" onClick={() => handleAction('sell')}>
                        Sell
                    </Button>
                </div>
                <div className="flex gap-2.5">
                    <Button variant="primary" font="regular" onClick={() => handleAction('cancelbuy')}>
                        Cancel Buy
                    </Button>
                    <Button variant="primary" font="regular" onClick={() => handleAction('cancelsell')}>
                        Cancel Sell
                    </Button>
                </div>
            </main>
        </Section>
    );
};

export default TradingAside;
