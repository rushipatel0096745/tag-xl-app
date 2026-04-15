import { router } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface DashboardData {
    total_assets: number;
    total_maintenance: number;
    total_certificate_expiry: number;
    total_failures: number;
    total_tag_available_of_use: number;
    total_maintenance_due: number;
    total_alerts: number;
}

const initialDashboardData: DashboardData = {
    total_assets: 0,
    total_maintenance: 0,
    total_certificate_expiry: 0,
    total_failures: 0,
    total_tag_available_of_use: 0,
    total_maintenance_due: 0,
    total_alerts: 0,
};

const Dashboard = ({ data }: { data: DashboardData }) => {
    // const [dashboardData, setDashboardData] = useState<DashboardData>(data || initialDashboardData);

    // const fetchDashbordData = async () => {
    //     const result = await GetDashboardData();

    //     if (result.has_error) {
    //         Alert.alert("Error", result.message);
    //         return;
    //     }

    //     const { has_error, message, ...dashboardFields } = result;

    //     setDashboardData(dashboardFields);
    // };

    // useEffect(() => {
    //     fetchDashbordData();
    // }, []);

    return (
        <View className='main mt-4 mx-3 flex flex-col justify-between gap-2'>
            <View className='flex-row flex-wrap justify-between '>
                <TouchableOpacity
                    className='w-[48%] bg-gray-200 p-4 mb-3 rounded-xl'
                    onPress={() => router.push("/(app)/(tabs)/home/asset/asset-list")}>
                    <View className='flex flex-col gap-1'>
                        <Text className='text-2xl font-bold text-[#263f94]'>{data.total_assets}</Text>
                        <Text className='text-lg'>Total Assets</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className='w-[48%] bg-gray-200 p-4 mb-3 rounded-xl'
                    onPress={() =>
                        router.push({
                            pathname: "/(app)/(tabs)/home/alerts/alert-list",
                            params: { type: "maintenance-check-due" },
                        })
                    }>
                    <View className='flex flex-col gap-1'>
                        <Text className='text-2xl font-bold text-[#263f94]'>{data.total_maintenance_due}</Text>
                        <Text className='text-lg'>Maintenance Check Due</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className='w-[48%] bg-gray-200 p-4 mb-3 rounded-xl'
                    onPress={() =>
                        router.push({
                            pathname: "/(app)/(tabs)/home/alerts/alert-list",
                            params: { type: "recertification-needed" },
                        })
                    }>
                    <View className='flex flex-col gap-1'>
                        <Text className='text-2xl font-bold text-[#263f94]'>
                            {data.total_certificate_expiry}
                        </Text>
                        <Text className='text-lg'>Recertification Needed</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className='w-[48%] bg-gray-200 p-4 mb-3 rounded-xl'
                    onPress={() =>
                        router.push({
                            pathname: "/(app)/(tabs)/home/alerts/alert-list",
                            params: { type: "asset-in-maintenance" },
                        })
                    }>
                    <View className='flex flex-col gap-1'>
                        <Text className='text-2xl font-bold text-[#263f94]'>{data.total_maintenance}</Text>
                        <Text className='text-lg'>Asset In Maintenance</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className='w-[48%] bg-gray-200 p-4 mb-3 rounded-xl'
                    onPress={() =>
                        router.push({
                            pathname: "/(app)/(tabs)/home/alerts/alert-list",
                            params: { type: "asset-failure" },
                        })
                    }>
                    <View className='flex flex-col gap-1'>
                        <Text className='text-2xl font-bold text-[#263f94]'>{data.total_failures}</Text>
                        <Text className='text-lg'>Asset Failure</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    className='w-[48%] bg-gray-200 p-4 mb-3 rounded-xl'
                    onPress={() =>
                        router.push({
                            pathname: "/(app)/(tabs)/home/alerts/alert-list",
                            params: { type: "all" },
                        })
                    }>
                    <View className='flex flex-col gap-1'>
                        <Text className='text-2xl font-bold text-[#263f94]'>{data.total_alerts}</Text>
                        <Text className='text-lg'> Total Alerts</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View className='action-btn'>
                <TouchableOpacity
                    className='bg-[#263f94] rounded-xl p-2 mt-6 active:opacity-80'
                    onPress={() => {
                        router.push("/(app)/(tabs)/home/asset/asset-add");
                    }}>
                    <Text className='text-white text-center font-semibold text-xl'>Add Asset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className='bg-[#263f94] rounded-xl p-2 mt-6 active:opacity-80'
                    onPress={() => {
                        router.push("/(app)/(tabs)/home/asset/asset-list");
                    }}>
                    <Text className='text-white text-center font-semibold text-xl'>Asset List</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Dashboard;
