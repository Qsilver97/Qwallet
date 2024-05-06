type InnerContainerProps = {
    children: React.ReactNode;
    gapVariant?: "base" | "forms" | "sm";
    paddingVariant?: "base" | "lists";
};

const InnerContainer = ({
    children,
    gapVariant = "base",
    paddingVariant = "base",
}: InnerContainerProps) => {
    const gaps = {
        sm: "gap-4",
        base: "gap-8",
        settings: "gap-12",
        forms: "gap-16",
    };
    const paddings = {
        base: "px-12 py-16",
        lists: "px-20 py-11",
    };

    return (
        <div
            className={`relative w-full h-full ${paddings[paddingVariant]} flex flex-col bg-dark rounded-2xl ${gaps[gapVariant]}`}
        >
            {children}
        </div>
    );
};

export default InnerContainer;
