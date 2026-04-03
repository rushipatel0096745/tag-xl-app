import { GetDashboardData } from "@/services/asset";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

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

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
    const fetchDashbordData = async () => {
        const result = await GetDashboardData();

        if (result.has_error) {
            Alert.alert("Error", result.message);
            return;
        }

        const { has_error, message, ...dashboardFields } = result;

        setDashboardData(dashboardFields);
    };

    useEffect(() => {
        fetchDashbordData();
    }, []);

    return (
        <View className='main mt-4 mx-3 flex flex-col justify-between gap-2'>
            <View className='flex-row flex-wrap justify-between '>
                {Object.entries(dashboardData).map(([key, value]) => (
                    <View className='w-[48%] bg-gray-200 p-4 mb-3 rounded-xl'>
                        <View className='flex flex-col gap-1'>
                            <Text>{value}</Text>
                            <Text> {key.replace(/_/g, " ").replace(/\b\w/g, (c: any) => c.toUpperCase())}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View className='action-btn'>
                <TouchableOpacity
                    className='bg-[#263f94] rounded-xl p-2 mt-6 active:opacity-80'
                    onPress={() => {
                        router.push("/asset/asset-add");
                    }}>
                    <Text className='text-white text-center font-semibold text-sm'>Add Asset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className='bg-[#263f94] rounded-xl p-2 mt-6 active:opacity-80'
                    onPress={() => {
                        router.push("/asset/asset-list");
                    }}>
                    <Text className='text-white text-center font-semibold text-sm'>Asset List</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Dashboard;
