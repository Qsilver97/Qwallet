import { faCheck, faCopy, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { handleCopy } from "../utils/helper";
import axios from "axios";
import { SERVER_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import { setBalances, setMarketcap, setRichlist, setTokens } from "../redux/appSlice";
import { TransactionItem } from "../utils/interfaces";
import NetworkSwitcher from "../components/NetworkSwitcher";

const Dashboard: React.FC = () => {
    const { login, logout, user } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
    const toggleAccountModal = () => setIsAccountModalOpen(!isAccountModalOpen);
    const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState<boolean>(false);
    const toggleDeleteAccountModal = () => setIsDeleteAccountModalOpen(!isDeleteAccountModalOpen);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
    const toggleTransferModal = () => setIsTransferModalOpen(!isTransferModalOpen);

    const { tick, balances, tokens, richlist, marketcap } = useSelector((state: RootState) => state.app);

    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [deleteAccount, setDeleteAccount] = useState<string>("");
    const [currentAddress, setCurrentAddress] = useState<string>("");
    const [displayAddress, setDisplayAddress] = useState(currentAddress);
    const [allAddresses, setAllAddresses] = useState<string[]>([]);
    const [addingStatus, setAddingStatus] = useState<boolean>(false);
    const [deletingStatus, setDeletingStatus] = useState<boolean>(false);
    const [toAddress, setToAddress] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [sendingStatus, setSendingStatus] = useState<'open' | 'pending' | 'closed' | 'rejected'>('closed');
    const [statusInterval, setStatusInterval] = useState<any>();
    const [sendingResult, setSendingResult] = useState<string>('');
    const [transactionId, setTrasactionId] = useState<string>('');
    const [expectedTick, setExpectedTick] = useState<number>();
    const [histories, setHistories] = useState<TransactionItem[]>([]);
    const [subTitle, setSubTitle] = useState<'Activity' | 'Token'>('Token');

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
        const expectedTick = parseInt(tick) + 5;
        setExpectedTick(expectedTick);
        axios.post(
            `${SERVER_URL}/api/transfer`,
            {
                toAddress,
                fromIdx: allAddresses.indexOf(currentAddress),
                amount,
                tick: expectedTick,
            }
        ).then((resp) => {
            const _statusInterval = setInterval(() => {
                axios.post(
                    `${SERVER_URL}/api/transfer-status`
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
            }, 2000)
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
        if (sendingResult.includes('broadcast for tick')) {
            const sendingResultSplit = sendingResult.split(' ');
            setTrasactionId(sendingResultSplit[1]);
            setExpectedTick(parseInt(sendingResultSplit[sendingResultSplit.length - 1]));
        } else if (sendingResult.includes('no command pending')) {
            clearInterval(statusInterval);
        }
    }, [sendingResult])

    useEffect(() => {
        // Assuming Tailwind's 'md' breakpoint is 768px
        if (screenWidth < 1024 && currentAddress.length > 6) {
            const sliceLength = Math.ceil(screenWidth * 20 / 1024);
            const modifiedAddress = `${currentAddress.slice(0, sliceLength)}...${currentAddress.slice(-sliceLength)}`;
            setDisplayAddress(modifiedAddress);
        } else {
            setDisplayAddress(currentAddress);
        }
    }, [screenWidth, currentAddress]);

    useEffect(() => {
        axios.post(
            `${SERVER_URL}/api/history`,
            {
                address: currentAddress
            }
        ).then((resp) => {
            if (resp.data.changes) {
                setHistories(resp.data.changes[1].txids)
            } else {
                setHistories([]);
            }
        }).catch((_) => {
            setHistories([]);
        })

        axios.post(
            `${SERVER_URL}/api/tokens`,
        ).then((resp) => {
            dispatch(setTokens(resp.data.tokens));
        }).catch((error) => {
            console.log(error.response);
        })

    }, [currentAddress])

    useEffect(() => {
        axios.post(
            `${SERVER_URL}/api/basic-info`
        ).then((resp) => {
            resp.data.balances.map((item: [number, string]) => {
                dispatch(setBalances({ index: item[0], balance: item[1] }));
            })
            dispatch(setTokens(resp.data.tokens));
            dispatch(setRichlist(resp.data.richlist));
            dispatch(setMarketcap(resp.data.marketcap));
            console.log(resp.data, 'basicinfo');
        })

        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    return (
        <>
            <div className="w-[calc(100%-20px)] max-w-[1368px] bg-[rgba(3,35,61,0.8)] h-[calc(100vh-100px)] m-[0_10px] overflow-y-auto z-0 rounded-[10px] shadow-[0_15px_25px_rgba(0,0,0,0.5)] text-white mx-auto">
                <header className="p-[20px_20px] md:p-[20px_60px] flex justify-between items-center border-b border-white text-[16px]">
                    <div className="cursor-pointer">
                        <img src="images/logo.png" className="w-[50px]" />
                    </div>
                    <div className="cursor-pointer" onClick={() => handleCopy(currentAddress)}>
                        <span className="text-[16px] sm:text-[18px] p-[5px] shadow-[0_2px_3px_rgba(0,0,0,0.5)] rounded-[5px]">
                            {displayAddress}
                        </span>
                    </div>
                    <div className="flex items-center gap-[10px] cursor-pointer">
                        <NetworkSwitcher />
                        <a className="text-[18px] bg-[#1e2975] px-2 rounded-[5px]" onClick={handleLogout} >Logout</a>
                        {/* <FontAwesomeIcon className="text-[32px]" icon={faGear} onClick={handleLogout} /> */}
                    </div>
                </header>
                <div className="p-[10px_20px] md:p-[20px_60px]">
                    <div className="flex gap-2 sm:gap-5 text-[1.5rem] sm:text-[1.75rem]">
                        <h3>
                            Balance: {balances.reduce((acc, currentValue) => acc + Number(currentValue), 0)}
                            &nbsp;|&nbsp;
                            <span className="text-[1.rem] sm:text-[1.25rem]">${balances.reduce((acc, currentValue) => acc + Number(currentValue), 0) * parseFloat(marketcap.price)}</span>
                        </h3>
                        <h3>Tick: {tick}</h3>
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
                                        <div className="flex justify-between text-[12px] w-full gap-1">
                                            <span className="bg-[#2e802e] px-1">
                                                {richlist['QU'] &&
                                                    richlist['QU'].find((jtem) => jtem[1] == item)?.[0] ? richlist['QU'].find((jtem) => jtem[1] == item)?.[0] : 'no rank'
                                                }
                                            </span>
                                            <span className="">
                                                {
                                                    balances[idx] &&
                                                    <span className="">${Math.round((parseFloat(balances[idx]) * parseFloat(marketcap.price)) * 100) / 100}</span>
                                                }
                                            </span>
                                        </div>
                                    </div>
                            })
                        }
                    </div>
                    <div className="mt-[20px]">
                        <div className="flex flex-wrap">
                            <input className="text-white p-[10px] my-2 mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] max-w-[720px] w-full outline-none bg-transparent" placeholder="Address" onChange={(e) => setToAddress(e.target.value)} />
                            <input className="text-white p-[10px] my-2 mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] w-[120px] outline-none bg-transparent" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} type="number" />
                            <button className="outline-none my-2 p-[10px_20px] bg-[#17517a] border-none rounded-[5px] text-white text-[16px] cursor-pointer transition-bg duration-300 ease" onClick={handleTransfer}>Send</button>
                        </div>
                        <div className="mt-[40px] max-h-[500px]">
                            <div className="flex gap-5 text-[1.75rem] mb-5">
                                <h3 className={`py-1 px-3 ${subTitle == 'Token' ? "bg-[#17517a]" : ""} cursor-pointer`} onClick={() => setSubTitle('Token')}>Token</h3>
                                <h3 className={`py-1 px-3 ${subTitle == 'Activity' ? "bg-[#17517a]" : ""} cursor-pointer`} onClick={() => setSubTitle('Activity')}>Activity</h3>
                            </div>
                            {
                                subTitle == 'Token' &&
                                <div className="relative overflow-x-auto shadow-[1px_2px_5px_5px_rgba(0.3,0.3,0.3,0.3)] sm:rounded-lg p-5">
                                    {
                                        tokens.map((item, idx) => {
                                            return <div className="flex justify-between items-center" key={idx}>
                                                <div className="flex gap-2 items-center justify-between min-w-[100px]">
                                                    <span>{item}</span>
                                                    <span>0</span>
                                                </div>
                                                <input className="text-white p-[10px] my-2 mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] max-w-[720px] w-full outline-none bg-transparent" placeholder="Address" />
                                                <input className="text-white p-[10px] my-2 mr-[5px] border-[1.5px] border-[#17517a] rounded-[5px] w-[120px] outline-none bg-transparent" placeholder="Amount" type="number" />
                                                <button className="outline-none my-2 p-[10px_20px] bg-[#17517a] border-none rounded-[5px] text-white text-[16px] cursor-pointer transition-bg duration-300 ease" >Send</button>
                                            </div>
                                        })
                                    }
                                </div>
                            }
                            {
                                subTitle == 'Activity' &&
                                <div className="relative overflow-x-auto shadow-[1px_2px_5px_5px_rgba(0.3,0.3,0.3,0.3)] sm:rounded-lg p-5">
                                    <table className="w-full text-sm text-left rtl:text-right h-full p-5">
                                        <thead className="text-xs uppercase ">
                                            <tr>
                                                <th scope="col" className="px-1 py-1 pb-3">
                                                    Txid
                                                </th>
                                                <th scope="col" className="px-1 py-1 pb-3">
                                                    Tick
                                                </th>
                                                <th scope="col" className="px-1 py-1 pb-3">
                                                    Address
                                                </th>
                                                <th scope="col" className="px-1 py-1 pb-3">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="">
                                            {
                                                histories.map((item, idx) => {
                                                    return <tr className={`${item[3].startsWith('-') ? 'text-red-400' : 'text-green-400'} odd:bg-[#022139] even:bg-[#0a304a]`} key={idx}>
                                                        <td className="px-1 py-2 font-mono cursor-pointer hover:bg-slate-400 hover:text-black" onClick={() => handleCopy(item[1])}>{screenWidth > 1250 ? item[1] : item[1].slice(0, Math.ceil(screenWidth ** 2.1) / 59000)}{item[1].slice(0, Math.ceil(screenWidth) * 67 / 1920).length < 60 && screenWidth < 1250 && '...'}</td>
                                                        <td className="px-1 py-2 font-mono cursor-pointer hover:bg-slate-400 hover:text-black" onClick={() => handleCopy(item[0])}>{item[0]}</td>
                                                        <td className="px-1 py-2 font-mono cursor-pointer hover:bg-slate-400 hover:text-black" onClick={() => handleCopy(item[2])}>{screenWidth > 1250 ? item[2] : item[2].slice(0, Math.ceil(screenWidth ** 2.1) / 59000)}{item[2].slice(0, Math.ceil(screenWidth) * 67 / 1920).length < 60 && screenWidth < 1250 && '...'}</td>
                                                        <td className="px-1 py-2 font-mono cursor-pointer hover:bg-slate-400 hover:text-black" onClick={() => handleCopy(item[3])}>{item[3]}</td>
                                                    </tr>
                                                }
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            }
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
                        {sendingResult == 'no command pending' ?
                            <div>Success</div> :
                            <div>{sendingStatus == 'closed' ? "Sending..." : "Failed"}</div>
                        }
                        <div className="gap-[10px]">
                            <FontAwesomeIcon icon={faTimes} onClick={toggleTransferModal} className='cursor-pointer' />
                        </div>
                    </div>
                }
                {
                    (sendingStatus == 'open' || sendingStatus == 'pending') ?
                        <div className="p-[10px_16px] max-h-[500px] overflow-y-auto my-[10px] flex flex-col gap-5 items-center">
                            {/* <div className="text-[24px]">Sending</div> */}
                            <ClipLoader />
                        </div> :
                        <>
                            {sendingStatus == 'closed' ?
                                <div className="max-w-md mx-auto bg-transparent overflow-hidden md:max-w-2xl my-4 px-8">
                                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Transaction ID</div>
                                    <p className="mt-1 text-lg font-mediu">{transactionId}</p>
                                    {
                                        sendingResult == 'no command pending' ?
                                            <>
                                                <div className="mt-4 font-[24px]">
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </div>
                                            </> :
                                            <>
                                                <div className="mt-2">
                                                    <span className="text-indigo-500 font-semibold">Expected Tick:</span> {expectedTick}
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-indigo-500 font-semibold">Status:</span> {sendingResult}
                                                </div>
                                            </>
                                    }
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