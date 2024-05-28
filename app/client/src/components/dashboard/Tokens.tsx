import React, { useState } from "react";
import TokenComponent from "./TokenComponent";
import { AssetItemProps } from "../../utils/interfaces";
import TokenModal from "./modal/TokenModal";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const Tokens: React.FC = () => {
    const { tokenBalances } = useAuth();
    const [token, setToken] = useState<AssetItemProps | null>(null);

    const handleSend = (token: AssetItemProps) => {
        if(tokenBalances[token.name]){
            setToken(token);
        } else {
            toast.error('No available banacle.')
        }
    };

    return (
        <>
            {token?.name && <TokenModal token={token} onClose={setToken} />}
            <div className="bg-dark py-8 px-10 rounded-lg overflow-scroll overflow-x-hidden scrolling">
                <h2 className="font-Inter font-semibold text-2xl pb-5">
                    Tokens
                </h2>
                <TokenComponent onSend={handleSend} />
            </div>
        </>
    );
};

export default Tokens;
