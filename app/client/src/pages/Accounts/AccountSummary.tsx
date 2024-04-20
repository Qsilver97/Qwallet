import React from 'react';
import { summaryAccountItems } from '../../utils/constants';
import SummaryItem from '../../components/dashboard/SummaryItem';

const AccountSummary: React.FC = () => {
    return (
        <div>
            <div >
                {
                    summaryAccountItems.map((item, idx) => {
                        return <SummaryItem label={item.label} icon={item.icon} amount={item.amount} key={idx} />
                    })
                }
            </div>
        </div>
    );
};

export default AccountSummary;