import Dropdown from "@/components/common/Dropdown";
import { CreateLocation, GetLocationList } from "@/services/asset";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
    next: () => void;
    prev: () => void;
    updateForm: (name: string, value: any) => void;
    validate: () => boolean;
    errors: any;
    formData: any;
}

type Location = {
    id: number;
    name: string;
};

const Step2 = ({ next, prev, updateForm, formData, errors, validate }: Props) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [location_name, setLocationName] = useState("");
    const [assignError, setAssignError] = useState("");

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    async function getLocations() {
        const result = await GetLocationList([], 1);
        if (result.has_error && result.error_code === "PERMISSION_DENIED") {
            console.log("location fetch error", result.message);
        }

        console.log("locations: ", result.locations);
        setLocations(result?.locations);
    }

    async function handleCreateLocation() {
        if (!location) return;

        const createLocation = await CreateLocation(location_name);

        if (createLocation.has_error && createLocation.error_code == "PERMISSION_DENIED") {
            setAssignError(createLocation.message);
            return;
        }

        if (createLocation.has_error) {
            setAssignError(createLocation.message);
            return;
        }

        if (!createLocation.has_error) {
            getLocations();
            updateForm("location_id", createLocation.location_id);
            closeModal();
        }
    }

    async function handleSave() {
        if (!validate()) return;
    }

    useEffect(() => {
        getLocations();
    }, []);

    return (
        <View className='flex flex-col justify-between gap-6 p-2'>
            <Modal visible={isModalOpen} onRequestClose={closeModal} animationType='slide' transparent={true}>
                <View className='flex-1 justify-center items-center bg-black/50'>
                    <View className='bg-white rounded-2xl p-4 mx-4 w-full max-w-md flex flex-col gap-4'>
                        {/* Header */}
                        <View className='flex flex-row justify-between items-center border-b border-gray-200 pb-3'>
                            <Text className='font-semibold text-[16px] text-gray-800'>Add New Location</Text>
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
                                placeholder='Location'
                                value={location_name}
                                onChangeText={(text) => setLocationName(text)}
                                placeholderTextColor='#9CA3AF'
                            />
                            {errors.uid && <Text className='text-red-600 text-sm'>{errors.uid}</Text>}
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
                                    handleCreateLocation();
                                }}>
                                <Text className='text-white font-semibold text-sm'>Yes, please</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View className='title'>
                <Text className='text-xl font-semibold'>Step 2 - Asset Details</Text>
            </View>

            <View className='flex flex-col justify-between gap-2 p-2 w-full'>
                <Text className='text-[16px] font-semibold'>Basic Information</Text>

                <View className='flex flex-row justify-start gap-2 w-full flex-wrap'>
                    <TextInput
                        className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 w-full'
                        placeholder='Name'
                        value={formData?.name}
                        onChangeText={(text) => updateForm("name", text)}
                        placeholderTextColor='#9CA3AF'
                    />
                    {errors.name && (
                        <View className='text-red-600'>
                            <p>{errors.name}</p>
                        </View>
                    )}

                    <View className='w-full'>
                        <Dropdown
                            options={locations}
                            value={formData.location_id}
                            onChange={(val: string | number) => updateForm("location_id", val)}
                            labelKey='name'
                            valueKey='id'
                            placeholder='Select Location'
                        />
                        <Text className='text-right text-blue-700 mt-2 cursor-pointer' onPress={openModal}>
                            Add New Location
                        </Text>
                        {errors.location_id && (
                            <View className='text-red-600'>
                                <p>{errors.location_id}</p>
                            </View>
                        )}
                    </View>

                    <TextInput
                        className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 w-full'
                        placeholder='Batch Code'
                        value={formData?.batch_code}
                        onChangeText={(text) => updateForm("batch_code", text)}
                        placeholderTextColor='#9CA3AF'
                    />
                    {errors.batch_code && (
                        <View className='text-red-600'>
                            <p>{errors.batch_code}</p>
                        </View>
                    )}
                </View>
            </View>
            {assignError && (
                <div className='assign-error bg-yellow-400 text-[14px] text-amber-900'>
                    <p>{assignError}</p>
                </div>
            )}
            <View className='flex flex-row justify-between gap-2 mt-6 w-full'>
                <Pressable
                    onPress={prev}
                    className='py-2.5 px-[14px] border border-[#263f94] rounded-xl justify-center items-center h-[38px]'>
                    <Text className='text-[#263f94] text-[14px] font-medium'>Back</Text>
                </Pressable>

                <Pressable
                    onPress={handleSave}
                    className='py-2.5 px-[14px] bg-[#263f94] border border-[#263f94] rounded-xl justify-center items-center h-[38px]'>
                    <Text className='text-white text-[14px] font-medium'>Continue</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default Step2;
