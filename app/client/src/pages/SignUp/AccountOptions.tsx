import { Link } from "react-router-dom";

import Button from "../../components/commons/Button";
import { useAuth } from "../../contexts/AuthContext";
import LoginContainer from "../Login/LoginContainer";

const AccountOptions = () => {
    const { create, setSeedType, seedType } = useAuth();

    const handleCheckboxChange = (seed: "24words" | "55chars") => {
        setSeedType(seed);
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
                    <p className="text-lg font-semibold font-Montserrat">
                        There are two ways to create your account.
                    </p>

                    <div className="flex justify-center lg:justify-start lg:ml-14 gap-16">
                        <div className="flex items-center gap-5 accent-dark-blue">
                            <input
                                type="radio"
                                name="accountOption"
                                id="24words"
                                className="w-5 h-5 cursor-pointer"
                                checked={seedType === "24words"}
                                onChange={() => handleCheckboxChange("24words")}
                            />
                            <label
                                htmlFor="24words"
                                className="text-base font-semibold font-Inter cursor-pointer"
                            >
                                24 Words
                            </label>
                        </div>
                        <div className="flex items-center gap-5 accent-dark-blue">
                            <input
                                type="radio"
                                name="accountOption"
                                id="55chars"
                                className="w-5 h-5 cursor-pointer"
                                checked={seedType === "55chars"}
                                onChange={() => handleCheckboxChange("55chars")}
                            />
                            <label
                                htmlFor="55chars"
                                className="text-base font-semibold font-Inter cursor-pointer"
                            >
                                55 Chars
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-start md:ml-6 lg:ml-6 gap-6 md:gap-10 lg:gap-20">
                        <Link
                            to={`/signup`}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button variant="primary" size="wide">
                                Back
                            </Button>
                        </Link>

                        <a
                            className="inline-block w-full lg:w-fit cursor-pointer"
                            onClick={create}
                        >
                            <Button variant="primary" size="wide">
                                Next
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </LoginContainer>
    );
};

export default AccountOptions;
