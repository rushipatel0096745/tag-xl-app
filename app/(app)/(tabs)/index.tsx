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
            {/* <Text className='text-xl font-bold text-blue-500'>Welcome to Nativewind!</Text> */}
            {/* <Link href={"/(app)/(tabs)/asset/asset-list"}>
                <Text>Go to asset</Text>
            </Link> */}

            <View>
                <Dashboard />
            </View>
        </View>
    );
}
