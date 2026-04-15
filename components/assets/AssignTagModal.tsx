import { AssignTag, CheckTagAssigned, CreateTag } from "@/services/asset";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

type Props = {
    visible: boolean;
    onRequestClose: () => void;
    onClose: () => void;
    error: (val: string) => void;
    assetId: number;
    fetchAsset: () => void;
    scannedUID?: string;
};

const AssignTagModal = ({ visible, onClose, scannedUID, assetId, fetchAsset }: Props) => {
    // const [uid, setUid] = useState("");

    const [loading, setLoading] = useState(false);

    const [tagType, setTagType] = useState<"RFID" | "QR" | "">("");

    const openQRScanner = () => {
        router.setParams({
            sheetOpen: "scan",
            sheetAllowed: "scan",
            sheetMode: "ADD_ASSET",
        });
    };

    const openRFIDScanner = () => {
        router.setParams({
            sheetOpen: "nfc",
            sheetAllowed: "nfc",
            sheetMode: "ADD_ASSET",
        });
    };

    async function handleSave() {
        setLoading(true);
        try {
            if (scannedUID) {
                const result = await CheckTagAssigned(scannedUID);
                if (result.has_error && result.error_code == "RECORD_ALREADY_USED") {
                    Alert.alert("Tag Already Assigned", "This tag is already assigned to another asset");
                    return;
                }

                if (result.has_error && result.error_code == "RECORD_NOT_FOUND") {
                    // create a new tag and assign it to the asset
                    const createTag = await CreateTag(scannedUID, tagType);

                    if (createTag.has_error) {
                        Alert.alert("Error", "Failed to create tag");
                        return;
                    }

                    if (!createTag.has_error) {
                        const data = {
                            asset_id: assetId,
                            uid: scannedUID,
                        };
                        const assignTag = await AssignTag(data);

                        if (assignTag.has_error) {
                            if (assignTag.error_code == "PERMISSION_DENIED") {
                                Alert.alert("Permission Denied", "Permission denied to assign tag");
                                onClose();
                                return;
                            }
                            Alert.alert("Error", "Failed to assign tag");
                            onClose();
                            return;
                        }

                        if (!assignTag.has_error) {
                            Alert.alert("Success", "Tag assigned successfully");
                            fetchAsset();
                            onClose();
                            return;
                        }
                    }
                }

                if (!result.has_error) {
                    const data = {
                        asset_id: assetId,
                        uid: scannedUID,
                    };
                    const assignTag = await AssignTag(data);

                    if (assignTag.has_error) {
                        if (assignTag.error_code == "PERMISSION_DENIED") {
                            Alert.alert("Permission Denied", "Permission denied to assign tag");
                            onClose();
                            return;
                        }
                        Alert.alert("Error", "Failed to assign tag");
                        onClose();
                        return;
                    }

                    if (!assignTag.has_error) {
                        Alert.alert("Success", "Tag assigned successfully");
                        fetchAsset();
                        onClose();
                        return;
                    }
                }
            }
        } catch {
            Alert.alert("Error", "An error occurred while assigning the tag");
            setLoading(false);
            onClose();
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType='fade' transparent>
            <View className='flex-1 bg-[rgba(0,0,0,0.3)] justify-center items-center px-4'>
                <View className='w-full bg-white rounded-2xl p-5 gap-5 shadow-lg'>
                    <View className='flex-row justify-between items-center'>
                        <Text className='text-lg font-semibold text-gray-800'>Assign Tag</Text>

                        <TouchableOpacity onPress={onClose}>
                            <Text className='text-[#263f94] font-medium'>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View className='h-px bg-gray-200' />

                    <View className='gap-3'>
                        <Text className='text text-500'>Select the Method</Text>

                        <View className='flex-row gap-3'>
                            <TouchableOpacity
                                className='flex-1 bg-[#263f94] rounded-xl py-3 items-center active:opacity-80'
                                onPress={() => {
                                    setTagType("RFID");
                                    openRFIDScanner();
                                    onClose();
                                }}>
                                <Text className='text-white font-medium'>RFID (NFC)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className='flex-1 bg-[#263f94] rounded-xl py-3 items-center active:opacity-80'
                                onPress={() => {
                                    setTagType("QR");
                                    openQRScanner();
                                    onClose();
                                }}>
                                <Text className='text-white font-medium'>Scan QR</Text>
                            </TouchableOpacity>
                        </View>

                        {scannedUID && (
                            <View>
                                <Text className='text text-500'>Scanned UID:</Text>
                                <TextInput
                                    className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                                    placeholder='Unique ID'
                                    value={scannedUID}
                                    placeholderTextColor='#9CA3AF'
                                    editable={false}
                                />
                            </View>
                        )}
                    </View>

                    {/* Footer */}
                    <View className='flex-row justify-end gap-3 pt-2'>
                        <TouchableOpacity className='px-4 py-2 rounded-xl border border-gray-300' onPress={onClose}>
                            <Text className='text-gray-600 font-medium'>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className='px-4 py-2 rounded-xl bg-[#263f94]' onPress={handleSave}>
                            <Text className='text-white font-medium'>
                                Save
                                {loading && <ActivityIndicator className='ml-2' color='white' animating={loading} />}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AssignTagModal;
