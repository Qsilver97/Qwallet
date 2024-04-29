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
import { MODES, SERVER_URL, sideBarItems } from "../utils/constants";
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
    setSeedType: Dispatch<SetStateAction<"55chars" | "24words">>;
    setMode: Dispatch<SetStateAction<ModeProps>>;
    setCurrentAddress: Dispatch<SetStateAction<string>>;
    login: (password: string) => void;
    logout: () => void;
    create: () => void;
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
    const [seeds, setSeeds] = useState<string>("");
    const [socket, setSocket] = useState<Socket>();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [activeTabIdx, setActiveTabIdx] = useState(0);
    const [accountInfo, setAccountInfo] = useState<AccountInfoInterface>();

    const [tick, setTick] = useState("");
    const [balances, setBalances] = useState<Balances>({});
    const [tokenBalances, setTokenBalances] = useState<{
        [name: string]: Balances;
    }>({});
    const [marketcap, setMarketcap] = useState<MarketcapInterface>();
    const [tokens, setTokens] = useState<string[]>([]);
    const [richlist, setRichlist] = useState<RichListInterface>({});
    const [currentAddress, setCurrentAddress] = useState<string>("");

    const [password, setPassword] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(true);

    const login = async (password: string) => {
        if(password == "") {
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
        } catch (error) {}

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
            .catch(() => {});
    };

    const fetchInfo = async () => {
        let resp;
        try {
            resp = await axios.post(`${SERVER_URL}/api/fetch-user`);
        } catch (error) {}

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
        init();
    }, []);

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
                tokenBalances,
                currentAddress,
                handleAddAccount,
                setMode,
                setSeedType,
                handleClickSideBar,
                login,
                logout,
                toAccountOption,
                create,
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
