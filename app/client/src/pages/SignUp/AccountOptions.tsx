import { Link } from "react-router-dom";

import LoginContainer from "../Login/LoginContainer";
import Button from "../../components/commons/Button";
import { useState } from "react";

const AccountOptions = () => {
    const [authMethod, isAuthMethod] = useState("words")
    const nextPageUrl = authMethod === "words" ? "words" : "chars"

    return (
        <LoginContainer>
            <img src="/assets/images/tech-blocks-image.png" alt="Cloud technology communication" className="w-3/6 lg:w-auto"/>

            <div className="w-2/5 flex flex-col gap-[60px]">
                <img src="/assets/images/logo.svg" alt="Logo" className="h-[50px] self-start" />

                <div className="flex flex-col gap-12">
                    <p className="text-lg font-semibold font-Montserrat">There are two ways to create your account.</p>

                    <div className="flex justify-center lg:justify-start lg:ml-14 gap-16">
                        <div className="flex items-center gap-5 accent-dark-blue">
                            <input type="radio" name="accountOption" id="24words" className="w-5 h-5" defaultChecked onClick={() => isAuthMethod("words")} />
                            <label htmlFor="24words" className="text-base font-semibold font-Inter">24 Words</label>
                        </div>
                        <div className="flex items-center gap-5 accent-dark-blue">
                            <input type="radio" name="accountOption" id="55chards" className="w-5 h-5" onClick={() => isAuthMethod("chars")} />
                            <label htmlFor="55chards" className="text-base font-semibold font-Inter">55 Chars</label>
                        </div>
                    </div>

                    <div className="flex justify-start md:ml-6 lg:ml-6 gap-6 md:gap-10 lg:gap-20">
                        <Link to={`/signup/${nextPageUrl}`} className="inline-block w-full lg:w-fit">
                            <Button variant="primary" size="wide">Back</Button>
                        </Link>

                        <Link to={`/signup/${nextPageUrl}`} className="inline-block w-full lg:w-fit">
                            <Button variant="primary" size="wide">Next</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </LoginContainer>
    )
}

export default AccountOptions;