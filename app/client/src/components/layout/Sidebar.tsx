import { sideBarItems } from "../../utils/constants";
import SidebarItem from "../dashboard/SidebarItem";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { Text } from "../../components/commons";

const Sidebar = () => {
    const { activeTabIdx, handleClickSideBar } = useAuth();

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
                <Link
                    to={"/login"}
                    className="absolute bottom-10 left-5 flex gap-5"
                >
                    <img src="assets/images/ui/logout.svg" />
                    <Text weight="medium" size="lg">
                        Log out
                    </Text>
                </Link>
            </div>
        </>
    );
};

export default Sidebar;
