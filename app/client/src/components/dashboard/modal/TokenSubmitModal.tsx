import React from "react";
import { Text } from "../../commons";

type TokenSubmitModalProps = {
    amount: string;
    addressToSend: string;
    token: string;
};

const TokenSubmitModal: React.FC<TokenSubmitModalProps> = ({
    amount,
    addressToSend,
    token,
}) => {
    return (
        <div className="space-y-9">
            <Text weight="bold" size="lg" className="break-words">
                {addressToSend}
            </Text>

            <div className="space-y-7">
                <div className="flex justify-between items-center">
                    <label className="font-Inter text-regular text-sm mr-auto">
                        Address
                    </label>
                    <span className="w-40 font-Inter font-light text-xs break-words text-right">
                        {addressToSend}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <label className="font-Inter text-regular text-sm mr-auto">
                        Token
                    </label>
                    <span className="font-Inter font-light text-xs">
                        {token}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <label className="font-Inter text-regular text-sm mr-auto">
                        Amount
                    </label>
                    <span className="font-Inter font-light text-xs">
                        {amount}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TokenSubmitModal;
