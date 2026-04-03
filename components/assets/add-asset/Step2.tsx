import Dropdown from "@/components/common/Dropdown";
import { GetLocationList } from "@/services/asset";
import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

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

    async function getLocations() {
        const result = await GetLocationList([], 1);
        if (result.has_error && result.error_code === "PERMISSION_DENIED") {
            console.log("location fetch error", result.message);
        }

        console.log("locations: ", result.locations);
        setLocations(result?.locations);
    }

    useEffect(() => {
        getLocations();
    }, []);

    return (
        <View className='flex flex-col justify-between gap-6 p-2'>
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

                    <View className='w-full'>
                        <Dropdown
                            options={locations}
                            value={formData.location_id}
                            onChange={(val: string | number) => updateForm("location_id", val)}
                            labelKey='name'
                            valueKey='id'
                            placeholder='Select Location'
                        />
                    </View>

                    <TextInput
                        className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 w-full'
                        placeholder='Batch Code'
                        value={formData?.batch_code}
                        onChangeText={(text) => updateForm("batch_code", text)}
                        placeholderTextColor='#9CA3AF'
                    />
                </View>
                {errors.uid && (
                    <View className='text-red-600'>
                        <p>{errors.uid}</p>
                    </View>
                )}
            </View>
        </View>
    );
};

export default Step2;
