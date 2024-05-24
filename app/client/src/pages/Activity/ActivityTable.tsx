import { HistoryEntry } from "./Activity";

interface ActivityTableProps {
    history: HistoryEntry[];
    loading: boolean;
}


const ActivityTable = ({history, loading}: ActivityTableProps) => {
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
                                                return <tr key={idx}>
                                                    <td className="px-1 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{item[1]}</td>
                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 font-mono">{item[0]}</td>
                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{item[2]}</td>
                                                    <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">{item[3]}</td>
                                                    {/* <td className="px-1 py-4 whitespace-nowrap text-end text-sm font-medium">
                                                        <button type="button" className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent text-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-400 dark:hover:text-blue-400">Select</button>
                                                    </td> */}
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
