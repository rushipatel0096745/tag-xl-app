import { CheckTagAssigned, CreateTag } from "@/services/asset";
import React, { useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

type CustomeModalProp = {
    visible: boolean;
    onRequestClose: () => void;
    updateForm: (name: string, value: any) => void;
    formData: any;
    onClose: () => void;
    next: () => void;
};

const NewTagModal: React.FC<CustomeModalProp> = ({ visible, onRequestClose, updateForm, formData, next, onClose }) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uid, setUid] = useState(formData.uid ?? "");
    const [assignError, setAssignError] = useState("");

    useEffect(() => {
        if (visible) setUid(formData.uid ?? "");
    }, [visible]);

    function validate() {
        const newErrors: Record<string, string> = {};

        if (!uid) newErrors.uid = "UID is required";

        setErrors(newErrors);
        return Object.entries(newErrors).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;

        const createTag = await CreateTag(uid, formData.tag_type);

        if (createTag.has_error && createTag.error_code == "PERMISSION_DENIED") {
            setAssignError(createTag.message);
            return;
        }

        if (createTag.has_error) {
            setAssignError(createTag.message);
            return;
        }

        if (!createTag.has_error) {
            const checkAssigned = await CheckTagAssigned(uid);
            updateForm("tag_id", createTag?.created_tags[0]?.tag_id);
            updateForm("uid", uid);
            updateForm("tag_type", formData.tag_type);

            if (checkAssigned.has_error && checkAssigned.error_code == "RECORD_ALREADY_USED") {
                setAssignError(checkAssigned.message);
                return;
            }

            if (checkAssigned.has_error && checkAssigned.error_code == "RECORD_NOT_FOUND") {
                setAssignError(checkAssigned.message);
            }

            if (!checkAssigned.has_error) {
                next();
                return;
            }
        }
    }

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType='slide' transparent={true}>
            <View className='flex-1 justify-center items-center bg-black/50'>
                <View className='bg-white rounded-2xl p-4 mx-4 w-full max-w-md flex flex-col gap-4'>
                    {/* Header */}
                    <View className='flex flex-row justify-between items-center border-b border-gray-200 pb-3'>
                        <Text className='font-semibold text-[16px] text-gray-800'>Create New Tag Confirmation</Text>
                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                            onPress={onClose}>
                            <Text className='text-white font-semibold text-sm'>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Input */}
                    <View className='flex flex-col gap-2'>
                        <TextInput
                            className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                            placeholder='Unique ID'
                            value={uid}
                            onChangeText={(text: string) => setUid(text)}
                            placeholderTextColor='#9CA3AF'
                        />
                        {errors.uid && <Text className='text-red-600 text-sm'>{errors.uid}</Text>}
                        {assignError && <Text className='text-red-600 text-sm'>{assignError}</Text>}
                    </View>

                    <View className='flex flex-row justify-end gap-2'>
                        <TouchableOpacity
                            className='border border-[#263f94] rounded-xl px-4 py-2 active:opacity-80'
                            onPress={onClose}>
                            <Text className='text-[#263f94] font-semibold text-sm'>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl px-4 py-2 active:opacity-80'
                            onPress={() => {
                                handleSave();
                            }}>
                            <Text className='text-white font-semibold text-sm'>Yes, please</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default NewTagModal;
