import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, Text } from "../../components/commons";
import Container from "../Login/LoginContainer";

const BackupChars = () => {
    // const { login } = useAuth();
    const navigate = useNavigate();

    const [password, setPassword] = useState<string>("");

    // const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setPassword(e.target.value);
    // };

    const handleLogin = () => {
        console.log(password);
    };

    return (
        <Container>
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

                <Text size="lg" weight="semibold">
                    Please enter the backup seeds you have saved.
                </Text>

                <div className="flex flex-col gap-12">
                    <input
                        type="text"
                        placeholder="Input seeds you have just created"
                        className="bg-transparent border-b border-white pl-2.5 py-1 outline-none"
                    />

                    <div className="flex justify-center gap-8 lg:gap-20">
                        <a
                            className="inline-block w-full lg:w-fit"
                            onClick={() => navigate(-1)}
                        >
                            <Button variant="primary" size="wide">
                                Back
                            </Button>
                        </a>
                        <Link
                            to={"/dashboard"}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button
                                variant="primary"
                                size="wide"
                                onClick={handleLogin}
                            >
                                Next
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default BackupChars;
