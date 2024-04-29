import {
    Title,
    Section,
    Text,
    Select,
    SwitchOptions,
} from "../../components/commons";
import { assetsItems, marketOptions } from "../../utils/constants";
import Layout from "../../components/layout";
import MainContent from "../../components/layout/MainContent";
import TokenSelect from "../../components/dashboard/select/TokenSelect";
import TradingAside from "./TradingAside";

const Trading = () => {
    const options = assetsItems.map((item) => ({
        label: item.icon,
        value: item.name,
    }));
    const dateOptions = [
        "04 Dec 23",
        "05 Dec 23",
        "08 Dec 23",
        "29 Dec 23",
        "26 Jan 24",
        "26 Mar 24",
    ];

    return (
        <>
            <Layout>
                <MainContent>
                    <Title
                        text="Trading"
                        iconUrl="/assets/images/sidebar/trading.svg"
                    />

                    <div className="space-y-2">
                        <TokenSelect
                            options={options}
                            showSelectDescription
                            hideTokenValue
                        />

                        <div className="grid grid-cols-[70%_30%] gap-2">
                            <div className="flex flex-col gap-2">
                                <Section>
                                    <div>
                                        <div className="flex flex-col gap-2">
                                            <SwitchOptions
                                                options={[
                                                    "Options Chain",
                                                    "Trade History",
                                                ]}
                                                defaultOption={0}
                                            />
                                            <SwitchOptions
                                                options={dateOptions}
                                                defaultOption={2}
                                                switchStyle="rounded"
                                            />
                                        </div>

                                        <img src="/assets/images/dashboard/chat.svg" />
                                    </div>
                                </Section>

                                <Section>
                                    <div className="flex justify-between w-full h-7">
                                        <span className="bg-blue-500 font-Inter text-xs text-white rounded-lg px-9 py-1.5 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in duration-150">
                                            Orders
                                        </span>

                                        <div className="flex items-center">
                                            <Text
                                                font="inter"
                                                weight="medium"
                                                size="xs"
                                                className="text-inactive"
                                            >
                                                Show selected market only
                                            </Text>

                                            <Select
                                                options={marketOptions}
                                                font="sm"
                                            />
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            <TradingAside />
                        </div>
                    </div>
                </MainContent>
            </Layout>
        </>
    );
};

export default Trading;
