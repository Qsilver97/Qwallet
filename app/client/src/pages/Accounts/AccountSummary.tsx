import React from 'react';
import SummaryItem from '../../components/dashboard/SummaryItem';
import { useAuth } from '../../contexts/AuthContext';

const AccountSummary: React.FC = () => {
    const { marketcap, portfolio, currentAddress } = useAuth();
    return (
        <div>
            <div className="flex">
                
                    <SummaryItem
                        label="Portfolio(USD)"
                        icon="/assets/images/dashboard/totalDeposit.svg"
                        unit="$"
                        amount={marketcap?.price && portfolio[currentAddress] ? Number(BigInt(portfolio[currentAddress]) * BigInt(Math.floor((parseFloat(marketcap?.price) || 0) * 10000000))) / 10000000 : 0}
                    />
                    <SummaryItem
                        label="Portfolio(QU)"
                        icon="/assets/images/dashboard/totalAssets.svg"
                        unit="QU"
                        amount={portfolio[currentAddress] || 0n}
                    />
            </div>
        </div>
    );
};

export default AccountSummary;