import React, { useState } from "react";
import Token from "./Token";
import TokenFormsModal from "./TokenFormsModal";
import { AssetItemProps, SelectOption } from "../../../utils/interfaces";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import { isPositiveNumber } from "../../../utils/helper";

type TokenModalProps = {
    onClose: (token: AssetItemProps | null) => void;
    token: AssetItemProps | null;
};

const TokenModal: React.FC<TokenModalProps> = ({ onClose, token }) => {
    const { currentAddress, tokenBalances, handleTx } = useAuth();
    const [amount, setAmount] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [sendingStatus, setSendingStatus] = useState<'init' | 'confirm' | 'open' | 'pending' | 'success' | 'rejected'>('init');
    const [selectedToken, setSelectedToken] = useState<SelectOption>({
        name: token?.name || "",
        iconUrl: token?.icon || "",
    });

    const handleConfirm = () => {
        if (toAddress == '' || toAddress.length != 60 || toAddress == currentAddress) {
            toast.error('Invaild address');
            return;
        }
        if (amount == '' || !isPositiveNumber(amount) || parseFloat(amount) > tokenBalances[selectedToken.name][currentAddress]) {
            toast.error('Invalid amount');
            return;
        }
        setSendingStatus('confirm');
    }

    const handleCloseModal = () => {
        onClose(null);
        setSendingStatus('init');
    };

    const transfer = async () => {
        await handleTx('send', amount, '', toAddress);
        handleCloseModal();
    };


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"></div>
            <div className="relative w-full max-w-[1024px] h-auto bg-dark p-8 rounded-2xl shadow-lg">
                <button
                    className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-800"
                    onClick={() => handleCloseModal()}
                >
                    <img src="/assets/images/ui/button.svg" alt="Close" />
                </button>

                <div className="w-full px-14 py-5 space-y-6">
                    {sendingStatus == 'open' &&
                        <Token
                            selectedToken={selectedToken}
                            setSelectedToken={setSelectedToken}
                        />
                    }

                    <TokenFormsModal
                        tokenName={token?.name || ""}
                        amount={amount}
                        setAmount={setAmount}
                        addressToSend={toAddress}
                        setAddressToSend={setToAddress}
                        sendingStatus={sendingStatus}
                    />

                    {sendingStatus == 'init' &&
                        <button
                            className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                            onClick={() => handleConfirm()}
                        >
                            Next
                        </button>
                    }

                    {sendingStatus == 'confirm' &&
                        <button
                            className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                            onClick={() => transfer()}
                        >
                            Send
                        </button>
                    }

                    {sendingStatus == 'success' || sendingStatus == 'rejected' &&
                        <button
                            className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                            onClick={() => handleCloseModal()}
                        >
                            Close
                        </button>
                    }
                </div>
            </div>
        </div>
    );
};

export default TokenModal;
