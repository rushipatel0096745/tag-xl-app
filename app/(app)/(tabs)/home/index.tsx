// app/(app)/(tabs)/home/index.tsx

import Dashboard from "@/components/assets/Dashboard";
import { GetDashboardData } from "@/services/asset";
import { useEffect } from "react";
import { Alert, View } from "react-native";

export default function Index() {
    const fetchDashbordData = async function () {
        const result = await GetDashboardData();
        if (result.has_error) {
            Alert.alert("Error", result.message);
            return;
        }

        if (!result.has_error) {
            console.log("dashboard data: ", result);
        }
    };

    useEffect(() => {
        fetchDashbordData();
    }, []);

    return (
        <View className='flex items-center justify-center bg-white'>
            <View>
                <Dashboard />
            </View>
        </View>
    );
}
