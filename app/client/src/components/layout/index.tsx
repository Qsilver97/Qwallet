import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Container from './Container';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <Container>
                <Navbar />

                <div className='flex gap-10 h-full'>
                    <Sidebar />
                    <div className='w-[calc(100%-230px)]'>
                        {children}
                    </div>
                </div>
            </Container>
        </>
    )
};

export default Layout;
