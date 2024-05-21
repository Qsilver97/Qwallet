import React from "react";
import TxFormsModal from "./TxFormsModal";
import { useAuth } from "../../../contexts/AuthContext";
type TxModalProps = {
    handleTx: () => void;
    quantity?: string;
    price?: string;
};

const TxModal: React.FC<TxModalProps> = ({ handleTx, quantity, price }) => {
    const { txStatus, setTxStatus } = useAuth();

    const handleCloseModal = () => {
        setTxStatus("");
    }
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"></div>
            <div className="relative w-[500px] h-auto bg-dark p-8 rounded-2xl shadow-lg">
                <div className="w-full px-14 py-5 space-y-6">
                    {txStatus == 'confirm' ?
                        <div>
                            <p>Quantity: {quantity}</p>
                            <p>Price: {price}</p>
                        </div>
                        :
                        <TxFormsModal />
                    }
                </div>
                {txStatus.includes('no command pending') &&
                    <button
                        className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                        onClick={() => handleCloseModal()}
                    >
                        Close
                    </button>
                }
                {txStatus == 'confirm' &&
                    <div className="flex gap-2">
                        < button
                            className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                            onClick={() => handleCloseModal()}
                        >
                            Close
                        </button>
                        < button
                            className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                            onClick={() => handleTx()}
                        >
                            Run
                        </button>
                    </div>
                }
            </div>
        </div >
    );
};

export default TxModal;
