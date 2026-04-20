import AssetList from "@/components/assets/AssetList";
import AppScreen from "@/components/common/AppScreen";
import React from "react";

const AssetListView = () => {
    return (
        <AppScreen hasHeader>
            <AssetList />
        </AppScreen>
    );
};

export default AssetListView;
