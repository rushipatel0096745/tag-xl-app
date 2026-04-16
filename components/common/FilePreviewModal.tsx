import React from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Pdf from "react-native-pdf";

type Props = {
    visible: boolean;
    onRequestClose: () => void;
    onClose: () => void;
    imageUri?: string;
};

const FilePreviewModal = ({ visible, onRequestClose, onClose, imageUri }: Props) => {
    const isPDF = imageUri?.toLowerCase().endsWith(".pdf");

    return (
        <Modal visible={visible} animationType='fade' onRequestClose={onRequestClose} transparent={true}>
            <View className='flex-1 bg-[rgba(0,0,0,0.3) ] justify-center items-center px-4'>
                <View className='w-full bg-white rounded-2xl overflow-hidden shadow-2xl' style={styles.modalContainer}>
                    {/* Header */}
                    <View className='flex-row justify-between items-center px-5 py-4 border-b border-gray-200'>
                        <Text className='text-lg font-semibold text-gray-800'>Image Preview</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className='bg-gray-100 px-3 py-1.5 rounded-full'
                            activeOpacity={0.7}>
                            <Text className='text-[#263f94] font-semibold'>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Image Container */}
                    <View className='p-5'>
                        {imageUri && !isPDF && (
                            <Image source={{ uri: imageUri }} style={styles.image} resizeMode='contain' />
                        )}

                        {imageUri && isPDF && (
                            <Pdf
                                source={{ uri: imageUri }}
                                style={{ width: "100%", height: 500 }}
                                trustAllCerts={false}
                                onLoadComplete={(numberOfPages) => {
                                    console.log(`Loaded ${numberOfPages} pages`);
                                }}
                                onError={(error) => {
                                    console.log("PDF error:", error);
                                }}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        maxHeight: "90%",
    },
    image: {
        width: "100%",
        height: 500,
    },
});

export default FilePreviewModal;
