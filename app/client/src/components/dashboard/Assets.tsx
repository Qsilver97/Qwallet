import React from "react";
import AssetItem from "./AssetItem";
import { useAuth } from "../../contexts/AuthContext";

const Assets: React.FC = () => {
    const { tokens } = useAuth();

    return (
        <div className="rounded-lg bg-dark px-6 py-8 flex flex-col text-center">
            {tokens.map((token, idx) => {
                return <AssetItem token={token} key={idx} />;
            })}
        </div>
    );
};

export default Assets;
