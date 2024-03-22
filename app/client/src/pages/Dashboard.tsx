import { faCopy, faGear, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { handleCopy } from "../utils/helper";
import axios from "axios";
import { SERVER_URL } from "../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Dashboard: React.FC = () => {
    const { login, logout, user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();

    const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
    const toggleAccountModal = () => setIsAccountModalOpen(!isAccountModalOpen);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState<boolean>(false);
    const toggleDeleteAccountModal = () => setIsDeleteAccountModalOpen(!isDeleteAccountModalOpen);

    const { tick, balances } = useSelector((state: RootState) => state.app);

    const [deleteAccount, setDeleteAccount] = useState<string>("");
    const [currentAddress, setCurrentAddress] = useState<string>("");
    const [allAddresses, setAllAddresses] = useState<string[]>([]);
    const [addingStatus, setAddingStatus] = useState<boolean>(false);
    const [deletingStatus, setDeletingStatus] = useState<boolean>(false);

    const handleAddAccount = () => {
        if (addingStatus) return;
        setAddingStatus(true);
        console.log(user?.password, user?.accountInfo.addresses.findIndex((item) => item == ""))
        axios.post(
            `${SERVER_URL}/api/add-account`,
            {
                password: user?.password,
                index: user?.accountInfo.addresses.findIndex((item) => item == "")
            }
        ).then((resp) => {
            console.log(resp.data);
            login(resp.data)
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            setAddingStatus(false)
        })
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    const handleDeleteAccount = () => {
        if (deletingStatus) return;
        setDeletingStatus(true)
        if (deleteAccount != "")
            axios.post(
                `${SERVER_URL}/api/delete-account`,
                {
                    password: user?.password,
                    index: user?.accountInfo.addresses.indexOf(deleteAccount),
                    address: deleteAccount,
                }
            ).then((resp) => {
                if (user?.accountInfo.addresses.indexOf(deleteAccount) == 0) {
                    handleLogout();
                }
                // delete balances[deleteAccount];
                login(resp.data);
            }).catch(() => {

            }).finally(() => {
                toggleDeleteAccountModal();
                setDeletingStatus(false);
            })
    }

    const handleTransfer = () => {
        socket?.emit('send', 'MVPYRACGNJBMJGDLLAXUDXHXFOXBOBWCBZQBAXSUTGJXOBRLZVCTBDPCXPMK')
    }

    const handleClickAccount = (address: string) => {
        setCurrentAddress(address);
        toggleAccountModal();
    }

    useEffect(() => {
        // if (socket) {
        //     socket.on('live', (data) => {
        //         console.log(data);
        //         if (data.command == 'CurrentTickInfo') {
        //             setTick(data.tick);
        //         } else if (data.command == 'EntityInfo') {
        //             setBalances((prev) => ({ ...prev, [data.address]: data.balance }));
        //         }
        //     })
        // }
    }, [socket])

    useEffect(() => {
        if (user?.accountInfo) {
            setCurrentAddress(user?.accountInfo.addresses[0])
            setAllAddresses(user?.accountInfo.addresses)
        }

    }, [login, user])

    return (
        <>
            <div className="w-[calc(100%-20px)] max-w-[1368px] bg-[rgba(3,35,61,0.8)] h-[calc(100vh-100px)] m-[0_10px] overflow-y-auto z-0 rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-white mx-auto">
                <header className="p-[20px_60px] flex justify-between items-center border-b border-white text-[16px]">
                    <div className="cursor-pointer">
                        <img src="images/logo.png" className="w-[50px]" />
                    </div>
                    <div className="cursor-pointer" onClick={toggleAccountModal}>
                        <span className="p-[5px] shadow-[0_2px_3px_rgba(0,0,0,0.5)] rounded-[5px]">
                            {currentAddress}
                            {/* <FontAwesomeIcon icon={faArrowDown} /> */}
                        </span>
                    </div>
                    <div className="flex items-center gap-[10px] cursor-pointer">
                        <FontAwesomeIcon className="text-[32px]" icon={faGear} onClick={handleLogout} />
                    </div>
                </header>
                <div className="p-[20px_60px] ">
                    <div>
                        <h3 className="text-[1.75rem]">Balance: {Object.values(balances).reduce((sum, balance) => sum + balance, 0)}</h3>
                        <h3 className="text-[1.75rem]">Tick: {tick}</h3>
                    </div>
                    <div className="mt-[20px]">
                        <div className="">
                            <input className="text-white p-[10px] mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] w-[720px] outline-none bg-transparent" />
                            <input className="text-white p-[10px] mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] w-[120px] outline-none bg-transparent " />
                            <button className="outline-none p-[10px_20px] bg-[#17517a] border-none rounded-[5px] text-white text-[16px] cursor-pointer transition-bg duration-300 ease" onClick={handleTransfer}>Send</button>
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
            <Modal isOpen={isAccountModalOpen}>
                <div className='flex justify-between p-[10px_16px] items-center border-b border-white text-[1.25rem]'>
                    <div>Addresses</div>
                    <div className="flex gap-[10px]">
                        <FontAwesomeIcon icon={faPlus} className={addingStatus ? `cursor-wait` : `cursor-pointer`} onClick={handleAddAccount} />
                        <FontAwesomeIcon icon={faTimes} className={`cursor-pointer`} onClick={toggleAccountModal} />
                    </div>
                </div>
                <div className="p-[10px_16px] max-h-[500px] overflow-y-auto mb-[10px]">
                    {
                        allAddresses.map((item, idx) => {
                            if (item != "")
                                return <div className="flex justify-between items-center gap-[20px]" key={`address-${idx}`}>
                                    <FontAwesomeIcon className="cursor-pointer" icon={faCopy} onClick={() => handleCopy(item)} />
                                    <span className="cursor-pointer" onClick={() => { handleClickAccount(item) }}>{item}</span>
                                    <FontAwesomeIcon className="cursor-pointer" icon={faTrash} onClick={() => { setDeleteAccount(item); toggleDeleteAccountModal(); }} />
                                </div>
                        })
                    }
                </div>
            </Modal>
            <Modal isOpen={isDeleteAccountModalOpen}>
                <div className='flex justify-between p-[10px_16px] items-center border-b border-white text-[1.25rem]'>
                    <div>Delete this account?</div>
                    <div className="flex gap-[10px]">
                        <FontAwesomeIcon icon={faTimes} onClick={toggleDeleteAccountModal} className='cursor-pointer' />
                    </div>
                </div>
                <div className="p-[10px_16px] max-h-[500px] overflow-y-auto mb-[10px]">
                    {deleteAccount}
                    <div className="flex justify-end gap-5 mt-[10px]">
                        <a className={(deletingStatus ? `cursor-wait` : `cursor-pointer`) + " bg-red-500 px-4 hover:bg-red-600"} onClick={handleDeleteAccount}>Yes</a>
                        <a className="cursor-pointer bg-[#5468ff] px-4 hover:bg-[#3f4cb1]" onClick={toggleDeleteAccountModal}>No</a>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default Dashboard;