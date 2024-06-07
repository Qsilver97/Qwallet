import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/commons/Button";
import Input from "../../components/commons/Input";
import LoginContainer from "./LoginContainer";
import { useAuth } from "../../contexts/AuthContext";
import { Text } from "../../components/commons";

const Login = () => {
    const { login, socket, setRecoverStatus } = useAuth();


    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [password, setPassword] = useState<string>("");

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        socket?.emit('passwordAvail', { command: `checkavail ${e.target.value}`, flag: 'checkavail' });
    };

    const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        login(password);
    };

    useEffect(() => {
        if (socket) {
            socket.on("passwordAvail", (msg: boolean) => {
                setIsPasswordValid(msg);
            });
        }
    }, [socket]);

    useEffect(() => {
        setRecoverStatus(false);
    }, [])

    return (
        <LoginContainer>
            <img
                src="/assets/images/tech-blocks-image.png"
                alt="Cloud technology communication"
                className="w-3/6 lg:w-auto"
            />

            <div className="w-2/5 flex flex-col gap-[60px]">
                <img src="/assets/images/logo.svg" alt="Logo" className="h-[50px] " />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-semibold tracking-tight">Login</h2>
                        <p className="text-sm text-zinc-400">
                        Enter password to login to an existing wallet.
                        </p>
                        <Input
                        //   label="Password"
                        label=""
                        inputId="password"
                        type="password"
                        onChange={handleChangePassword}
                        />
                        {isPasswordValid && password != "" && (
                        <Text
                            size="sm"
                            weight="semibold"
                            className="text-moonstoneBlue mt-4"
                        >
                            Password does not exist.
                        </Text>
                        )}

                        <Link to={"/dashboard"} className="mt-4">
                        <Button
                            variant="primary"
                            size="wide"
                            onClick={handleLogin}
                            disable={isPasswordValid || password == ""}
                            className={
                            isPasswordValid || password == "" ? "cursor-not-allowed" : ""
                            }
                        >
                            Login
                        </Button>
                        </Link>
                    </div>
                    <hr className="h-px my-12 bg-blue-200 border-0"></hr>
                    <div className="flex flex-col items-center gap-4">
                        <h2 className="text-3xl font-semibold tracking-tight">Register</h2>
                        <p className="text-sm text-zinc-400">
                        Create new wallet or import using seed.
                        </p>
                        <div className="flex justify-center items-center">
                            <br></br>
                            <Link to={"/signup"} className="inline-block w-full lg:w-fit">
                            <Button variant="outline" size="full">
                            Create new wallet
                            </Button>
                        </Link>
                        <span className="mx-4">or</span>

                        <Link to={"/signup"} className="inline-block w-full lg:w-fit">
                            <Button
                            variant="outline"
                            size="full"
                            onClick={() => {
                                setRecoverStatus(true);
                            }}
                            >
                            Restore your wallet from your seed
                            </Button>
                        </Link>
                        </div>
                    </div>   
                </div>
            </div>
        </LoginContainer>
    );
};

export default Login;
