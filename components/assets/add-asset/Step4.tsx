import Dropdown from "@/components/common/Dropdown";
import { GetManualTemplateAssetList } from "@/services/templates";
import { ManualTemplateListItem } from "@/types/Templates";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MaintenanceTemplate from "./MaintenanceTemplate";
import PreUseTemplate from "./PreUseTemplate";

interface Props {
    next: () => void;
    prev: () => void;
    updateForm: (name: string, value: any) => void;
    validate: () => boolean;
    handleSubmit: () => void;
    errors: any;
    formData: any;
    formError: string;
}

const Step4 = ({ next, prev, updateForm, validate, formData, handleSubmit, errors, formError }: Props) => {
    const [manualTempList, setManualTempList] = useState<ManualTemplateListItem[]>([]);

    async function fetchManualTemplates() {
        const result = await GetManualTemplateAssetList();
        console.log("Manual template", result);
        setManualTempList(result?.manual_templates);
    }

    useEffect(() => {
        fetchManualTemplates();
    }, []);

    async function handleSave() {
        if (!validate()) return;

        await handleSubmit();
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {/* <ScrollView style={{ flex: 1 }} scrollEventThrottle={16}> */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps='handled'
                nestedScrollEnabled={true}>
                <View className='flex-col gap-6 p-2'>
                    {formError && (
                        <View>
                            <Text className='text-red-500'>{formError}</Text>
                        </View>
                    )}

                    {/* Title */}
                    <Text className='text-xl font-semibold mb-4'>Step 4 - Templates</Text>

                    <View className='gap-2'>
                        <Text className='text-[16px] font-semibold'>Manual Guide</Text>

                        <Dropdown
                            onChange={(text: string | number) => updateForm("manual_template_id", text)}
                            options={manualTempList}
                            labelKey='name'
                            valueKey='id'
                            value={formData.manual_template_id}
                            placeholder='Select Manual Template'
                        />
                    </View>

                    {/* Preuse check template */}
                    <View>
                        <PreUseTemplate formData={formData} updateForm={updateForm} error={errors} />
                    </View>

                    {/* Maintenance check template */}
                    <View>
                        <MaintenanceTemplate formData={formData} updateForm={updateForm} error={errors} />
                    </View>

                    {/* Navigation */}
                    <View className='flex-row justify-between gap-2 mt-2'>
                        <Pressable
                            onPress={prev}
                            className='py-2.5 px-3.5 border border-[#263f94] rounded-xl justify-center items-center h-9.5'>
                            <Text className='text-[#263f94] text-[14px] font-medium'>Back</Text>
                        </Pressable>
                        <Pressable
                            onPress={handleSave}
                            className='py-2.5 px-3.5 bg-[#263f94] border border-[#263f94] rounded-xl justify-center items-center h-9.5'>
                            <Text className='text-white text-[14px] font-medium'>Continue</Text>
                        </Pressable>
                    </View>
                </View>
                {/* </View> */}
            </ScrollView>
        </GestureHandlerRootView>
    );
};

export default Step4;
