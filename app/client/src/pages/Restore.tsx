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

const Restore: React.FC = () => {
    const socket = useSocket()
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const { seedType, password } = useSelector((state: RootState) => state.app)

    const [passwordInputType, setPasswordInputType] = useState<string>('password');
    const [confirmPassword, setConfirmPassword] = useState<string>();
    const [passwordStatus, setPasswordStatus] = useState<boolean>(false);
    const [step, setStep] = useState<'1' | '2'>('1');
    const [restoreSeeds, setRestoreSeeds] = useState<string | string[]>([]);
    const [recovering, setRecovering] = useState<boolean>(false);

    const handleNext = () => {
        setRecovering(true);
        let passwordPrefix = '';
        if (seedType == '55chars') passwordPrefix = 'Q';
        let _password = `${passwordPrefix}${password}`;
        console.log(_password, restoreSeeds);
        axios.post(
            `${SERVER_URL}/api/restore`,
            {
                password: _password,
                seeds: restoreSeeds,
                seedType: seedType,
            }
        ).then((resp) => {
            console.log(resp.data);
            navigate('/login');
        }).catch(() => {
        }).finally(() => {
            setRecovering(false);;
        })
    }

    const handlePassword = (value: string) => {
        dispatch(setPassword(value));
    }

    const handleConfirmPassword = (value: string) => {
        setConfirmPassword(value);
    }

    const handleSeedType = (value: string) => {
        if (value == '24words') {
            setRestoreSeeds([]);
        } else { value == '55chars' } {
            setRestoreSeeds('');
        }
        dispatch(setSeedType(value));
    }

    const handleEye = () => {
        setPasswordInputType((prev) => {
            if (prev == 'text') return 'password'
            else return 'text'
        })
    }

    const handleRestoreSeeds = (value: string) => {
        setRestoreSeeds(value)
    }

    const handleRestoreSeedsFor24 = (value: string, idx: number) => {
        if (seedType == '24words') {
            setRestoreSeeds((prev) => {
                let _prev = [...prev]
                _prev[idx] = value
                return _prev
            })
        }
    }

    const handleBack = () => {
        navigate('/login')
    }

    useEffect(() => {
        if (password != "") {
            socket?.emit('passwordAvail', { command: `checkavail ${password}`, flag: 'passwordAvail' })
        } else {
            setPasswordStatus(true)
        }
    }, [password, confirmPassword])

    useEffect(() => {
        dispatch(setPassword(""))
        setConfirmPassword("")
    }, [])

    useEffect(() => {
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
            {
                step == '1' ?
                    <div className="bg-light w-full dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                        <img className="mx-auto" src="images/logo.png" width="100px" />
                        <h2 className="my-[15px] mx-auto text-light dark:text-dark text-[2rem]">Restore</h2>
                        <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                            There are two ways to restore your account.
                        </div>
                        <div className="relative">
                            <div className="flex justify-evenly mb-3">
                                <Radio
                                    label="24 Words"
                                    name="options"
                                    value="24words"
                                    checked={seedType === '24words'}
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
                                {
                                    password != confirmPassword &&
                                    <p className="w-full text-left text-red-600">Password does not match.</p>
                                }
                            </div>
                            <div className="flex gap-2">
                                <Button buttonValue="Back" onClick={handleBack} />
                                <Button buttonValue="Next" onClick={() => setStep('2')} disabled={!passwordStatus || (password != confirmPassword) || (password == "")} />
                            </div>
                        </div>
                    </div> :
                    <div className="bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                        <img className="mx-auto" src="images/logo.png" width="100px" />
                        <h2 className="my-[15px] mx-auto text-light dark:text-dark text-[2rem]">Confirm Seeds</h2>
                        <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                            Please enter the backup seeds you have saved.
                        </div>
                        <div className="relative">
                            {seedType == '55chars' &&
                                <Input inputType={'text'} onChange={handleRestoreSeeds} placeHolder="Input seeds you've just created." />
                            }
                            {seedType == '24words' &&
                                <ul className="grid gap-[20px] p-[10px_0] grid-cols-4 select-none relative">
                                    {
                                        Array.from({ length: 24 }).map((_, idx) => {
                                            return <li className="flex gap-[5px] list-none border-b border-white" key={`seed${idx}`}>
                                                <span className="w-[30px]">{idx + 1}</span>
                                                <input onChange={(e) => { handleRestoreSeedsFor24(e.target.value, idx) }} className="border-none outline-none select-none text-center text-white m-0 p-0 bg-transparent w-full" type='text' />
                                            </li>
                                        })
                                    }
                                </ul>
                            }
                            <div className="flex gap-2">
                                <Button buttonValue="Back" onClick={() => setStep('1')} />
                                <Button buttonValue="Next" onClick={handleNext} disabled={recovering} />
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}

export default Restore;