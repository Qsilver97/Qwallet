import React from 'react';
import { assetsItems } from '../../utils/constants';
import AssetItem from './AssetItem';
import Button from '../commons/Button';

const Assets: React.FC = () => {
    return (
        <div className='rounded-lg bg-dark px-6 py-8 flex flex-col text-center'>
            {
                assetsItems.map((item, idx) => {
                    return <AssetItem item={item} key={idx} />
                })
            }
            <Button variant="secondary" size="full" onClick={() => console.log('Clicked View All!')}>
                View All
            </Button>
        </div>
    );
};

export default Assets;
