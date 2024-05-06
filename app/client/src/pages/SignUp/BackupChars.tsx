import { useNavigate } from "react-router-dom";

import { Button, Text } from "../../components/commons";
import Container from "../Login/LoginContainer";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";

const BackupChars = () => {
    const { seeds, setSeeds, recoverStatus, restoreAccount } = useAuth();
    const navigate = useNavigate();

    const [backupSeeds, setBackupSeeds] = useState<string>("");

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBackupSeeds(e.target.value);
    };


    const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (recoverStatus) {
            restoreAccount()
        } else {
            navigate('/login')
        }
    };

    useEffect(() => {
        if (recoverStatus) {
            setSeeds(backupSeeds);
        }
    }, [backupSeeds])

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
                        onChange={handleChangePassword}
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
                        <div
                            // to={"/dashboard"}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button
                                variant="primary"
                                size="wide"
                                onClick={handleNext}
                                disable={seeds != backupSeeds}
                                className={seeds != backupSeeds ? "cursor-not-allowed" : "cursor-pointer"}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default BackupChars;
