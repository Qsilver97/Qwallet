import ActivityTable from "./ActivityTable";
import Layout from "../../components/layout"
import Title from "../../components/commons/Title";
import Pagination from "../../components/commons/Pagination";
import MainContent from "../../components/layout/MainContent";
import InnerContainer from "../../components/layout/InnerContainer";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { SERVER_URL } from "../../utils/constants";
import axios from "axios";

const PAGEPERNUM = 10;

export interface HistoryEntry {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: number;
}

const Activity = () => {
    const { currentAddress } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [currentPageNum, setCurrentPageNum] = useState<number>(1);
    const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
    const totalPageNum = Math.ceil(history.length / PAGEPERNUM) || 0;

    const handleChangePageNum = (pageNum: number) => {
        setCurrentPageNum(pageNum)
    }

    const getPaginatedHistory = (pageNum: number, pagePerNum: number): HistoryEntry[] => {
        const startIndex = (pageNum - 1) * pagePerNum;
        const endIndex = startIndex + pagePerNum;
        const sortedHistory = [...history].sort((a, b) => {
            if (a[0] < b[0]) return 1;
            if (a[0] > b[0]) return -1;
            return 0;
        })
        const filteredHistory = sortedHistory.slice(startIndex, endIndex);
        return filteredHistory;
    };

    useEffect(() => {
        async function init() {
            try {
                setLoading(true);
                const resp = await axios.post(`${SERVER_URL}/api/history`, { address: currentAddress });
                if (resp.data.history) {
                    setHistory(resp.data.history);
                }
            } catch (error) {

            } finally {
                setLoading(false);
            }
        }
        init();
    }, [currentAddress, currentPageNum]);

    useEffect(() => {
        setFilteredHistory(getPaginatedHistory(currentPageNum, PAGEPERNUM));
    }, [history])

    return (
        <>
            <Layout>
                <MainContent>
                    <Title text="Activity" iconUrl="/assets/images/sidebar/activity.svg" />
                    <InnerContainer gapVariant="sm">
                        <ActivityTable history={filteredHistory} loading={loading} />
                        <Pagination count={totalPageNum} handleChangePageNum={handleChangePageNum} />
                    </InnerContainer>
                </MainContent>
            </Layout>
        </>
    )
}

export default Activity;