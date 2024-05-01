import React from 'react';
import Button from '../commons/Button';

const Ads: React.FC = () => {
    return (
        <div className='rounded-lg bg-[#2C2C2C] px-6 py-8 flex flex-col text-center'>
            <img src='/assets/images/logo.svg' />
            <div className='mt-10 mb-3'>
                Join Our Community
            </div>
            <Button size='full' variant="primary" onClick={() => console.log('Clicked Join Now!')}>
                Join Now
            </Button>
        </div>
    );
};

export default Ads;
