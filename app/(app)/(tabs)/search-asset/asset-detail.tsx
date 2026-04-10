import AppScreen from "@/components/common/AppScreen";
import AssetDetails from "@/components/search/AssetDetails";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const AssetDetailView = () => {
    const { uid } = useLocalSearchParams<{ uid: string }>();

    return (
        <AppScreen>
            <AssetDetails uid={uid}/>
        </AppScreen>
    );
};

export default AssetDetailView;
