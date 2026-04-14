import AppScreen from "@/components/common/AppScreen";
import MaintenanceCheck from "@/components/search/MaintenanceCheck";
import React from "react";
import { View } from "react-native";

const MaintenanceCheckView = () => {
    return (
        <View style={{ flex: 1 }}>
            <MaintenanceCheck />
        </View>
    );
};

export default MaintenanceCheckView;
