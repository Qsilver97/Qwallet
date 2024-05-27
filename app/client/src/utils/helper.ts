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

function formatNumberWithCommas(number: number) {
    if(!number) return 0;
    const options = Number.isInteger(number)
        ? {}
        : { minimumFractionDigits: 3, maximumFractionDigits: 3 };

    return number.toLocaleString('en-US', options);
}

export { handleCopy, isNaturalNumber, isPositiveNumber, formatNumberWithCommas }