import { View } from "react-native";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity } from "react-native";

type DropdownProps = {
    options: any[];
    value: string | number | null;
    onChange: (value: string | number) => void;
    placeholder?: string;
    labelKey?: string;
    valueKey?: string; 
};

function Dropdown({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    labelKey = "label",
    valueKey = "value",
}: DropdownProps) {
    const [open, setOpen] = useState(false);

    const selected = options.find((o) => o[valueKey] === value);

    return (
        <View>
            <TouchableOpacity
                className='border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-row justify-between items-center'
                onPress={() => setOpen(true)}>
                <Text className={selected ? "text-gray-800" : "text-gray-400"}>
                    {selected ? selected[labelKey] : placeholder}
                </Text>
                <Text className='text-gray-400'>▼</Text>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType='fade' onRequestClose={() => setOpen(false)}>
                <TouchableOpacity
                    className='flex-1 bg-black/50 justify-center items-center'
                    activeOpacity={1}
                    onPress={() => setOpen(false)}>
                    <View className='bg-white rounded-2xl mx-6 w-full max-w-sm overflow-hidden'>
                        <View className='flex flex-row justify-between items-center px-4 py-3 border-b border-gray-100'>
                            <Text className='font-semibold text-gray-800'>Select</Text>
                            <TouchableOpacity onPress={() => setOpen(false)}>
                                <Text className='text-gray-400 text-lg'>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className='max-h-72'>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option[valueKey]}
                                    className={`px-4 py-3 border-b border-gray-50 flex flex-row justify-between items-center
                                        ${option[valueKey] === value ? "bg-blue-50" : ""}`}
                                    onPress={() => {
                                        onChange(option[valueKey]);
                                        setOpen(false);
                                    }}>
                                    <Text
                                        className={`${option[valueKey] === value ? "text-[#263f94] font-semibold" : "text-gray-700"}`}>
                                        {option[labelKey]}
                                    </Text>
                                    {option[valueKey] === value && <Text className='text-[#263f94]'>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
export default Dropdown;
