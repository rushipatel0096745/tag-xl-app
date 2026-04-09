import AlertEdit from "@/components/alerts/AlertEdit";
import AppScreen from "@/components/common/AppScreen";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const AlertEditView = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <AppScreen>
            <AlertEdit id={id} />
        </AppScreen>
    );
};

export default AlertEditView;
