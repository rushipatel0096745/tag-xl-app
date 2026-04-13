import { CreateLocation, GetAsset, GetLocationList, UpdateAsset } from "@/services/asset";
import {
    GetMaintenanceTemplateAssetList,
    GetManualTemplateAssetList,
    GetPreUseTemplateAssetList,
} from "@/services/templates";
import { AssetDetail, Question } from "@/types/Aseet";
import { MaintenanceTemplteListItem, ManualTemplateListItem, PreUseTemplteListItem } from "@/types/Templates";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { CameraIcon, FolderOpen, ImageIcon } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import NativeDatePickerInput from "../common/NativeDateTimePicker";
import NativeDropdown from "../common/NativeDropdown";
import UnassignTagModal from "./UnassignTagModal";

type UploadedFile = {
    uri: string;
    name: string;
    mimeType?: string;
} | null;

type Location = { id: number; name: string };

type Props = {
    id: string;
    setUpdateLoading?: (val: boolean) => void;
};

const AssetEdit = ({ id }: Props) => {
    const [asset, setAsset] = useState<AssetDetail>();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [userRole, setUserRole] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [update_loading, setUpdateLoading] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [manualTempList, setManualTempList] = useState<ManualTemplateListItem[]>([]);
    const [preUseTemplateList, setPreUseTemplateList] = useState<PreUseTemplteListItem[]>([]);
    const [maintenanceTemplateList, setMaintenanceTemplateList] = useState<MaintenanceTemplteListItem[]>([]);

    const [image, setImage] = useState<UploadedFile>();
    const [third_party_file, setThirdPartyFile] = useState<UploadedFile>();
    const [start_date, setStartDate] = useState<Date | null>(null);
    const [end_date, setEndDate] = useState<Date | null>(null);
    const [frequency, setFrequency] = useState<string | number>();

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [unassignModalError, setUnassignModalError] = useState("");
    const [assignModalError, setAssignModalError] = useState("");

    const [preUseQuestions, setPreUseQuestions] = useState<Question[] | null>(null);
    const [maintenanceQuestions, setMaintenanceQuestions] = useState<Question[] | null>(null);

    const openUnassignModal = () => setIsUnassignModalOpen(true);
    const openAssignModal = () => setIsAssignModalOpen(true);

    const [location_name, setLocationName] = useState("");
    const [assignError, setAssignError] = useState("");
    const [formData, setFormData] = useState({
        name: asset?.name ?? "",
        location_id: asset?.location?.id ?? null,
        batch_code: asset?.batch_code ?? "",
        image: asset?.image ?? ("" as any | null),
        manual_template_id: String(asset?.manual_template?.id) ?? "",
        status: String(asset?.status) ?? "",
        third_party_certificate: asset?.third_party_certificate[0] ?? ("" as any),
        third_party_start_date: asset?.third_party_certificate[0]?.third_party_start_date ?? "",
        third_party_expiry_date: asset?.third_party_certificate[0]?.third_party_expiry_date ?? "",
        pre_use_template_id: String(asset?.pre_use_template?.id) ?? "",
        maintenance_template_id: String(asset?.maintenance_template?.id) ?? "",
    });

    function handleChange(field: string, value: any) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    function validate() {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.batch_code) newErrors.batch_code = "Batch Code is required";
        if (!formData.location_id) newErrors.location_id = "Location is required";
        if (!formData.maintenance_template_id)
            newErrors.maintenance_template_id = "Select Maintenance Template is required";
        if (!formData.status) newErrors.status = "Select Status";
        if (!formData.batch_code) newErrors.status = "Select Status";
        if (third_party_file) {
            if (!start_date) newErrors.start_date = "Start date is required";
            if (!end_date) newErrors.end_date = "Expiry date is required";
        }
        if (start_date && end_date && !third_party_file) {
            newErrors.third_party_file = "Upload Third Party Certificate";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;
        try {
            setUpdateLoading(true);

            const assetData = new FormData();
            assetData.append("name", formData.name);
            assetData.append("batch_code", formData.batch_code);
            image && assetData.append("image", image as any);
            assetData.append("location_id", String(formData.location_id));
            assetData.append("status", String(formData.status));
            assetData.append("maintenance_template_id", formData.maintenance_template_id);
            assetData.append("pre_use_template_id", formData.pre_use_template_id);
            formData.manual_template_id && assetData.append("manual_template_id", formData.manual_template_id);

            if (third_party_file) {
                assetData.append("third_party_certificate", third_party_file as any);
                if (start_date) {
                    assetData.append("third_party_start_date", start_date.toISOString().split("T")[0]);
                }

                if (end_date) {
                    assetData.append("third_party_expiry_date", end_date.toISOString().split("T")[0]);
                }
            }

            console.log("\n===== FORM DATA TO BE SENT =====");
            console.log(formData);
            console.log("========================\n");

            const result = await UpdateAsset(Number(id), assetData);

            if (result.has_error && result.error_code === "PERMISSION_DENIED") {
                Alert.alert("Asset", "Permission Denied to Update Asset");
            }

            if (result.has_error) {
                Alert.alert("Asset", result.message);
                console.log("error: ", result.message);
            }

            if (!result.has_error) {
                Alert.alert("Asset", "Asset Updated Successfully");
            }
        } catch (error) {
            console.error("Update error:", error);
            Alert.alert("Error", "Something went wrong");
        } finally {
            loadData();
            setUpdateLoading(false);
        }
    }

    async function fetchAsset() {
        try {
            const result = await GetAsset(parseInt(id as string));

            if (result.has_error && result.error_code === "PERMISSION_DENIED") {
                setErrors({ permission: result.message });
            }

            if (!result.has_error) {
                // console.log("\n===== API RESPONSE =====");
                // console.log(JSON.stringify(result.asset, null, 2));
                // console.log("========================\n");
                const a = result.asset;
                setAsset(a);

                setFormData({
                    name: a.name ?? "",
                    location_id: a.location.id ?? "",
                    batch_code: a.batch_code ?? "",
                    image: a.image ?? "",
                    manual_template_id: String(a.manual_template?.id) ?? "",
                    status: String(a.status) ?? "",
                    third_party_certificate: a.third_party_certificate[0] ?? "",
                    third_party_start_date: a.third_party_certificate[0]?.third_party_start_date ?? "",
                    third_party_expiry_date: a.third_party_certificate[0]?.third_party_expiry_date ?? "",
                    pre_use_template_id: String(a.pre_use_template?.id) ?? "",
                    maintenance_template_id: String(a.maintenance_template?.id) ?? "",
                });

                setMaintenanceQuestions(a.maintenance_template.questions);
                setPreUseQuestions(a.pre_use_template.questions);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
        }
    }

    async function fetchManualTemplates() {
        const result = await GetManualTemplateAssetList();
        setManualTempList(result?.manual_templates);
    }

    async function fetchMaintenanceTemplates() {
        const result = await GetMaintenanceTemplateAssetList();
        setMaintenanceTemplateList(result?.maintenance_templates);
        // setMaintenanceQuestions(result?.maintenance_template)
    }

    function displayQuestions(id: number, type: "maintenance" | "preuse") {
        if (type === "maintenance") {
            const template = maintenanceTemplateList.find((temp) => temp.id === id);
            if (template) setMaintenanceQuestions(template.questions);
        }

        if (type === "preuse") {
            const template = preUseTemplateList.find((temp) => temp.id === id);
            if (template) setPreUseQuestions(template.questions);
        }
    }

    async function fetchPreUseTemplates() {
        const result = await GetPreUseTemplateAssetList();
        setPreUseTemplateList(result?.pre_use_templates);
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
        await getLocations();
        handleChange("location_id", res.location_id);
        setIsLocationModalOpen(false);
        setLocationName("");
    }

    const activeTarget = useRef<"image" | "third_party" | null>(null);

    const openUploadModal = (target: "image" | "third_party") => {
        activeTarget.current = target;
        setIsUploadModalOpen(true);
    };

    const addFile = (file: NonNullable<UploadedFile>) => {
        const fileObj = {
            name: file.name,
            uri: file.uri,
            type: file.mimeType ?? "application/octet-stream",
        };

        if (activeTarget.current === "image") {
            setImage(fileObj);
        } else if (activeTarget.current === "third_party") {
            setThirdPartyFile(fileObj);
        }

        activeTarget.current = null;
    };

    const handleTakePhoto = async () => {
        setIsUploadModalOpen(false);

        const { status, granted, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

        if (!granted) {
            if (!canAskAgain) {
                Alert.alert("Permission blocked", "Please enable camera permission from settings.", [
                    { text: "Cancel" },
                    { text: "Settings", onPress: () => Linking.openSettings() },
                ]);
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
                mimeType: "image/jpeg",
            });
        }
    };

    const handleChooseFromGallery = async () => {
        setIsUploadModalOpen(false);
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission required", "Permission to access the media library is required.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            // allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            allowsMultipleSelection: false,
        });

        if (!result.canceled) {
            addFile({
                uri: result.assets[0].uri,
                name: result.assets[0].fileName ?? `image_${Date.now()}.jpg`,
                mimeType: result.assets[0].mimeType ?? "image/jpeg",
            });
        }
    };

    const handleChooseFile = async () => {
        setIsUploadModalOpen(false);
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            multiple: false,
            copyToCacheDirectory: true,
        });
        if (!result.canceled) {
            addFile({
                uri: result.assets[0].uri,
                name: result.assets[0].name,
                mimeType: result.assets[0].mimeType,
            });
        }
    };

    const downloadFile = (url: string) => {
        Alert.alert("Download File", "Browser is required to open this document", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Open in Browser",
                onPress: async () => {
                    try {
                        await Linking.openURL(url);
                    } catch (err) {
                        console.error("Failed to open URL:", err);
                    }
                },
            },
        ]);
    };

    function handleSelection(val: string | number) {
        setFrequency(val);

        // claculateExpiry();
        if (!start_date) return;

        const monthsToAdd = Number(val);
        const newDate = new Date(start_date);
        newDate.setMonth(newDate.getMonth() + monthsToAdd);
        newDate.setDate(newDate.getDate() - 1);

        setEndDate(newDate);
    }

    function claculateExpiry() {
        if (start_date && frequency && frequency !== "custom") {
            const monthsToAdd = Number(frequency);
            const newDate = new Date(start_date);
            newDate.setMonth(newDate.getMonth() + monthsToAdd);
            newDate.setDate(newDate.getDate() - 1);

            setEndDate(newDate);
        }
    }

    async function loadData() {
        try {
            setLoading(true);

            await Promise.all([
                fetchAsset(),
                getLocations(),
                fetchManualTemplates(),
                fetchMaintenanceTemplates(),
                fetchPreUseTemplates(),
            ]);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadData();
    }, []);

    // useEffect(() => {
    //     console.log("location type: ", typeof asset?.location?.id);
    //     console.log("Maintenance type", typeof asset?.maintenance_template?.id);
    //     console.log("preuse type", typeof asset?.pre_use_template?.id);
    // }, [asset]);

    const statusOptions = [
        { label: "Active", value: "1" },
        { label: "Inactive", value: "0" },
    ];

    if (loading) {
        return (
            <View className='flex-1 justify-center items-center'>
                <Text>Loading...</Text>
            </View>
        );
    }

    const customDropdownOptions = [
        { label: "1 Months", value: "1" },
        { label: "3 Months", value: "3" },
        { label: "6 Months", value: "6" },
        { label: "12 Months", value: "12" },
        { label: "Custom", value: "custom" },
    ];

    return (
        <View className='main p-4 flex flex-col gap-4 justify-between'>
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
                transparent>
                <View className='flex-1 justify-center items-center bg-black/50'>
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

            {asset?.tag?.id && (
                <UnassignTagModal
                    visible={isUnassignModalOpen}
                    onClose={() => setIsUnassignModalOpen(false)}
                    onRequestClose={() => setIsUnassignModalOpen(false)}
                    uid={asset?.tag?.uid}
                    error={setUnassignModalError}
                    fetchAsset={fetchAsset}
                />
            )}

            {/* image */}
            <View className='relative flex flex-row justify-center border rounded-xl border-gray-400'>
                <Image
                    source={{ uri: image ? image.uri : `https://api.tagxl.com/${formData?.image}` }}
                    style={{ width: "100%", height: 280 }}
                    contentFit='scale-down'
                />

                <TouchableOpacity
                    onPress={() => {
                        console.log("Upload pressed");
                        openUploadModal("image");
                    }}
                    className='absolute top right-2 bg-black/60 p-2 rounded-full'>
                    <Ionicons name='cloud-upload-outline' size={20} color='white' />
                </TouchableOpacity>
            </View>

            <View className='flex-col gap-2'>
                <Text className='text-[16px]'>Tag UID</Text>
                <TextInput
                    value={asset?.tag?.uid}
                    editable={false}
                    className='border border-gray-400 rounded-lg p-4 bg-white'
                />
            </View>

            <View className='flex-col gap-2'>
                <Text className='text-[16px]'>Asset Name</Text>
                <TextInput
                    value={formData?.name}
                    editable={true}
                    className='border border-gray-400 rounded-lg p-4 bg-white'
                    onChangeText={(val) => handleChange("name", val)}
                />
            </View>

            <View className='flex-col gap-2'>
                <Text className='text-[16px]'>Location</Text>
                <NativeDropdown
                    data={locations}
                    labelField='name'
                    valueField='id'
                    placeholder='select location'
                    value={formData.location_id as number}
                    onChange={(val) => handleChange("location_id", val)}
                />
                <Text className='text-right text-blue-700 mt-2 text-sm' onPress={() => setIsLocationModalOpen(true)}>
                    + Add New Location
                </Text>
            </View>

            <View className='flex-row gap-2 items-center w-full'>
                <View className='flex-1 flex-col gap-2'>
                    <Text className='text-[16px]'>Batch Code</Text>
                    <TextInput
                        value={formData?.batch_code}
                        editable={true}
                        className='border border-gray-400 rounded-lg p-4 bg-white'
                        onChangeText={(val) => handleChange("batch_code", val)}
                    />
                </View>
                <View className='flex-1 flex-col gap-2'>
                    <Text className='text-[16px]'>Status</Text>
                    <View className='w-full'>
                        <NativeDropdown
                            data={statusOptions}
                            value={formData?.status}
                            onChange={(item) => handleChange("status", item)}
                        />
                    </View>
                </View>
            </View>

            <View className='flex-col gap-2'>
                <Text className='text-[16px]'>Manual Template</Text>
                <NativeDropdown
                    data={manualTempList}
                    labelField='name'
                    valueField='id'
                    placeholder='Select Manual Template'
                    value={Number(formData.manual_template_id)}
                    onChange={(item) => handleChange("manual_template_id", item)}
                />
            </View>

            {/* preuse template */}
            <View className='flex-col gap-2'>
                <View className='flex-col gap-2'>
                    <Text className='text-[16px]'>Pre-use Check Template</Text>
                    <NativeDropdown
                        data={preUseTemplateList}
                        labelField='title'
                        valueField='id'
                        placeholder='Select Pre Use Template'
                        value={Number(formData.pre_use_template_id)}
                        onChange={(item) => {
                            handleChange("pre_use_template_id", item);
                            displayQuestions(Number(item), "preuse");
                        }}
                    />
                    {preUseQuestions && (
                        <View className='flex flex-col justify-between gap-2 bg-white p-2 border-0 rounded-lg'>
                            <Text className='text-[15px] text-gray-500'>Template Questions</Text>
                            {preUseQuestions?.map((q: Question) => (
                                <View key={q.id} className='flex flex-row items-center gap-2'>
                                    <View className='w-1.5 h-1.5 rounded-full bg-gray-800' />
                                    <Text>{q.question}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            {/* maintenance check template */}
            <View className='flex-col gap-2'>
                <View className='flex-col gap-2'>
                    <Text className='text-[16px]'>Maintenance Check Template</Text>
                    <NativeDropdown
                        data={maintenanceTemplateList}
                        labelField='title'
                        valueField='id'
                        placeholder='Select Maintenance Template'
                        value={Number(formData.maintenance_template_id)}
                        onChange={(item) => {
                            handleChange("maintenance_template_id", item);
                            displayQuestions(Number(item), "maintenance");
                        }}
                    />
                    {maintenanceQuestions && (
                        <View className='flex flex-col justify-between gap-2 bg-white p-2 border-0 rounded-lg'>
                            <Text className='text-[15px] text-gray-500'>Template Questions</Text>
                            {maintenanceQuestions?.map((q: Question) => (
                                <View key={q.id} className='flex flex-row items-center gap-2'>
                                    <View className='w-1.5 h-1.5 rounded-full bg-gray-800' />
                                    <Text>{q.question}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            <View className='flex-col gap-2'>
                <Text className='text-[16px]'>Third Party Certificate</Text>
                <View className='flex flex-col justify-between border rounded-xl border-gray-400'>
                    {asset?.third_party_certificate && asset?.third_party_certificate.length > 0 && (
                        <View className='flex flex-row justify-between items-center border-b border-gray-400 py-2 px-4'>
                            <Text className='font-semibold text-[16px]'>Last Uploaded Certificate</Text>

                            {asset?.third_party_certificate && asset?.third_party_certificate.length > 0 && (
                                <TouchableOpacity
                                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80'
                                    onPress={() =>
                                        downloadFile(
                                            ("https://api.tagxl.com/" +
                                                asset?.third_party_certificate[0].third_party_certificate) as string
                                        )
                                    }>
                                    <Text className='text-white text-center font-semibold text-sm'>Download</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <View className='flex flex-col flex-wrap justify-between gap-2 py-2 px-4'>
                        {asset?.third_party_certificate && asset?.third_party_certificate.length > 0 && (
                            <View className='flex flex-row justify-between gap-2 w-full'>
                                <View>
                                    <Text>
                                        Start Date:{" "}
                                        {asset?.third_party_certificate[0]?.third_party_start_date.split("T")[0]}
                                    </Text>
                                </View>
                                <View className='items-end'>
                                    <Text>
                                        End Date:{" "}
                                        {asset?.third_party_certificate[0]?.third_party_expiry_date.split("T")[0]}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View className='w-full'>
                            <TouchableOpacity
                                className='bg-white border border-gray-400 rounded-lg p-2'
                                onPress={() => openUploadModal("third_party")}>
                                <Text className='text-blue-700 text-lg text-center'>
                                    {third_party_file ? "Change Certificate" : "Upload New Certificate"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {third_party_file && (
                            <View className='flex-col gap-2'>
                                <Text>New Uploaded Certificate:</Text>
                                <Text className='text-blue-700'>{third_party_file.name}</Text>
                            </View>
                        )}
                    </View>
                </View>
                {third_party_file && (
                    <>
                        <View className='flex-col gap-2'>
                            <Text className='text-[16px]'>Start Date: </Text>
                            <NativeDatePickerInput
                                value={start_date}
                                onChange={(date: Date) => {
                                    setStartDate(date);
                                    claculateExpiry();
                                }}
                                maximumDate={new Date()}
                            />
                        </View>

                        <View>
                            <NativeDropdown
                                data={customDropdownOptions}
                                onChange={(item) => handleSelection(item)}
                                value={frequency}
                                placeholder='Select the Frequency'
                            />
                        </View>

                        {start_date && frequency && (
                            <View className='flex-col gap-2'>
                                <Text className='text-[16px]'>Expiry Date: </Text>
                                {frequency === "custom" ? (
                                    <NativeDatePickerInput
                                        value={end_date}
                                        onChange={setEndDate}
                                        minimumDate={start_date}
                                    />
                                ) : (
                                    <>
                                        <View className='flex-row items-center bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 gap-3 opacity-70'>
                                            <Text className='flex-1 text-[15px] tracking-wide'>
                                                {end_date
                                                    ? end_date.toLocaleDateString("en-GB") // dd/mm/yyyy
                                                    : "--"}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                    </>
                )}
            </View>

            <View className='flex-col gap-2'>
                <TouchableOpacity
                    className='bg-[#263f94] rounded-xl px-3 py-2 active:opacity-80 w-full'
                    onPress={handleSave}>
                    <Text className='text-white text-center font-semibold text-[16px]'>Save Changes</Text>
                </TouchableOpacity>
            </View>

            <View className='flex-col gap-2'>
                <TouchableOpacity
                    className={`${
                        asset?.tag?.id ? "bg-red-600" : "bg-green-600"
                    } rounded-xl px-3 py-2 active:opacity-80 w-full`}
                    onPress={() => {
                        {
                            asset?.tag?.id ? openUnassignModal() : openAssignModal();
                        }
                    }}>
                    <Text className='text-white text-center font-semibold text-[16px]'>
                        {asset?.tag?.id ? "Unassign Tag" : "Assign Tag"}
                    </Text>
                </TouchableOpacity>
            </View>

            {update_loading && (
                <View className='absolute inset-0 bg-black/40 flex items-center justify-center z-50'>
                    <ActivityIndicator size='large' color='#fff' />
                    <Text className='text-white mt-3 font-semibold'>Updating asset...</Text>
                </View>
            )}
        </View>
    );
};

export default AssetEdit;
