type TitleProps = {
    text: string
    iconUrl: string
}

const Title = ({text, iconUrl}: TitleProps) => {
    return (
        <div className="flex items-center gap-3">
            <img src={iconUrl} alt="Trading Icon" className="w-[55px]" />
            <h1 className="text-4xl mb-[5px]">{text}</h1>
        </div>
    )
}

export default Title