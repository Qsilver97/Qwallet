import { Link } from "react-router-dom";

import LoginContainer from "../Login/LoginContainer";
import Button from "../../components/commons/Button";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const SignUpChars = () => {
    const [backup, setBackup] = useState(false);

    const { seeds } = useAuth();

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
                    <p className="text-lg font-semibold font-Montserrat w-full text-center">
                        A new seed has been generated and needs to be securely
                        backed up. We highly recommend to write down on paper
                        for safe keeping
                    </p>

                    <p className="mx-auto text-base font-semibold font-Inter underline underline-offset-4">
                        {seeds}
                    </p>

                    <div className="flex items-center gap-5">
                        <input
                            type="checkbox"
                            name="makeBackup"
                            id="backup"
                            className="w-4 h-4"
                            checked={backup}
                            onChange={() => setBackup((prev) => !prev)}
                        />
                        <label
                            htmlFor="backup"
                            className="text-lg font-semibold font-Montserrat cursor-pointer"
                        >
                            I've made a backup
                        </label>
                    </div>

                    <div className="flex justify-center gap-8 lg:gap-20">
                        <Link
                            to={"/signup/options"}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button variant="primary" size="wide">
                                {" "}
                                Back
                            </Button>
                        </Link>

                        <Link
                            to={"/backup/55chars"}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button
                                variant="primary"
                                size="wide"
                                className={!backup ? "cursor-not-allowed" : "cursor-pointer"}
                                disable={!backup}
                            >
                                Next
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </LoginContainer>
    );
};

export default SignUpChars;
