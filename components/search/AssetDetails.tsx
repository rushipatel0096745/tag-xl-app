import { useAuth } from "@/context/AuthContext";
import { GetAssetWithTag } from "@/services/asset";
import { AssetDetail } from "@/types/Aseet";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";

const AssetDetails = ({ uid }: { uid: string }) => {
    const { user, logOut } = useAuth();

    const [asset, setAsset] = useState<AssetDetail | null>(null);

    async function fetchAssetWithTag() {
        const result = await GetAssetWithTag(uid);
        console.log("asset: ", JSON.stringify(result.asset, null, 2));

        if (result.has_error && result.error_code === "PERMISSION_DENIED") {
            Alert.alert("Permission Denied");
        }

        if (result.has_error && result.message === "Invalid or expired session") {
            Alert.alert("Session Over", "", [
                {
                    text: "OK",
                    onPress: () => {
                        logOut();
                        router.push("/(auth)/sign-in");
                    },
                },
            ]);
            return;
        }

        if (!result.has_error) {
            setAsset(result?.asset);
        }
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

    useFocusEffect(
        useCallback(() => {
            fetchAssetWithTag();
        }, [uid])
    );

    useEffect(() => {
        // setAsset(null); // Clear old asset data
        fetchAssetWithTag();
        console.log("uid: ", uid);
        console.log(new Date().toString());
    }, [uid]);

    function formatDateTime(dateString: string) {
        if (!dateString) return "";

        const date = new Date(dateString + "Z");

        const datePart = date
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            .replace(/ /g, "-");

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        const period = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;

        const timePart = `${hours}:${minutes}:${seconds} ${period}`;

        return `${datePart} ${timePart}`;
    }

    return (
        <View className='flex-1 gap-4 p-4'>
            {asset?.is_asset_fail && (
                <View className='warning gap-2 border-2 border-red-400 rounded-2xl bg-red-100 p-4'>
                    <View className='flex-row justify-center items-center gap-2'>
                        <Ionicons name='warning' size={24} color='#f87171' />
                        <Text className='text-red-400 font-semibold text-2xl'>WARNING</Text>
                    </View>
                    <Text className='text-red-400 text-center'>This asset is not in working condition</Text>
                </View>
            )}
            <View className='gap-2'>
                <Text className='text-gray-600'>Asset Name: </Text>
                <Text className='text-lg'>{asset?.name}</Text>
            </View>

            <View className='gap-2'>
                <Text className='text-gray-600'>RFID No: </Text>
                <Text className='text-lg'>{asset?.tag.uid}</Text>
            </View>

            {asset?.last_pre_use_check && (
                <View className='gap-2'>
                    <Text className='text-gray-600'>Last Pre-use Check: </Text>
                    <Text className='text-lg'>{formatDateTime(asset?.last_pre_use_check)}</Text>
                </View>
            )}

            {asset?.last_maintenance_check && (
                <View className='gap-2'>
                    <Text className='text-gray-600'>Last Maintenance Check: </Text>
                    <Text className='text-lg'>{formatDateTime(asset?.last_maintenance_check)}</Text>
                </View>
            )}

            <View className='gap-2'>
                <Text className='text-gray-600'>Documents: </Text>
                <View className='gap-2 p-2'>
                    <View className='items-center w-full'>
                        {asset?.third_party_certificate.length !== 0 && (
                            <TouchableOpacity
                                className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'
                                onPress={() =>
                                    downloadFile(
                                        ("https://api.tagxl.com/" +
                                            asset?.third_party_certificate[0]?.third_party_certificate) as string
                                    )
                                }>
                                <Text className='text-white text-xl font-medium text-center'>
                                    Third Party Certificate
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View className='items-center w-full'>
                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'
                            onPress={() => {
                                downloadFile(("https://api.tagxl.com/" + asset?.oem_certificate) as string);
                            }}>
                            <Text className='text-white text-xl font-medium text-center'>OEM Certificate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className='gap-2 bg-yellow-100 border border-yellow-400 rounded-xl p-2'>
                <Text className='text-xl font-semibold text-center text-yellow-600'>
                    <Ionicons name='warning' size={24} color='#f59e0b' /> Caution
                </Text>

                <Text className='text-center p-2'>
                    Anyone using lifting equipment must receive proper training and follow instruction to guarantee safe
                    operation.
                </Text>

                <View className='gap-2 p-2'>
                    <View className='items-center w-full'>
                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'
                            onPress={() => {
                                if (asset?.manual_template) {
                                    downloadFile(
                                        ("https://api.tagxl.com/" + asset?.manual_template.files[0].file_path) as string
                                    );
                                } else {
                                    Alert.alert("No safety use instructions found");
                                }
                            }}>
                            <Text className='text-white text-xl font-medium text-center'>Safe use instructions</Text>
                        </TouchableOpacity>
                    </View>

                    {!asset?.is_asset_fail && (
                        <View className='items-center w-full'>
                            <TouchableOpacity
                                className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'
                                onPress={() =>
                                    router.push({ pathname: "/pre-use-check", params: { asset_id: asset?.id } })
                                }>
                                <Text className='text-white text-xl font-medium text-center'>Pre-use Check</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!asset?.is_asset_fail && (
                        <View className='items-center w-full'>
                            <TouchableOpacity
                                className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'
                                onPress={() =>
                                    router.push({ pathname: "/maintenance-check", params: { asset_id: asset?.id } })
                                }>
                                <Text className='text-white text-xl font-medium text-center'>Maintenance Check</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export default AssetDetails;
