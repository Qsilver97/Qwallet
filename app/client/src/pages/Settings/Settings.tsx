import { useState } from "react";
import Layout from "../../components/layout";
import Title from "../../components/commons/Title";
import MainContent from "../../components/layout/MainContent";
import InnerContainer from "../../components/layout/InnerContainer";
import SidebarSettings from "./SidebarSettings";
import InnerSettings from "./InnerSettings";

export type ActiveItems =
    | "General"
    | "Security & Privacy"
    | "Support"
    | "About Qubic";

const Profile = () => {
    const [activeItem, setActiveItem] = useState<ActiveItems>("General");

    return (
        <>
            <Layout>
                <MainContent>
                    <Title
                        text="Settings"
                        iconUrl="/assets/images/sidebar/settings.svg"
                    />

                    <div className="flex gap-12">
                        <SidebarSettings
                            activeItem={activeItem}
                            setActiveItem={setActiveItem}
                        />
                        <InnerContainer gapVariant="forms">
                            <InnerSettings activeItem={activeItem} />
                        </InnerContainer>
                    </div>
                </MainContent>
            </Layout>
        </>
    );
};

export default Profile;
