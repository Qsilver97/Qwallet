import React from "react";
import { assetsItems } from "../../utils/constants";
import AssetItem from "./AssetItem";

const Assets: React.FC = () => {
    return (
        <div className="rounded-lg bg-dark px-6 py-8 flex flex-col text-center">
            {assetsItems.map((item, idx) => {
                return <AssetItem item={item} key={idx} />;
            })}
        </div>
    );
};

export default Assets;
