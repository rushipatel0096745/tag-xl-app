import React, { Dispatch, SetStateAction } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

type Props = {
    visible: boolean;
    onRequestClose: () => void;
    onClose: () => void;
    error: Dispatch<SetStateAction<string>>;
};

const AssignTagModal = ({ visible, onRequestClose, onClose }: Props) => {

    function handleSave() {
        
    }

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType='slide' transparent={true}>
            <View className='flex-1 justify-center items-center bg-black/50'>
                <View className='flex flex-row justify-between items-center border-b border-gray-200 pb-3'>
                    <View className='bg-white rounded-2xl p-4 mx-4 w-full max-w-md flex flex-col gap-4'>
                        <Text className='font-semibold text-[16px] text-gray-800'>Create New Tag Confirmation</Text>
                        <TouchableOpacity
                            className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                            onPress={onClose}>
                            <Text className='text-white font-semibold text-sm'>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* footer */}
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

export default AssignTagModal;
