import React from "react";
import { SummaryItemProps } from "../../utils/interfaces";
import { formatNumberWithCommas } from "../../utils/helper";

const SummaryItem: React.FC<SummaryItemProps> = ({ icon, label, unit, amount }) => {
    return (
        <div className="items-center justify-between rounded-lg inline-block mr-4">
            <div className="flex items-center gap-2">
                <img
                    src={icon}
                    alt={label}
                    className="w-12 h-12 p-2 bg-[#B0B0B030] rounded-lg"
                />
                <div>
                    <div className="font-medium text-sm font-Inter">
                        {label}
                    </div>
                    <div className="text-2xl font-bold font-Inter">
                        {unit ? unit : ''} {formatNumberWithCommas(amount)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryItem;
