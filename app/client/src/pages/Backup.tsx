import React, { useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import Input from "../components/common/Input";

const Backup: React.FC = () => {

    const [backuped, setBackuped] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleBackup = () => {
        setBackuped(!backuped)
    }

    const handleBack = () => {
        navigate('/create')
    }
    
    const handleNext = () => {
        navigate('/dashboard')
    }

    return (
        <>
            <div className="bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                <img className="mx-auto" src="images/logo.png" width="100px" />
                <h2 className="my-[15px] mx-auto text-light dark:text-dark text-[2rem]">Create an account</h2>
                <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                    A new seed has been generated and needs to be securely backed up. We highly recommend to write down on paper for safe keeping
                </div>
                <div className="relative">
                    <Input inputType={'text'} onChange={() => { }} placeHolder="" value={"asdf"} disabled={true} />
                    <div className="w-full flex gap-1">
                        <input type="checkbox" id="backup" onChange={handleBackup} checked={backuped} />
                        <label htmlFor="backup">I've Made a Backup</label>
                    </div>
                    <div className="flex gap-2">
                        <Button buttonValue="Back" onClick={handleBack} />
                        <Button buttonValue="Next" onClick={handleNext} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Backup;