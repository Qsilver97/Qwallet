import { Link } from "react-router-dom";

import LoginContainer from "../Login/LoginContainer";
import Input from "../../components/commons/Input";
import Button from "../../components/commons/Button";

const SignUp = () => {
    return (
        <LoginContainer>
            <img src="/assets/images/tech-blocks-image.png" alt="Cloud technology communication" className="w-3/6 lg:w-auto"/>

            <div className="w-2/5 flex flex-col gap-[60px]">
                <img src="/assets/images/logo.svg" alt="Logo" className="h-[50px] self-start" />

                <div className="flex flex-col gap-12">
                    <Input label="Password" inputId="password" type="password" />
                    <Input label="Confirm Password" inputId="confirmPassword" type="password" />

                    <div className="flex justify-center gap-8 lg:gap-20">
                        <Link to={'/login'} className="inline-block w-full lg:w-fit">
                            <Button variant="primary" size="wide">Login</Button>
                        </Link>

                        <Link to={'/signup/option'} className="inline-block w-full lg:w-fit">
                            <Button variant="primary" size="wide">Next</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </LoginContainer>
    )
}

export default SignUp;