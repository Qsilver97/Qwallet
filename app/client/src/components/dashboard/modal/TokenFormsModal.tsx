import { Text } from "../../commons";
import Input from "../../commons/Input";
import TokenSubmitModal from "./TokenSubmitModal";

type TokenFormsModalProps = {
    tokenName: string;
    amount: string;
    setAmount: React.Dispatch<React.SetStateAction<string>>;
    addressToSend: string;
    setAddressToSend: React.Dispatch<React.SetStateAction<string>>;
    modalPage: number;
};

const TokenFormsModal = ({
    tokenName,
    amount,
    setAmount,
    addressToSend,
    setAddressToSend,
    modalPage,
}: TokenFormsModalProps) => {
    return (
        <div className="py-5 px-6 space-y-6 border-white/60 border rounded-2xl">
            {modalPage === 1 && (
                <>
                    <div className="space-y-4">
                        <Input
                            label="Send Adress"
                            placeholder="Send to address"
                            inputId="address"
                            inputStyle="modal"
                            value={addressToSend}
                            onChange={(e) => setAddressToSend(e.target.value)}
                        />

                        <Input
                            type="number"
                            placeholder="Amount"
                            label="Amount"
                            inputId="amount"
                            inputStyle="modal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <label className="font-Inter font-light text-xs">
                                Limit
                            </label>
                            <span className="font-Inter font-light text-xs">
                                0.02 {tokenName} - 23 {tokenName}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <label className="font-Inter font-light text-xs mr-auto">
                                Fee
                            </label>
                            <span className="font-Inter font-light text-xs">
                                0.02 {tokenName}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <label className="font-Inter font-light text-xs mr-auto">
                                Available
                            </label>
                            <span className="font-Inter font-light text-xs">
                                1 {tokenName}
                            </span>
                        </div>
                    </div>
                </>
            )}
            {modalPage === 2 && (
                <TokenSubmitModal
                    amount={amount}
                    addressToSend={addressToSend}
                    token={tokenName}
                />
            )}
            {modalPage === 3 && (
                <div className="space-y-7 grid justify-center">
                    <img
                        src="assets/images/ui/checked-blue.svg"
                        alt="Checked Blue"
                        className="mx-auto"
                    />

                    <div className="space-y-5">
                        <Text className="text-2xl text-center">
                            Transfer Success
                        </Text>
                        <Text className="text-5xl text-center">342</Text>
                    </div>

                    <Text className="text-center">{addressToSend}</Text>
                </div>
            )}
        </div>
    );
};

export default TokenFormsModal;
