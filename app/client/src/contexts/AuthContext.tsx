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
    RichListInterface,
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
    totalBalance: string;
    recoverStatus: boolean;
    mode: ModeProps;
    tokenOptions: TokenOption[];
    currentToken: TokenOption;
    setCurrentToken: Dispatch<SetStateAction<TokenOption>>;
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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
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

    const tokenOptions: TokenOption[] = assetsItems.map((item) => ({
        label: item.icon,
        value: item.name,
    }));

    const [currentToken, setCurrentToken] = useState<TokenOption>(tokenOptions[0]);

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
            console.log(data, 'aaaaaaaaaaaaaaaaaaaaa')
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
                setCurrentToken,
                setRecoverStatus,
                setSeeds,
                handleAddAccount,
                setMode,
                setSeedType,
                handleClickSideBar,
                login,
                logout,
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
