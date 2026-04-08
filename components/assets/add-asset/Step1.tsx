import { CheckTagAssigned } from "@/services/asset";
import React, { useState } from "react";
import { Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import NewTagModal from "./NewTagModal";

type TagType = "RFID" | "QR" | "Manual" | "";

interface Props {
    next: () => void;
    updateForm: (name: string, value: any) => void;
    validate: () => boolean;
    errors: any;
    formData: any;
}

const tagTypeOptions: { label: string; value: TagType; text: string }[] = [
    { label: "RFID", value: "RFID", text: "Scan or enter RFID tag" },
    { label: "QR", value: "QR", text: "Scan or enter QR code" },
    { label: "Manual", value: "Manual", text: "Enter the unique ID" },
];

const Step1 = ({ next, updateForm, validate, errors, formData }: Props) => {
    const [tagId, setTagId] = useState("");
    const [assignError, setAssignError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUidChange = (value: string) => {
        setTagId(value);
        updateForm("uid", value);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    async function handleSave() {
        if (!validate()) return;

        const checkAssigned = await CheckTagAssigned(tagId || formData.uid);

        if (checkAssigned.has_error && checkAssigned.error_code == "RECORD_ALREADY_USED") {
            setAssignError(checkAssigned.message);
            return;
        }

        if (checkAssigned.has_error && checkAssigned.error_code == "RECORD_NOT_FOUND") {
            openModal();
            return;
        }

        if (!checkAssigned.has_error) {
            updateForm("tag_id", checkAssigned.tag.id);
            next();
        }
    }

    return (
        <View className='flex-1 p-3'>
            <NewTagModal
                visible={isModalOpen}
                onRequestClose={closeModal}
                onClose={closeModal}
                formData={formData}
                updateForm={updateForm}
                next={next}
            />

            {/* Title */}
            <Text className='text-xl font-semibold mb-4'>Step 1 - Select the Tag</Text>

            {/* Tag Type */}
            <View className='mb-4'>
                <Text className='text-[16px] font-semibold mb-2'>Select UID Type</Text>

                <View className='flex-row'>
                    {tagTypeOptions.map((option) => {
                        const isSelected = formData.tag_type === option.value;
                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => updateForm("tag_type", option.value)}
                                style={{
                                    height: 38,
                                    paddingHorizontal: 12,
                                    borderRadius: 999,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    marginRight: 8,
                                    backgroundColor: isSelected ? "#263f94" : "#f5f6fa",
                                    borderColor: isSelected ? "#263f94" : "#c9d5ff",
                                }}>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: "500",
                                        color: isSelected ? "#ffffff" : "#111c43",
                                    }}>
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {errors.tag_type && <Text className='text-red-500 mt-1'>{errors.tag_type}</Text>}
            </View>

            {/* UID Input */}
            <View className='mb-4'>
                <Text className='text-[16px] font-semibold mb-2'>Enter UID</Text>

                <TextInput
                    className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                    placeholder='Unique ID'
                    value={formData?.uid}
                    onChangeText={handleUidChange}
                    placeholderTextColor='#9CA3AF'
                />

                {errors.uid && <Text className='text-red-500 mt-1'>{errors.uid}</Text>}
            </View>

            {/* Error Message */}
            {assignError && (
                <View className='bg-yellow-400 p-2 rounded-md mb-3'>
                    <Text className='text-amber-900 text-[14px]'>{assignError}</Text>
                </View>
            )}

            {/* Button */}
            <View>
                <TouchableOpacity className='bg-[#263f94] rounded-xl py-3 px-4 items-center self-end'>
                    <Pressable onPress={handleSave}>
                        <Text className='text-white text-[14px] font-medium'>Continue</Text>
                    </Pressable>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Step1;
