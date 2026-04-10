import { GetAssetWithTag } from "@/services/asset";
import { AssetDetail } from "@/types/Aseet";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import NfcManager, { NfcTech } from "react-native-nfc-manager";

const AssetDetails = ({ uid }: { uid: string }) => {
    const [asset, setAsset] = useState<AssetDetail | null>(null);

    async function fetchAssetWithTag() {
        const result = await GetAssetWithTag(uid);

        if (result.has_error && result.error_code === "PERMISSION_DENIED") {
            Alert.alert("Permission Denied");
        }

        if (!result.has_error) {
            console.log(JSON.stringify(result.asset), null, 2);
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

    useEffect(() => {
        fetchAssetWithTag();
    }, []);

    return (
        <View className='flex-1 gap-4 p-4'>
            <View className='gap-2'>
                <Text className='text-gray-600'>Asset Name: </Text>
                <Text className='text-lg'>{asset?.name}</Text>
            </View>

            <View className='gap-2'>
                <Text className='text-gray-600'>RFID No: </Text>
                <Text className='text-lg'>{asset?.tag.uid}</Text>
            </View>

            <View className='gap-2'>
                <Text className='text-gray-600'>Documents: </Text>
                <View className='gap-2 p-2'>
                    <View className='items-center w-full'>
                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'
                            onPress={() =>
                                downloadFile(
                                    ("https://api.tagxl.com/" +
                                        asset?.third_party_certificate[0].third_party_certificate) as string
                                )
                            }>
                            <Text className='text-white text-xl font-medium text-center'>Third Party Certificate</Text>
                        </TouchableOpacity>
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
                        <TouchableOpacity className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'>
                            <Text className='text-white text-xl font-medium text-center'>Safe use instructions</Text>
                        </TouchableOpacity>
                    </View>
                    <View className='items-center w-full'>
                        <TouchableOpacity className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'>
                            <Text className='text-white text-xl font-medium text-center'>Pre-use Check</Text>
                        </TouchableOpacity>
                    </View>
                    <View className='items-center w-full'>
                        <TouchableOpacity className='bg-[#263f94] rounded-xl py-3 px-4 items-center w-full'>
                            <Text className='text-white text-xl font-medium text-center'>Maintenance Check</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default AssetDetails;
