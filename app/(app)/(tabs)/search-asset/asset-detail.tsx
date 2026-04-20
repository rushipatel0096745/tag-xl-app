import AssetDetails from "@/components/search/AssetDetails";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";

const AssetDetailView = () => {
    const { uid } = useLocalSearchParams<{ uid: string }>();

    return (
        <ScrollView className='flex-1'>
            <AssetDetails uid={uid} />
        </ScrollView>
    );
};

export default AssetDetailView;
