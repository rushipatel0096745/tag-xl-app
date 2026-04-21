import AppScreen from "@/components/common/AppScreen";
import MaintenanceCheck from "@/components/search/MaintenanceCheck";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";

const MaintenanceCheckView = () => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1 }}>
                <MaintenanceCheck />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default MaintenanceCheckView;
