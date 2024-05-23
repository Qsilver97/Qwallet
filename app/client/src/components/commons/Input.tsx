type InputProps = {
    type?: string;
    inputId: string;
    label: string;
    placeholder?: string;
    inputStyle?: "forms" | "base" | "modal" | "custom";
    gapVariant?: "strech" | "base" | "xs";
    backgroundVariant?: "base" | "off-white" | "transparent";
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Input = ({
    type = "text",
    inputId,
    label,
    inputStyle = "base",
    gapVariant = "base",
    backgroundVariant = "base",
    placeholder,
    value,
    onChange,
}: InputProps) => {
    const backgrounds = {
        base: "bg-dark-input",
        "off-white": "bg-white/5",
        transparent: "bg-transparent",
    };
    const gaps = {
        base: "gap-5",
        strech: "gap-3",
        xs: "gap-1",
    };

    const inputStylesMap = {
        forms: {
            input: `${backgrounds["off-white"]} w-full max-w-xl h-10 px-3 outline-none rounded-[10px] font-Inter border-white/10 border`,
            label: "font-Inter font-medium text-sm",
            outerContainer: `flex flex-col ${gaps[gapVariant]}`,
        },
        base: {
            input: `${backgrounds["base"]} max-w-xl h-10 px-3 outline-none rounded-[5px] font-Inter`,
            label: "font-Montserrat font-semibold text-lg",
            outerContainer: `flex flex-col ${gaps[gapVariant]}`,
        },
        modal: {
            input: `${backgrounds["transparent"]} h-10 p-5 outline-none rounded-2xl border-white/60 border text-sm font-semibold font-Inter`,
            label: "text-lg",
            outerContainer: `flex flex-col ${gaps["strech"]}`,
        },
        custom: {
            input: `${backgrounds[backgroundVariant]} max-w-xl h-10 px-3 outline-none rounded-[5px] font-Inter`,
            label: "text-lg",
            outerContainer: `flex flex-col ${gaps[gapVariant]}`,
        },
    };

    const style = inputStylesMap[inputStyle];

    return (
        <div className={style.outerContainer}>
            <label htmlFor={inputId} className={style.label}>
                {label}
            </label>
            <input
                type={type}
                id={inputId}
                className={style.input}
                placeholder={placeholder ? placeholder : ""}
                min={0}
                value={value}
                onChange={onChange}
            />
        </div>
    );
};

export default Input;
