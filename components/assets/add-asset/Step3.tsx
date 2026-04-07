import DateInput from "@/components/common/DateInput";
import Dropdown from "@/components/common/Dropdown";
import * as DocumentPicker from "expo-document-picker";
// import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { CameraIcon, FolderOpen, ImageIcon, Upload, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Props {
    next: () => void;
    prev: () => void;
    updateForm: (name: string, value: any) => void;
    validate: () => boolean;
    errors: any;
    formData: any;
}

type UploadedFile = {
    uri: string;
    name: string;
    // type: "image" | "file";
    mimeType?: string;
} | null;

const Step3 = ({ next, prev, updateForm, formData, validate, errors }: Props) => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [OEMfile, setOEMFile] = useState<UploadedFile | null>(formData.oem_certificate || null);
    const [third_party_file, setThirdPartyFile] = useState<UploadedFile | null>(
        formData.third_party_certificate || null
    );

    const parseDate = (date: any) => {
        if (!date) return undefined;
        const d = new Date(date);
        return isNaN(d.getTime()) ? undefined : d;
    };

    function deriveCustomDate(startDateStr: string, expiryDateStr: string): string | number {
        if (!startDateStr || !expiryDateStr) return "";

        const start = new Date(startDateStr);
        const expiry = new Date(expiryDateStr);

        const months = (expiry.getFullYear() - start.getFullYear()) * 12 + (expiry.getMonth() - start.getMonth());

        const presets = [1, 3, 6, 12];
        const match = presets.find((m) => m === months);

        return match ? String(match) : "custom";
    }

    const [startDate, setStartDate] = useState<Date | undefined>(parseDate(formData.third_party_start_date));
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(parseDate(formData.third_party_expiry_date));
    const [customDate, setCustomDate] = useState<string | number>(() =>
        deriveCustomDate(formData.third_party_start_date, formData.third_party_expiry_date)
    );

    // tracking upload zone
    const activeTarget = useRef<"oem" | "third_party" | null>(null);

    const openUploadModal = (target: "oem" | "third_party") => {
        activeTarget.current = target;
        setIsUploadModalOpen(true);
    };

    const addFile = (file: NonNullable<UploadedFile>) => {
        const fileObj = {
            name: file.name,
            uri: file.uri,
            type: file.mimeType ?? "application/octet-stream",
        };

        if (activeTarget.current === "oem") {
            setOEMFile(file);
            updateForm("oem_certificate", fileObj);
        } else if (activeTarget.current === "third_party") {
            setThirdPartyFile(file);
            updateForm("third_party_certificate", fileObj);
        }

        activeTarget.current = null;
    };

    const removeFile = (target: "oem" | "third_party") => {
        if (target === "oem") {
            setOEMFile(null);
            updateForm("oem_certificate", null);
        } else {
            setThirdPartyFile(null);
            updateForm("third_party_certificate", null);
        }
    };

    // const handleTakePhoto = async (fileType: "oem" | "third_party") => {
    //     setIsUploadModalOpen(false);
    //     const granted = await ImagePicker.requestCameraPermissionsAsync();
    //     if (!granted) {
    //         Alert.alert("Permission required", "Camera access is needed to take photos.");
    //         return;
    //     }
    //     const result = await ImagePicker.launchCameraAsync({
    //         quality: 0.8,
    //         allowsEditing: true,
    //     });
    //     if (!result.canceled) {
    //         addFile({
    //             uri: result.assets[0].uri,
    //             name: `photo_${Date.now()}.jpg`,
    //             type: "image",
    //             mimeType: "image/jpeg",
    //         });
    //     }
    // };

    const handleTakePhoto = async (fileType: "oem" | "third_party") => {
        setIsUploadModalOpen(false);

        const { status, granted, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

        if (!granted) {
            if (!canAskAgain) {
                Alert.alert("Permission blocked", "Please enable camera permission from settings.");
                return;
            }

            Alert.alert("Permission required", "Camera access is needed to take photos.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
        });

        if (!result.canceled) {
            addFile({
                uri: result.assets[0].uri,
                name: `photo_${Date.now()}.jpg`,
                // type: "image",
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
            addFile({
                uri: result.assets[0].uri,
                name: result.assets[0].fileName ?? `image_${Date.now()}.jpg`,
                // type: "image",
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
            addFile({
                uri: result.assets[0].uri,
                name: result.assets[0].name,
                // type: "file",
                mimeType: result.assets[0].mimeType,
            });
        }
    };

    useEffect(() => {
        console.log("third_part_file: ", third_party_file);
        console.log("OEM file: ", OEMfile);
    }, [third_party_file, OEMfile]);

    function handleDate(date_type: "start" | "expiry", val: Date) {
        if (date_type === "start") {
            const start = val?.toISOString().split("T")[0];
            updateForm("third_party_start_date", start);
        }
        if (date_type === "expiry") {
            const expiry = val?.toISOString().split("T")[0];
            updateForm("third_party_expiry_date", expiry);
        }
    }

    function handleSave() {
        if (!validate()) return;

        const oem_certificate = {
            name: OEMfile?.name,
            uri: OEMfile?.uri,
            type: OEMfile?.mimeType,
        };
        updateForm("oem_certificate", oem_certificate);

        if (third_party_file) {
            const third_party_certificate = {
                name: third_party_file?.name,
                uri: third_party_file?.uri,
                type: third_party_file?.mimeType,
            };

            const start = startDate?.toISOString().split("T")[0];
            const expiry = expiryDate?.toISOString().split("T")[0];

            updateForm("third_party_certificate", third_party_certificate);
            updateForm("third_party_start_date", start);
            updateForm("third_party_expiry_date", expiry);
        }
        console.log("form data: ", formData);
        next();
    }

    const customeDropdownOptions = [
        { label: "1 Months", value: "1" },
        { label: "3 Months", value: "3" },
        { label: "6 Months", value: "6" },
        { label: "12 Months", value: "12" },
        { label: "Custom", value: "custom" },
    ];

    function handleCustom(val: string | number) {
        setCustomDate(val);

        if (val === "custom") {
            setExpiryDate(undefined);
            updateForm("third_party_expiry_date", undefined);
            return;
        }

        if (!startDate) return;

        const monthsToAdd = Number(val);
        const newDate = new Date(startDate);
        newDate.setMonth(newDate.getMonth() + monthsToAdd);
        newDate.setDate(newDate.getDate() - 1);

        setExpiryDate(newDate);
        updateForm("third_party_expiry_date", newDate.toISOString().split("T")[0]);
    }

    useEffect(() => {
        if (customDate && customDate !== "custom") {
            handleCustom(customDate);
        }
    }, [startDate]);

    return (
        <ScrollView>
            <View className='flex-1 flex-col gap-6 p-2'>
                {/* Upload modal */}
                <Modal
                    visible={isUploadModalOpen}
                    onRequestClose={() => setIsUploadModalOpen(false)}
                    animationType='slide'
                    transparent>
                    <Pressable className='flex-1 justify-end bg-black/50' onPress={() => setIsUploadModalOpen(false)}>
                        <View className='bg-white rounded-t-3xl p-6 gap-4'>
                            <Text className='text-center text-gray-400 text-sm font-medium tracking-wide uppercase'>
                                Add Image
                            </Text>

                            <TouchableOpacity
                                onPress={() => {
                                    handleTakePhoto("oem");
                                }}
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

                {/* Title */}
                <Text className='text-xl font-semibold mb-4'>Step 3 - Certificates</Text>

                <View className='gap-2'>
                    <Text className='text-[16px] font-semibold'>OEM Certificate</Text>
                    {OEMfile && (
                        <View className='relative self-start'>
                            <Image source={{ uri: OEMfile.uri }} className='w-20 h-20 rounded-xl bg-gray-100' />
                            <TouchableOpacity
                                onPress={() => removeFile("oem")}
                                className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full items-center justify-center'>
                                <X size={10} color='white' strokeWidth={3} />
                            </TouchableOpacity>
                        </View>
                    )}
                    {/* upload file*/}
                    <TouchableOpacity
                        onPress={() => openUploadModal("oem")}
                        className='border-2 border-dashed border-[#263f94]/40 rounded-2xl py-8 items-center gap-3 active:opacity-70 active:bg-blue-50'>
                        <View className='w-12 h-12 bg-[#263f94]/10 rounded-2xl items-center justify-center'>
                            <Upload size={22} color='#263f94' />
                        </View>
                        <View className='items-center gap-1'>
                            <Text className='font-semibold text-[#263f94]'>Add Image/File</Text>
                        </View>
                    </TouchableOpacity>
                    {errors.oem_certificate && (
                        <Text className='text-red-500 text-sm mt-1'>{errors.oem_certificate}</Text>
                    )}
                </View>

                <View className='gap-2'>
                    <Text className='text-[16px] font-semibold'>Third Party Certificate</Text>
                    {third_party_file && (
                        <View className='relative self-start'>
                            <Image
                                source={{ uri: third_party_file?.uri }}
                                className='w-20 h-20 rounded-xl bg-gray-100'
                                // contentFit='cover'
                            />

                            <TouchableOpacity
                                onPress={() => removeFile("third_party")}
                                className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full items-center justify-center'>
                                <X size={10} color='white' strokeWidth={3} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* upload file*/}
                    <TouchableOpacity
                        onPress={() => openUploadModal("third_party")}
                        className='border-2 border-dashed border-[#263f94]/40 rounded-2xl py-8 items-center gap-3 active:opacity-70 active:bg-blue-50'>
                        <View className='w-12 h-12 bg-[#263f94]/10 rounded-2xl items-center justify-center'>
                            <Upload size={22} color='#263f94' />
                        </View>
                        <View className='items-center gap-1'>
                            <Text className='font-semibold text-[#263f94]'>Add Image/File</Text>
                        </View>
                    </TouchableOpacity>
                    {errors.third_party_certificate && (
                        <Text className='text-red-500 text-sm mt-1'>{errors.third_party_certificate}</Text>
                    )}

                    {third_party_file && (
                        <View className='gap-3 mt-2'>
                            <DateInput
                                label='Start Date'
                                value={startDate}
                                onChange={(date: Date) => {
                                    setStartDate(date);
                                    handleDate("start", date);
                                }}
                            />
                            {errors.third_party_start_date && (
                                <Text className='text-red-500 text-sm'>{errors.third_party_start_date}</Text>
                            )}

                            <View className='gap-1'>
                                <Text className='text-sm font-medium text-gray-700'>Select Frequency</Text>
                                <Dropdown
                                    onChange={(val: string | number) => handleCustom(val)}
                                    options={customeDropdownOptions}
                                    value={customDate}
                                    placeholder='Select frequency'
                                />
                            </View>

                            {customDate && startDate && (
                                <View className='gap-1'>
                                    {customDate !== "custom" ? (
                                        <View className='gap-1'>
                                            <Text className='text-sm font-medium text-gray-700'>Expiry Date</Text>
                                            <View className='border border-gray-200 rounded-xl p-4 bg-gray-100 flex-row items-center justify-between'>
                                                <Text className='text-gray-800'>
                                                    {expiryDate
                                                        ? expiryDate.toLocaleDateString("en-GB", {
                                                              day: "2-digit",
                                                              month: "short",
                                                              year: "numeric",
                                                          })
                                                        : "—"}
                                                </Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <DateInput
                                            label='Expiry Date'
                                            value={expiryDate}
                                            onChange={(date: Date) => {
                                                setExpiryDate(date);
                                                handleDate("expiry", date);
                                            }}
                                            minimumDate={startDate}
                                        />
                                    )}
                                    {errors.third_party_expiry_date && (
                                        <Text className='text-red-500 text-sm'>{errors.third_party_expiry_date}</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/*  Navigation  */}
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
        </ScrollView>
    );
};

export default Step3;
