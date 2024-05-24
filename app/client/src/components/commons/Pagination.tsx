import React from 'react';
import { PaginationItem, Pagination as PaginationMui } from '@mui/material';

type PaginationProps = {
    count: number;
    handleChangePageNum: (pageNum: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ count, handleChangePageNum }) => {

    const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
        handleChangePageNum(value);
    };

    return <PaginationMui
        count={count}
        shape="rounded"
        color="primary"
        className="w-fit mx-auto mt-7"
        onChange={handleChange}
        renderItem={(item) => (
            <PaginationItem
                style={{ color: "#fff" }}
                {...item}
            />
        )}
    />
};

export default Pagination;
