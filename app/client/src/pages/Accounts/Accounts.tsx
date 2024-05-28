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

    useEffect(() => {
        accountInfo?.addresses.forEach((item) => {
            if (item !== "") {
                setData((currentData) => {
                    const idx = currentData.findIndex((temp) => temp.address === item);
                    const balance = balances[item] || 0;

                    if (idx === -1) {
                        // If the address doesn't exist, add it
                        return [...currentData, { address: item, balance }];
                    } else {
                        // If the address exists, update its balance
                        return currentData.map((dataItem, index) =>
                            index === idx ? { ...dataItem, balance } : dataItem
                        );
                    }
                });
            }
        });
    }, [accountInfo, balances]);
    
    const pagesTotal = Math.round(data.length / 10);

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
                                <Button variant="primary">ADD ADDRESS</Button>
                            </a>
                        </div>

                        <AccountSummary />
                    </div>

                    <InnerContainer gapVariant="forms" paddingVariant="lists">
                        {/* <div className="absolute top-2 left-2">
                            <TokenSelect options={options} hideTokenValue />
                        </div> */}

                        <div className="mt-4">
                            <AccountGrid data={data} currentPage={1} />
                            {
                                pagesTotal > 1 &&
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
                            }
                        </div>
                    </InnerContainer>
                </MainContent>
            </Layout>
        </>
    );
};

export default Accounts;
