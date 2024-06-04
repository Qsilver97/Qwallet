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
import { EXPECTEDTICKGAP, MODES, SERVER_URL, assetsItems, sideBarItems } from "../utils/constants";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import {
    AccountInfoInterface,
    MarketcapInterface,
    ModeProps,
    OrderInterface,
    RichListInterface,
    TokenPriceInterface,
} from "../utils/interfaces";
import { toast } from "react-toastify";
import { Loading } from "../components/commons";
import { TokenOption } from "../components/commons/Select";

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
    portfolio: Balances;
    totalBalance: string;
    recoverStatus: boolean;
    mode: ModeProps;
    tokenOptions: TokenOption[];
    currentToken: TokenOption;
    orders: OrderInterface | undefined;
    tradingPageLoading: boolean;
    txStatus: string;
    tokenPrices: TokenPriceInterface;
    txWasmStatus: any;
    txSocketStatus: any;
    txLoading: boolean;
    txModalStatus: 'middle' | 'bottom' | 'closed' | string;
    setTxModalStatus: Dispatch<SetStateAction<'middle' | 'bottom' | 'closed' | string>>;
    setTxStatus: Dispatch<SetStateAction<string>>;
    setCurrentToken: Dispatch<SetStateAction<TokenOption>>;
    fetchTradingInfoPage: (token?: string) => Promise<void>;
    setRecoverStatus: Dispatch<SetStateAction<boolean>>;
    setSeedType: Dispatch<SetStateAction<"55chars" | "24words">>;
    setMode: Dispatch<SetStateAction<ModeProps>>;
    setSeeds: Dispatch<SetStateAction<string | string[]>>;
    setCurrentAddress: Dispatch<SetStateAction<string>>;
    login: (password: string) => void;
    updateUserState: (data: any) => void;
    logout: () => void;
    create: () => void;
    restoreAccount: () => void;
    handleAddAccount: () => void;
    handleTx: (flag: 'buy' | 'sell' | 'cancelbuy' | 'cancelsell' | 'send', amount: string, price: string, toAddress?: string, token?: string) => Promise<void>;
    toAccountOption: (password: string, confirmPassword: string) => void;
    handleClickSideBar: (idx: number) => void;
}
interface Balances {
    [address: string]: bigint;
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
    const [totalBalance, setTotalBalance] = useState<string>('0');
    const [tokenPrices, setTokenprices] = useState<TokenPriceInterface>({});
    // const [totalBalance, setTotalBalance] = useState<string>('0');
    const [portfolio, setPortfolio] = useState<any>({})

    const [tick, setTick] = useState("0");
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
    const [txWasmStatus, setTxWasmStatus] = useState<any>();
    const [txSocketStatus, setTxSocketStatus] = useState<any>();
    const [txLoading, setTxLoading] = useState<boolean>(false);
    const [txModalStatus, setTxModalStatus] = useState<'middle' | 'bottom' | 'closed' | string>('closed');

    const tokenOptions: TokenOption[] = assetsItems.map((item) => ({
        label: item.icon,
        value: item.name,
    }));

    const [currentToken, setCurrentToken] = useState<TokenOption>(tokenOptions[1]);

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
            setIsAuthenticated(resp.data.userState.isAuthenticated);
            setPassword(resp.data.userState.password);
            setAccountInfo(resp.data.userState.accountInfo);
            setTick(resp.data.networkResp.latest);
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

    const updateUserState = (data: any) => {
        axios.post(`${SERVER_URL}/api/update-userstate`, data)
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
                            [data.accountInfo?.addresses[item[0]]]: BigInt(
                                item[1]
                            ),
                        };
                    });
            });
            setMarketcap(data.marketcap);
            setTokenprices({ ...data.tokenPrices, 'QU': [1, 1] });
            setTokens(["QU", ...(data?.tokens || [])]);
            setRichlist(data.richlist);
            setTick(data.networkResp.latest)
            console.log(data, 'bbbbbbbbbbbbbbbbbb')
        } else {
        }
    };

    const fetchTradingInfoPage = async (token?: string): Promise<any> => {
        setTradingPageLoading(true);
        let _token = currentToken.value;
        if (token) _token = token;
        let orders;
        try {
            const resp = await axios.post(`${SERVER_URL}/api/trading-page-info`, {
                token: _token
            });
            console.log(resp.data, _token, 'fffffffffffffffffffffffff')
            if (resp.data.error) {
                console.log(resp.data, _token);
            } else {
                orders = resp.data;
            }
        } catch (error) {

        }
        setOrders(orders)
        setTradingPageLoading(false);
        return orders;
    }

    const handleTx = async (flag: 'buy' | 'sell' | 'cancelbuy' | 'cancelsell' | 'send', amount: string, price: string, toAddress?: string, token?: string): Promise<any> => {
        setTxLoading(true);
        let tokenName = currentToken.value;
        if (token) {
            tokenName = token;
        }
        try {
            await axios.post(`${SERVER_URL}/api/send-tx`, {
                flag,
                password,
                index: accountInfo?.addresses.indexOf(currentAddress),
                tick: tick + EXPECTEDTICKGAP,
                currentToken: tokenName,
                amount,
                price,
                toAddress
            })
            toast.success('Sent tx');
            setTxModalStatus('middle');
        } catch (error) {
            toast.error('Internal Server Error');
        } finally {
            setTxLoading(false);
        }
    }

    useEffect(() => {
        const newSocket = io(wsUrl);
        setSocket(newSocket);

        newSocket.on("live", (data) => {
            if (data.command == "CurrentTickInfo") {
                setTick(data.tick);
            } else if (data.command == "EntityInfo") {
                // console.log(data.balance, 1);
                if (data.address)
                    setBalances((prev) => {
                        return {
                            ...prev,
                            [data.address]: BigInt(data.balance),
                        };
                    });
                if (data.tokens) {
                    data.tokens.map((item: [string, string]) => {
                        setTokenBalances((prev) => { return { ...prev, [item[0]]: { [data.address]: BigInt(item[1]) } } })
                    })
                }
            } else if (data.balances) {
                setTotalBalance(data.total);
                data.balances.map((item: [number, string]) => {
                    if (data[0])
                        setBalances((prev) => {
                            return { ...prev, [data[0]]: BigInt(item[1]) };
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

        newSocket.on('txWasmStatus', (data) => {
            console.log('txWasmStatus', data);
            setTxWasmStatus(data);
        });

        newSocket.on('txSocketStatus', (data) => {
            console.log('txSocketStatus', data);
            setTxSocketStatus(data);
            if (data.txStatus.status) {
                fetchTradingInfoPage(data.currentToken);
            }
        })

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
        updateUserState({ currentAddress })
    }, [currentAddress])

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

    useEffect(() => {
        let tmp: Balances = {};
    
        Object.keys(tokenBalances).forEach((token) => {
            const tokenPrice = BigInt(tokenPrices?.[token]?.[0] || 0);
    
            Object.keys(tokenBalances[token]).forEach((addr) => {
                const balance = BigInt(tokenBalances?.[token]?.[addr] || 0);
                
                if (tmp[addr] !== undefined) {
                    tmp[addr] += balance * tokenPrice;
                } else {
                    tmp[addr] = balance * tokenPrice;
                }
    
                console.log(addr, balance, tokenPrice, tmp[addr]);
            });
        });
    
        setPortfolio(tmp);
    }, [tokenBalances, tokenPrices]);

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
                portfolio,
                mode,
                tokenBalances,
                currentAddress,
                recoverStatus,
                currentToken,
                tokenOptions,
                orders,
                tradingPageLoading,
                txStatus,
                tokenPrices,
                txWasmStatus,
                txSocketStatus,
                txLoading,
                txModalStatus,
                setTxModalStatus,
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
                handleTx,
                toAccountOption,
                create,
                restoreAccount,
                setCurrentAddress,
                updateUserState,
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
