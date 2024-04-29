import React, { ReactNode } from "react";

type TextProps = {
    children: ReactNode;
    size?: "base" | "xs" | "sm" | "lg" | "xl";
    weight?: "base" | "light" | "medium" | "semibold" | "bold";
    font?: "inter" | "montserrat";
    className?: string;
    onClick?: () => void;
};

const Text: React.FC<TextProps> = ({
    children,
    size = "base",
    weight = "base",
    font = "inter",
    className = "",
    onClick,
}) => {
    const sizes = {
        base: "regular",
        xs: "xs",
        sm: "sm",
        lg: "lg",
        xl: "xl",
    };
    const weights = {
        base: "regular",
        light: "light",
        medium: "medium",
        semibold: "semibold",
        bold: "bold",
    };
    const fontTypes = {
        inter: "Inter",
        montserrat: "Montserrat",
    };

    return (
        <p
            className={`text-${sizes[size]} font-${weights[weight]} font-${fontTypes[font]}  ${className}`}
            onClick={onClick}
        >
            {children}
        </p>
    );
};

export default Text;
