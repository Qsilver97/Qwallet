import React, { useEffect, useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../utils/constants";
import { useSocket } from "../context/SocketContext";

const ChildComponent: React.FC<{ value: string }> = ({ value }) => {
    return <div>{value}</div>;
};

const Cli: React.FC = () => {

    const [command, setCommand] = useState<string>("");
    const socket = useSocket();
    const [result, setResult] = useState<string>("");
    const [children, setChildren] = useState<Array<JSX.Element>>([]);

    const addChild = (value: string) => {
        setChildren(currentChildren => {
            const newChild = <ChildComponent value={value} key={currentChildren.length} />;
            return [newChild, ...currentChildren];
        });
    };

    const handleCommand = (e: any) => {
        setCommand(e.target.value);
    }

    const handleSend = () => {
        console.log(command)
        console.log(`${SERVER_URL}/api/cli`)
        axios.post(
            `${SERVER_URL}/api/cli`,
            {
                command,
                flag: 'cli',
            }
        ).then((resp) => {
            console.log(resp.data)
        }).catch(() => {

        })
    }

    useEffect(() => {
        console.log(children);
    }, [children])

    useEffect(() => {
        if (socket) {
            socket.on('result', (msg) => {
                setResult(msg.value);
            })
            socket.on('log', (msg) => {
                addChild(msg.value);
            })
        }
    }, [socket])

    return (
        <div className="max-w-full mx-auto my-5 p-5 bg-white rounded-lg shadow-md">
            <div className="mb-5 flex gap-2.5">
                <input className="p-2.5 border border-gray-300 rounded w-full" onChange={handleCommand} />
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded cursor-pointer" onClick={handleSend}>Send</button>
                {/* <button className="px-5 py-2.5 bg-blue-600 text-white rounded cursor-pointer">Stop</button> */}
            </div>
            <div className="border border-gray-300 rounded p-2.5 h-18 overflow-y-auto bg-gray-100 h-[70px]">{result}</div>
            <div className="border border-gray-300 rounded p-2.5 h-18 overflow-y-auto bg-gray-100 h-[600px]">
                {children.map(child => child)}
            </div>
        </div>
    )
}

export default Cli;