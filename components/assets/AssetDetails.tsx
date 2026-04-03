import { useAuth } from "@/context/AuthContext";
import { GetAsset } from "@/services/asset";
import { AssetDetail, Question } from "@/types/Aseet";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { LayoutAnimation, Platform, UIManager } from "react-native";

// Enable for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((prev) => !prev);
};

const AssetDetails = ({ id }: { id: string }) => {
    const [asset, setAsset] = useState<AssetDetail>();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [userRole, setUserRole] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [preUseCollapsed, setPreUseCollapsed] = useState(false);
    const [maintenanceCollapsed, setMaintenanceCollapsed] = useState(false);
    const { user } = useAuth();

    async function fetchAsset() {
        try {
            setLoading(true);

            const result = await GetAsset(parseInt(id as string));

            if (result.has_error && result.error_code === "PERMISSION_DENIED") {
                setErrors({ permission: result.message });
            }

            if (!result.has_error) {
                console.log(result.asset);
                setAsset(result?.asset);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
        } finally {
            setLoading(false);
        }
    }

    async function downloadFile(url: string, folderName: string = "downloads"): Promise<string> {
        try {
            const destination = new Directory(Paths.cache, folderName);
            destination.create();

            const output = await File.downloadFileAsync(url, destination);

            if (output.exists) {
                console.log("Downloaded to:", output.uri);
                return output.uri;
            } else {
                throw new Error("File download failed");
            }
        } catch (error) {
            console.error("Download error:", error);
            throw error;
        }
    }

    useEffect(() => {
        fetchAsset();
        setUserRole(user?.role.permission.asset ?? []);
    }, []);
    
    return (
        <SafeAreaProvider>
            <SafeAreaView className='flex-1 m-2'>
                <ScrollView>
                    <View className='main p-2 flex flex-col gap-2.5 justify-between'>
                        {/* image */}
                        <View className='flex flex-row justify-center border rounded-xl border-gray-400'>
                            <Image
                                source={{ uri: `https://api.tagxl.com/${asset?.image}` }}
                                style={{ width: "100%", height: 280 }}
                                contentFit='scale-down'
                            />
                        </View>

                        {/* asset-info */}
                        <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                            <View className='flex flex-row justify-between items-center border-b border-gray-400 py-2 px-4'>
                                <Text className='font-semibold text-[16px]'>Details</Text>
                                <TouchableOpacity className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'>
                                    <Text className='text-white text-center font-semibold text-sm'>Edit</Text>
                                </TouchableOpacity>
                            </View>

                            <View className='flex flex-col justify-between gap-4 py-2 px-4'>
                                <View className='asset-info flex flex-col justify-between '>
                                    <Text className='text-sm text-gray-500'>Asset Name</Text>
                                    <Text>{asset?.name}</Text>
                                </View>
                                <View className='asset-info flex flex-col justify-between '>
                                    <Text className='text-sm text-gray-500'>Batch Code</Text>
                                    <Text>{asset?.batch_code}</Text>
                                </View>{" "}
                                <View className='asset-info flex flex-col justify-between '>
                                    <Text className='text-sm text-gray-500'>UID Type</Text>
                                    <Text>{asset?.tag?.tag_type}</Text>
                                </View>{" "}
                                <View className='asset-info flex flex-col justify-between '>
                                    <Text className='text-sm text-gray-500'>UID</Text>
                                    <Text>{asset?.tag?.uid}</Text>
                                </View>
                                <View className='asset-info flex flex-col justify-between '>
                                    <Text className='text-sm text-gray-500'>Status</Text>
                                    {asset?.status === 0 && <Text className='text-green-700'>GOOD</Text>}
                                </View>
                            </View>
                        </View>

                        {/* third party certificate */}
                        <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                            <View className='flex flex-row justify-between items-center border-b border-gray-400 py-2 px-4'>
                                <Text className='font-semibold text-[16px]'>Third Party Certificate</Text>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() =>
                                        downloadFile(
                                            asset?.third_party_certificate[0].third_party_certificate as string,
                                            "certificates"
                                        )
                                    }>
                                    <Text className='text-white text-center font-semibold text-sm'>Download</Text>
                                </TouchableOpacity>
                            </View>

                            <View className='flex flex-col flex-wrap justify-between gap-2 py-2 px-4'>
                                <View className='flex flex-row justify-between gap-2 w-full'>
                                    <View>
                                        <Text>
                                            Start Date:{" "}
                                            {asset?.third_party_certificate[0]?.third_party_start_date.split("T")[0]}
                                        </Text>
                                    </View>
                                    <View className='items-end'>
                                        <Text>
                                            End Date:{" "}
                                            {asset?.third_party_certificate[0]?.third_party_expiry_date.split("T")[0]}
                                        </Text>
                                    </View>
                                </View>
                                <Text className='text-blue-700 underline'>View all certificates</Text>
                            </View>
                        </View>

                        {/* OEM certificate */}
                        <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                            <View className='flex flex-row justify-between items-center py-2 px-4'>
                                <Text className='font-semibold text-[16px]'>OEM Certificate</Text>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() =>
                                        downloadFile(
                                            asset?.third_party_certificate[0].third_party_certificate as string,
                                            "certificates"
                                        )
                                    }>
                                    <Text className='text-white text-center font-semibold text-sm'>Download</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Pre-use check templater */}
                        <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                            <View className='flex flex-row justify-between items-center py-2 px-4'>
                                <View>
                                    <Text className='font-semibold text-[16px]'>Pre-use Check Template</Text>
                                    <Text className='text-[12px]'>Last check: {asset?.last_pre_use_check ?? "-"}</Text>
                                </View>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() => toggle(setPreUseCollapsed)}>
                                    <Text className='text-white text-center font-semibold text-sm'>
                                        {preUseCollapsed ? "Expand" : "Collapse"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {!preUseCollapsed && (
                                <View className='flex flex-col gap-4 justify-between px-4 py-2 border-t border-gray-400'>
                                    <View className='flex flex-col justify-between gap-2'>
                                        <Text className='text-[15px] text-gray-500'>Template Name</Text>
                                        <Text className='text-[15px] font-semibold'>
                                            {asset?.pre_use_template.title}
                                        </Text>
                                    </View>
                                    <View className='flex flex-col justify-between gap-2'>
                                        <Text className='text-[15px] text-gray-500'>Template Questions</Text>
                                        {asset?.pre_use_template.questions?.map((q: Question) => (
                                            <View key={q.id} className='flex flex-row items-center gap-2'>
                                                <View className='w-1.5 h-1.5 rounded-full bg-gray-800' />
                                                <Text>{q.question}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View className='flex flex-col justify-between gap-2'>
                                        <Text className='text-[15px] text-gray-500'>Last Pre-use Check</Text>
                                        <Text className='text-[15px] font-semibold'>
                                            {asset?.last_pre_use_check ?? "-"}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Maintenance template */}
                        <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                            <View className='flex flex-row justify-between items-center py-2 px-4 '>
                                <View>
                                    <Text className='font-semibold text-[16px]'>Maintenance Template</Text>
                                    <Text className='text-[12px]'>
                                        Last check: {asset?.last_maintenance_check ?? "-"}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() => toggle(setMaintenanceCollapsed)}>
                                    <Text className='text-white text-center font-semibold text-sm'>
                                        {maintenanceCollapsed ? "Expand" : "Collapse"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {!maintenanceCollapsed && (
                                <View className='flex flex-col gap-4 justify-between px-4 py-2 border-t border-gray-400'>
                                    <View className='flex flex-col justify-between gap-2'>
                                        <Text className='text-[15px] text-gray-500'>Template Name</Text>
                                        <Text className='text-[15px] font-semibold'>
                                            {asset?.maintenance_template.title}
                                        </Text>
                                    </View>
                                    <View className='flex flex-col justify-between gap-2'>
                                        <Text className='text-[15px] text-gray-500'>Template Questions</Text>
                                        {asset?.maintenance_template.questions?.map((q: Question) => (
                                            <View key={q.id} className='flex flex-row items-center gap-2'>
                                                <View className='w-1.5 h-1.5 rounded-full bg-gray-800' />
                                                <Text>{q.question}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View className='flex flex-col justify-between gap-2'>
                                        <Text className='text-[15px] text-gray-500'>Last Maintenance Check</Text>
                                        <Text className='text-[15px] font-semibold'>
                                            {asset?.last_maintenance_check ?? "-"}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default AssetDetails;
