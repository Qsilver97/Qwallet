import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import Input from "../components/common/Input";

const Login: React.FC = () => {

    const navigate = useNavigate();

    const [password, setPassword] = useState<string>();

    const [passwordInputType, setPasswordInputType] = useState<string>('password');

    const handleLogin = () => {
        console.log(password)
    }

    const handleCreate = () => {
        navigate('/create')
    }

    const handleRestore = () => {
        navigate('/restore')
    }

    const handlePasswordChange = (value: string) => {
        setPassword(value);
    }

    const handleEye = () => {
        setPasswordInputType((prev) => {
            if (prev == 'text') return 'password'
            else return 'text'
        })
    }

    return (
        <>
            <div className="bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                <img className="mx-auto" src="images/logo.png" width="100px" />
                <h2 className="my-[15px] mx-auto text-light dark:text-dark text-[2rem]">Login</h2>
                <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                    Enter your password to access your account.
                    <br />
                    Each password corresponds to a unique user account
                </div>
                <div className="relative">
                    <Input inputType={passwordInputType} onChange={handlePasswordChange} placeHolder="Password" />
                    <FontAwesomeIcon onClick={handleEye} icon={(passwordInputType == 'password' ? faEye : faEyeSlash)} className="absolute top-[15px] right-3 text-gray-500 cursor-pointer" />
                    {/* <p className="check-available">Password does not exist!</p> */}
                    <Button buttonValue="Login" onClick={handleLogin} />
                    <Button buttonValue="Create" onClick={handleCreate} />
                    <a className="text-[#007bff]" onClick={handleRestore}>Restore your wallet from your seed</a>
                </div>
            </div>
        </>
    )
}

export default Login;