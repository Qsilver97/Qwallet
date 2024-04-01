import { faCopy, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { handleCopy } from "../utils/helper";
import axios from "axios";
import { SERVER_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import { setBalances } from "../redux/appSlice";

const Dashboard: React.FC = () => {
    const { login, logout, user } = useAuth();
    const dispatch = useDispatch();
    const socket = useSocket();
    const navigate = useNavigate();

    const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
    const toggleAccountModal = () => setIsAccountModalOpen(!isAccountModalOpen);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState<boolean>(false);
    const toggleDeleteAccountModal = () => setIsDeleteAccountModalOpen(!isDeleteAccountModalOpen);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
    const toggleTransferModal = () => setIsTransferModalOpen(!isTransferModalOpen);

    const { tick, balances } = useSelector((state: RootState) => state.app);

    const [deleteAccount, setDeleteAccount] = useState<string>("");
    const [currentAddress, setCurrentAddress] = useState<string>("");
    const [allAddresses, setAllAddresses] = useState<string[]>([]);
    const [addingStatus, setAddingStatus] = useState<boolean>(false);
    const [deletingStatus, setDeletingStatus] = useState<boolean>(false);
    const [toAddress, setToAddress] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [sendingStatus, setSendingStatus] = useState<'open' | 'pending' | 'closed' | 'rejected'>('closed');
    const [_, setStatusInterval] = useState<any>();
    const [sendingResult, setSendingResult] = useState<string>('');

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
        if (toAddress == "" || amount == "" || amount == "0") {
            toast.error(
                `Invalid address or amount!`
            );
            return;
        }
        setSendingStatus('open');
        axios.post(
            `${SERVER_URL}/api/transfer`,
            {
                toAddress,
                fromIdx: allAddresses.indexOf(currentAddress),
                amount,
                tick: parseInt(tick) + 10,
            }
        ).then((resp) => {
            const _statusInterval = setInterval(() => {
                axios.post(
                    `${SERVER_URL}/api/ccall`,
                    {
                        command: 'status 1',
                        flag: 'status'
                    }
                ).then((resp) => {
                    console.log(resp.data);
                    if (resp.data.value.result == '0') {
                        setSendingStatus('pending');
                    } else if (resp.data.value.result == '1') {
                        setSendingResult(resp.data.value.display);
                        setSendingStatus('closed');
                    } else {
                        setSendingStatus('rejected');
                    }
                }).catch((error) => {
                    console.log(error.response);
                    setSendingStatus('rejected');
                })
            }, 1000)
            setStatusInterval(_statusInterval);
            console.log(resp.data);
            // setSendingStatus('closed');
        }).catch((_) => {
            setSendingStatus('rejected');
        }).finally(() => {
        });
    }

    const handleClickAccount = (address: string) => {
        setCurrentAddress(address);
        toggleAccountModal();
    }

    const handleSelectAccount = (address: string) => {
        setCurrentAddress(address);
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
        if (sendingStatus == 'open' || sendingStatus == 'pending') {
            setIsTransferModalOpen(true);
        } else {
            // clearInterval(statusInterval);
        }
    }, [sendingStatus])

    useEffect(() => {
        if (user?.accountInfo) {
            setCurrentAddress(user?.accountInfo.addresses[0])
            setAllAddresses(user?.accountInfo.addresses)
        }

    }, [login, user])

    useEffect(() => {
        if (balances[0] == "") {
            axios.post(
                `${SERVER_URL}/api/balances`
            ).then((resp) => {
                resp.data.balances.map((item: [number, string]) => {
                    dispatch(setBalances({ index: item[0], balance: item[1] }));
                })
            }).catch((error) => {
                console.log(error.response);
            })
        }
    }, [])

    return (
        <>
            <div className="w-[calc(100%-20px)] max-w-[1368px] bg-[rgba(3,35,61,0.8)] h-[calc(100vh-100px)] m-[0_10px] overflow-y-auto z-0 rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-white mx-auto">
                <header className="p-[20px_60px] flex justify-between items-center border-b border-white text-[16px]">
                    <div className="cursor-pointer">
                        <img src="images/logo.png" className="w-[50px]" />
                    </div>
                    <div className="cursor-pointer" onClick={() => handleCopy(currentAddress)}>
                        <span className="p-[5px] shadow-[0_2px_3px_rgba(0,0,0,0.5)] rounded-[5px]">
                            {currentAddress}
                            {/* <FontAwesomeIcon icon={faArrowDown} /> */}
                        </span>
                    </div>
                    <div className="flex items-center gap-[10px] cursor-pointer">
                        <a className="text-[18px] bg-[#1e2975] px-2 rounded-[5px]" onClick={handleLogout} >Logout</a>
                        {/* <FontAwesomeIcon className="text-[32px]" icon={faGear} onClick={handleLogout} /> */}
                    </div>
                </header>
                <div className="p-[20px_60px] ">
                    <div className="flex gap-5">
                        <h3 className="text-[1.75rem]">Balance: {balances.reduce((acc, currentValue) => acc + Number(currentValue), 0)}</h3>
                        <h3 className="text-[1.75rem]">Tick: {tick}</h3>
                    </div>
                    <div className="flex gap-5 w-full h-full overflow-auto overflow-y-hidden p-5 border-[1.5px] border-[#17517a] rounded-[5px] mt-2">
                        <div className={`p-2 cursor-pointer flex items-center align-middle shadow-[2px_2px_2px_2px_rgba(0,0,0,0.3)] ${addingStatus ? "cursor-wait" : "cursor-pointer"}`} onClick={handleAddAccount}>
                            <FontAwesomeIcon icon={faPlus} className="p-3 text-[24px]" />
                        </div>
                        {
                            allAddresses.map((item, idx) => {
                                if (item != "")
                                    return <div className={`p-2 cursor-pointer flex items-center flex-col ${currentAddress == item ? " shadow-[2px_2px_2px_2px_rgba(0,0,0,0.6)] bg-[#17517a] " : " shadow-[2px_2px_2px_2px_rgba(0,0,0,0.3)] "}`} key={`item${idx}`} onClick={() => handleSelectAccount(item)} onContextMenu={(e) => { e.preventDefault(); setDeleteAccount(item); toggleDeleteAccountModal() }}>
                                        <div>{`${item.slice(0, 5)}...${item.slice(-5)}`}</div>
                                        <span>{+balances[idx] | 0}</span>
                                    </div>
                            })
                        }
                    </div>
                    <div className="mt-[20px]">
                        <div className="">
                            <input className="text-white p-[10px] mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] w-[720px] outline-none bg-transparent" placeholder="Address" onChange={(e) => setToAddress(e.target.value)} />
                            <input className="text-white p-[10px] mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] w-[120px] outline-none bg-transparent" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} type="number" />
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
                                    <span className="font-mono cursor-pointer" onClick={() => { handleClickAccount(item) }}>{item}</span>
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
            <Modal isOpen={isTransferModalOpen}>
                {
                    (sendingStatus == 'closed' || sendingStatus == 'rejected') &&
                    <div className='flex justify-between p-[10px_16px] items-center text-[1.25rem] gap-5'>
                        <div>{sendingStatus == 'closed' ? "Success" : "Failed"}</div>
                        <div className="flex gap-[10px]">
                            <FontAwesomeIcon icon={faTimes} onClick={toggleTransferModal} className='cursor-pointer' />
                        </div>
                    </div>
                }
                {
                    (sendingStatus == 'open' || sendingStatus == 'pending') ?
                        <div className="p-[10px_16px] max-h-[500px] overflow-y-auto mb-[10px] flex flex-col gap-5 items-center">
                            <div className="text-[24px]">Sending</div>
                            <ClipLoader />
                        </div> :
                        <>
                            {sendingStatus == 'closed' ?
                                <div className="p-[10px_16px] max-h-[500px] overflow-y-auto mb-[10px] flex flex-col gap-5 items-center">
                                    <div className="text-[24px]">{sendingResult}</div>
                                </div> :
                                <div className="p-[10px_16px] max-h-[500px] overflow-y-auto mb-[10px] flex flex-col gap-5 items-center">
                                    <div className="text-[24px]">Failed</div>
                                </div>
                            }
                        </>
                }
            </Modal>
        </>
    )
}

export default Dashboard;