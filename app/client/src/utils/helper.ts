import { toast } from "react-toastify";

const handleCopy = async (value: any) => {
    toast(`Copied`)
    await navigator.clipboard.writeText(`${value}`);
}

function isNaturalNumber(str: string): boolean {
    // Regular expression to match a natural number (non-negative integer)
    const naturalNumberRegex = /^[0-9]+$/;
    return naturalNumberRegex.test(str);
}

function isPositiveNumber(str: string): boolean {
    // Regular expression to match a positive integer (greater than zero)
    const positiveNumberRegex = /^[1-9][0-9]*$/;
    return positiveNumberRegex.test(str);
}

export { handleCopy, isNaturalNumber, isPositiveNumber }