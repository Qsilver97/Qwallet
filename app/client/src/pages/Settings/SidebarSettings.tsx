import { Text } from "../../components/commons";
import { settingsSidebarItems } from "../../utils/constants";
import { ActiveItems } from "./Settings";

type SidebarSettingsProps = {
    activeItem: ActiveItems;
    setActiveItem: React.Dispatch<React.SetStateAction<ActiveItems>>;
};

const SidebarSettings = ({
    activeItem,
    setActiveItem,
}: SidebarSettingsProps) => {
    return (
        <nav className="w-full max-w-48 mt-14">
            <ul className="flex flex-col gap-8">
                {settingsSidebarItems.map((item) => {
                    const { width, height } = item.size;
                    const transition =
                        "transition-all duration-200 ease-in-out";
                    const activeStyle =
                        activeItem === item.label
                            ? "text-white fill-white"
                            : "text-inactive fill-inactive";

                    return (
                        <li
                            key={item.icon}
                            className="ml-2 flex gap-4 cursor-pointer group hover:ml-3"
                            onClick={() =>
                                setActiveItem(item.label as ActiveItems)
                            }
                        >
                            <svg
                                width={width}
                                height={height}
                                viewBox={`0 0 ${width} ${height}`}
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d={item.icon}
                                    className={`group-hover:fill-white ${activeStyle} ${transition}`}
                                />
                            </svg>

                            <Text
                                weight="medium"
                                className={`group-hover:text-white ${activeStyle} ${transition}`}
                            >
                                {item.label}
                            </Text>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default SidebarSettings;
