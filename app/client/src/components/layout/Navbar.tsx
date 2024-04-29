import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { handleCopy } from "../../utils/helper";
import { Text } from "../commons";
import SwitchButton from "../dashboard/SwitchButton";

const Navbar = () => {
    const { currentAddress } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const addresses = [
        "fasdfuioashdoifuhasdoifuhasoidufhasiodhfaioushdfi",
        "fasdfuioashdoifuhasdoifuhasoidufhasiodhfaioushdfi",
        "fasdfuioashdoifuhasdoifuhasoidufhasiodhfaioushdfi",
        "fasdfuioashdoifuhasdoifuhasoidufhasiodhfaioushdfi",
    ];

    const handleSelectedAddress = () => {
        setIsOpen(false);
        // setCurrentAddress(address)
    };

    return (
        <>
            <div className="grid grid-cols-[230px_1fr] gap-10 items-center">
                <div className="w-[230px]">
                    <img src="/assets/images/logo.svg" />
                </div>

                <div className="relative flex justify-between  items-center flex-wrap gap-1">
                    <div className="flex gap-2.5 items-center w-max">
                        <Text
                            weight="bold"
                            size="sm"
                            className="uppercase cursor-pointer"
                            onClick={() => handleCopy(currentAddress)}
                        >
                            {
                                "fasdfuioashdoifuhasdoifuhasoidufhasiodhfaioushdfi"
                            }
                        </Text>
                        <img
                            src="assets/images/ui/chevron-down.svg"
                            alt="Icon"
                            className="cursor-pointer"
                            onClick={() => setIsOpen(!isOpen)}
                        />

                        {isOpen && (
                            <div className="absolute top-8 w-max h-20 bg-[#151B1E] pl-1 pr-4 overflow-scroll overflow-x-hidden scrolling">
                                {addresses.map((address) => (
                                    <Text
                                        weight="bold"
                                        className="uppercase py-1 cursor-pointer select-none"
                                        size="sm"
                                        onClick={() => handleSelectedAddress()}
                                    >
                                        {address}
                                    </Text>
                                ))}
                            </div>
                        )}
                    </div>
                    <SwitchButton />
                </div>
            </div>
        </>
    );
};

export default Navbar;
