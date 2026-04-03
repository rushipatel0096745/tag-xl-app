import AssetDetails from "@/components/assets/AssetDetails";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

const AssetItemDetails = () => {
    const { id }: { id: string } = useLocalSearchParams();

    return (
        <View className="flex-1">
            <AssetDetails id={id} />
        </View>
    );
};

export default AssetItemDetails;
