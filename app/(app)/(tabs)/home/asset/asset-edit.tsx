import AssetEdit from "@/components/assets/AssetEdit";
import AppScreen from "@/components/common/AppScreen";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const AssetEditView = () => {
    const { id }: { id: string } = useLocalSearchParams();

    return (
        // <View className="flex-1">
        <AppScreen scroll>
            <AssetEdit id={id} />
        </AppScreen>
        // </View>
    );
};

export default AssetEditView;
