import { Link } from "react-router-dom";

import LoginContainer from "../Login/LoginContainer";
import Input from "../../components/commons/Input";
import Button from "../../components/commons/Button";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const SignUp = () => {
    const { toAccountOption } = useAuth();

    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setConfirmPassword(e.target.value);
    };

    const handleNext = () => {
        toAccountOption(password, confirmPassword);
    };

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
                    <Input
                        label="Password"
                        inputId="password"
                        type="password"
                        onChange={handlePasswordChange}
                    />
                    <Input
                        label="Confirm Password"
                        inputId="confirmPassword"
                        type="password"
                        onChange={handleConfirmPasswordChange}
                    />

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
