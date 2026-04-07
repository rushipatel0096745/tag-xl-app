import Dropdown from "@/components/common/Dropdown";
import NativeDropdown from "@/components/common/NativeDropdown";
import { GetMaintenanceTemplateAssetList, GetPreUseTemplateAssetList } from "@/services/templates";
import { MaintenanceTemplteListItem, PreUseTemplteListItem } from "@/types/Templates";
import { Checkbox } from "expo-checkbox";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

type Props = {
    formData: any;
    updateForm: (name: string, value: any) => void;
    error: Record<string, string>;
};

type Question = {
    id: number;
    question: string;
    type: string;
    multiselect_value?: Record<string, string> | undefined;
};

type QuestionCreate = {
    question: string;
    type: string;
    multiselect_value?: Record<string, string> | null;
};

const MaintenanceTemplate = ({ formData, updateForm, error }: Props) => {
    const [preUseTempList, setPreUseTempList] = useState<MaintenanceTemplteListItem[]>([]);
    const [allQuesions, setAllQuestions] = useState<Question[]>([]);

    const typeOptions = [
        { label: "Yes/No", value: "boolean" },
        { label: "Textfield", value: "text" },
        { label: "Checkbox", value: "checkbox" },
        { label: "Select", value: "select" },
    ];

    const [questionText, setQuestionText] = useState("");
    const [questionType, setQuesitonType] = useState("");
    const [options, setOptions] = useState<string[]>([""]);
    // const [options, setOptions] = useState<Record<string, string>>({ "": "" });

    const [newQuestions, setNewQuestions] = useState<QuestionCreate[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate() {
        const newErrors: Record<string, string> = {};
        if (!questionText) newErrors.questionText = "Question text is required";
        if (!questionType) newErrors.questionType = "Question Type is required";

        if (questionType === "checkbox" || questionType === "select") {
            if (options.filter((opt) => opt !== "").length === 0) {
                newErrors.options = "Options are required";
            }
        }

        setErrors(newErrors);
        return Object.entries(newErrors).length === 0;
    }

    function handleAddOption() {
        setOptions((prev) => [...prev, ""]);
    }

    function handleOptionChange(text: string, index: number) {
        const updated = [...options];
        updated[index] = text;
        setOptions(updated);
    }

    function handleDeleteOption(index: number) {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    }

    function handleTypeChange(text: string) {
        setQuesitonType(text);
    }

    function handleAddQuestion() {
        if (!validate()) return;

        const queObj = {
            question: questionText,
            type: questionType,
        } as QuestionCreate;
        if (questionType === "checkbox" || questionType === "select") {
            const multiselect_value = {} as Record<string, string>;
            options
                .filter((opt) => opt !== "")
                .map((opt) => {
                    multiselect_value[opt] = opt;
                });
            queObj["multiselect_value"] = multiselect_value;
        }
        setNewQuestions((prev) => [...prev, queObj]);

        // reset
        setQuestionText("");
        setQuesitonType("");
        setOptions([""]);
    }

    function deleteQuestion(index: number) {
        const questionObj = newQuestions[index];
        const updated = newQuestions.filter((q) => q.question !== questionObj.question);
        setNewQuestions(updated);
    }

    function handleSelection(text: string | number) {
        updateForm("maintenance_template_id", text);
        const template = preUseTempList.find((temp) => temp.id === Number(text));

        if (template) {
            setAllQuestions(template.questions);
        }
    }

    async function fetchMaintenanceTemplates() {
        const result = await GetMaintenanceTemplateAssetList();
        console.log("Manual template", result);
        setPreUseTempList(result?.maintenance_templates);
    }

    useEffect(() => {
        fetchMaintenanceTemplates();
    }, []);

    useEffect(() => {
        console.log("maintenance questions: ", newQuestions);
    }, [newQuestions]);

    const renderItem = ({ item, drag, isActive, getIndex }: any) => {
        const index = getIndex();
        return (
            <Pressable
                onLongPress={drag}
                disabled={isActive}
                className={`flex flex-row items-center justify-between gap-2 border border-gray-500 rounded-xl p-2 mt-2 ${
                    isActive ? "bg-gray-200" : "bg-white"
                }`}>
                <View className='flex flex-row items-center gap-2 flex-1'>
                    <Text>☰</Text>
                    <Text numberOfLines={1} className='flex-1'>
                        {item.question}
                    </Text>
                    <Text>Type: {item.type}</Text>
                </View>
                <Pressable onPress={() => deleteQuestion(index)} className='bg-red-500 rounded-xl py-2 px-3'>
                    <Text className='text-white text-[14px] font-medium'>Delete</Text>
                </Pressable>
            </Pressable>
        );
    };

    return (
        <View className='flex-col justify-between gap-3 p-3 border border-gray-400 rounded-xl bg-white'>
            <Text className='text-[16px] font-semibold'>Maintenance Check Template</Text>

            <Dropdown
                onChange={(text: string | number) => handleSelection(text)}
                options={preUseTempList}
                labelKey='title'
                valueKey='id'
                value={formData.maintenance_template_id}
                placeholder='Select Maintenance Check Template'
            />
            {error.maintenance_template_id && (
                <View>
                    <Text className='text-red-500'>{error.maintenance_template_id}</Text>
                </View>
            )}

            {allQuesions.length !== 0 && (
                <View className='border p-4 mt-1 border-gray-400 rounded-xl bg-white'>
                    <Text className='text-lg font-semibold'>All Maintenance Check Questions</Text>

                    {allQuesions?.map((q) => {
                        return (
                            <View key={q.id} className='mb-2'>
                                <Text>{q.question}</Text>
                                <Text className='text text-gray-500'>Question Type</Text>

                                {q.type === "text" && (
                                    <View className='mt-1'>
                                        <TextInput
                                            value='Textfield'
                                            editable={false}
                                            className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                                        />
                                    </View>
                                )}

                                {q.type === "boolean" && (
                                    <View className='flex flex-row gap-2'>
                                        {[
                                            { label: "Yes", value: 1 },
                                            { label: "No", value: 0 },
                                        ].map((item) => {
                                            const selected = 1;
                                            return (
                                                <TouchableOpacity key={item.value} style={styles.container}>
                                                    <View style={styles.outerCircle}>
                                                        {selected === item.value && <View style={styles.innerCircle} />}
                                                    </View>
                                                    <Text>{item.label}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}

                                {q.type === "select" &&
                                    (() => {
                                        const options = Object.entries(q.multiselect_value ?? {}).map(([key, val]) => ({
                                            label: key,
                                            value: val,
                                        }));

                                        return (
                                            <View style={styles.container}>
                                                <NativeDropdown data={options} />
                                            </View>
                                        );
                                    })()}

                                {q.type === "checkbox" && (
                                    <View style={styles.checkbocContainer}>
                                        {q.multiselect_value &&
                                            Object.entries(q?.multiselect_value)?.map(([label, value]) => (
                                                <View style={styles.section} key={value}>
                                                    <Checkbox style={styles.checkbox} disabled value={false} />
                                                    <Text style={styles.paragraph}>{label}</Text>
                                                </View>
                                            ))}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            )}

            <View className='border p-2 mt-1 border-gray-400 rounded-xl'>
                {newQuestions.length !== 0 && (
                    <>
                        <Text className='text-lg font-semibold p-2'>New Added Questions</Text>

                        <DraggableFlatList
                            data={newQuestions}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderItem}
                            onDragEnd={({ data }) => setNewQuestions(data)}
                        />
                    </>
                )}
            </View>

            <View className='border p-4 mt-1 border-gray-400 rounded-xl bg-white'>
                <Text className='text-lg font-semibold'>Add Question</Text>
                <View className='flex flex-col justify-between gap-4'>
                    <TextInput
                        value={questionText}
                        onChangeText={(text: string) => setQuestionText(text)}
                        editable={true}
                        multiline={true}
                        numberOfLines={6}
                        className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                        placeholder='Type question here'
                        textAlignVertical='top'
                    />
                    {errors.questionText && (
                        <View>
                            <Text className='text-red-500'>{errors.questionText}</Text>
                        </View>
                    )}

                    <NativeDropdown data={typeOptions} onChange={handleTypeChange} />
                    {errors.questionType && (
                        <View>
                            <Text className='text-red-500'>{errors.questionType}</Text>
                        </View>
                    )}

                    {(questionType === "select" || questionType === "checkbox") && (
                        <View className='flex flex-col gap-2 p-3 border border-gray-400 rounded-xl'>
                            {options.map((option, index) => (
                                <View key={index} className='flex flex-row items-center gap-2'>
                                    <TextInput
                                        value={option}
                                        onChangeText={(text) => handleOptionChange(text, index)}
                                        editable={true}
                                        className='flex-1 border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                                        placeholder='Type option'
                                    />
                                    <Pressable
                                        onPress={() => handleDeleteOption(index)}
                                        className='bg-red-500 rounded-xl py-3 px-4 items-center'>
                                        <Text className='text-white text-[14px] font-medium'>Delete</Text>
                                    </Pressable>
                                </View>
                            ))}

                            <Pressable
                                onPress={handleAddOption}
                                className='bg-[#263f94] rounded-xl py-3 px-4 items-center self-start mt-1'>
                                <Text className='text-white text-[14px] font-medium'>Add Option</Text>
                            </Pressable>
                            {errors.options && (
                                <View>
                                    <Text className='text-red-500'>{errors.options}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    <View>
                        <Pressable
                            onPress={handleAddQuestion}
                            className='bg-[#263f94] rounded-xl py-3 px-4 items-center self-start'>
                            <Text className='text-white text-[14px] font-medium'>Add Question</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default MaintenanceTemplate;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    outerCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#333",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: "#333",
    },

    // for checkbox
    checkbocContainer: {
        flex: 1,
        flexDirection: "row",
        // marginHorizontal: 16,
        // marginVertical: 32,
    },
    section: {
        flexDirection: "row",
        alignItems: "center",
    },
    paragraph: {
        fontSize: 15,
    },
    checkbox: {
        margin: 8,
    },

    // for select
    selectContainer: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    dropdown: {
        height: 48,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 14,
        backgroundColor: "#fff",
    },
    selectedText: {
        fontSize: 15,
        color: "#111",
    },
    itemText: {
        fontSize: 15,
        color: "#111",
    },
});
