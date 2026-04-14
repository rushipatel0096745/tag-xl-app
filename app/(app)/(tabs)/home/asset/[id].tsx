import AssetDetails from "@/components/assets/AssetDetails";
import AppScreen from "@/components/common/AppScreen";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

const AssetItemDetails = () => {
    const { id }: { id: string } = useLocalSearchParams();

    return (
        <AppScreen>
            <AssetDetails id={id} />
        </AppScreen>
    );
};

export default AssetItemDetails;
