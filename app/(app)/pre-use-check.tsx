import AppScreen from "@/components/common/AppScreen";
import PreUseCheck from "@/components/search/PreUseCheck";
import React from "react";
import { View } from "react-native";

const PreUseCheckView = () => {
    return (
        <View style={{ flex: 1 }}>
            <PreUseCheck />
        </View>
    );
};

export default PreUseCheckView;
