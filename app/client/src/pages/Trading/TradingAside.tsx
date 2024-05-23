import Button from "../../components/commons/Button";
import Input from "../../components/commons/Input";
import Section from "../../components/commons/Section";
import { useState } from "react";
import TokenSelect from "../../components/dashboard/select/TokenSelect";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import TxModal from "../../components/dashboard/modal/TxModal";
import { TokenOption } from "../../components/commons/Select";
import { isNaturalNumber, isPositiveNumber } from "../../utils/helper";

const TradingAside = ({ options }: { options: TokenOption[] }) => {
    const { handleBuyCell, txStatus, setTxStatus, tokenBalances, currentAddress, currentToken } = useAuth();

    const [command, setCommand] = useState<'buy' | 'sell' | 'cancelbuy' | 'cancelsell'>();
    const [quantity, setQuantity] = useState<string>();
    const [price, setPrice] = useState<string>();

    const handleChangeQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuantity(e.target.value);
    }

    const handleChangePrice = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(e.target.value);
    }

    const handleTx = () => {
        if (!quantity || !price || !command) {
            toast.error('Invalid command.');
            return;
        }
        handleBuyCell(command, quantity, price);
    }

    const handleAction = (command: 'buy' | 'sell' | 'cancelbuy' | 'cancelsell') => {
        if (!quantity || !price || !isPositiveNumber(quantity) || !isNaturalNumber(price)) {
            toast.error('Input valid quantity or price.');
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
                <TxModal handleTx={handleTx} quantity={quantity} price={price} />
            }
            {/* <Text size="xs" weight="medium" className="text-celestialBlue">
                SELECT A STRIKE PRICE
            </Text> */}

            <main className="flex flex-col gap-5">
                {/* <div className="flex flex-wrap xl:flex-nowrap justify-between items-center w-full">
                    <Select options={options} placeholder="Type" />

                    <p className="text-sm font-Inter">08 Dec 23</p>

                    <Select options={options} placeholder="Strike" />
                </div> */}

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
                {/* <div className="flex flex-col gap-3">
                    <Text
                        size="xs"
                        weight="medium"
                        className="text-celestialBlue"
                    >
                        NUMBER OF CONTRACTS
                    </Text>

                    <Input
                        type="number"
                        label=""
                        placeholder="0"
                        inputId="contracts-input"
                        inputStyle="custom"
                        gapVariant="xs"
                        backgroundVariant="transparent"
                    />

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="reduce-checkbox"
                            sx={{
                                padding: 0,
                                color: "#6A6A6D",
                                width: 16,
                            }}
                        />
                        <label htmlFor="reduce-checkbox">
                            <Text size="sm" className="text-inactive">
                                Reduce only
                            </Text>
                        </label>
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between">
                            <Text size="sm" className="text-inactive">
                                Total
                            </Text>
                            <label>---</label>
                        </div>
                        <div className="flex justify-between">
                            <Text size="sm" className="text-inactive">
                                Fees
                            </Text>
                            <label>---</label>
                        </div>
                        <div className="flex justify-between">
                            <Text size="sm" className="text-inactive">
                                Available Balance
                            </Text>
                            <label>---</label>
                        </div>
                        <div className="flex justify-between">
                            <Text size="sm" className="text-inactive">
                                Current Position
                            </Text>
                            <label>---</label>
                        </div>
                    </div>
                </div> */}
            </main>

            {/* <footer className="w-full">
                <SwitchOptions
                    options={["Order book", "Offers", "Trades"]}
                    defaultOption={0}
                    switchStyle="rounded"
                />
            </footer> */}
        </Section>
    );
};

export default TradingAside;
