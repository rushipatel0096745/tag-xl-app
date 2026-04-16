import { useAuth } from "@/context/AuthContext";
import { AssetInspectionLog, GetAsset } from "@/services/asset";
import { AssetAccessLog, AssetDetail, Question } from "@/types/Aseet";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import { FlatList } from "react-native-gesture-handler";
const { StorageAccessFramework } = FileSystem;

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
    const [preUseCollapsed, setPreUseCollapsed] = useState(true);
    const [maintenanceCollapsed, setMaintenanceCollapsed] = useState(true);
    const [accessLogCollapsed, setAccessLogCollapsed] = useState(true);
    const [locations, setLocations] = useState();
    const { user } = useAuth();
    const [accessLogs, setAccessLogs] = useState<AssetAccessLog[]>([]);
    const [page, setPage] = useState(1);
    const [log_loading, setLogLoading] = useState(false);
    const [hasAccessLogMore, setHasAccessLogMore] = useState(true);

    async function fetchAsset() {
        try {
            setLoading(true);

            const result = await GetAsset(parseInt(id as string));

            if (result.has_error && result.error_code === "PERMISSION_DENIED") {
                setErrors({ permission: result.message });
            }

            if (!result.has_error) {
                // console.log(result.asset, null, 2);
                setAsset(result?.asset);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
        } finally {
            setLoading(false);
        }
    }

    async function getAccessLogs(pageNumber = 1) {
        if (log_loading) return;

        setLogLoading(true);

        const result = await AssetInspectionLog(parseInt(id as string), pageNumber, 5);

        if (result.has_error) {
            Alert.alert("Error", result.message);
            setLogLoading(false);
            return;
        }

        const newLogs = result.logs || [];

        if (pageNumber === 1) {
            setAccessLogs(newLogs);
        } else {
            setAccessLogs((prev) => [...prev, ...newLogs]);
        }

        if (newLogs.length < 5) {
            setHasAccessLogMore(false);
        }

        setLogLoading(false);
    }

    const handleAccessLogLoadMore = () => {
        if (!hasAccessLogMore || log_loading) return;

        const nextPage = page + 1;
        setPage(nextPage);
        getAccessLogs(nextPage);
    };

    const downloadFile = (url: string) => {
        Alert.alert("Download File", "Browser is required to open this document", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Open in Browser",
                onPress: async () => {
                    try {
                        await Linking.openURL(url);
                    } catch (err) {
                        console.error("Failed to open URL:", err);
                    }
                },
            },
        ]);
    };

    useEffect(() => {
        fetchAsset();
        getAccessLogs(1);
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
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() => {
                                        router.push({
                                            pathname: "/(app)/(tabs)/home/asset/asset-edit",
                                            params: {
                                                id: id,
                                            },
                                        });
                                    }}>
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
                                </View>
                                <View className='asset-info flex flex-col justify-between '>
                                    <Text className='text-sm text-gray-500'>UID Type</Text>
                                    <Text>{asset?.tag?.tag_type}</Text>
                                </View>
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

                                {asset?.third_party_certificate && asset?.third_party_certificate.length > 0 && (
                                    <TouchableOpacity
                                        className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                        onPress={() =>
                                            downloadFile(
                                                ("https://api.tagxl.com/" +
                                                    asset?.third_party_certificate[0].third_party_certificate) as string
                                            )
                                        }>
                                        <Text className='text-white text-center font-semibold text-sm'>Download</Text>
                                    </TouchableOpacity>
                                )}
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
                                {asset?.third_party_certificate && asset?.third_party_certificate.length > 0 && (
                                    <Text className='text-blue-700 underline'>View all certificates</Text>
                                )}
                            </View>
                        </View>

                        {/* OEM certificate */}
                        <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                            <View className='flex flex-row justify-between items-center py-2 px-4'>
                                <Text className='font-semibold text-[16px]'>OEM Certificate</Text>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() => {
                                        const download_url = "https://api.tagxl.com/" + asset?.oem_certificate;
                                        downloadFile(download_url as string);
                                    }}>
                                    <Text className='text-white text-center font-semibold text-sm'>Download</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Pre-use check template */}
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

                        {/* access log */}
                        <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                            <View className='flex flex-row justify-between items-center py-2 px-4 '>
                                <View>
                                    <Text className='font-semibold text-[16px]'>Access Log</Text>
                                </View>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() => toggle(setAccessLogCollapsed)}>
                                    <Text className='text-white text-center font-semibold text-sm'>
                                        {accessLogCollapsed ? "Expand" : "Collapse"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {!accessLogCollapsed && (
                                <FlatList
                                    data={accessLogs}
                                    keyExtractor={(item) => item.id.toString()}
                                    scrollEnabled={false}
                                    nestedScrollEnabled={true}
                                    renderItem={({ item }) => (
                                        <View style={{ padding: 12, borderBottomWidth: 1 }}>
                                            <Text>{item.log_type}</Text>
                                            <Text>
                                                {item.submitted_by.firstname} {item.submitted_by.lastname}
                                            </Text>
                                            <Text>{item.created_at}</Text>
                                        </View>
                                    )}
                                    ListFooterComponent={
                                        hasAccessLogMore ? (
                                            <TouchableOpacity onPress={handleAccessLogLoadMore} style={{ padding: 16 }}>
                                                <Text style={{ textAlign: "center" }}>
                                                    {loading ? "Loading..." : "Load More"}
                                                </Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <Text style={{ textAlign: "center", padding: 16 }}>No more logs</Text>
                                        )
                                    }
                                />
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default AssetDetails;

// async function downloadFile(url: string, folderName: string = "downloads"): Promise<string> {
//     try {
//         const destination = new Directory(Paths.document, folderName);

//         if (!destination.exists) {
//             destination.create();
//         }

//         const fileName = url.split("/").pop() || `file_${Date.now()}`;
//         const file = new File(destination, fileName);

//         const output = await File.downloadFileAsync(url, file, {
//             idempotent: true,
//         });

//         console.log("Downloaded to:", output.uri);
//         Alert.alert("File", "File downloaded");

//         return output.uri;
//     } catch (error) {
//         console.error("Download error:", error);
//         throw error;
//     }
// }

// async function downloadFile(url: string) {
//     try {
//         const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

//         if (!permissions.granted) {
//             alert("Permission denied");
//             return;
//         }

//         const directoryUri = permissions.directoryUri;

//         const fileName = url.split("/").pop() || `file_${Date.now()}`;

//         const tempFile = FileSystem.documentDirectory + fileName;

//         const downloaded = await FileSystem.downloadAsync(url, tempFile);

//         const fileBase64 = await FileSystem.readAsStringAsync(downloaded.uri, {
//             encoding: FileSystem.EncodingType.Base64,
//         });

//         const newFileUri = await StorageAccessFramework.createFileAsync(directoryUri, fileName, "image/jpeg");

//         await FileSystem.writeAsStringAsync(newFileUri, fileBase64, {
//             encoding: FileSystem.EncodingType.Base64,
//         });

//         alert("Saved to Downloads");
//     } catch (error) {
//         console.error(error);
//     }
// }
