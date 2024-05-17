import ActivityTable from "./ActivityTable";
import Layout from "../../components/layout"
import Title from "../../components/commons/Title";
import Pagination from "../../components/commons/Pagination";
import MainContent from "../../components/layout/MainContent";
import InnerContainer from "../../components/layout/InnerContainer";

const Activity = () => {
    return (
        <>
            <Layout>
                <MainContent>
                    <Title text="Activity" iconUrl="/assets/images/sidebar/activity.svg" />
                    <InnerContainer gapVariant="sm">
                        <ActivityTable />
                        <Pagination count={10} />
                    </InnerContainer>
                </MainContent>
            </Layout>
        </>
    )
}

export default Activity;