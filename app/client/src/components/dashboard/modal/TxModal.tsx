import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { formatNumberWithCommas } from "../../../utils/helper";
type TxModalProps = {
    handleBuySell: () => void;
    quantity?: string;
    price?: string;
};

const TxModal: React.FC<TxModalProps> = ({ handleBuySell, quantity, price }) => {
    const { txStatus, setTxStatus, currentToken } = useAuth();

    const handleCloseModal = () => {
        setTxStatus("");
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"></div>
            <div className="relative w-[500px] h-auto bg-dark p-8 rounded-2xl shadow-lg">
                {txStatus == 'confirm' &&
                    <>
                        <div>
                            <p>Token: {currentToken.value}</p>
                            <p>Quantity: {formatNumberWithCommas(parseInt(quantity as string))}</p>
                            <p>Price: {formatNumberWithCommas(parseInt(price as string))}</p>
                        </div>
                        <div className="flex gap-2">
                            < button
                                className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                                onClick={() => handleCloseModal()}
                            >
                                Close
                            </button>
                            < button
                                className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                                onClick={() => handleBuySell()}
                            >
                                Confirm
                            </button>
                        </div>
                    </>
                }
            </div>
        </div >
    );
};

export default TxModal;
