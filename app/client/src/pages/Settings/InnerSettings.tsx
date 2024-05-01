import { Select, Text } from "../../components/commons";
import { useAuth } from "../../contexts/AuthContext";
import { SettingsItems } from "../../enums/SettingsItems";
import { MODES, autoLockTimes, currencies } from "../../utils/constants";
import { ActiveItems } from "./Settings";

type InnerSettingsProps = {
    activeItem: ActiveItems;
};

const InnerSettings = ({ activeItem }: InnerSettingsProps) => {
    const { logout } = useAuth();

    const languageOptions = [
        {
            label: "English",
            value: "en",
        },
    ];

    const networkOptions = MODES.map((item) => ({
        label: item.type,
        value: item.wsUrl,
    }));

    return (
        <>
            <Text size="lg" weight="medium">
                {activeItem}
            </Text>
            {activeItem === SettingsItems.GENERAL && (
                <>
                    <div className="relative w-full flex justify-between items-center">
                        <div className="flex flex-col space">
                            <Text weight="medium">Language</Text>
                            <Text size="sm" weight="medium" className="mt-2.5">
                                Choose your language
                            </Text>
                        </div>
                        <Select
                            placeholder={languageOptions[0].label}
                            options={languageOptions}
                            isBorderStyle
                        />
                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>
                    <div className="relative w-full flex justify-between items-center">
                        <div className="flex flex-col space">
                            <Text weight="medium">Currency</Text>
                            <Text size="sm" weight="medium" className="mt-2.5">
                                Choose your preferred currency
                            </Text>
                        </div>
                        <Select
                            placeholder={currencies[0].label}
                            options={currencies}
                            isBorderStyle
                        />
                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>
                    <div className="relative w-full flex justify-between items-center">
                        <div className="flex flex-col space">
                            <Text weight="medium">Network</Text>
                            <Text size="sm" weight="medium" className="mt-2.5">
                                Change network
                            </Text>
                        </div>
                        <Select
                            placeholder={networkOptions[0].label}
                            options={networkOptions}
                            isBorderStyle
                        />
                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>
                </>
            )}
            {activeItem === SettingsItems.SECURITY && (
                <>
                    <div className="relative w-full flex justify-between items-center">
                        <div className="flex flex-col space">
                            <Text weight="medium">Auto-lock</Text>
                            <Text size="sm" weight="medium" className="mt-2.5">
                                Choose Auto-lock time
                            </Text>
                        </div>

                        <Select
                            placeholder={autoLockTimes[0].label}
                            options={autoLockTimes}
                            isBorderStyle
                        />

                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>

                    <div className="relative w-full flex justify-between items-center">
                        <Text weight="medium">Log out</Text>

                        <button
                            className="px-7 py-1.5 font-Inter font-medium text-xs border border-white rounded-md outline-none hover:bg-white/5 transition-all duration-200"
                            onClick={() => logout()}
                        >
                            Log out
                        </button>

                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>
                </>
            )}
            {activeItem === SettingsItems.SUPPORT && (
                <>
                    <div className="relative w-full flex justify-between items-center">
                        <div className="flex flex-col space">
                            <Text weight="medium">Have a question?</Text>
                            <Text size="sm" weight="medium" className="mt-2.5">
                                Submit a ticket and our team will reach out to
                                you
                            </Text>
                        </div>

                        <button className="px-7 py-1.5 font-Inter font-medium text-xs border border-white rounded-md outline-none hover:bg-white/5 transition-all duration-200">
                            Help
                        </button>

                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>
                </>
            )}
            {activeItem === SettingsItems.ABOUT && (
                <>
                    <div className="relative w-full flex justify-between items-center">
                        <div className="flex flex-col space">
                            <Text weight="medium">Term of Service</Text>
                            <Text size="sm" weight="medium" className="mt-2.5">
                                You can check term of service of Qubic
                            </Text>
                        </div>

                        <button className="px-7 py-1.5 font-Inter font-medium text-xs border border-white rounded-md outline-none hover:bg-white/5 transition-all duration-200">
                            Term of Service
                        </button>

                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>

                    <div className="relative w-full flex justify-between items-center">
                        <div className="flex flex-col space">
                            <Text weight="medium">Privacy Policy</Text>
                            <Text size="sm" weight="medium" className="mt-2.5">
                                You can check privacy policy of Qubic
                            </Text>
                        </div>

                        <button className="px-7 py-1.5 font-Inter font-medium text-xs border border-white rounded-md outline-none hover:bg-white/5 transition-all duration-200">
                            Privacy Policy
                        </button>

                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>

                    <div className="relative w-full flex justify-between items-center">
                        <div className="flex flex-col space">
                            <Text weight="medium">Visit Website?</Text>
                            <Text size="sm" weight="medium" className="mt-2.5">
                                You can visit website of Qubic
                            </Text>
                        </div>

                        <button className="px-7 py-1.5 font-Inter font-medium text-xs border border-white rounded-md outline-none hover:bg-white/5 transition-all duration-200">
                            Visit Website
                        </button>

                        <div className="absolute -bottom-4 w-full">
                            <div className="w-full h-[0.5px] bg-inactive"></div>
                            <div className="absolute right-0 -top-[1.5px] w-[3px] h-[3px] bg-inactive rounded-full"></div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default InnerSettings;
