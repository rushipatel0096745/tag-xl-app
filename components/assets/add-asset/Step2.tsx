import FilePreviewModal from "@/components/common/FilePreviewModal";
import NativeDropdown from "@/components/common/NativeDropdown";
import { validateFileSize } from "@/lib/utils";
import { CreateLocation, GetLocationList } from "@/services/asset";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { Camera } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Camera as CameraIcon, FileText, FolderOpen, ImageIcon, Upload, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Image,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
    next: () => void;
    prev: () => void;
    updateForm: (name: string, value: any) => void;
    validate: () => boolean;
    errors: any;
    formData: any;
}

type Location = { id: number; name: string };

type UploadedFile = {
    uri: string;
    name: string;
    type: "image" | "file";
    mimeType?: string;
} | null;

export const Step2 = ({ next, prev, updateForm, formData, errors, validate }: Props) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [location_name, setLocationName] = useState("");
    const [assignError, setAssignError] = useState("");
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    const openPreviewModal = () => setPreviewModalOpen(true);
    const closePreviewModal = () => setPreviewModalOpen(false);

    function handleImagePreview() {
        openPreviewModal();
    }

    async function getLocations() {
        const result = await GetLocationList([], 1);
        if (!result.has_error) setLocations(result?.locations ?? []);
    }

    async function handleCreateLocation() {
        if (!location_name.trim()) return;
        const res = await CreateLocation(location_name);
        if (res.has_error) {
            setAssignError(res.message);
            return;
        }
        getLocations();
        updateForm("location_id", res.location_id);
        setIsLocationModalOpen(false);
        setLocationName("");
    }

    useEffect(() => {
        getLocations();
    }, []);

    useEffect(() => {
        console.log("uploaded files: ", uploadedFile);
    }, [uploadedFile]);

    const requestCameraPermission = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        return status === "granted";
    };

    const handleTakePhoto = async () => {
        setIsUploadModalOpen(false);
        const granted = await requestCameraPermission();
        if (!granted) {
            Alert.alert("Permission required", "Camera access is needed to take photos.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
        });
        if (!result.canceled) {
            const asset = result.assets[0];

            const { valid, message } = validateFileSize(asset.fileSize);

            if (!valid) {
                Alert.alert("File Size Too Large", message);
                return;
            }

            addFile({
                // uri: result.assets[0].uri,
                uri: asset.uri,
                name: `photo_${Date.now()}.jpg`,
                type: "image",
                mimeType: "image/jpeg",
            });
        }
    };

    const handleChooseFromGallery = async () => {
        setIsUploadModalOpen(false);
        const result = await ImagePicker.launchImageLibraryAsync({
            // mediaTypes: ImagePicker.MediaTypeOptions.Images,
            mediaTypes: ["images"],
            allowsMultipleSelection: false, // single only
            quality: 0.8,
        });
        if (!result.canceled) {
            const asset = result.assets[0];

            const { valid, message } = validateFileSize(asset.fileSize);

            if (!valid) {
                Alert.alert("File Size Too Large", message);
                return;
            }

            addFile({
                uri: result.assets[0].uri,
                name: result.assets[0].fileName ?? `image_${Date.now()}.jpg`,
                type: "image",
                mimeType: result.assets[0].mimeType ?? "image/jpeg",
            });
        }
    };

    const handleChooseFile = async () => {
        setIsUploadModalOpen(false);
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            multiple: false, // single file
            copyToCacheDirectory: true,
        });
        if (!result.canceled) {
            const asset = result.assets[0];

            const { valid, message } = validateFileSize(asset.size);

            if (!valid) {
                Alert.alert("File Size Too Large", message);
                return;
            }

            if (result.assets[0].mimeType === "application/pdf") {
                Alert.alert("File Type Not Allowed", "PDF files are not allowed.");
                return;
            }

            addFile({
                uri: result.assets[0].uri,
                name: result.assets[0].name,
                type: "file",
                mimeType: result.assets[0].mimeType,
            });
        }
    };

    const addFile = (file: NonNullable<UploadedFile>) => {
        setUploadedFile(file);
        const fileObj = {
            name: file.name,
            uri: file.uri,
            type: file.mimeType ?? "application/octet-stream",
        };
        if (fileObj.type === "image/jpeg") {
            updateForm("image", fileObj);
        } else {
            updateForm("image", null);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        updateForm("image", null);
    };

    // On iOS we can use the native action sheet instead of a custom modal
    const handleUploadPress = () => {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ["Cancel", "Take Photo", "Choose from Gallery", "Choose a File"],
                    cancelButtonIndex: 0,
                },
                (index) => {
                    if (index === 1) handleTakePhoto();
                    if (index === 2) handleChooseFromGallery();
                    if (index === 3) handleChooseFile();
                }
            );
        } else {
            setIsUploadModalOpen(true);
        }
    };

    async function handleSave() {
        console.log("Form Data Submitted:", formData);
        console.log("image: ", uploadedFile);
        if (!validate()) return;
        next();
    }

    const imageUri = uploadedFile?.uri || formData?.image?.uri;

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className='flex flex-col gap-6 p-2'>
                {/* Upload modal */}
                <Modal
                    visible={isUploadModalOpen}
                    onRequestClose={() => setIsUploadModalOpen(false)}
                    animationType='slide'
                    transparent>
                    <Pressable
                        className='flex-1 justify-end bg-[rgba(0,0,0,0.5)]'
                        onPress={() => setIsUploadModalOpen(false)}>
                        <View className='bg-white rounded-t-3xl p-6 gap-4'>
                            <Text className='text-center text-gray-400 text-sm font-medium tracking-wide uppercase'>
                                Add Image
                            </Text>

                            <TouchableOpacity
                                onPress={handleTakePhoto}
                                className='flex-row items-center gap-4 p-4 bg-gray-50 rounded-2xl active:opacity-70'>
                                <View className='w-10 h-10 bg-[#263f94]/10 rounded-xl items-center justify-center'>
                                    <CameraIcon size={20} color='#263f94' />
                                </View>
                                <View>
                                    <Text className='font-semibold text-gray-800'>Take Photo</Text>
                                    <Text className='text-gray-400 text-xs mt-0.5'>Use camera to capture</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleChooseFromGallery}
                                className='flex-row items-center gap-4 p-4 bg-gray-50 rounded-2xl active:opacity-70'>
                                <View className='w-10 h-10 bg-[#263f94]/10 rounded-xl items-center justify-center'>
                                    <ImageIcon size={20} color='#263f94' />
                                </View>
                                <View>
                                    <Text className='font-semibold text-gray-800'>Choose from Gallery</Text>
                                    <Text className='text-gray-400 text-xs mt-0.5'>Pick images from your library</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleChooseFile}
                                className='flex-row items-center gap-4 p-4 bg-gray-50 rounded-2xl active:opacity-70'>
                                <View className='w-10 h-10 bg-[#263f94]/10 rounded-xl items-center justify-center'>
                                    <FolderOpen size={20} color='#263f94' />
                                </View>
                                <View>
                                    <Text className='font-semibold text-gray-800'>Choose a File</Text>
                                    <Text className='text-gray-400 text-xs mt-0.5'>Browse PDFs, docs & more</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsUploadModalOpen(false)}
                                className='p-4 items-center rounded-2xl border border-gray-200 active:opacity-70'>
                                <Text className='text-gray-500 font-medium'>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Modal>

                {/* Location Modal */}
                <Modal
                    visible={isLocationModalOpen}
                    onRequestClose={() => setIsLocationModalOpen(false)}
                    animationType='slide'
                    transparent={true}
                    statusBarTranslucent>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingHorizontal: 16,
                        }}>
                        <View className='bg-white rounded-2xl p-4 mx-4 w-full max-w-md gap-4'>
                            <View className='flex-row justify-between items-center border-b border-gray-200 pb-3'>
                                <Text className='font-semibold text-[16px] text-gray-800'>Add New Location</Text>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() => setIsLocationModalOpen(false)}>
                                    <Text className='text-white font-semibold text-sm'>Close</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                                placeholder='Location name'
                                value={location_name}
                                onChangeText={setLocationName}
                                placeholderTextColor='#9CA3AF'
                            />
                            {assignError ? <Text className='text-red-500 text-sm'>{assignError}</Text> : null}
                            <View className='flex-row justify-end gap-2'>
                                <TouchableOpacity
                                    className='border border-[#263f94] rounded-xl px-4 py-2 active:opacity-80'
                                    onPress={() => setIsLocationModalOpen(false)}>
                                    <Text className='text-[#263f94] font-semibold text-sm'>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-4 py-2 active:opacity-80'
                                    onPress={handleCreateLocation}>
                                    <Text className='text-white font-semibold text-sm'>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* image preview modal */}
                <FilePreviewModal
                    visible={previewModalOpen}
                    onRequestClose={closePreviewModal}
                    onClose={closePreviewModal}
                    imageUri={imageUri}
                />

                <Text className='text-xl font-semibold'>Step 2 - Asset Details</Text>

                <View className='gap-3'>
                    <Text className='text-[16px] font-semibold'>Basic Information</Text>

                    <TextInput
                        className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 w-full'
                        placeholder='Name'
                        value={formData?.name}
                        onChangeText={(t) => updateForm("name", t)}
                        placeholderTextColor='#9CA3AF'
                    />
                    {errors.name && <Text className='text-red-500 text-sm'>{errors.name}</Text>}

                    <View>
                        {/* <Dropdown
                        options={locations}
                        value={formData.location_id}
                        onChange={(val: string | number) => updateForm("location_id", val)}
                        labelKey='name'
                        valueKey='id'
                        placeholder='Select Location'
                    /> */}
                        <NativeDropdown
                            data={locations}
                            value={formData?.location_id}
                            onChange={(val: string | number) => updateForm("location_id", val)}
                            labelField='name'
                            valueField='id'
                            placeholder='Select Location'
                        />
                        <Text
                            className='text-right text-blue-700 mt-2 text-sm'
                            onPress={() => setIsLocationModalOpen(true)}>
                            + Add New Location
                        </Text>
                        {errors.location_id && <Text className='text-red-500 text-sm mt-1'>{errors.location_id}</Text>}
                    </View>

                    <TextInput
                        className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 w-full'
                        placeholder='Batch Code'
                        value={formData?.batch_code}
                        onChangeText={(t) => updateForm("batch_code", t)}
                        placeholderTextColor='#9CA3AF'
                    />
                    {errors.batch_code && <Text className='text-red-500 text-sm'>{errors.batch_code}</Text>}
                </View>

                <View className='gap-2'>
                    <Text className='text-[16px] font-semibold'>Add Images</Text>

                    {/* Uploaded previews */}
                    {(uploadedFile || formData.image) && (
                        <View className='flex-row flex-wrap gap-2 mb-2'>
                            <TouchableOpacity className='relative' onPress={() => handleImagePreview()}>
                                {imageUri ? (
                                    <Image
                                        source={{ uri: uploadedFile ? uploadedFile?.uri : formData.image.uri }}
                                        className='w-20 h-20 rounded-xl bg-gray-100'
                                        resizeMode='cover'
                                    />
                                ) : (
                                    <View className='w-20 h-20 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center gap-1'>
                                        <FileText size={24} color='#263f94' />
                                        <Text className='text-[10px] text-gray-500 px-1 text-center' numberOfLines={2}>
                                            {uploadedFile?.name}
                                        </Text>
                                    </View>
                                )}
                                {/* Remove button */}
                                <TouchableOpacity
                                    onPress={() => removeFile()}
                                    className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full items-center justify-center'>
                                    <X size={10} color='white' strokeWidth={3} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* upload file */}
                    <TouchableOpacity
                        onPress={handleUploadPress}
                        className='border-2 border-dashed border-[#263f94]/40 rounded-2xl py-8 items-center gap-3 active:opacity-70 active:bg-blue-50'>
                        <View className='w-12 h-12 bg-[#263f94]/10 rounded-2xl items-center justify-center'>
                            <Upload size={22} color='#263f94' />
                        </View>
                        <View className='items-center gap-1'>
                            <Text className='font-semibold text-[#263f94]'>Add Image</Text>
                        </View>
                    </TouchableOpacity>
                    {errors.image && <Text className='text-red-500 text-sm'>{errors.image}</Text>}
                </View>

                {/* ── Navigation ── */}
                <View className='flex-row justify-between gap-2 mt-2'>
                    <TouchableOpacity
                        className='py-3 px-4 border border-[#263f94] rounded-xl justify-center items-center'
                        onPress={prev}>
                        <Text className='text-[#263f94] text-[14px] font-medium'>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className='bg-[#263f94] rounded-xl py-3 px-4 items-center self-end'
                        onPress={handleSave}>
                        <Text className='text-white text-[14px] font-medium'>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default Step2;
