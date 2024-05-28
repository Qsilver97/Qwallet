import {
    Title,
    Section,
    Loading,
} from "../../components/commons";
import { assetsItems } from "../../utils/constants";
import Layout from "../../components/layout";
import MainContent from "../../components/layout/MainContent";
import TokenSelect from "../../components/dashboard/select/TokenSelect";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import TradingAside from "./TradingAside";
import { formatNumberWithCommas } from "../../utils/helper";
import { toast } from "react-toastify";

const tabs = ['Bids', 'Asks']

const Trading = () => {
    const { fetchTradingInfoPage, setTxStatus, tradingPageLoading, orders, tokens, currentToken, tokenBalances, currentAddress, handleTx } = useAuth();
    const [activeTab, setActiveTab] = useState<string>('Bids');

    const options = tokens.map((token) => {
        const item = assetsItems.find((k) => k.name == token) || assetsItems[0]
        return ({
            label: item.icon,
            value: token,
        })
    });

    const [command, setCommand] = useState<'buy' | 'sell' | 'cancelbuy' | 'cancelsell'>();
    const [quantity, setQuantity] = useState<string>('');
    const [price, setPrice] = useState<string>('');

    const handleBuySell = async () => {
        if (!quantity || !price || !command) {
            toast.error('Invalid command.');
            return;
        }
        await handleTx(command, quantity, price);
        setTxStatus("");
    }

    const handleAction = (bid: any) => {
        let command: "buy" | "sell" | "cancelbuy" | "cancelsell" | undefined = 'cancelsell';
        if (activeTab == 'Bids') {
            command = 'cancelbuy';
        }
        setTxStatus('confirm');
        setQuantity(bid[1]);
        setPrice(bid[2]);
        setCommand(command);
    }

    useEffect(() => {
        async function init() {
            const orders = await fetchTradingInfoPage();
            console.log(orders, 'fffffffff')
        }
        if (currentToken.value !== 'QU') {
            init();
        }
        let fetchInterval: ReturnType<typeof setInterval> | null = null;
        if (currentToken.value !== 'QU') {
            fetchInterval = setInterval(() => {
                init
            }, 60000)
        }
        return (() => {
            if (fetchInterval)
                clearInterval(fetchInterval)
        })
    }, [currentToken, activeTab])

    return (
        <>
            <Layout>
                <MainContent>
                    <Title
                        text="Trading"
                        iconUrl="/assets/images/sidebar/trading.svg"
                    />

                    <div className="space-y-2">
                        {
                            Array.isArray(options) && options.length > 0 &&
                            <div className="flex items-center gap-2">
                                <TokenSelect
                                    options={options}
                                    showSelectDescription
                                    hideTokenValue
                                />
                                <span className="text-2xl p-2 px-4 bg-slate-500 rounded-lg">{tokenBalances[`${currentToken.value}`] ? (tokenBalances[`${currentToken.value}`][currentAddress] || 0) : 0}</span>
                            </div>
                        }
                        {currentToken.value == 'QU' ? <div className="relative top-5 p-5">Switch to the other token to trade</div> :
                            <>
                                <div className="flex my-4">
                                    <span className="p-1 bg-slate-500 rounded">Issuer: {orders?.issuer}</span>
                                </div>
                                <div className="grid grid-cols-[70%_30%] gap-2">
                                    <div className="flex flex-col gap-2">
                                        <Section>
                                            <div className="flex justify-start gap-5 w-full h-7">
                                                {
                                                    tabs.map((item: string, idx) => {
                                                        return <span key={idx} className={`font-Inter text-xs text-white rounded-lg px-9 py-1.5 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in duration-100 cursor-pointer ${item == activeTab ? 'bg-blue-500' : 'bg-[#192b3b] hover:bg-blue-500'}`} onClick={() => setActiveTab(item)}>
                                                            {item}
                                                        </span>
                                                    })
                                                }
                                            </div>
                                            {tradingPageLoading && orders === undefined ?
                                                <Loading /> :
                                                <div className="flex flex-col">
                                                    <div className="-m-1.5 overflow-x-auto">
                                                        <div className="p-1.5 min-w-full inline-block align-middle">
                                                            <div className="overflow-hidden">
                                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                                                    <thead>
                                                                        {activeTab == 'Bids' &&
                                                                            <tr>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">No</th>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Buyer</th>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Quantity</th>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Price</th>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Action</th>
                                                                            </tr>
                                                                        }
                                                                        {activeTab == 'Asks' &&
                                                                            <tr>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">No</th>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Seller</th>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Quantity</th>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Price</th>
                                                                                <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Action</th>
                                                                            </tr>
                                                                        }
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700 font-Montserrat">
                                                                        {orders &&
                                                                            orders[activeTab.toLowerCase() as 'bids' | 'asks'].map((bid, idx) => {
                                                                                return <tr key={idx}>
                                                                                    <td className="px-1 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{idx + 1}</td>
                                                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 font-mono">{bid[0]}</td>
                                                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{formatNumberWithCommas(parseInt(bid[1]))}</td>
                                                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{formatNumberWithCommas(parseInt(bid[2]))}</td>
                                                                                    {
                                                                                        bid[0] == currentAddress &&
                                                                                        <td className="mx-1 my-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 cursor-pointer">
                                                                                            <span className="bg-slate-950 p-1 rounded hover:bg-slate-800" onClick={() => handleAction(bid)}>Cancel</span>
                                                                                        </td>
                                                                                    }
                                                                                </tr>
                                                                            })
                                                                        }
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </Section>
                                    </div>
                                    <TradingAside options={options} price={price} quantity={quantity} setPrice={setPrice} setQuantity={setQuantity} handleBuySell={handleBuySell} setCommand={setCommand} />
                                </div>
                            </>
                        }
                    </div>
                </MainContent>
            </Layout>
        </>
    );
};

export default Trading;
