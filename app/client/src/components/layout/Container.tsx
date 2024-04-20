import React from 'react';

const Container: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className='h-max p-[43px] flex flex-col gap-5'>
            {children}
        </div>
    )
};

export default Container;
