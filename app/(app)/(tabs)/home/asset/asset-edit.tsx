import AssetEdit from "@/components/assets/AssetEdit";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

const AssetEditView = () => {
    const { id }: { id: string } = useLocalSearchParams();

    return (
        <View className="flex-1">
            <AssetEdit id={id} />
        </View>
    );
};

export default AssetEditView;
