import React, { useEffect, useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";

const Confirm: React.FC = () => {
    const { seeds, seedType } = useSelector((state: RootState) => state.app)

    const [confirmSeeds, setConfirmSeeds] = useState<string | string[]>();
    const [matchStatus, setMatchStatus] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleConfirmSeeds = (value: string) => {
        setConfirmSeeds(value)
    }

    const handleConfirmSeedsFor24 = (value: string, idx: number) => {
        setConfirmSeeds((prev) => {
            if(typeof prev == 'object'){
                let _prev = [...prev]
                _prev[idx] = value
                return _prev
            }
        })
    }

    const handleBack = () => {
        navigate('/backup')
    }

    const handleNext = () => {
        if(typeof seeds == 'object' && typeof confirmSeeds == 'object'){
            if(seeds.length === confirmSeeds.length && seeds.every((value, index) => value === confirmSeeds[index])){
                navigate('/login')
            } else {
                console.error("Seeds don't match")
            }
        } else if (seeds == confirmSeeds) {
            navigate('/login')
        } else {
            console.error("Seeds don't match")
        }
    }

    useEffect(() => {
        if(typeof seeds == 'object' && typeof confirmSeeds == 'object'){
            if(seeds.length === confirmSeeds.length && seeds.every((value, index) => value === confirmSeeds[index])){
                setMatchStatus(false)
            } else {
                setMatchStatus(true)
            }
        } else if (seeds == confirmSeeds) {
            setMatchStatus(false)
        } else {
            setMatchStatus(true)
        }
    }, [confirmSeeds])

    useEffect(() => {
        if(seedType == '22words') {
            setConfirmSeeds([])
        } else if(seedType == '55chars') {
            setConfirmSeeds("")
        }
    }, [])

    return (
        <>
            <div className="bg-light dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                <img className="mx-auto" src="images/logo.png" width="100px" />
                <h2 className="my-[15px] mx-auto text-light dark:text-dark text-[2rem]">Confirm Seeds</h2>
                <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                    Please enter the backup seeds you have saved.
                </div>
                <div className="relative">
                    {typeof seeds == 'string' &&
                        <Input inputType={'text'} onChange={handleConfirmSeeds} placeHolder="Input seeds you've just created." />
                    }
                    {typeof seeds == 'object' &&
                        <ul className="grid gap-[20px] p-[10px_0] grid-cols-4 select-none relative">
                            {
                                seeds.map((_, idx) => {
                                    return <li className="flex gap-[5px] list-none border-b border-white" key={`seed${idx}`}>
                                        <span className="w-[30px]">{idx + 1}</span>
                                        <input onChange={(e) => {handleConfirmSeedsFor24(e.target.value, idx)}} className="border-none outline-none select-none text-center text-white m-0 p-0 bg-transparent w-full" type='text' />
                                    </li>
                                })
                            }
                        </ul>
                    }
                    <div className="flex gap-2">
                        <Button buttonValue="Back" onClick={handleBack} />
                        <Button buttonValue="Next" onClick={handleNext} disabled={matchStatus} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Confirm;