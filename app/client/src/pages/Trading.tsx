import Title from "../components/commons/Title";
import Layout from "../components/layout"
import MainContent from "../components/layout/MainContent";

const Trading = () => {
    return (
        <>
            <Layout>
                <MainContent >
                    <Title text="Trading" iconUrl="/assets/images/sidebar/trading.svg" />
                </MainContent>
            </Layout>
        </>
    )
}

export default Trading;