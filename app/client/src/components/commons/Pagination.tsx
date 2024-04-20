import React from 'react';
import { PaginationItem, Pagination as PaginationMui } from '@mui/material';

type PaginationProps = {
    count: number
}

const Pagination: React.FC<PaginationProps> = ({count}) => {

    return <PaginationMui count={count} shape="rounded" color="primary" className="w-fit mx-auto mt-7" renderItem={(item) => (
        <PaginationItem
            style={{color: "#fff"}}
            {...item}
        />
        )} 
    />
};

export default Pagination;
