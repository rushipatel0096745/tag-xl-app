import PreUseCheck from "@/components/search/PreUseCheck";
import React from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";

const PreUseCheckView = () => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1 }}>
                <PreUseCheck />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default PreUseCheckView;
