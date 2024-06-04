import React from 'react';
import SummaryItem from '../../components/dashboard/SummaryItem';
import { useAuth } from '../../contexts/AuthContext';

const AccountSummary: React.FC = () => {
    const { marketcap, portfolio, currentAddress } = useAuth();
    return (
        <div>
            <div className="flex">
                {marketcap?.price && portfolio[currentAddress] ? <>
                    <SummaryItem
                        label="Portfolio(USD)"
                        icon="/assets/images/dashboard/totalDeposit.svg"
                        unit="$"
                        amount={Number(BigInt(portfolio[currentAddress]) * BigInt(Math.floor((parseFloat(marketcap?.price) || 0) * 10000000))) / 10000000}
                    />
                    <SummaryItem
                        label="Portfolio(QU)"
                        icon="/assets/images/dashboard/totalAssets.svg"
                        unit="QU"
                        amount={portfolio[currentAddress]}
                    /></> : <></>}
            </div>
        </div>
    );
};

export default AccountSummary;