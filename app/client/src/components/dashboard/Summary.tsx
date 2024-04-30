import React from "react";

import SummaryItem from "./SummaryItem";
import TokenSelect from "./select/TokenSelect";
import { assetsItems } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import MetricsChart from "./chart/MetricsChart";

const Summary: React.FC = () => {
    const { marketcap, tick } = useAuth();

    const options = assetsItems.map((item) => ({
        label: item.icon,
        value: item.name,
    }));

    return (
        <div className="bg-dark rounded-lg p-5">
            <div className="flex flex-wrap justify-center gap-5 mb-5">
                <SummaryItem
                    label="Total assets"
                    icon="/assets/images/dashboard/totalAssets.svg"
                    amount={`$${marketcap?.marketcap}`}
                />
                <SummaryItem
                    label="Total deposits"
                    icon="/assets/images/dashboard/totalDeposit.svg"
                    amount={`QU ${marketcap?.supply}`}
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
