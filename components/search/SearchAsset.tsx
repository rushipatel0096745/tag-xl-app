import { CheckTagAssigned } from "@/services/asset";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import NFCScanner from "./NFCScanner";
import QRScanner from "./QRScanner";

type TabType = "nfc" | "scan" | "manual";

const SearchAsset = () => {
    const [tab, setTab] = useState<TabType>("manual");
    const [UID, setUID] = useState("");

    let navigation = false;

    async function checkTagAssigned(uid: string, resetScanner?: () => void) {
        if (navigation) return;
        navigation = true;

        const result = await CheckTagAssigned(uid);

        if (result.has_error && result.error_code == "RECORD_ALREADY_USED") {
            router.push({ pathname: "/(app)/(tabs)/search-asset/asset-detail", params: { uid: uid } });
            return;
        }

        if (result.has_error && result.error_code == "RECORD_NOT_FOUND") {
            // router.push({ pathname: "/(app)/(tabs)/search-asset/asset-detail", params: { uid: uid } });
            Alert.alert("Invalid UID", "", [
                {
                    text: "OK",
                    onPress: () => {
                        navigation = false;
                        resetScanner?.();
                    },
                }
            ]);
            return;
        }

        if (!result.has_error) {
            Alert.alert("Server isn't responding, please try after some time");
            router.replace("/(app)/(tabs)/home");
        }
    }

    return (
        <View className='flex-1'>
            <View className='flex-row border-b border-gray-300'>
                {[
                    { key: "nfc", label: "NFC" },
                    { key: "scan", label: "Scan" },
                    { key: "manual", label: "Search" },
                ].map((item) => {
                    const isActive = tab === item.key;

                    return (
                        <TouchableOpacity
                            key={item.key}
                            className={`flex-1 items-center p-3 border-b-2 ${
                                isActive ? "border-[#263f94]" : "border-transparent"
                            }`}
                            onPress={() => setTab(item.key as TabType)}>
                            <Text className={`text-xl ${isActive ? "text-[#263f94]" : "text-gray-500"}`}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {tab === "nfc" && (
                <NFCScanner
                    onScan={(uid) => {
                        setUID(uid);
                        Alert.alert("Tag detected", uid);
                        checkTagAssigned(uid);
                    }}
                />
            )}
            {tab === "scan" && (
                <View className='flex-1'>
                    <QRScanner
                        onScan={(uid, resetScanner) => {
                            setUID(uid);

                            setTimeout(() => {
                                checkTagAssigned(uid, resetScanner);
                            }, 300);
                        }}
                    />
                </View>
            )}
            {tab === "manual" && (
                <View className='flex-1 justify-center px-6'>
                    <View className='gap-4'>
                        <View>
                            <Text className='text-lg font-semibold mb-1'>Enter Tag UID:</Text>

                            <TextInput
                                className='border rounded-lg border-gray-400 text-black bg-white p-2 text-lg'
                                placeholder='Enter UID'
                                onChangeText={(val) => setUID(val)}
                            />
                        </View>

                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl py-3 items-center'
                            onPress={() => checkTagAssigned(UID)}>
                            <Text className='text-white text-[16px] font-medium'>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default SearchAsset;
