import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";

const ChildComponent: React.FC<{ value: string }> = ({ value }) => {
    return <div>{value}</div>;
};

const CliSocket: React.FC = () => {

    const [wasmCommand, setWasmCommand] = useState<string>("");
    const { socket, mode } = useAuth();
    const [result, setResult] = useState<string>("");
    const [wasmChildren, setWasmChildren] = useState<Array<JSX.Element>>([]);

    const [socketChildren, setSocketChildren] = useState<Array<JSX.Element>>([]);
    const [socketCommand, setSocketCommand] = useState<string>("");


    const addSocketChild = (value: string) => {
        setSocketChildren(currentChildren => {
            const newChild = <ChildComponent value={value} key={currentChildren.length} />;
            return [newChild, ...currentChildren];
        })
    }

    const addWasmChild = (value: string) => {
        setWasmChildren(currentChildren => {
            const newChild = <ChildComponent value={value} key={currentChildren.length} />;
            return [newChild, ...currentChildren];
        });
    };

    const handleWasmCommand = (e: any) => {
        setWasmCommand(e.target.value);
    }

    const handleSocketCommand = (e: any) => {
        setSocketCommand(e.target.value);
    }

    const handleWasmSend = () => {
        axios.post(
            `${SERVER_URL}/api/ccall-v1request`,
            {
                command: wasmCommand,
                flag: 'cli',
            }
        ).then((resp) => {
            console.log(resp.data)
        }).catch(() => {

        })
    }

    const handleSocketSend = () => {
        axios.post(
            `${SERVER_URL}/api/socket`,
            {
                command: socketCommand,
                socketUrl: mode.wsUrl,
                flag: 'socket',
            }
        ).then((resp) => {
            console.log(resp.data)
        }).catch(() => {

        })
    }

    useEffect(() => {
        if (socket) {
            socket.on('result', (msg) => {
                setResult(msg);
                const timestamp = new Date().toISOString();
                addWasmChild(`[${timestamp}] result: ${msg}`);
            })
            socket.on('log', (msg) => {
                addWasmChild(msg);
            })
            socket.on('socketLog', (msg) => {
                addSocketChild(msg);
            })
        }
    }, [socket])

    return (
        <div className="flex gap-2">
            <div className="my-5 p-5 bg-white text-black rounded-lg shadow-md top-2 w-full max-w-[50%] max-h-[100vh]">
                <div className="mb-5 flex gap-2.5 items-center">
                    <h2>WASM</h2>
                    <input className="p-2.5 border border-gray-300 rounded w-full" onChange={handleWasmCommand} />
                    <button className="px-5 py-2.5 bg-blue-600 text-white rounded cursor-pointer" onClick={handleWasmSend}>Send</button>
                    {/* <button className="px-5 py-2.5 bg-blue-600 text-white rounded cursor-pointer">Stop</button> */}
                </div>
                <div className="border border-gray-300 rounded p-2.5 h-18 overflow-y-auto bg-gray-100 h-[70px]">{result}</div>
                <div className="border border-gray-300 rounded p-2.5 h-18 overflow-auto whitespace-nowrap bg-gray-100 h-[calc(100vh-220px)]">
                    {wasmChildren.map(child => child)}
                </div>
            </div>
            <div className="my-5 p-5 bg-white text-black rounded-lg shadow-md top-2 w-full max-w-[50%] max-h-[100vh]">
                <div className="mb-5 flex gap-2.5 items-center">
                    <h2>Socket</h2>
                    <input className="p-2.5 border border-gray-300 rounded w-full" onChange={handleSocketCommand} />
                    <button className="px-5 py-2.5 bg-blue-600 text-white rounded cursor-pointer" onClick={handleSocketSend}>Send</button>
                    {/* <button className="px-5 py-2.5 bg-blue-600 text-white rounded cursor-pointer">Stop</button> */}
                </div>
                {/* <div className="border border-gray-300 rounded p-2.5 h-18 overflow-y-auto bg-gray-100 h-[70px]">{result}</div> */}
                <div className="border border-gray-300 rounded p-2.5 h-18 overflow-auto whitespace-nowrap bg-gray-100 h-[calc(100vh-220px)]">
                    {socketChildren.map(child => child)}
                </div>
            </div>
        </div>
    )
}

export default CliSocket;