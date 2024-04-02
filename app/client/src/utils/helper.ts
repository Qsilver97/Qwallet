import { toast } from "react-toastify";

const handleCopy = async (value: any) => {
    toast(`Copied`)
    await navigator.clipboard.writeText(`${value}`);
}

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export { handleCopy, delay }