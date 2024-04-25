import { useAuth } from "../../contexts/AuthContext";
import { handleCopy } from "../../utils/helper";
import SwitchButton from "../dashboard/SwitchButton";

const Navbar = () => {
    const { currentAddress } = useAuth();
    return (
        <>
            <div className="grid grid-cols-[230px_1fr] gap-10 items-center">
                <div className="w-[230px]">
                    <img src="/assets/images/logo.svg" />
                </div>

                <div className="flex justify-between  items-center flex-wrap gap-1">
                    <span
                        className="cursor-pointer"
                        onClick={() => handleCopy(currentAddress)}
                    >
                        {currentAddress}
                    </span>
                    <SwitchButton />
                </div>
            </div>
        </>
    );
};

export default Navbar;
