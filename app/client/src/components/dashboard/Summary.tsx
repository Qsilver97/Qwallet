import React from "react";

import SummaryItem from "./SummaryItem";
import TokenSelect from "./select/TokenSelect";
import { assetsItems } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import MetricsChart from "./chart/MetricsChart";

const Summary: React.FC = () => {
    const { tick, balances, marketcap } = useAuth();

    const options = assetsItems.map((item) => ({
        label: item.icon,
        value: item.name,
    }));

    return (
        <div className="bg-dark rounded-lg p-5">
            <div className="flex flex-wrap justify-start gap-5 mb-5">
                {marketcap?.price &&
                    <SummaryItem
                        label="Total assets"
                        icon="/assets/images/dashboard/totalAssets.svg"
                        amount={`$${(Object.keys(balances).reduce((sum, key) => sum + balances[key], 0) * parseFloat(marketcap?.price)).toFixed(3)}`}
                    />
                }
                <SummaryItem
                    label="Total deposits"
                    icon="/assets/images/dashboard/totalDeposit.svg"
                    amount={`QU ${0}`}
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
