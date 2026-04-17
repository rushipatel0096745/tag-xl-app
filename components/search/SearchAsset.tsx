import { CheckTagAssigned, CreateTag } from "@/services/asset";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
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

    const [showModal, setShowModal] = useState(false);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

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

    async function handleCreateTag() {
        const result = await CreateTag(UID, tab === "nfc" ? "RFID" : "QR");

        if (result.has_error) {
            Alert.alert("Error", result.message);
            return;
        }

        if (!result.has_error) {
            Alert.alert("Success", "Tag created Successfully");
            onClose?.();
        }
    }

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

            if (sheetMode === "DEFAULT") {
                if (tab === "nfc" || tab === "scan") {
                    if (result.has_error && result.error_code === "RECORD_ALREADY_USED") {
                        router.push({ pathname: "/(app)/(tabs)/search-asset/asset-detail", params: { uid: uid } });
                        onClose?.();
                        return;
                    }
                    if (result.has_error && result.error_code === "RECORD_NOT_FOUND") {
                        // create a tag with modal
                        openModal();
                        // onClose?.();
                    }
                    if (!result.has_error) {
                        Alert.alert("Tag is not assigned", "This tag is not assigned to any asset.", [
                            {
                                text: "OK",
                                onPress: () => {
                                    navigationRef.current = false;
                                    resetScanner?.();
                                },
                            },
                        ]);
                    }
                }

                if (tab === "manual") {
                    if (result.has_error && result.error_code === "RECORD_ALREADY_USED") {
                        router.push({ pathname: "/(app)/(tabs)/search-asset/asset-detail", params: { uid: uid } });
                        onClose?.();
                        return;
                    }
                    if (result.has_error && result.error_code === "RECORD_NOT_FOUND") {
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
                        return;
                    }
                }
            }
        } catch (err) {
            Alert.alert("Something went wrong");
        } finally {
            setLoading(false);
            navigationRef.current = false;
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

            <View className='flex-1'>
                {tab === "nfc" && (
                    <NFCScanner
                        onScan={(uid, resetScanner) => {
                            setUID(uid);
                            setTimeout(() => {
                                checkTagAssigned(uid, resetScanner);
                            }, 300);
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
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                        <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }}>
                            <View>
                                <Text className='text-lg font-semibold mb-1'>Enter Tag UID:</Text>
                                <TextInput
                                    className='border rounded-lg border-gray-400 text-black bg-white p-2 text-lg'
                                    placeholder='Enter UID'
                                    returnKeyType='done'
                                    onChangeText={(val) => setUID(val)}
                                    onSubmitEditing={() => {
                                        if (UID.trim()) checkTagAssigned(UID);
                                    }}
                                />
                            </View>

                            <TouchableOpacity
                                disabled={UID.trim() === "" || loading}
                                className='bg-[#263f94] rounded-xl py-3 items-center'
                                onPress={() => checkTagAssigned(UID)}>
                                {loading ? (
                                    <ActivityIndicator size='small' color='#ffffff' />
                                ) : (
                                    <Text className='text-white text-[16px] font-medium'>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                )}
            </View>

            <Modal visible={showModal} onRequestClose={closeModal} animationType='slide' transparent={true}>
                <View className='flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]'>
                    <View className='bg-white rounded-2xl p-4 mx-4 w-full max-w-md flex flex-col gap-4'>
                        {/* Header */}
                        <View className='flex flex-row justify-between items-center border-b border-gray-200 pb-3'>
                            <Text className='font-semibold text-[16px] text-gray-800'>Create New Tag Confirmation</Text>
                            <TouchableOpacity
                                className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                onPress={closeModal}>
                                <Text className='text-white font-semibold text-sm'>Close</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Input */}
                        <View className='flex flex-col gap-2'>
                            <TextInput
                                className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                                placeholder='Unique ID'
                                value={UID}
                                editable={false}
                                placeholderTextColor='#9CA3AF'
                            />
                        </View>

                        <View className='flex flex-row justify-end gap-2'>
                            <TouchableOpacity
                                className='border border-[#263f94] rounded-xl px-4 py-2 active:opacity-80'
                                onPress={closeModal}>
                                <Text className='text-[#263f94] font-semibold text-sm'>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className='bg-[#263f94] rounded-xl px-4 py-2 active:opacity-80'
                                onPress={() => {
                                    handleCreateTag();
                                }}>
                                <Text className='text-white font-semibold text-sm'>Yes, please</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SearchAsset;
