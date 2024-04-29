import { Pagination, PaginationItem } from "@mui/material";

import Button from "../../components/commons/Button";
import Title from "../../components/commons/Title";
import Layout from "../../components/layout";
import InnerContainer from "../../components/layout/InnerContainer";
import MainContent from "../../components/layout/MainContent";
import AccountSummary from "./AccountSummary";
import AccountGrid from "./AccountGrid";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import TokenSelect from "../../components/dashboard/select/TokenSelect";
import { assetsItems } from "../../utils/constants";

type DataType = {
    address: string;
    balance: number;
};

const Accounts = () => {
    const { accountInfo, balances, handleAddAccount } = useAuth();
    const [data, setData] = useState<DataType[]>([]);
    accountInfo?.addresses.map((item) => {
        return {
            address: item,
            balance: balances[item],
        };
    });

    useEffect(() => {
        accountInfo?.addresses.map((item) => {
            if (item != "") {
                const prevData = [...data];
                const idx = prevData.findIndex((temp) => temp.address == item);
                let balance = 0;
                if (balances[item]) {
                    balance = balances[item];
                }
                if (idx == -1) {
                    prevData.push({
                        address: item,
                        balance: balance,
                    });
                } else {
                    prevData[idx] = {
                        address: item,
                        balance: balance,
                    };
                }
                setData(prevData);
            }
        });
    }, [accountInfo, balances]);

    // const data = [
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    //     {
    //         address: 'NTMGHIDJKGHLDJGHIEVLJDFDJHFKSJDLKFJLKDSJFKJLKS',
    //         balance: 250
    //     },
    // ]

    const pagesTotal = data.length % 10;

    const options = assetsItems.map((item) => ({
        label: item.icon,
        value: item.name,
    }));

    return (
        <>
            <Layout>
                <MainContent>
                    <div className="space-y-8">
                        <div className="flex justify-between items-center w-full">
                            <Title
                                text="ACCOUNTS"
                                iconUrl="/assets/images/sidebar/accounts.svg"
                            />

                            <a
                                className="cursor-pointer"
                                onClick={handleAddAccount}
                            >
                                <Button variant="primary">ADD ACCOUNT</Button>
                            </a>
                        </div>

                        <AccountSummary />
                    </div>

                    <InnerContainer gapVariant="forms" paddingVariant="lists">
                        <div className="absolute top-2 left-2">
                            <TokenSelect options={options} hideTokenValue />
                        </div>

                        <div className="mt-4">
                            <AccountGrid data={data} currentPage={1} />

                            <Pagination
                                count={pagesTotal}
                                shape="rounded"
                                color="primary"
                                className="w-fit mx-auto mt-7"
                                renderItem={(item) => (
                                    <PaginationItem
                                        style={{ color: "#fff" }}
                                        {...item}
                                    />
                                )}
                            />
                        </div>
                    </InnerContainer>
                </MainContent>
            </Layout>
        </>
    );
};

export default Accounts;
