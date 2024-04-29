import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Text } from "../../components/commons";

type ColumnGridProps = {
    inputValues?: boolean;
};

const ColumnGrid = ({ inputValues = false }: ColumnGridProps) => {
    const [blurBackground, setBlurBackground] = useState(true);

    const { seeds } = useAuth();

    return (
        <div className="grid grid-cols-4 gap-6 relative rounded-lg">
            {typeof seeds == "object" &&
                seeds.map((seed, idx) => (
                    <div
                        key={idx}
                        className="relative flex justify-between w-20 bg-gray-200 rounded-md"
                    >
                        <span>{idx}</span>
                        {inputValues ? (
                            <input
                                type="text"
                                className="border-none outline-none select-none text-center text-white m-0 p-0 bg-transparent w-full"
                            />
                        ) : (
                            <span>{seed}</span>
                        )}

                        <div className="absolute bottom-0 border border-white w-full h-[1px]"></div>
                    </div>
                ))}
            {!inputValues && blurBackground && (
                <>
                    <div className="bg-gray bg-opacity-40 backdrop-filter backdrop-blur-sm absolute top-0 left-0 w-[110%] h-[110%] -translate-x-[5%] -translate-y-[5%] rounded-lg"></div>
                    <div
                        className="cursor-pointer flex gap-2 rounded-full bg-dark py-4 px-14 absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        onClick={() => setBlurBackground(false)}
                    >
                        <img
                            src="/assets/images/signup/eye.svg"
                            alt="Content Eye Locker"
                            className="w-6 h-6 "
                        />
                        <Text weight="bold">View</Text>
                    </div>
                </>
            )}
        </div>
    );
};

export default ColumnGrid;
