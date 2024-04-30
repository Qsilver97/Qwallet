import React from "react";

interface ButtonProps {
    variant: "primary" | "secondary";
    size?: "base" | "wide" | "full";
    font?: "base" | "regular";
    className?: string;
    disable?: boolean;
    children: React.ReactNode;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
    variant,
    size = "base",
    font = "base",
    disable,
    children,
    className,
    onClick,
}) => {
    const fontStyles = {
        base: {
            weight: "font-semibold",
            color: { primary: "text-white", secondary: "text-white" },
        },
        regular: {
            weight: "font-regular",
            color: { primary: "text-white", secondary: "text-inactive" },
        },
    };

    // Common base styles for all buttons
    const baseStyles = `${fontStyles[font].weight} ${className} rounded-lg px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in duration-150`;

    // Variant specific styles
    const variantStyles = {
        primary: `bg-blue-500 ${fontStyles[font].color.primary} focus:ring-blue-500 hover:bg-blue-600`,
        secondary: `bg-gray-600 ${fontStyles[font].color.secondary} focus:ring-gray-500 hover:bg-gray-700`,
    };

    const sizesStyles = {
        base: "w-full md:w-40",
        wide: "w-full lg:w-36",
        full: "w-full",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizesStyles[size]}`}
            onClick={onClick}
            disabled={disable}
        >
            {children}
        </button>
    );
};

export default Button;
