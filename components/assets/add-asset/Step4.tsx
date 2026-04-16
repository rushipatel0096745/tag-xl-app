import NativeDropdown from "@/components/common/NativeDropdown";
import { GetManualTemplateAssetList } from "@/services/templates";
import { ManualTemplateListItem } from "@/types/Templates";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
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
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);

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
        try {
            setLoading(true);
            console.log("form data: ", JSON.stringify(formData, null, 2));
            await handleSubmit();
        } catch (error) {
            setLoading(false);
            console.log("Submit error:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
                style={{ flex: 1, flexGrow: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps='handled'
                nestedScrollEnabled={true}
                scrollEnabled={!isDragging}>
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

                        <NativeDropdown
                            onChange={(text: string | number) => updateForm("manual_template_id", text)}
                            data={manualTempList}
                            labelField='name'
                            valueField='id'
                            value={formData.manual_template_id}
                            placeholder='Select Manual Template'
                        />
                    </View>

                    {/* Preuse check template */}
                    <View>
                        <PreUseTemplate
                            formData={formData}
                            updateForm={updateForm}
                            error={errors}
                            onDragStateChange={setIsDragging}
                        />
                    </View>

                    {/* Maintenance check template */}
                    <View>
                        <MaintenanceTemplate
                            formData={formData}
                            updateForm={updateForm}
                            error={errors}
                            onDragStateChange={setIsDragging}
                        />
                    </View>

                    {/* Navigation */}
                    <View className='flex-row justify-between gap-2 mt-2'>
                        <TouchableOpacity
                            className='py-3 px-4 border border-[#263f94] rounded-xl justify-center items-center'
                            onPress={prev}>
                            <Text className='text-[#263f94] text-[14px] font-medium'>Back</Text>s
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='bg-green-500 rounded-xl py-3 px-4 items-center self-end'
                            onPress={handleSave}>
                            <Text className='text-white text-[14px] font-medium'>
                                Save
                                {loading && <ActivityIndicator color='#fff' />}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

export default Step4;
