import React, { useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import Radio from "../components/common/Radio";
import Input from "../components/common/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Create: React.FC = () => {
    const navigate = useNavigate();
    const [seedType, setSeedType] = useState<string>('22words');
    const [passwordInputType, setPasswordInputType] = useState<string>('password');

    const handleCreate = () => {
        navigate(`/backup?seedType=${seedType}`)
    }

    const handlePassword = () => {

    }

    const handleConfirmPassword = () => {

    }

    const handleSeedType = (value: string) => {
        setSeedType(value);
    }

    const handleEye = () => {
        setPasswordInputType((prev) => {
            if (prev == 'text') return 'password'
            else return 'text'
        })
    }

    const handleBack = () => {
        navigate('/login')
    }

    return (
        <>
            <div className="bg-light w-full dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                <img className="mx-auto" src="images/logo.png" width="100px" />
                <h2 className="my-[15px] mx-auto text-light dark:text-dark text-[2rem]">Create</h2>
                <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                    There are two ways to create your account.
                </div>
                <div className="relative">
                    <div className="flex justify-evenly mb-3">
                        <Radio
                            label="22 Words"
                            name="options"
                            value="22words"
                            checked={seedType === '22words'}
                            onChange={handleSeedType}
                        />
                        <Radio
                            label="55 Chars"
                            name="options"
                            value="55chars"
                            checked={seedType === '55chars'}
                            onChange={handleSeedType}
                        />
                    </div>
                    {/* <p className="check-available">Password does not exist!</p> */}
                    <div className="relative">
                        <Input inputType={passwordInputType} onChange={handlePassword} placeHolder="Password" />
                        <FontAwesomeIcon onClick={handleEye} icon={(passwordInputType == 'password' ? faEye : faEyeSlash)} className="absolute top-[15px] right-3 text-gray-500 cursor-pointer" />
                        <Input inputType={passwordInputType} onChange={handleConfirmPassword} placeHolder="Confirm password" />
                    </div>
                    <div className="flex gap-2">
                        <Button buttonValue="Back" onClick={handleBack} />
                        <Button buttonValue="Create" onClick={handleCreate} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Create;