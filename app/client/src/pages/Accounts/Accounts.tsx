import { Link } from "react-router-dom";
import { Pagination, PaginationItem } from "@mui/material";

import Button from "../../components/commons/Button";
import Title from "../../components/commons/Title";
import Layout from "../../components/layout"
import InnerContainer from "../../components/layout/InnerContainer";
import MainContent from "../../components/layout/MainContent";
import AccountSummary from "./AccountSummary";
import AccountGrid from "./AccountGrid";

const Accounts = () => {

    const data = [
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
        {
            address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
            balance: 250
        },
    ]

    const pagesTotal = data.length % 10

    return (
        <>
            <Layout>
                <MainContent>
                    <div className="space-y-8">
                        <div className="flex justify-between items-center w-full">
                            <Title text="ACCOUNTS" iconUrl="/assets/images/sidebar/accounts.svg" />
                            
                            <Link to={'#'}>
                                <Button variant="primary">ADD ACCOUNT</Button>
                            </Link>
                        </div>

                        <AccountSummary/>
                    </div>

                    <InnerContainer gapVariant="forms" paddingVariant="lists">
                        <div>
                            <AccountGrid data={data} currentPage={1}/>

                            <Pagination count={pagesTotal} shape="rounded" color="primary" className="w-fit mx-auto mt-7" renderItem={(item) => (
                                <PaginationItem
                                    style={{color: "#fff"}}
                                    {...item}
                                />
                                )} 
                            />
                        </div>
                    </InnerContainer>
                </MainContent>
            </Layout>
        </>
    )
}

export default Accounts;