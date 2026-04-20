import AllAlertsList from "@/components/alerts/AllAlertsList";
import AssetFailureList from "@/components/alerts/AssetFailureList";
import MaintenanceAssetList from "@/components/alerts/MaintenanceAssetList";
import MaintenanceDueList from "@/components/alerts/MaintenanceDueList";
import RecertificationList from "@/components/alerts/RecertificationList";
import AppScreen from "@/components/common/AppScreen";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect } from "react";

const ALERT_CONFIG: Record<string, { title: string; component: React.ReactNode }> = {
    all: {
        title: "All Alerts",
        component: <AllAlertsList />,
    },
    "asset-failure": {
        title: "Asset Failure",
        component: <AssetFailureList />,
    },
    "recertification-needed": {
        title: "Recertification Needed",
        component: <RecertificationList />,
    },
    "maintenance-check-due": {
        title: "Maintenance Due",
        component: <MaintenanceDueList />,
    },
    "asset-in-maintenance": {
        title: "Assets in Maintenance",
        component: <MaintenanceAssetList />,
    },
};

const AlertList = () => {
    const { type } = useLocalSearchParams<{ type: string }>();
    const navigation = useNavigation();

    const config = ALERT_CONFIG[type] ?? ALERT_CONFIG["all"];

    useEffect(() => {
        navigation.setOptions({ title: config.title });
    }, [type]);

    // function getAlertComp(type: string) {
    //     switch (type) {
    //         case "all":
    //             return <AllAlertsList />;
    //         case "asset-failure":
    //             return <AssetFailureList />;
    //         case "recertification-needed":
    //             return <RecertificationList />;
    //         case "maintenance-check-due":
    //             return <MaintenanceDueList />;
    //         case "asset-in-maintenance":
    //             return <MaintenanceAssetList />;
    //         default:
    //             return <AllAlertsList />;
    //     }
    // }

    {
        /* <Stack.Screen options={{ title: config.title }} /> */
    }
    return <AppScreen hasHeader>{config.component}</AppScreen>;
};

export default AlertList;
