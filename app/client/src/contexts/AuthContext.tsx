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
import { ModeProps } from "../utils/interfaces";
import { toast } from "react-toastify";

interface AuthContextType {
    isAuthenticated: boolean;
    activeTabIdx: number;
    socket: Socket | undefined;
    seedType: string;
    setSeedType: Dispatch<SetStateAction<"55chars" | "24words">>;
    login: (password: string) => void;
    logout: () => void;
    create: () => void;
    toAccountOption: (password: string, confirmPassword: string) => void;
    handleClickSideBar: (idx: number) => void;
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

    const [tick, setTick] = useState("");
    const [balances, setBalances] = useState(0);

    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const login = (password: string) => {
        if (!password || !confirmPassword) {
            toast.error("Password Invalid");
            return;
        }

        axios
            .post(`${SERVER_URL}/api/login`, {
                password,
                socketUrl: mode.wsUrl,
            })
            .then(() => {
                setIsAuthenticated(true);
            })
            .catch(() => {
                toast.error("Couldn't log in");
                setIsAuthenticated(false);
            })
            .finally(() => { });
    };

    const toAccountOption = (password: string, confirmPassword: string) => {
        if (!(password === confirmPassword) || !password || !confirmPassword) {
            toast.error("Password Invalid");
            return;
        }

        setPassword(password);
        setConfirmPassword(confirmPassword);

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

    const logout = () => {
        setIsAuthenticated(false);
        navigate("/login");
    };

    const handleClickSideBar = (idx: number) => {
        console.log(idx);
        setActiveTabIdx(idx);
        navigate(sideBarItems[idx].link);
    };

    useEffect(() => {
        const newSocket = io(wsUrl);
        setSocket(newSocket);

        newSocket.on("live", (data) => {
            console.log(data, "all");
            if (data.command == "CurrentTickInfo") {
                // dispatch(setTick(data.tick));
            } else if (data.command == "EntityInfo") {
                console.log(data.balance, 1);
                // dispatch(setBalances({ [data.address]: parseFloat(data.balance) }));
            } else if (data.balances) {
                console.log(data.balances, 2);
                data.balances.map((item: [number, string]) => {
                    // dispatch(setBalances({ index: item[0], balance: item[1] }));
                });
            } else if (data.richlist) {
                console.log(data.richlist, 3);
                // dispatch(updateRichlist(data));
            } else if (data.marketcap) {
                console.log(data.marketcap, 4);
            }
        });

        return () => {
            newSocket.close();
        };
    }, [wsUrl]);

    return (
        <AuthContext.Provider
            value={{
                socket,
                isAuthenticated,
                activeTabIdx,
                seedType,
                setSeedType,
                handleClickSideBar,
                login,
                logout,
                toAccountOption,
                create,
            }}
        >
            {children}
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
