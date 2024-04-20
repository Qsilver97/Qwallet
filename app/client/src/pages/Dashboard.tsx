import Ads from "../components/dashboard/Ads";
import Assets from "../components/dashboard/Assets";
import Summary from "../components/dashboard/Summary";
import Tokens from "../components/dashboard/Tokens";
import Layout from "../components/layout"

const Dashboard = () => {
    return (
        <>
            <Layout>
                <div className="flex w-full justify-between">
                    <div className='max-w-[calc(100%-270px)] w-full flex flex-col gap-5'>
                        <Summary />
                        <Tokens />
                    </div>
                    <div className='w-[250px] flex flex-col gap-5'>
                        <Assets />
                        <Ads />
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default Dashboard;