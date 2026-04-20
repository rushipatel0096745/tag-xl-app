// app/(app)/(tabs)/home/index.tsx

import Dashboard, { DashboardData } from "@/components/assets/Dashboard";
import { useAuth } from "@/context/AuthContext";
import { GetDashboardData } from "@/services/asset";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";

export default function Index() {
    const initialDashboardData: DashboardData = {
        total_assets: 0,
        total_maintenance: 0,
        total_certificate_expiry: 0,
        total_failures: 0,
        total_tag_available_of_use: 0,
        total_maintenance_due: 0,
        total_alerts: 0,
    };

    const { logOut } = useAuth();

    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);

    const fetchDashboardData = async () => {
        const result = await GetDashboardData();

        if (result.has_error && result.message === "Invalid or expired session") {
            Alert.alert("Session Over", "", [
                {
                    text: "OK",
                    onPress: () => {
                        logOut();
                        router.replace("/(auth)/sign-in");
                    },
                },
            ]);
            return;
        }

        if (result.has_error) {
            Alert.alert("Error", result.message);
            return;
        }

        const { has_error, message, ...dashboardFields } = result;

        setDashboardData(dashboardFields);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };
    return (
        <ScrollView
            className='flex-1'
            style={{ flexGrow: 1, width: "100%" }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#263f94"]}
                    tintColor='#263f94'
                />
            }>
            <View className='bg-white'>
                <Dashboard data={dashboardData} />
            </View>
        </ScrollView>
    );
}
