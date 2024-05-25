import React, { useEffect, useState } from "react";
import Token from "./Token";
import TokenFormsModal from "./TokenFormsModal";
import { AssetItemProps, SelectOption } from "../../../utils/interfaces";
import axios from "axios";
import { SERVER_URL } from "../../../utils/constants";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";

type TokenModalProps = {
    onClose: (token: AssetItemProps | null) => void;
    token: AssetItemProps | null;
};

const TokenModal: React.FC<TokenModalProps> = ({ onClose, token }) => {
    const { currentAddress, accountInfo, tick, tokenBalances } = useAuth();
    const [amount, setAmount] = useState("");
    const [toAddress, setToAddress] = useState("");
    const [sendingStatus, setSendingStatus] = useState<'init' | 'confirm' | 'open' | 'pending' | 'success' | 'rejected'>('init');
    const [transactionId, setTrasactionId] = useState<string>('');
    const [expectedTick, setExpectedTick] = useState<number>();
    const [sendingResult, setSendingResult] = useState<string>('');
    const [statusInterval, setStatusInterval] = useState<any>();
    const [selectedToken, setSelectedToken] = useState<SelectOption>({
        name: token?.name || "",
        iconUrl: token?.icon || "",
    });

    const handleConfirm = () => {
        setSendingStatus('confirm');
    }

    const handleCloseModal = () => {
        onClose(null);
        setSendingStatus('init');
    };

    const transfer = async () => {
        setSendingStatus('open');

        if (toAddress == '' || toAddress == currentAddress || amount == '' || parseFloat(amount) > tokenBalances[selectedToken.name][currentAddress]) {
            toast.error('Invaild address or amount');
            return
        }
        console.log('a');
        setSendingStatus('pending');
        axios
            .post(`${SERVER_URL}/api/transfer`, {
                toAddress,
                fromIdx: accountInfo?.addresses.indexOf(currentAddress),
                amount,
                tick: parseInt(tick) + 5,
                tokenName: selectedToken.name,
            })
            .then(() => {
                const _statusInterval = setInterval(() => {
                    axios.post(
                        `${SERVER_URL}/api/tx-status`
                    ).then((resp) => {
                        console.log(resp.data);
                        if (resp.data.value.result == '0') {
                            setSendingStatus('pending');
                        } else if (resp.data.value.result == '1') {
                            setSendingResult(resp.data.value.display);
                            // setSendingStatus('success');
                        } else {
                            setSendingStatus('rejected');
                        }
                    }).catch((error) => {
                        console.log(error.response);
                        setSendingStatus('rejected');
                    })
                }, 2000)
                setStatusInterval(_statusInterval);
            })
            .catch((error) => {
                console.log(error.response)
            })
            .finally(() => {
            })

    };

    useEffect(() => {
        if (sendingStatus == 'open' || sendingStatus == 'pending') {
            // setIsTransferModalOpen(true);
        } else {
            // clearInterval(statusInterval);
        }
    }, [sendingStatus])

    useEffect(() => {
        if (sendingResult.includes('broadcast for tick')) {
            const sendingResultSplit = sendingResult.split(' ');
            setTrasactionId(sendingResultSplit[1]);
            setExpectedTick(parseInt(sendingResultSplit[sendingResultSplit.length - 1]));
        } else if (sendingResult.includes('no command pending')) {
            setSendingStatus('success');
            clearInterval(statusInterval);
        }
    }, [sendingResult])

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
                        transactionId={transactionId}
                        sendingStatus={sendingStatus}
                        expectedTick={expectedTick}
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
