import React from "react";

import SummaryItem from "./SummaryItem";
import TokenSelect from "./select/TokenSelect";
import { assetsItems } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import MetricsChart from "./chart/MetricsChart";

const Summary: React.FC = () => {
    const { tick, totalBalance, marketcap, tokens } = useAuth();

    const options = tokens.map((token) => {
        const item = assetsItems.find((k) => k.name == token) || assetsItems[0]
        return ({
            label: item.icon,
            value: token,
        })
    });

    return (
        <div className="bg-dark rounded-lg p-5">
            <div className="flex flex-wrap justify-start gap-5 mb-5">
                {marketcap?.price &&
                    <SummaryItem
                        label="Total assets"
                        icon="/assets/images/dashboard/totalAssets.svg"
                        amount={`$${(parseInt(totalBalance) * parseFloat(marketcap?.price)).toFixed(3)}`}
                    />
                }
                <SummaryItem
                    label="Total QU"
                    icon="/assets/images/dashboard/totalDeposit.svg"
                    amount={`QU ${totalBalance}`}
                />
                <SummaryItem
                    label="Tick"
                    icon="/assets/images/dashboard/totalAssets.svg"
                    amount={`${tick}`}
                />
            </div>
            <TokenSelect options={options} />

            <MetricsChart />
        </div>
    );
};

export default Summary;
