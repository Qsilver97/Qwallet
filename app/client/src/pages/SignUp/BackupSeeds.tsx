import { Link } from "react-router-dom";

import LoginContainer from "../Login/LoginContainer";
import Button from "../../components/commons/Button";
import ColumnGrid from "./ColumnGrid";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";

const BackupSeeds = () => {
    // const [backup, setBackup] = useState(false);
    const { seeds } = useAuth();

    const [backupSeeds, setBackupSeeds] = useState<string[]>([]);

    function areArraysEqual(array1: string[], array2: string[]) {
        // Check if both arrays are the same length
        if (array1.length !== array2.length) {
            return false;
        }

        // Compare each element of the arrays
        for (let i = 0; i < array1.length; i++) {
            if (array1[i] !== array2[i]) {
                return false; // Return false if any elements do not match
            }
        }

        // If all elements are matched
        return true;
    }

    const handleInputSeed = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        console.log(e.target.value, idx, 'sss')
        const prevSeeds = [...backupSeeds];
        prevSeeds[idx] = e.target.value;
        setBackupSeeds(prevSeeds);
    }

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

                    <ColumnGrid inputValues handleInputSeed={handleInputSeed} />

                    <div className="flex justify-center gap-8 lg:gap-20">
                        <Link
                            to={"/signup/options"}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button variant="primary" size="wide">
                                Back
                            </Button>
                        </Link>

                        <Link
                            to={"/dashboard"}
                            className="inline-block w-full lg:w-fit"
                        >
                            <Button
                                variant="primary"
                                size="wide"
                                disable={typeof seeds == 'object' && !areArraysEqual(seeds, backupSeeds)}
                                className={typeof seeds == 'object' && !areArraysEqual(seeds, backupSeeds) ? 'cursor-not-allowed' : 'cursor-pointer'}
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

export default BackupSeeds;
