import Ads from "../components/dashboard/Ads";
import Assets from "../components/dashboard/Assets";
import Summary from "../components/dashboard/Summary";
import Tokens from "../components/dashboard/Tokens";
import Layout from "../components/layout";

const Dashboard = () => {
    return (
        <>
            <Layout>
                <div className="w-full grid grid-cols-[minmax(auto,calc(100%-270px))_250px] grid-rows-[auto_230px] gap-5">
                    <Summary />
                    <Assets />
                    <Tokens />
                    <Ads />
                </div>
            </Layout>
        </>
    );
};

export default Dashboard;
