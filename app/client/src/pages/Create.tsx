import React, { useEffect, useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import Radio from "../components/common/Radio";
import Input from "../components/common/Input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import { setPassword, setSeedType } from "../redux/appSlice";
import { RootState } from "../redux/store";
import axios from "axios";
import { SERVER_URL } from "../utils/constants";
import { useSocket } from "../context/SocketContext";

const Create: React.FC = () => {
    const socket = useSocket()
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const { seedType, password } = useSelector((state: RootState) => state.app)

    const [passwordInputType, setPasswordInputType] = useState<string>('password');
    const [confirmPassword, setConfirmPassword] = useState<string>();
    const [passwordStatus, setPasswordStatus] = useState<boolean>(false);

    const handleCreate = () => {
        let passwordPrefix = ''
        if (seedType == '55chars') passwordPrefix = 'Q'
        axios.post(
            `${SERVER_URL}/ccall`,
            {
                command: `login ${passwordPrefix}${password}`,
                flag: `create`
            }
        ).then((resp) => {
            console.log(resp)
        }).catch((error) => {
            console.log(error)
        })
        navigate(`/backup`)
    }

    const handlePassword = (value: string) => {
        if (value != "") {
            socket?.emit('passwordAvail', { command: `checkavail ${value}`, flag: 'passwordAvail' })
        } else {
            setPasswordStatus(true)
        }
        dispatch(setPassword(value));
    }

    const handleConfirmPassword = (value: string) => {
        setConfirmPassword(value);
    }

    const handleSeedType = (value: string) => {
        dispatch(setSeedType(value));
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

    useEffect(() => {
        axios.post(
            `${SERVER_URL}/api/ccall`,
            {
                command: `login a`,
                flag: `create`
            }
        ).then((resp) => {
            console.log(resp)
        }).catch((error) => {
            console.log(error)
        })
        if (socket) {
            socket.on('test', (msg) => {
                console.log(msg)
            })
            socket.on('passwordAvail', (msg: boolean) => {
                setPasswordStatus(msg)
            })
        }
    }, [socket])

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
                        {
                            !passwordStatus &&
                            <p className="w-full text-left text-red-600">Password already exist.</p>
                        }
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