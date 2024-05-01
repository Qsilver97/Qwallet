import { Link } from "react-router-dom";

import LoginContainer from "../Login/LoginContainer";
import Input from "../../components/commons/Input";
import Button from "../../components/commons/Button";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Text } from "../../components/commons";

const SignUp = () => {
    const { toAccountOption, socket } = useAuth();

    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        socket?.emit('passwordAvail', { command: `checkavail ${e.target.value}`, flag: 'checkavail' });
    };

    const handleConfirmPasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setConfirmPassword(e.target.value);
    };

    const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        toAccountOption(password, confirmPassword);
    };

    useEffect(() => {
        if (socket) {
            socket.on("passwordAvail", (msg: boolean) => {
                setIsPasswordValid(msg);
            });
        }
    }, [socket]);

    return (
        <LoginContainer>
            <img
                src="/assets/images/tech-blocks-image.png"
                alt="Cloud technology communication"
                className="w-3/6 lg:w-auto"
            />

            <div className="w-2/5 flex flex-col gap-[60px]">
                <img
                    src="/assets/images/logo.svg"
                    alt="Logo"
                    className="h-[50px] self-start"
                />

                <div className="flex flex-col gap-12">
                    <div>
                        <Input
                            label="Password"
                            inputId="password"
                            type="password"
                            onChange={handlePasswordChange}
                        />
                        {!isPasswordValid && (
                            <Text
                                size="sm"
                                weight="semibold"
                                className="text-moonstoneBlue mt-4"
                            >
                                Password already exist.
                            </Text>
                        )}
                    </div>

                    <div>
                        <Input
                            label="Confirm Password"
                            inputId="confirmPassword"
                            type="password"
                            onChange={handleConfirmPasswordChange}
                        />
                        {password != confirmPassword && (
                            <Text
                                size="sm"
                                weight="semibold"
                                className="text-moonstoneBlue mt-4"
                            >
                                Password does not match.
                            </Text>
                        )}
                    </div>

                    <div className="flex justify-center gap-8 lg:gap-20">
                        <Link
                            to={"/login"}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button variant="primary" size="wide">
                                Login
                            </Button>
                        </Link>

                        <a className="inline-block w-full lg:w-fit">
                            <Button
                                variant="primary"
                                size="wide"
                                onClick={handleNext}
                                disable={!isPasswordValid || password == '' || confirmPassword == '' || (password != confirmPassword)}
                                className={!isPasswordValid || password == '' || confirmPassword == '' || (password != confirmPassword) ? 'cursor-not-allowed' : ''}
                            >
                                Next
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </LoginContainer>
    );
};

export default SignUp;
