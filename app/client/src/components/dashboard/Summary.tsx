import React from 'react'

import SummaryItem from './SummaryItem'
import TokenSelect from './select/TokenSelect'
import { assetsItems, summaryItems } from '../../utils/constants'

const Summary: React.FC = () => {
    const options = assetsItems.map((item) => ({
        label: item.icon,
        value: item.name,
    }))

    return (
        <div className="bg-dark rounded-lg p-5">
            <div className="mb-5">
                {summaryItems.map((item, idx) => {
                    return (
                        <SummaryItem
                            label={item.label}
                            icon={item.icon}
                            amount={item.amount}
                            key={idx}
                        />
                    )
                })}
            </div>
            <TokenSelect options={options} />
            <div>
                <img src="/assets/images/dashboard/chat.svg" />
            </div>
        </div>
    )
}

export default Summary
