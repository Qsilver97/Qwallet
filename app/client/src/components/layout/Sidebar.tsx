import { sideBarItems } from "../../utils/constants";
import SidebarItem from "../dashboard/SidebarItem";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";

const Sidebar = () => {
    const { logout, activeTabIdx, handleClickSideBar } = useAuth();
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
        </>
    );
};

export default Sidebar;
