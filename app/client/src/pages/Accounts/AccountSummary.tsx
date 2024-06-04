import React from 'react';
import SummaryItem from '../../components/dashboard/SummaryItem';
import { useAuth } from '../../contexts/AuthContext';

const AccountSummary: React.FC = () => {
    const { balances, marketcap, tick } = useAuth();
    return (
        <div>
            <div >
                <SummaryItem
                    label={'Balance'}
                    icon={'/assets/images/dashboard/totalDeposit.svg'}
                    unit='$'
                    amount={parseFloat(marketcap?.price ? (Object.keys(balances).reduce((sum, key) => BigInt(sum) + balances[key], 0n) * BigInt(parseFloat(marketcap?.price) * 100000000)).toString() : '0') / 100000000}
                />
                <SummaryItem
                    label={'Ticks'}
                    icon={'/assets/images/dashboard/totalAssets.svg'}
                    amount={parseInt(tick)}
                />
            </div>
        </div>
    );
};

export default AccountSummary;