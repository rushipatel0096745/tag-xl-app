import { useAuth } from "@/context/AuthContext";
import { AssetInspectionLog, GetAnswers, GetAsset, GetAssetChangeLog } from "@/services/asset";
import { AssetAccessLog, AssetChangeLog, AssetDetail, Question } from "@/types/Aseet";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { FormatDateTime } from "@/lib/utils";
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

type Answer = {
    answer: string | string[];
    question: string;
};

const AssetDetails = ({ id }: { id: string }) => {
    const [asset, setAsset] = useState<AssetDetail>();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [userRole, setUserRole] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [preUseCollapsed, setPreUseCollapsed] = useState(true);
    const [maintenanceCollapsed, setMaintenanceCollapsed] = useState(true);
    const [accessLogCollapsed, setAccessLogCollapsed] = useState(true);
    const [changeLogCollapsed, setChangeLogCollapsed] = useState(true);
    const [locations, setLocations] = useState();
    const { user } = useAuth();

    // for access log
    const [accessLogs, setAccessLogs] = useState<AssetAccessLog[]>([]);
    const [page, setPage] = useState(1);
    const [log_loading, setLogLoading] = useState(false);
    const [hasAccessLogMore, setHasAccessLogMore] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [answer_loading, setAnswerLoading] = useState(false);
    const log_loading_ref = useRef(false);
    const [answers, setAnswers] = useState<Answer[]>([]);

    // for change log
    const [assetChangeLog, setAssetChangeLog] = useState<AssetChangeLog[]>([]);
    const [assetChangeLogPage, setAssetChangeLogPage] = useState(1);
    const [assetChangeLogLoading, setAssetChangeLogLoading] = useState(false);
    const [hasAssetChangeLogMore, setHasAssetChangeLogMore] = useState(true);
    const asset_change_log_loading_ref = useRef(false);

    // third party certificate
    const [certificate_modal_open, setCertificateModalOpen] = useState(false);
    const [certificate_loading, setCertificateLoading] = useState(false);
    const [certificate_modal_data, setCertificateModalData] = useState();

    async function fetchAsset() {
        try {
            setLoading(true);

            const result = await GetAsset(parseInt(id as string));

            if (result.has_error && result.error_code === "PERMISSION_DENIED") {
                setErrors({ permission: result.message });
                Alert.alert("Error", result.message);
            }

            if (result.has_error && result.message === "Invalid or expired session") {
                Alert.alert("Session Expired", result.message, [
                    {
                        text: "Ok",
                        onPress: () => router.replace("/(auth)/sign-in"),
                    },
                ]);
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
        if (log_loading_ref.current) return;
        // console.log("getAccessLogs called with page:", pageNumber);
        log_loading_ref.current = true;
        setLogLoading(true);

        try {
            const result = await AssetInspectionLog(parseInt(id as string), pageNumber, 5);

            if (result.has_error) {
                Alert.alert("Error", result.message);
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
        } catch (err) {
            console.error("Error fetching logs:", err);
            Alert.alert("Error", "Failed to load logs.");
        } finally {
            log_loading_ref.current = false;
            setLogLoading(false);
        }
    }

    const handleAccessLogLoadMore = () => {
        if (!hasAccessLogMore || log_loading_ref.current) return;
        // console.log("loading more....");
        setPage((prev) => {
            const nextPage = prev + 1;
            getAccessLogs(nextPage);
            return nextPage;
        });
    };

    async function handleShowAnswers(submission_type: string, answer_id: number) {
        setModalVisible(true);
        setAnswerLoading(true);
        const result = await GetAnswers(answer_id, submission_type);
        setAnswerLoading(false);
        if (result.has_error) {
            Alert.alert("Error", result.message);
            return;
        }
        setAnswers(result.answers);
    }

    async function getAssetChangeLog(pageNumber = 1) {
        if (asset_change_log_loading_ref.current) return;
        asset_change_log_loading_ref.current = true;
        setAssetChangeLogLoading(true);

        try {
            const result = await GetAssetChangeLog(parseInt(id as string), pageNumber, 5);

            if (result.has_error) {
                Alert.alert("Error", result.message);
                return;
            }

            const newLogs = result.logs || [];

            if (pageNumber === 1) {
                setAssetChangeLog(newLogs);
            } else {
                setAssetChangeLog((prev) => [...prev, ...newLogs]);
            }

            if (newLogs.length < 5) {
                setHasAssetChangeLogMore(false);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
            Alert.alert("Error", "Failed to load logs.");
        } finally {
            asset_change_log_loading_ref.current = false;
            setAssetChangeLogLoading(false);
        }
    }

    async function handleAssetChangeLogLoadMore() {
        if (!hasAssetChangeLogMore || asset_change_log_loading_ref.current) return;
        // console.log("loading more....");
        setAssetChangeLogPage((prev) => {
            const nextPage = prev + 1;
            getAssetChangeLog(nextPage);
            return nextPage;
        });
    }

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
        getAssetChangeLog(1);
        setUserRole(user?.role.permission.asset ?? []);
    }, []);

    const renderItem = ({ item, index }: { item: AssetAccessLog; index: number }) => {
        const isFirst = index === 0;
        const isLast = index === accessLogs.length - 1;

        return (
            <View style={{ flexDirection: "row" }}>
                <View style={{ width: 24, alignItems: "center", marginLeft: 5 }}>
                    <View
                        style={{
                            flex: 0,
                            width: 1,
                            height: 10,
                            backgroundColor: isFirst ? "transparent" : "transparent",
                            borderLeftWidth: isFirst ? 0 : 1,
                            borderStyle: "dashed",
                            borderColor: "#d1d5db",
                        }}
                    />

                    <View
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#9ca3af",
                            borderWidth: 2,
                            borderColor: "#e5e7eb",
                            zIndex: 1,
                        }}
                    />

                    <View
                        style={{
                            flex: 1,
                            width: 1,
                            borderLeftWidth: isLast ? 0 : 1,
                            borderStyle: "dashed",
                            borderColor: "#d1d5db",
                            minHeight: 12,
                        }}
                    />
                </View>

                <View style={{ flex: 1, paddingLeft: 5, paddingBottom: 20 }}>
                    <Text style={{ fontSize: 14, color: "#111827" }}>
                        <Text style={{ fontWeight: "600" }}>
                            {item.log_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Completed
                            At{" "}
                        </Text>
                        <Text style={{ color: "#6b7280" }}>{FormatDateTime(item.created_at)}</Text>
                    </Text>

                    <Text style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>
                        <Text style={{ fontWeight: "600" }}>Checked by: </Text>
                        {item.submitted_by.firstname}
                    </Text>

                    <TouchableOpacity
                        onPress={() => {
                            const answersId =
                                item.log_type === "maintenance" ? item.maintenance_answers_id : item.pre_use_answers_id;
                            handleShowAnswers(item.log_type, answersId);
                        }}
                        style={{ marginTop: 4 }}>
                        <Text style={{ color: "#6366f1", fontSize: 13, textDecorationLine: "underline" }}>
                            Show Answers
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderAssetLog = ({ item, index }: { item: AssetChangeLog; index: number }) => {
        const isFirst = index === 0;
        const isLast = index === assetChangeLog.length - 1;
        return (
            <View style={{ flexDirection: "row" }}>
                <View style={{ width: 24, alignItems: "center", marginLeft: 5 }}>
                    <View
                        style={{
                            flex: 0,
                            width: 1,
                            height: 10,
                            backgroundColor: isFirst ? "transparent" : "transparent",
                            borderLeftWidth: isFirst ? 0 : 1,
                            borderStyle: "dashed",
                            borderColor: "#d1d5db",
                        }}
                    />

                    <View
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#9ca3af",
                            borderWidth: 2,
                            borderColor: "#e5e7eb",
                            zIndex: 1,
                        }}
                    />

                    <View
                        style={{
                            flex: 1,
                            width: 1,
                            borderLeftWidth: isLast ? 0 : 1,
                            borderStyle: "dashed",
                            borderColor: "#d1d5db",
                            minHeight: 12,
                        }}
                    />
                </View>

                <View style={{ flex: 1, paddingLeft: 5, paddingBottom: 20 }}>
                    <Text style={{ fontSize: 14, color: "#111827" }}>
                        <Text style={{ fontWeight: "600" }}>Changed By: {item.submitted_by.firstname} | At </Text>
                        <Text style={{ color: "#6b7280" }}>{FormatDateTime(item.created_at)}</Text>
                    </Text>

                    <Text className='font-semibold'>Changes:</Text>

                    {item.change_log.map((item, index) => {
                        return (
                            <Text key={index}>
                                {item.field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} :{" "}
                                {item.old_value} &rarr; {item.new_value}
                            </Text>
                        );
                    })}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size='large' />
            </View>
        );
    }

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
                                    <TouchableOpacity onPress={() => setCertificateModalOpen(true)}>
                                        <Text className='text-blue-700 underline'>View all certificates</Text>
                                    </TouchableOpacity>
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
                                    <Text className='text-[12px]'>
                                        Last check: {FormatDateTime(asset?.last_pre_use_check) ?? "-"}
                                    </Text>
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
                                        Last check: {FormatDateTime(asset?.last_maintenance_check) ?? "-"}
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
                                <>
                                    <FlatList
                                        data={accessLogs}
                                        keyExtractor={(item) => item.id.toString()}
                                        scrollEnabled={false}
                                        nestedScrollEnabled={true}
                                        extraData={accessLogs}
                                        renderItem={renderItem}
                                        ListFooterComponent={
                                            hasAccessLogMore ? (
                                                <TouchableOpacity
                                                    onPress={handleAccessLogLoadMore}
                                                    style={{ padding: 16 }}>
                                                    <Text style={{ textAlign: "center" }}>
                                                        {log_loading ? "Loading..." : "Load More"}
                                                    </Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <Text style={{ textAlign: "center", padding: 16 }}>No more logs</Text>
                                            )
                                        }
                                    />
                                </>
                            )}
                        </View>

                        {/* asset change log */}
                        <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                            <View className='flex flex-row justify-between items-center py-2 px-4 '>
                                <View>
                                    <Text className='font-semibold text-[16px]'>Asset Change Log</Text>
                                </View>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() => toggle(setChangeLogCollapsed)}>
                                    <Text className='text-white text-center font-semibold text-sm'>
                                        {changeLogCollapsed ? "Expand" : "Collapse"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {!changeLogCollapsed && (
                                <>
                                    <FlatList
                                        data={assetChangeLog}
                                        keyExtractor={(item) => item.id.toString()}
                                        scrollEnabled={false}
                                        nestedScrollEnabled={true}
                                        extraData={assetChangeLog}
                                        renderItem={renderAssetLog}
                                        ListFooterComponent={
                                            hasAssetChangeLogMore ? (
                                                <TouchableOpacity
                                                    onPress={handleAssetChangeLogLoadMore}
                                                    style={{ padding: 16 }}>
                                                    <Text style={{ textAlign: "center" }}>
                                                        {assetChangeLogLoading ? "Loading..." : "Load More"}
                                                    </Text>
                                                </TouchableOpacity>
                                            ) : (
                                                // <Text style={{ textAlign: "center", padding: 16 }}>No more logs</Text>
                                                <Text></Text>
                                            )
                                        }
                                    />
                                </>
                            )}
                        </View>

                        {/* third party certificates */}
                        <Modal
                            visible={certificate_modal_open}
                            animationType='slide'
                            transparent={true}
                            onRequestClose={() => setCertificateModalOpen(false)}>
                            <View className='flex-1 bg-[rgba(0,0,0,0.5)] justify-center items-center px-4'>
                                <View
                                    className='w-full bg-white rounded-2xl overflow-hidden shadow-2xl'
                                    style={{ maxHeight: "80%" }}>
                                    {/* Header */}
                                    <View className='flex-row justify-between items-center px-5 py-4 border-b border-gray-200'>
                                        <Text className='text-lg font-semibold text-gray-800'>
                                            All Third Party Certificates
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setCertificateModalOpen(false)}
                                            className='bg-gray-100 px-3 py-1.5 rounded-full'
                                            activeOpacity={0.7}>
                                            <Text className='text-[#263f94] font-semibold'>Close</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <ScrollView className='p-5'>
                                        <View className='flex-col gap-2 justify-between'>
                                            {asset?.third_party_certificate?.map((item, index) => (
                                                <View
                                                    className='flex-col border rounded-xl border-gray-400 bg-gray-100 p-3'
                                                    key={index}>
                                                    <View className='flex-row justify-between'>
                                                        <Text>
                                                            Start Date:{" "}
                                                            {FormatDateTime(item.third_party_start_date).split(" ")[0]}
                                                        </Text>
                                                        <Text>
                                                            End Date:{" "}
                                                            {FormatDateTime(item.third_party_expiry_date).split(" ")[0]}
                                                        </Text>
                                                    </View>
                                                    <View className='flex-row justify-between mt-1'>
                                                        <Text>
                                                            Created At: {FormatDateTime(item.created_at).split(" ")[0]}
                                                        </Text>
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                downloadFile(
                                                                    ("https://api.tagxl.com/" +
                                                                        item.third_party_certificate) as string
                                                                )
                                                            }>
                                                            <Text className='text-blue-500 underline'>Download</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>

                        {/* answers modal */}
                        <Modal
                            visible={modalVisible}
                            animationType='slide'
                            transparent={true}
                            onRequestClose={() => setModalVisible(false)}>
                            <View className='flex-1 bg-[rgba(0,0,0,0.5) ] justify-center items-center px-4'>
                                <View
                                    className='w-full bg-white rounded-2xl overflow-hidden shadow-2xl'
                                    style={styles.modalContainer}>
                                    {/* Header */}
                                    <View className='flex-row justify-between items-center px-5 py-4 border-b border-gray-200'>
                                        <Text className='text-lg font-semibold text-gray-800'>Show Answers</Text>
                                        <TouchableOpacity
                                            onPress={() => setModalVisible(false)}
                                            className='bg-gray-100 px-3 py-1.5 rounded-full'
                                            activeOpacity={0.7}>
                                            <Text className='text-[#263f94] font-semibold'>Close</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className='p-5'>
                                        <View className='flex-col gap-2 justify-between'>
                                            {answer_loading ? (
                                                <Text className='text-center'>Loading....</Text>
                                            ) : (
                                                answers?.map((answer: Answer, index: number) => (
                                                    <View
                                                        className='flext-col question border rounded-xl border-gray-400 bg-gray-100 p-3'
                                                        key={index}>
                                                        <Text>{answer.question}</Text>
                                                        <Text>
                                                            {Array.isArray(answer.answer)
                                                                ? answer.answer.join(", ")
                                                                : answer.answer}
                                                        </Text>
                                                    </View>
                                                ))
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default AssetDetails;

const styles = StyleSheet.create({
    modalContainer: {
        maxHeight: "90%",
    },
    image: {
        width: "100%",
        height: 500,
    },
});

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
