import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
    Dispatch,
    SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import { MODES, SERVER_URL, assetsItems, sideBarItems } from "../utils/constants";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import {
    AccountInfoInterface,
    MarketcapInterface,
    ModeProps,
    OrderInterface,
    RichListInterface,
} from "../utils/interfaces";
import { toast } from "react-toastify";
import { Loading } from "../components/commons";
import { TokenOption } from "../components/commons/Select";
import { mockOrders } from "../utils/mock";

interface AuthContextType {
    isAuthenticated: boolean;
    activeTabIdx: number;
    socket: Socket | undefined;
    seedType: string;
    seeds: string | string[];
    accountInfo: AccountInfoInterface | undefined;
    marketcap: MarketcapInterface | undefined;
    tokens: string[];
    tick: string;
    balances: Balances;
    richlist: RichListInterface;
    currentAddress: string;
    tokenBalances: { [name: string]: Balances };
    totalBalance: string;
    recoverStatus: boolean;
    mode: ModeProps;
    tokenOptions: TokenOption[];
    currentToken: TokenOption;
    orders: OrderInterface | undefined;
    tradingPageLoading: boolean;
    txStatus: string;
    txId: string;
    expectedTick: number;
    setTxStatus: Dispatch<SetStateAction<string>>;
    setCurrentToken: Dispatch<SetStateAction<TokenOption>>;
    fetchTradingInfoPage: () => Promise<void>;
    setRecoverStatus: Dispatch<SetStateAction<boolean>>;
    setSeedType: Dispatch<SetStateAction<"55chars" | "24words">>;
    setMode: Dispatch<SetStateAction<ModeProps>>;
    setSeeds: Dispatch<SetStateAction<string | string[]>>;
    setCurrentAddress: Dispatch<SetStateAction<string>>;
    login: (password: string) => void;
    logout: () => void;
    create: () => void;
    restoreAccount: () => void;
    handleAddAccount: () => void;
    handleBuyCell: (flag: 'buy' | 'sell' | 'cancelbuy' | 'cancelsell', amount: string, price: string) => Promise<void>;
    toAccountOption: (password: string, confirmPassword: string) => void;
    handleClickSideBar: (idx: number) => void;
}
interface Balances {
    [address: string]: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
    wsUrl: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
    children,
    wsUrl,
}) => {
    const navigate = useNavigate();

    const [mode, setMode] = useState<ModeProps>(MODES[0]);
    const [seedType, setSeedType] = useState<"55chars" | "24words">("24words");
    const [seeds, setSeeds] = useState<string | string[]>("");
    const [socket, setSocket] = useState<Socket>();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [activeTabIdx, setActiveTabIdx] = useState(0);
    const [accountInfo, setAccountInfo] = useState<AccountInfoInterface>();
    const [totalBalance, _] = useState<string>('0');
    // const [totalBalance, setTotalBalance] = useState<string>('0');

    const [tick, setTick] = useState("");
    const [balances, setBalances] = useState<Balances>({});
    const [tokenBalances, setTokenBalances] = useState<{
        [name: string]: Balances;
    }>({});
    const [marketcap, setMarketcap] = useState<MarketcapInterface>();
    const [tokens, setTokens] = useState<string[]>([]);
    const [richlist, setRichlist] = useState<RichListInterface>({});
    const [currentAddress, setCurrentAddress] = useState<string>("");
    const [recoverStatus, setRecoverStatus] = useState<boolean>(false);

    // trading page
    const [orders, setOrders] = useState<OrderInterface>();
    const [tradingPageLoading, setTradingPageLoading] = useState<boolean>(false);
    const [txStatus, setTxStatus] = useState<string>("");
    const [txInterval, setTxInterval] = useState<any>();
    const [txId, setTxId] = useState<string>("");
    const [expectedTick, setExpectedTick] = useState<number>(0);

    const tokenOptions: TokenOption[] = assetsItems.map((item) => ({
        label: item.icon,
        value: item.name,
    }));

    const [currentToken, setCurrentToken] = useState<TokenOption>(tokenOptions[5]);

    const [password, setPassword] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);

    const login = async (password: string) => {
        if (password == "") {
            return
        }
        setLoading(true);
        if (!password) {
            toast.error("Password Invalid");
            return;
        }
        let resp;
        try {
            resp = await axios.post(`${SERVER_URL}/api/login`, {
                password,
                socketUrl: mode.wsUrl,
            });
        } catch (error) { }

        if (resp && resp.status == 200) {
            setIsAuthenticated(resp.data.isAuthenticated);
            setPassword(resp.data.password);
            setAccountInfo(resp.data.accountInfo);
            await fetchInfo();
        } else {
            toast.error("Couldn't log in");
            setIsAuthenticated(false);
        }
        setLoading(false);
    };

    const logout = () => {
        axios
            .post(`${SERVER_URL}/api/logout`)
            .then((resp) => {
                setIsAuthenticated(resp.data.isAuthenticated);
                setPassword(resp.data.password);
                setAccountInfo(resp.data.accountInfo);
            })
            .catch(() => {
                toast.error("Can't logout");
            });
        // navigate("/login");
    };

    const toAccountOption = (password: string, confirmPassword: string) => {
        if (!(password === confirmPassword) || !password || !confirmPassword) {
            toast.error("Password Invalid");
            return;
        }

        setPassword(password);
        navigate("/signup/options");
    };

    const create = () => {
        let passwordPrefix = "";
        console.log(seedType);

        if (seedType == "55chars") passwordPrefix = "Q";

        axios
            .post(`${SERVER_URL}/api/ccall`, {
                command: `login ${passwordPrefix}${password}`,
                flag: `create`,
            })
            .then((res: any) => {
                console.log(res);
                if (
                    res.data.value.result == 0 &&
                    res.data.value.seedpage == 1
                ) {
                    const seeds = res.data.value.display.split(" ");
                    if (seeds.length == 1) {
                        setSeeds(seeds[0]);
                    } else {
                        setSeeds(seeds);
                    }
                }
                navigate(`signup/${seedType}`);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleClickSideBar = (idx: number) => {
        console.log(idx);
        setActiveTabIdx(idx);
        navigate(sideBarItems[idx].link);
    };

    const handleAddAccount = () => {
        let index = accountInfo?.addresses.findIndex((item) => item == "");
        if (index == -1) {
            index = accountInfo?.addresses.length;
        }
        axios
            .post(`${SERVER_URL}/api/add-account`, {
                password: password,
                index,
            })
            .then((resp) => {
                setIsAuthenticated(resp.data.isAuthenticated);
                setPassword(resp.data.password);
                setAccountInfo(resp.data.accountInfo);
                // fetchInfo()
            })
            .catch(() => { });
    };

    const restoreAccount = () => {
        axios
            .post(`${SERVER_URL}/api/restore`, {
                password,
                seedType,
                seeds
            })
            .then((resp) => {
                console.log(resp.data);
            })
            .catch((error) => {
                console.log(error.response);
            })
            .finally(() => {
                navigate('/login');
            })
    }

    const fetchInfo = async () => {
        let resp;
        try {
            resp = await axios.post(`${SERVER_URL}/api/fetch-user`);
        } catch (error) { }

        if (resp && resp.status == 200) {
            const data = resp.data;
            setIsAuthenticated(data.isAuthenticated);
            setPassword(data.password);
            setAccountInfo(data.accountInfo);
            data.balances?.map((item: [number, string]) => {
                if (data.accountInfo?.addresses[item[0]])
                    setBalances((prev) => {
                        return {
                            ...prev,
                            [data.accountInfo?.addresses[item[0]]]: parseFloat(
                                item[1]
                            ),
                        };
                    });
            });
            setMarketcap(data.marketcap);
            setTokens(["QU", ...(data?.tokens || [])]);
            setRichlist(data.richlist);
        } else {
        }
    };

    const fetchTradingInfoPage = async (): Promise<any> => {
        setTradingPageLoading(true);
        // let orders;
        // try {
        //     const resp = await axios.post(`${SERVER_URL}/api/trading-page-info`, {
        //         token: currentToken.value
        //     });
        //     orders = resp.data;
        // } catch (error) {
        //     orders = [];
        // }
        setOrders(mockOrders)
        setTradingPageLoading(false);
        return mockOrders;
    }

    const handleBuyCell = async (flag: 'buy' | 'sell' | 'cancelbuy' | 'cancelsell', amount: string, price: string): Promise<any> => {
        await axios.post(`${SERVER_URL}/api/buy-cell`, {
            flag,
            password,
            index: accountInfo?.addresses.indexOf(currentAddress),
            tick: parseInt(tick) + 10,
            currentToken: currentToken.value,
            amount,
            price,
        }).then(() => {
            const _statusInterval = setInterval(() => {
                axios.post(
                    `${SERVER_URL}/api/tx-status`
                ).then((resp) => {
                    console.log(resp.data);
                    if (resp.data.value.result == '0') {
                    } else if (resp.data.value.result == '1') {
                        setTxStatus(resp.data.value.display);
                    } else {
                    }
                }).catch(() => {
                })
            }, 2000)
            setTxInterval(_statusInterval);
        }).catch(() => {

        })
    }

    useEffect(() => {
        if (txStatus.includes('broadcast for tick')) {
            const sendingResultSplit = txStatus.split(' ');
            setTxId(sendingResultSplit[1]);
            setExpectedTick(parseInt(sendingResultSplit[sendingResultSplit.length - 1]));
        } else if (txStatus.includes('no command pending')) {
            clearInterval(txInterval);
        }
    }, [txStatus])

    useEffect(() => {
        const newSocket = io(wsUrl);
        setSocket(newSocket);

        newSocket.on("live", (data) => {
            if (data.command == "CurrentTickInfo") {
                setTick(data.tick);
            } else if (data.command == "EntityInfo") {
                console.log(data.balance, 1);
                if (data.address)
                    setBalances((prev) => {
                        return {
                            ...prev,
                            [data.address]: parseFloat(data.balance),
                        };
                    });
            } else if (data.balances) {
                data.balances.map((item: [number, string]) => {
                    if (data[0])
                        setBalances((prev) => {
                            return { ...prev, [data[0]]: parseFloat(item[1]) };
                        });
                });
            } else if (data.richlist) {
                setRichlist((prev) => {
                    return { ...prev, [data.name]: data.richlist };
                });
            } else if (data.marketcap) {
                console.log(data.marketcap, 4);
            }
        });

        return () => {
            newSocket.close();
        };
    }, [wsUrl]);

    useEffect(() => {
        setTokenBalances((prev) => {
            return { ...prev, QU: balances };
        });
    }, [balances]);

    useEffect(() => {
        if (accountInfo) setCurrentAddress(accountInfo.addresses[0]);
    }, [accountInfo]);

    useEffect(() => {
        async function init() {
            await login(password);
        }
        init();
    }, [mode]);

    useEffect(() => {
        async function init() {
            setLoading(true);
            await fetchInfo();
            setLoading(false);
        }
        if (isAuthenticated)
            init();
    }, [isAuthenticated]);

    useEffect(() => {
        async function checkAuthenticated() {
            setLoading(true);
            try {
                const resp = await axios
                    .post(`${SERVER_URL}/api/check-authenticated`, () => {
                    })
                if (resp.status == 200) {
                    setIsAuthenticated(true)
                }
            } catch (error) {

            }
            setLoading(false);
        }
        checkAuthenticated();
    }, [])

    return (
        <AuthContext.Provider
            value={{
                socket,
                isAuthenticated,
                activeTabIdx,
                seedType,
                seeds,
                marketcap,
                tokens,
                accountInfo,
                richlist,
                tick,
                balances,
                totalBalance,
                mode,
                tokenBalances,
                currentAddress,
                recoverStatus,
                currentToken,
                tokenOptions,
                orders,
                tradingPageLoading,
                txStatus,
                txId,
                expectedTick,
                setTxStatus,
                fetchTradingInfoPage,
                setCurrentToken,
                setRecoverStatus,
                setSeeds,
                handleAddAccount,
                setMode,
                setSeedType,
                handleClickSideBar,
                login,
                logout,
                handleBuyCell,
                toAccountOption,
                create,
                restoreAccount,
                setCurrentAddress,
            }}
        >
            {loading ? <Loading /> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
