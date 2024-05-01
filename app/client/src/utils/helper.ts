import { toast } from "react-toastify";

const handleCopy = async (value: any) => {
    toast(`Copied`)
    await navigator.clipboard.writeText(`${value}`);
}

export {handleCopy}