import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Button from "../components/common/Button";

const Login: React.FC = () => {

    const handleLogin = () => {
        console.log('login')
    }

    const handleCreate = () => {
        console.log('create')
    }

    return (
        <>
            <div className="bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-[10px] p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                <img className="mx-auto" src="images/logo.png" width="100px" />
                <h2 className="my-[20px] mx-auto text-light dark:text-dark pb-[10px] text-[2rem]">Login</h2>
                <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                    Enter your password to access your account.
                    <br />
                    Each password corresponds to a unique user account
                </div>
                <div className="relative">
                    <input type="password" className="w-full p-[10px] mb-[30px] border-b border-white bg-transparent outline-none text-white text-[16px]" placeholder="Password" required />
                    <FontAwesomeIcon icon={faEye} className="absolute top-[10px] right-3 text-gray-500 cursor-pointer" />
                    {/* <p className="check-available">Password does not exist!</p> */}
                    <Button buttonValue="Login" onClick={handleLogin} />
                    <Button buttonValue="Create" onClick={handleCreate} />
                    <a href="#" className="text-[#007bff]">Restore your wallet from your seed</a>
                </div>
            </div>
        </>
    )
}

export default Login;