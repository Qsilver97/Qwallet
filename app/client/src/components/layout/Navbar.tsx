import { useState } from "react";
import { handleCopy } from "../../utils/helper";
import SwitchButton from "../dashboard/SwitchButton";

const Navbar = () => {
    const [currentAddress, setCurrentAddress] = useState<string>("");
    const [displayAddress, setDisplayAddress] = useState(currentAddress);

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
                        {displayAddress}
                    </span>
                    <SwitchButton />
                </div>
            </div>
        </>
    );
};

export default Navbar;
