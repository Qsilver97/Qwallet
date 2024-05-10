import { useAuth } from "../../../contexts/AuthContext";
import { Text } from "../../commons";

const TxFormsModal = () => {
    const { txId, expectedTick, txStatus } = useAuth();

    return (
        <div className="py-5 px-6 space-y-6 border-white/60 border rounded-2xl">
            {txStatus.includes('broadcast for tick') &&
                <div className="break-all">
                    Sending...
                    <br />
                    transactionId: {txId}<br />
                    expectedTick: {expectedTick}
                </div>
            }
            {txStatus.includes('no command pending') &&

                <div className="space-y-7 grid justify-center">
                    <img
                        src="assets/images/ui/checked-blue.svg"
                        alt="Checked Blue"
                        className="mx-auto"
                    />

                    <div className="space-y-5">
                        <Text className="text-2xl text-center">
                            Success
                        </Text>
                    </div>
                </div>
            }
        </div>
    );
};

export default TxFormsModal;
