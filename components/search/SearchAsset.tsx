import { CheckTagAssigned } from "@/services/asset";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import NFCScanner from "./NFCScanner";
import QRScanner from "./QRScanner";

type TabType = "nfc" | "scan" | "manual";

type Props = {
    onClose?: () => void;
    initialTab?: TabType;
    allowedTabs?: TabType[];
    sheetMode?: "ADD_ASSET" | "EDIT_ASSET" | "DEFAULT";
};

const SearchAsset = ({ onClose, initialTab, allowedTabs, sheetMode }: Props) => {
    // const [tab, setTab] = useState<TabType>("manual");
    const [tab, setTab] = useState<TabType>(initialTab || "manual");
    const [UID, setUID] = useState("");

    // useFocusEffect(
    //     useCallback(() => {
    //         setTab("manual");
    //         setUID("");
    //     }, [])
    // );

    useEffect(() => {
        if (initialTab) {
            setTab(initialTab);
        }
    }, [initialTab]);

    const [loading, setLoading] = useState(false);
    const navigationRef = useRef(false);

    async function checkTagAssigned(uid: string, resetScanner?: () => void) {
        if (navigationRef.current) return;
        navigationRef.current = true;

        setLoading(true);

        try {
            if (sheetMode === "ADD_ASSET") {
                router.setParams({
                    scannedUID: uid,
                });
                onClose?.();
                return;
            }

            const result = await CheckTagAssigned(uid);

            if (sheetMode === "EDIT_ASSET") {
                // if (result.has_error && result.error_code === "RECORD_ALREADY_USED") {
                //     Alert.alert("Tag already assigned", "This tag is already assigned to another asset.");
                //     return;
                // }

                // tag exist but not assigned to any asset
                router.setParams({
                    scannedUID: uid,
                });
                onClose?.();
                return;
            }

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
                            navigationRef.current = false;
                            resetScanner?.();
                        },
                    },
                ]);
                return;
            }

            if (!result.has_error) {
                Alert.alert("Server isn't responding, please try after some time");
                router.replace("/(app)/(tabs)/home");
            }
        } catch (err) {
            Alert.alert("Something went wrong");
        } finally {
            setLoading(false);
            navigationRef.current = false;
        }
    }

    return (
        // <View className='flex-1 '>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className='flex-1'>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}
                keyboardShouldPersistTaps='handled'>
                <View className='flex-row border-b border-gray-300'>
                    {[
                        { key: "nfc", label: "NFC" },
                        { key: "scan", label: "Scan" },
                        { key: "manual", label: "Search" },
                    ].map((item) => {
                        const isActive = tab === item.key;
                        const isAllowed = allowedTabs?.includes(item.key as TabType);

                        return (
                            <TouchableOpacity
                                key={item.key}
                                disabled={!isAllowed}
                                className={`flex-1 items-center p-3 border-b-2 ${
                                    isActive ? "border-[#263f94]" : "border-transparent"
                                } ${!isAllowed ? "opacity-40" : ""}`}
                                onPress={() => isAllowed && setTab(item.key as TabType)}>
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
                    <View className='flex-1 mt-4 px-6'>
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
                                disabled={UID.trim() === "" || loading}
                                className='bg-[#263f94] rounded-xl py-3 items-center'
                                onPress={() => checkTagAssigned(UID)}>
                                {loading && <ActivityIndicator size='small' color='#ffffff' />}
                                <Text className='text-white text-[16px] font-medium'>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
        // </View>
    );
};

export default SearchAsset;
