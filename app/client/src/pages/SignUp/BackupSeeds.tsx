import { useState } from "react";
import { Link } from "react-router-dom";

import LoginContainer from "../Login/LoginContainer";
import Button from "../../components/commons/Button";
import ColumnGrid from "./ColumnGrid";

const BackupSeeds = () => {
    const [backup, setBackup] = useState(false);

    return (
        <LoginContainer>
            <img
                src="/assets/images/tech-blocks-image.png"
                alt="Cloud technology communication"
                className="w-3/6 lg:w-auto"
            />

            <div className="w-full flex flex-col gap-[60px]">
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

                    <ColumnGrid inputValues />

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
                            to={"/dashboard"}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button variant="primary" size="wide">
                                Next
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </LoginContainer>
    );
};

export default BackupSeeds;
