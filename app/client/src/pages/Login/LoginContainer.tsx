import { ReactNode } from "react"

type LoginContainerProps = {
    children: ReactNode
}

const LoginContainer = ({children}: LoginContainerProps) => {
    return <div className="px-12 flex justify-center items-center gap-14 lg:gap-[72px] h-full w-full">
        {children}
    </div>
}

export default LoginContainer