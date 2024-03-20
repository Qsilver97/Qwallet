import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";

const Create: React.FC = () => {
    const navigate = useNavigate();

    const handleCreate = () => {

    }

    const handleBack = () => {
        navigate('/login')
    }

    return (
        <>
            <div className="bg-light w-full dark:bg-dark text-light dark:text-dark max-w-[500px] mx-auto p-[40px] rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-center z-0">
                <img className="mx-auto" src="images/logo.png" width="100px" />
                <h2 className="my-[15px] mx-auto text-light dark:text-dark pb-[10px] text-[2rem]">Create</h2>
                <div className="mb-[20px] leading-[25px] text-[1rem] font-normal">
                    There are two ways to create your account.
                </div>
                <div className="relative">
                    <div className="text-[20px] border border-[rgba(65,88,104,0.8)] rounded-[10px] flex gap-[20px] items-center pl-[20px] bg-[#00243f] cursor-pointer">
                        <img src="images/seed.png" className="w-[80px]" alt="" />
                        <p>Create with 24 words</p>
                        {/* <span className="fa fa-angle-double-right"></span> */}
                    </div>
                    <div className="text-[20px] border border-[rgba(65,88,104,0.8)] rounded-[10px] flex gap-[20px] items-center pl-[20px] bg-[#00243f] cursor-pointer my-[15px]">
                        <img src="images/chars.png" className="w-[80px]" alt="" />
                        <p>Create with 55 chars</p>
                        {/* <span className="fa fa-angle-double-right"></span> */}
                    </div>
                    {/* <p className="check-available">Password does not exist!</p> */}
                    <Button buttonValue="Back" onClick={handleBack} />
                </div>
            </div>
        </>
    )
}

export default Create;