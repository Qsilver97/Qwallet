import { sideBarItems } from "../../utils/constants";
import SidebarItem from "../dashboard/SidebarItem";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Text } from "../../components/commons";

const Sidebar = () => {
    const { logout, activeTabIdx, handleClickSideBar } = useAuth();

    return (
        <>
            <div className="relative max-w-[230px] w-full">
                {sideBarItems.map((item, idx) => {
                    return (
                        <SidebarItem
                            key={idx}
                            icon={item.icon}
                            label={item.label}
                            link={item.link}
                            active={activeTabIdx === idx ? true : false}
                            onClick={() => {
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
