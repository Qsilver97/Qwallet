import React, { useEffect, useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Backup: React.FC = () => {
    const { seeds } = useSelector((state: RootState) => state.app)

    const [backuped, setBackuped] = useState<boolean>(false);
    const [seedsShowStatus, setSeedsShowStatus] = useState<boolean>(false);
    // const [backdrop, setBackdrop] = useState<string>('opacity-100');

    const navigate = useNavigate();

    const handleBackup = () => {
        setBackuped(!backuped)
    }

    const handleBack = () => {
        navigate('/create')
    }

    const handleNext = () => {
        navigate('/confirm')
    }

    const handleMouseEnter = () => {
        setSeedsShowStatus(true)
    }

    const handleMouseLeave = () => {
        setSeedsShowStatus(false)
    }

    const handleCopy = async (value: string) => {
        await navigator.clipboard.writeText(value);
    }

    useEffect(() => {
    }, [])

    return (
        <>
            <div className="bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                <img className="mx-auto" src="images/logo.png" width="100px" />
                <h2 className="my-[15px] mx-auto text-light dark:text-dark text-[2rem]">Create an account</h2>
                <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                    A new seed has been generated and needs to be securely backed up. We highly recommend to write down on paper for safe keeping
                </div>
                <div className="relative">
                    {typeof seeds == 'string' &&
                        <div onClick={() => handleCopy(seeds)} className="cursor-pointer">
                            <input
                                type={'text'}
                                value={seeds}
                                className="w-full p-[10px] border-b border-white bg-transparent outline-none text-white text-[16px] pointer-events-none"
                                disabled={true}
                            />
                        </div>
                    }
                    {typeof seeds == 'object' &&
                        <ul className="grid gap-[20px] p-[10px_0] grid-cols-4 select-none relative">
                            {
                                seeds.map((seed, idx) => {
                                    return <li className="flex gap-[5px] list-none border-b border-white" key={`seed${idx}`}>
                                        <span className="w-[30px]">{idx + 1}</span>
                                        <input className="border-none select-none text-center text-white m-0 p-0 bg-transparent w-full" type={seedsShowStatus ? "text" : "password"} value={seed} disabled />
                                    </li>
                                })
                            }
                            <div
                                className={`absolute w-full h-full transition-all duration-300 backdrop-blur-[6px] ${seedsShowStatus ? 'opacity-0' : 'opacity-100'}`}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            ></div>
                            <FontAwesomeIcon icon={faEye} className="absolute text-[40px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </ul>
                    }
                    <div className="w-full flex gap-1">
                        <input type="checkbox" id="backup" onChange={handleBackup} checked={backuped} />
                        <label htmlFor="backup">I've Made a Backup</label>
                    </div>
                    <div className="flex gap-2">
                        <Button buttonValue="Back" onClick={handleBack} />
                        <Button buttonValue="Next" onClick={handleNext} disabled={!backuped} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Backup;