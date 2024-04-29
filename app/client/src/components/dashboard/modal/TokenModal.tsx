import React, { useState } from "react";

import Token from "./Token";
import TokenFormsModal from "./TokenFormsModal";
import { AssetItemProps, SelectOption } from "../../../utils/interfaces";

type TokenModalProps = {
    onClose: (token: AssetItemProps | null) => void;
    token: AssetItemProps | null;
};

const TokenModal: React.FC<TokenModalProps> = ({ onClose, token }) => {
    const [amount, setAmount] = useState("");
    const [addressToSend, setAddressToSend] = useState("");
    const [selectedToken, setSelectedToken] = useState<SelectOption>({
        name: token?.name || "",
        iconUrl: token?.icon || "",
    });
    const [modalPage, setModalPage] = useState(1);

    const handleCloseModal = () => {
        onClose(null);
        setModalPage(1);
    };

    const handleSubmitModal = () => {
        if (modalPage === 3) {
            handleCloseModal();
            return;
        }

        setModalPage(modalPage + 1);
    };

    console.log(token);

    const submitButtonText = modalPage === 1 ? "Continue" : "Send";

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"></div>
            <div className="relative w-[500px] h-auto bg-dark p-8 rounded-2xl shadow-lg">
                <button
                    className="absolute top-0 right-0 p-2 text-gray-600 hover:text-gray-800"
                    onClick={() => handleCloseModal()}
                >
                    <img src="/assets/images/ui/button.svg" alt="Close" />
                </button>

                <div className="w-full px-14 py-5 space-y-6">
                    <Token
                        selectedToken={selectedToken}
                        setSelectedToken={setSelectedToken}
                    />

                    <TokenFormsModal
                        tokenName={token?.name || ""}
                        amount={amount}
                        setAmount={setAmount}
                        addressToSend={addressToSend}
                        setAddressToSend={setAddressToSend}
                        modalPage={modalPage}
                    />

                    <button
                        className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                        onClick={() => handleSubmitModal()}
                    >
                        {modalPage === 3 ? "Back" : submitButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenModal;
