import { faCopy, faGear, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { logout } = useAuth();

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handleAddAccount = () => {
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <>
            <div className="w-[calc(100%-20px)] max-w-[1368px] bg-[rgba(3,35,61,0.8)] h-[calc(100vh-100px)] m-[0_10px] overflow-y-auto z-0 rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-white mx-auto">
                <header className="p-[20px_60px] flex justify-between items-center border-b border-white text-[16px]">
                    <div className="cursor-pointer">
                        <img src="images/logo.png" className="w-[50px]" />
                    </div>
                    <div className="cursor-pointer" onClick={toggleModal}>
                        <span className="p-[5px] shadow-[0_2px_3px_rgba(0,0,0,0.5)] rounded-[5px]">
                            MVPYRACGNJBMJGDLLAXUDXHXFOXBOBWCBZQBAXSUTGJXOBRLZVCTBDPCXPMK
                            {/* <FontAwesomeIcon icon={faArrowDown} /> */}
                        </span>
                    </div>
                    <div className="flex items-center gap-[10px] cursor-pointer">
                        <FontAwesomeIcon className="text-[32px]" icon={faGear} onClick={handleLogout} />
                    </div>
                </header>
                <div className="p-[20px_60px] ">
                    <div>
                        <h3 className="text-[1.75rem]">Balance: 0</h3>
                        <h3 className="text-[1.75rem]">Tick: 130928</h3>
                    </div>
                    <div className="mt-[20px]">
                        <div className="">
                            <input className="text-white p-[10px] mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] w-[720px] outline-none bg-transparent" />
                            <input className="text-white p-[10px] mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] w-[120px] outline-none bg-transparent " />
                            <button className="outline-none p-[10px_20px] bg-[#17517a] border-none rounded-[5px] text-white text-[16px] cursor-pointer transition-bg duration-300 ease">Send</button>
                        </div>
                        <div className="mt-[40px] max-h-[1000px] overflow-auto">
                            <h3 className="text-[1.75rem]">Activity</h3>
                            <table className="text-[#bbb] w-full max-w-[100%] mb-[1rem] bg-transparent text-left">
                                <thead>
                                    <tr>
                                        <th className="border-b border-[#dee2e6] border-t-0 p-[0.75rem]">Date</th>
                                        <th className="border-b border-[#dee2e6] border-t-0 p-[0.75rem]">Type</th>
                                        <th className="border-b border-[#dee2e6] border-t-0 p-[0.75rem]">Detail</th>
                                        <th className="border-b border-[#dee2e6] border-t-0 p-[0.75rem]">Amount</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen}>
                <div className='flex justify-between p-[10px_16px] items-center border-b border-white text-[1.25rem]'>
                    <div>Addresses</div>
                    <div className="flex gap-[10px]">
                        <FontAwesomeIcon icon={faPlus} className='cursor-pointer' onClick={handleAddAccount} />
                        <FontAwesomeIcon icon={faTimes} onClick={toggleModal} className='cursor-pointer' />
                    </div>
                </div>
                <div className="p-[10px_16px]">
                    <div className="flex justify-between items-center gap-[20px]">
                        <FontAwesomeIcon className="cursor-pointer" icon={faCopy} />
                        <span className="cursor-pointer">MVPYRACGNJBMJGDLLAXUDXHXFOXBOBWCBZQBAXSUTGJXOBRLZVCTBDPCXPMK</span>
                        <FontAwesomeIcon className="cursor-pointer" icon={faTrash} />
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Dashboard;