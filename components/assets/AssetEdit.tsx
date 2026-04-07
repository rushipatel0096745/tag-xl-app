import { GetAsset, GetLocationList } from "@/services/asset";
import { AssetDetail } from "@/types/Aseet";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type Location = { id: number; name: string };

const AssetEdit = ({ id }: { id: string }) => {
    const [asset, setAsset] = useState<AssetDetail>();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [userRole, setUserRole] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState<Location[]>([]);

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

    async function getLocations() {
        const result = await GetLocationList([], 1);
        if (!result.has_error) setLocations(result?.locations ?? []);
    }

    useEffect(() => {
        fetchAsset();
        getLocations();
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView className='flex-1 m-2'>
                <ScrollView>
                    <View className='main p-4 flex flex-col gap-4 justify-between'>
                        {/* image */}
                        <View className='flex flex-row justify-center border rounded-xl border-gray-400'>
                            <Image
                                source={{ uri: `https://api.tagxl.com/${asset?.image}` }}
                                style={{ width: "100%", height: 280 }}
                                contentFit='scale-down'
                            />
                        </View>

                        <View className='flex-col gap-2'>
                            <Text className='text-[16px]'>Tag UID</Text>
                            <TextInput
                                value={asset?.tag.uid}
                                editable={false}
                                className='border border-gray-400 rounded-lg p-4'
                            />
                        </View>

                        <View className='flex-col gap-2'>
                            <Text className='text-[16px]'>Asset Name</Text>
                            <TextInput
                                value={asset?.name}
                                editable={true}
                                className='border border-gray-400 rounded-lg p-4'
                            />
                        </View>

                        <View className='flex-col gap-2'>
                            <Text className='text-[16px]'>Location</Text>
                            {/* <NativeDropdown /> */}
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
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default AssetEdit;
