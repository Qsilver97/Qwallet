import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import { UserDetailType, useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setIsAuthenticated, setPassword } from "../redux/appSlice";
import axios from "axios";
import { SERVER_URL } from "../utils/constants";
import { toast } from "react-toastify";

const Login: React.FC = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const socket = useSocket();
    const auth = useAuth();

    const { password } = useSelector((state: RootState) => state.app);
    const [passwordStatus, setPasswordStatus] = useState<boolean>();

    const [passwordInputType, setPasswordInputType] = useState<string>('password');
    const [loginWaiting, setLoginWaiting] = useState<boolean>(false);

    const handleLogin = () => {
        setLoginWaiting(true);
        if (password != "") {
            dispatch(setIsAuthenticated(null));
            axios.post(
                `${SERVER_URL}/api/login`,
                {
                    password
                }
            ).then((resp) => {
                console.log(resp.data)
                const userInfo: UserDetailType = resp.data;
                dispatch(setIsAuthenticated(true));
                auth.login(userInfo);
                navigate('/dashboard');
            }).catch((error) => {
                toast.error(error.response.data);
                dispatch(setIsAuthenticated(false));
            }).finally(() => {
                setLoginWaiting(false);
            })
        } else {
            toast.error('Incorrect password.');
        }
    }

    const handleCreate = () => {
        navigate('/create');
    }

    const handleRestore = () => {
        // navigate('/restore');
    }

    const handlePasswordChange = (value: string) => {
        dispatch(setPassword(value));
    }

    const handleEye = () => {
        setPasswordInputType((prev) => {
            if (prev == 'text') return 'password'
            else return 'text'
        })
    }

    useEffect(() => {
        if (password != "")
            socket?.emit('passwordAvail', { command: `checkavail ${password}`, flag: 'passwordAvail' });
    }, [password])

    useEffect(() => {
        dispatch(setPassword(""));
    }, [])

    useEffect(() => {
        if (socket) {
            socket.on('passwordAvail', (msg: boolean) => {
                setPasswordStatus(msg);
            })
        }
    }, [socket])

    return (
        <>
            <div className={`bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0`}>
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
                    {passwordStatus &&
                        <p className="w-full text-left text-red-600">Password does not exist.</p>
                    }
                    <Button buttonValue="Login" onClick={handleLogin} disabled={passwordStatus || password == "" || loginWaiting} />
                    <Button buttonValue="Create" onClick={handleCreate} />
                    <a className="text-[#007bff] cursor-pointer" onClick={handleRestore}>Restore your wallet from your seed</a>
                </div>
            </div>
        </>
    )
}

export default Login;