import { UnassignTag } from "@/services/asset";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Alert, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import NativeDropdown from "../common/NativeDropdown";

type Props = {
    visible: boolean;
    onRequestClose: () => void;
    onClose: () => void;
    uid: string;
    error: Dispatch<SetStateAction<string>>;
    fetchAsset: () => void;
};

const dropdownOptions = [
    { label: "Physically broken", value: "Physically broken" },
    { label: "Unreadable", value: "Unreadable" },
    { label: "Heat Damage", value: "Heat Damage" },
    { label: "Detached from asset", value: "Detached from asset" },
    { label: "Other reason", value: "OTHER" },
];

const UnassignTagModal = ({ visible, onRequestClose, onClose, uid, fetchAsset, error }: Props) => {
    const [reason, setReason] = useState("");
    const [other_reason, setOtherReason] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate() {
        const newErrors: Record<string, string> = {};
        if (!reason) newErrors.reason = "Reason is required";
        if (reason === "OTHER" && !other_reason) newErrors.other_reason = "Please enter the reason";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;

        const data = {
            uid,
            reason,
            remarks: other_reason ?? "",
        };

        const unassignedTag = await UnassignTag(data);

        if (unassignedTag.has_error && unassignedTag.error_code === "PERMISSION_DENIED") {
            error("Permission Denied to Unassign Tag");
            Alert.alert("Tag", "Permission Denied to Unassign Tag");
            onClose();
            return;
        }

        if (!unassignedTag.has_error) {
            fetchAsset();
            Alert.alert("Tag", "Tag Unassigned successfully");
            onClose();
        }
    }

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType='slide' transparent={true}>
            <View className='flex-1 justify-center items-center bg-[rgb(0,0,0,0.5)] px-4'>
                {/* Card */}
                <View className='bg-white border rounded-2xl p-4 w-[90%] flex flex-col gap-4'>
                    {/* Header */}
                    <View className='flex-row justify-between items-center border-b border-gray-200 pb-3'>
                        <Text className='font-semibold text-[16px] text-gray-800'>Unassign Tag</Text>
                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                            onPress={onClose}>
                            <Text className='text-white font-semibold text-sm'>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <View className='flex-col gap-4 mt-2'>
                        <Text className='text-gray-600 text-sm'>Reason for unassigning</Text>

                        <NativeDropdown
                            data={dropdownOptions}
                            onChange={(val) => {
                                setReason(val);
                                setOtherReason("");
                                setErrors({});
                            }}
                            value={reason}
                            placeholder='Select a reason'
                        />
                        {errors.reason && <Text className='text-red-500 text-sm'>{errors.reason}</Text>}

                        {reason === "OTHER" && (
                            <View className='flex-col gap-1'>
                                <TextInput
                                    value={other_reason}
                                    onChangeText={(text: string) => setOtherReason(text)}
                                    editable={true}
                                    multiline={true}
                                    numberOfLines={6}
                                    className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                                    placeholder='Type reason here'
                                    textAlignVertical='top'
                                />
                                {errors.other_reason && (
                                    <Text className='text-red-500 text-sm'>{errors.other_reason}</Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Footer */}
                    <View className='flex-row justify-end gap-2'>
                        <TouchableOpacity
                            className='border border-[#263f94] rounded-xl px-4 py-2 active:opacity-80'
                            onPress={onClose}>
                            <Text className='text-[#263f94] font-semibold text-sm'>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl px-4 py-2 active:opacity-80'
                            onPress={handleSave}>
                            <Text className='text-white font-semibold text-sm'>Yes, please</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default UnassignTagModal;
