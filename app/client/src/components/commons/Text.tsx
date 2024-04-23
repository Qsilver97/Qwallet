import React, { ReactNode } from "react";

type TextProps = {
    children: ReactNode;
    size?: "base" | "xs" | "sm" | "lg" | "xl";
    weight?: "base" | "light" | "medium" | "semibold";
    font?: "inter" | "montserrat";
    className?: string;
};

const Text: React.FC<TextProps> = ({
    children,
    size = "base",
    weight = "base",
    font = "inter",
    className = "",
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
    };
    const fontTypes = {
        inter: "Inter",
        montserrat: "Montserrat",
    };

    return (
        <p
            className={`text-${sizes[size]} font-${weights[weight]} font-${fontTypes[font]}  ${className}`}
        >
            {children}
        </p>
    );
};

export default Text;
