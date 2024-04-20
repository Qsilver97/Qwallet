import Button from "../components/commons/Button";
import Input from "../components/commons/Input";
import Title from "../components/commons/Title";
import Layout from "../components/layout"
import InnerContainer from "../components/layout/InnerContainer";
import MainContent from "../components/layout/MainContent";

const Profile = () => {
    return (
        <>
            <Layout>
                <MainContent>
                    <Title text="Profile" iconUrl="/assets/images/sidebar/profile.svg" />
                    <InnerContainer gapVariant="forms">
                        <div className="space-y-8">
                            <Input label="New Password" inputId="newPassword" gapVariant="strech" inputStyle="forms" />
                            <Input label="Old Password" inputId="oldPassword" gapVariant="strech" inputStyle="forms" />
                            <Input label="Confirm Password" inputId="confirmPassword" gapVariant="strech" inputStyle="forms" />
                        </div>

                        <Button variant="primary">Save</Button>
                    </InnerContainer>
                </MainContent>
            </Layout>
        </>
    )
}

export default Profile;