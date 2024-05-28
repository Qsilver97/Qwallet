import axios from "axios";
import { formatNumberWithCommas, handleCopy } from "../../utils/helper";
import { HistoryEntry } from "./Activity";
import { SERVER_URL } from "../../utils/constants";
import { useCallback, useState } from "react";
import _ from 'lodash';
import { ClipboardDocumentIcon } from '@heroicons/react/24/solid';


interface ActivityTableProps {
    history: HistoryEntry[];
    loading: boolean;
}


const ActivityTable = ({ history, loading }: ActivityTableProps) => {
    const [hoverIdx, setHoverIdx] = useState<number>();
    const [hoverItem, setHoverItem] = useState<string>();
    const [itemLoading, setItemLoading] = useState<boolean>(false);


    const handleMouseEnter = useCallback(_.throttle(async (_: React.MouseEvent<HTMLSpanElement, MouseEvent>, item: HistoryEntry, idx: number) => {
        setItemLoading(true);
        setHoverIdx(idx);
        const command = `${item[1]} ${item[0]}`;
        try {
            const resp = await axios.post(`${SERVER_URL}/api/call-socket`, { command });
            setHoverItem(JSON.stringify(resp.data.sctx));
            console.log(JSON.stringify(resp.data.sctx));
        } catch (error) {

        } finally {
            setItemLoading(false);
        }
    }, 100), []);


    const handleMouseLeave = () => {
        setHoverIdx(undefined);
        setHoverItem(undefined);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col">
                <div className="-m-1.5 overflow-x-auto">
                    <div className="p-1.5 min-w-full inline-block align-middle">
                        <div className="overflow-hidden">
                            {loading ?
                                <div className={`flex items-center justify-center min-h-screen`}>
                                    <div className="flex flex-col justify-center items-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                        <p className="mt-3 text-lg">Loading...</p>
                                    </div>
                                </div> :
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                                    <thead>
                                        <tr>
                                            <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">TXID</th>
                                            <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">TICK</th>
                                            <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">ADDRESS</th>
                                            <th scope="col" className="px-1 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">AMOUNT</th>
                                            {/* <th scope="col" className="px-1 py-3 text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Action</th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700 font-mono">
                                        {history && history.length > 0 &&
                                            history.map((item, idx) => {
                                                return <tr
                                                    key={idx}
                                                    onMouseEnter={(e) => { handleMouseEnter(e, item, idx) }}
                                                    onMouseLeave={handleMouseLeave}
                                                    className="relative px-1 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200"
                                                >
                                                    <td
                                                        className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 font-mono"
                                                    >
                                                        <div className="flex gap-1">
                                                            <span>
                                                                {item[1]}
                                                            </span>
                                                            <span>
                                                                <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer text-white hover:text-red-400" onClick={() => handleCopy(item[1])} />
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 font-mono">
                                                        <div className="flex gap-1">
                                                            <span>
                                                                {formatNumberWithCommas(parseInt(item[0]))}
                                                            </span>
                                                            <span>
                                                                <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer text-white hover:text-red-400" onClick={() => handleCopy(item[0])} />
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                                                        <div className="flex gap-1">
                                                            <span>
                                                                {item[2]}
                                                            </span>
                                                            <span>
                                                                <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer text-white hover:text-red-400" onClick={() => handleCopy(item[2])} />
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                                                        <div className="flex gap-1">
                                                            <span>
                                                                {formatNumberWithCommas(parseInt(item[3]))}
                                                            </span>
                                                            <span>
                                                                <ClipboardDocumentIcon className="h-5 w-5 cursor-pointer text-white hover:text-red-400" onClick={() => handleCopy(item[3])} />
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {hoverIdx != undefined && hoverIdx == idx && item[2].startsWith('BAAAAAAA') &&
                                                        <div
                                                            className="absolute bg-white text-black border border-gray-300 shadow-lg p-2 max-w-[300px] top-0 left-0 break-words overflow-hidden whitespace-normal z-10"
                                                        >
                                                            {itemLoading ?
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div> :
                                                                hoverItem
                                                            }
                                                        </div>
                                                    }
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityTable
