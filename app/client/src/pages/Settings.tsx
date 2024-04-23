import Layout from "../components/layout";
import Input from "../components/commons/Input";
import Title from "../components/commons/Title";
import Button from "../components/commons/Button";
import MainContent from "../components/layout/MainContent";
import InnerContainer from "../components/layout/InnerContainer";

const Profile = () => {
    return (
        <>
            <Layout>
                <MainContent>
                    <Title
                        text="Settings"
                        iconUrl="/assets/images/sidebar/settings.svg"
                    />
                    <InnerContainer gapVariant="forms">
                        <div className="space-y-8">
                            <Input
                                label="New Password"
                                inputId="newPassword"
                                gapVariant="strech"
                                inputStyle="forms"
                            />
                            <Input
                                label="Old Password"
                                inputId="oldPassword"
                                gapVariant="strech"
                                inputStyle="forms"
                            />
                            <Input
                                label="Confirm Password"
                                inputId="confirmPassword"
                                gapVariant="strech"
                                inputStyle="forms"
                            />
                        </div>

                        <Button variant="primary">Save</Button>
                    </InnerContainer>
                </MainContent>
            </Layout>
        </>
    );
};

export default Profile;
