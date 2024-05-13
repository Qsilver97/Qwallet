import { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";

const ActivityTable = () => {
    const { currentAddress } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [history, setHistory] = useState<any>();
    useEffect(() => {
        async function init() {
            try {
                setLoading(true);
                const resp = await axios.post(`${SERVER_URL}/api/history`, { address: currentAddress });
                console.log(resp.data);
                setHistory(resp.data);
            } catch (error) {

            }
        }
        init();
    }, []);
    const data = [
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
        {
            product: 'NTMG........................JLKS',
            txID: 1234567,
            address: 'NTMG........................JLKS',
            amount: 250
        },
    ]

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-[1fr_0.6fr_1fr_0.6fr] gap-x-4">
                <div className="font-medium font-Inter text-sm text-left text-dark-gray">TXID</div>
                <div className="font-medium font-Inter text-sm text-left text-dark-gray">TXID</div>
                <div className="font-medium font-Inter text-sm text-left text-dark-gray">ADDRESS</div>
                <div className="font-medium font-Inter text-sm text-left text-dark-gray">AMOUNT</div>
            </div>
            <div className="flex flex-col gap-6">
                {data.map(({ product, txID, address, amount }, index) => (
                    <div key={index} className="grid grid-cols-[min-content_0.6fr_1fr_0.6fr] gap-x-5">
                        <div className="font-semibold font-Inter">{product}</div>
                        <div className="font-semibold font-Inter">{txID}</div>
                        <div className="font-semibold font-Inter">{address}</div>
                        <div className="font-semibold font-Inter">{amount}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityTable
