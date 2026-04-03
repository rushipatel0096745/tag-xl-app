// import React, { useState } from "react";
// import { Pressable, Text, TextInput, View } from "react-native";
// import NewTagModal from "./NewTagModal";
// import { CheckTagAssigned } from "@/services/asset";

// type TagType = "RFID" | "QR" | "Manual" | "";

// interface TagItem {
//     tag_type: TagType;
//     uid: string;
// }

// interface Tag {
//     id: number;
//     uid: string;
//     tag_type: string;
//     is_assigned: boolean;
//     created_at: string;
//     updated_at: any;
// }

// interface Props {
//     next: () => void;
//     updateForm: (name: string, value: any) => void;
//     validate: () => boolean;
//     errors: any;
//     formData: any;
// }

// const tagTypeOptions: { label: string; value: TagType; text: string }[] = [
//     { label: "RFID", value: "RFID", text: "Scan or enter RFID tag" },
//     { label: "QR", value: "QR", text: "Scan or enter QR code" },
//     { label: "Manual", value: "Manual", text: "Enter the unique ID" },
// ];

// const Step1 = ({ next, updateForm, validate, errors, formData }: Props) => {
//     const [tagId, setTagId] = useState("");
//     const [assignError, setAssignError] = useState("");
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     const handleUidChange = (value: string) => {
//         setTagId(value);
//         updateForm("uid", value);
//     };

//     const openModal = () => setIsModalOpen(true);
//     const closeModal = () => setIsModalOpen(false);

//     async function handleSave() {
//         // next();
//         if (validate()) {
//             return;
//         }

//         const checkAssigned = await CheckTagAssigned(tagId || formData.uid);

//         if (checkAssigned.has_error && checkAssigned.error_code == "RECORD_ALREADY_USED") {
//             setAssignError(checkAssigned.message);
//             return;
//         }

//         if (checkAssigned.has_error && checkAssigned.error_code == "RECORD_NOT_FOUND") {
//             // create the tag via modal
//             openModal();
//         }

//         if (!checkAssigned.has_error) {
//             updateForm("tag_id", checkAssigned.tag.id);
//             next();
//             return;
//         }
//     }

//     return (
//         <View className='flex flex-col justify-between gap-6 p-2'>
//             <NewTagModal
//                 visible={isModalOpen}
//                 onRequestClose={closeModal}
//                 onClose={closeModal}
//                 formData={formData}
//                 updateForm={updateForm}
//                 next={next}
//             />

//             <View className='title'>
//                 <Text className='text-xl font-semibold'>Step 1 - Select the Tag</Text>
//             </View>

//             <View className='flex flex-col justify-between gap-2 p-2'>
//                 <Text className='text-[16px] font-semibold'>Select UID Type</Text>
//                 <View className='flex flex-row justify-start gap-2'>
//                     {tagTypeOptions.map((option) => (
//                         <Pressable
//                             key={option.value}
//                             onPress={() => updateForm("tag_type", option.value)}
//                             className={`rounded-full justify-center items-center h-[38px] px-[10px] border
//                                          ${formData.tag_type === option.value ? "bg-[#263f94] border-[#263f94]" : "bg-[#f5f6fa] border-[#c9d5ff]"}`}>
//                             <Text
//                                 className={`text-[14px] font-medium
//                                                     ${formData.tag_type === option.value ? "text-white" : "text-[#111c43]"}`}>
//                                 {option.label}
//                             </Text>
//                         </Pressable>
//                     ))}
//                 </View>
//                 {errors.tag_type && (
//                     <View className='text-red-600'>
//                         <Text>{errors.tag_type}</Text>
//                     </View>
//                 )}
//             </View>

//             <View className='flex flex-col justify-between gap-2 p-2 w-full'>
//                 <Text className='text-[16px] font-semibold'>Enter UID </Text>

//                 <View className='flex flex-row justify-start gap-2 w-full'>
//                     <TextInput
//                         className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 w-full'
//                         placeholder='Unique ID'
//                         value={formData?.uid}
//                         onChangeText={(text) => handleUidChange(text)}
//                         placeholderTextColor='#9CA3AF'
//                     />
//                 </View>
//                 {errors.uid && (
//                     <View className='text-red-600'>
//                         <Text>{errors.uid}</Text>
//                     </View>
//                 )}
//             </View>

//             <View className='actions-btn next_step-btn flex items-center justify-between gap-2 mt-6 '>
//                 {assignError && (
//                     <div className='assign-error bg-yellow-400 text-[14px] text-amber-900'>
//                         <Text>{assignError}</Text>
//                     </div>
//                 )}
//                 <Pressable
//                     onPress={handleSave}
//                     className='btn continue py-2.5 pr-3 pl-3.5 ml-auto all-unset cursor-pointer text-center bg-[#263f94] border border-[#263f94] text-white box-border rounded-xl justify-center items-center gap-[6px] h-[38px] px-[14px] py-[10px] text-[14px] font-500 transition-all duration-200 inline-flex'>
//                     <Text className='text-white text-[14px] font-medium'>Continue</Text>
//                 </Pressable>
//             </View>
//         </View>
//     );
// };

// export default Step1;

import { CheckTagAssigned } from "@/services/asset";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
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
        if (validate()) return;

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
            {assignError ? (
                <View className='bg-yellow-400 p-2 rounded-md mb-3'>
                    <Text className='text-amber-900 text-[14px]'>{assignError}</Text>
                </View>
            ) : null}

            {/* Button */}
            <Pressable onPress={handleSave} className='bg-[#263f94] rounded-xl py-3 px-4 items-center self-end'>
                <Text className='text-white text-[14px] font-medium'>Continue</Text>
            </Pressable>
        </View>
    );
};

export default Step1;
