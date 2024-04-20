import { sideBarItems } from "../../utils/constants";
import SidebarItem from "../dashboard/SidebarItem";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
    const { activeTabIdx, handleClickSideBar } = useAuth();

    return (
        <div className="max-w-[230px] w-full">
            {
                sideBarItems.map((item, idx) => {
                    return <SidebarItem
                        key={idx}
                        icon={item.icon}
                        label={item.label}
                        link={item.link}
                        active={activeTabIdx === idx ? true : false}
                        onClick={() => { handleClickSideBar(idx) }}
                    />
                })
            }
        </div>
    )
};

export default Sidebar;
