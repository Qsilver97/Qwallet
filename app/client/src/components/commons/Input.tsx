type InputProps = {
    type?: string
    inputId: string
    label: string
    placeholder?: string
    inputStyle?: 'forms' | 'base' | 'modal'
    gapVariant?: 'strech' | 'base'
}

const Input = ({type = "text", inputId, label, inputStyle = 'base', gapVariant = 'base', placeholder}: InputProps) => {
    const backgrounds = {
        base: 'bg-dark-input',
        'off-white': 'bg-white/5',
        transparent: "bg-transparent"
    }
    const gaps = {
        base: 'gap-12',
        strech: 'gap-3'
    }

    const inputStylesMap = {
        forms: {
            input: `${backgrounds['off-white']} w-full max-w-xl h-10 px-3 outline-none rounded-[10px] font-Inter border-white/10 border`,
            label: "font-Inter font-medium text-sm",
            outerContainer: `flex flex-col ${gaps[gapVariant]}`
        },
        base: {
            input:`${backgrounds["base"]} max-w-xl h-10 px-3 outline-none rounded-[5px] font-Inter`,
            label: "text-lg",
            outerContainer: `flex flex-col ${gaps[gapVariant]}`

        },
        modal: {
            input:`${backgrounds["transparent"]} max-w-xl h-10 p-5 outline-none rounded-2xl border-white/60 border text-sm font-semibold font-Inter`,
            label: "text-lg",
            outerContainer: `flex flex-col ${gaps["strech"]}`
        },
    }

    const style = inputStylesMap[inputStyle]
    
    return (
        <div className={style.outerContainer}>
            <label htmlFor={inputId} className={style.label}>{label}</label>
            <input type={type} id={inputId} className={style.input} placeholder={placeholder ? placeholder : ""} />
        </div>
    )
}

export default Input