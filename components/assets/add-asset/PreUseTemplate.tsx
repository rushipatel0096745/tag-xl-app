import Dropdown from "@/components/common/Dropdown";
import { GetPreUseTemplateAssetList } from "@/services/templates";
import { PreUseTemplteListItem } from "@/types/Templates";
import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

type Props = {
    formData: any;
    updateForm: (name: string, value: any) => void;
};

type Question = {
    id: number;
    question: string;
    type: string;
    multiselect_value?: Record<string, string> | undefined;
};

const questionTypes: Record<string, string> = {
    boolean: "Yes/No",
    text: "Textfield",
    checkbox: "Checkbox",
    select: "Select",
};

const PreUseTemplate = ({ formData, updateForm }: Props) => {
    const [preUseTempList, setPreUseTempList] = useState<PreUseTemplteListItem[]>([]);
    const [allQuesions, setAllQuestions] = useState<Question[]>([]);

    function handleSelection(text: string | number) {
        updateForm("pre_use_template_id", text);
        const template = preUseTempList.find((temp) => temp.id === Number(text));

        if (template) {
            setAllQuestions(template.questions);
        }
    }

    async function fetchPreUseTemplates() {
        const result = await GetPreUseTemplateAssetList();
        console.log("Manual template", result);
        setPreUseTempList(result?.pre_use_templates);
    }

    useEffect(() => {
        fetchPreUseTemplates();
    }, []);

    // const questionRenderer = function (questionType: string): React.ReactNode {
    //     // console.log("question renderer called");
    //     switch (questionType) {
    //         case "boolean":
    //             return <BooleanInput />;
    //         case "text":
    //             return <TextInput />;
    //         default:
    //             return <TextInput />;
    //     }
    // };

    return (
        <View>
            <Text className='text-[16px] font-semibold'>Pre Use Check Template</Text>

            <Dropdown
                onChange={(text: string | number) => handleSelection(text)}
                options={preUseTempList}
                labelKey='title'
                valueKey='id'
                value={formData.pre_use_template_id}
                placeholder='Select Pre Use Check Template'
            />
            {allQuesions.length !== 0 && (
                <View className='border p-2 mt-1 border-gray-400 rounded-xl'>
                    <Text className='text-lg font-semibold'>All Pre Use Check Questions</Text>

                    {allQuesions?.map((q) => {
                        return (
                            <View key={q.id} className='mb-2'>
                                <Text>{q.question}</Text>
                                <Text className='text-sm text-gray-500'>Question Type</Text>

                                {q.type === "text" && (
                                    <View>
                                        <TextInput
                                            value='Textfield'
                                            editable={false}
                                            className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                                            // selectTextOnFocus={!isDisabled}
                                        />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

export default PreUseTemplate;
