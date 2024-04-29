import { ReactNode } from "react"

type MainContentProps = {
    children: ReactNode
}

const MainContent = ({children}: MainContentProps) => {
    return <div className="bg-dark/60 w-full h-max rounded-2xl px-12 py-10 flex flex-col gap-7">
        {children}
    </div>
}

export default MainContent