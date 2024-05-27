import { sideBarItems } from "../../utils/constants";
import SidebarItem from "../dashboard/SidebarItem";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";

const Sidebar = () => {
    const { logout, activeTabIdx, handleClickSideBar, txSocketStatus, tick, txModalStatus, setTxModalStatus } = useAuth();
    const [activePath, setActivePath] = useState<string>("");

    useEffect(() => {
        if (window.location.pathname == '/') {
            setActivePath('/dashboard')
        } else {
            setActivePath(window.location.pathname)
        }
    }, [activeTabIdx])

    return (
        <>
            <div className="relative w-[230px]">
                {sideBarItems.map((item, idx) => {
                    return (
                        <SidebarItem
                            key={idx}
                            icon={item.icon}
                            label={item.label}
                            link={item.link}
                            active={activePath.toLowerCase() === item.link.toLowerCase() ? true : false}
                            onClick={() => {
                                if (item.link === "/login") {
                                    logout();
                                    return;
                                }
                                handleClickSideBar(idx);
                            }}
                        />
                    );
                })}
            </div>
            {txModalStatus == 'bottom' && txSocketStatus &&
                <div className="fixed bottom-5 bg-slate-500 p-2 rounded h-[300px] max-w-[230px] break-all break-words cursor-pointer">
                    {txSocketStatus.txStatus.status &&
                        <button className="absolute right-2 text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 rounded-full p-2" onClick={() => { setTxModalStatus('closed') }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    }
                    <div className="relative cursor-pointer top-5" onClick={() => setTxModalStatus('middle')}>
                        Txid: {txSocketStatus.txid}<br />
                        Current tick: {tick}<br />
                        Expected tick: {txSocketStatus.tick}<br />
                    </div>
                    {/* {JSON.stringify(txSocketStatus)}<br />
                    {JSON.stringify(txWasmStatus)}<br /> */}
                </div>
            }
            {txModalStatus == 'middle' &&
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg"></div>
                    <div className="relative w-[500px] h-auto bg-dark p-8 rounded-2xl shadow-lg break-all break-words">
                        {txSocketStatus ?
                            <>
                                {/* <div className=" bottom-5 bg-slate-500 p-2 rounded max-h-[300px] max-w-[230px] break-all break-words"> */}
                                {/* <input type="button" value={'close'} className="cursor-pointer" onClick={() => setTxModalStatus('bottom')} /> */}
                                Txid: {txSocketStatus.txid}<br />
                                Current tick: {tick}<br />
                                Expected tick: {txSocketStatus.tick}<br />
                                {/* {JSON.stringify(txSocketStatus)}<br />
                        {JSON.stringify(txWasmStatus)}<br /> */}
                                {/* </div> */}
                                <button
                                    className="w-full py-4 bg-dark-gray-400 font-Inter font-light rounded-xl cursor-pointer"
                                    onClick={() => setTxModalStatus('bottom')}
                                >
                                    Close
                                </button>
                            </> :
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        }
                    </div>
                </div>
            }
        </>
    );
};

export default Sidebar;
