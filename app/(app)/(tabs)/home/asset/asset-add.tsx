import AddAsset from "@/components/assets/add-asset/AddAsset";
import AppScreen from "@/components/common/AppScreen";
import React from "react";
import { View } from "react-native";

const CreateAsset = () => {
    return (
        <AppScreen hasHeader>
            <AddAsset />
        </AppScreen>
    );
};

export default CreateAsset;
