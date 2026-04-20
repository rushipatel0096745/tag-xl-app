import { useAuth } from "@/context/AuthContext";
import { validateFileSize } from "@/lib/utils";
import { GetAsset, PreUseAnswers } from "@/services/asset";
import { AssetDetail, Question } from "@/types/Aseet";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
// import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { CameraIcon, FileText, FolderOpen, ImageIcon, Upload, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import NativeDropdown from "../common/NativeDropdown";

type Answer = {
    questionId: number;
    answer: string | string[];
};

type UploadedFile = {
    uri: string;
    name: string;
    type: "image" | "file";
    mimeType?: string;
} | null;

const PreUseCheck = () => {
    const { asset_id } = useLocalSearchParams();

    const { user, logOut } = useAuth();

    const [asset, setAsset] = useState<AssetDetail | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [answers, setAnswers] = useState<Answer[]>([]);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile>(null);

    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

    async function fetchAsset() {
        try {
            const result = await GetAsset(Number(asset_id));

            if (result.has_error && result.error_code === "PERMISSION_DENIED") {
                setErrors({ permission: result.message });
            }

            if (!result.has_error) {
                // console.log(result.asset);
                setAsset(result?.asset);
            }

            if (result.has_error && result.message === "Invalid or expired session") {
                Alert.alert("Session Over", "", [
                    {
                        text: "OK",
                        onPress: () => {
                            logOut();
                            router.push("/(auth)/sign-in");
                        },
                    },
                ]);
                return;
            }

            const asset = result?.asset as AssetDetail;
            let preUseQuestions = asset?.pre_use_template?.questions || [];
            if (asset?.asset_pre_use_questions) {
                preUseQuestions.push(...asset.asset_pre_use_questions);
            }
            setQuestions(preUseQuestions);

            if (preUseQuestions.length > 0) {
                setActiveQuestionId(preUseQuestions[0].id);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
        }
    }

    useEffect(() => {
        fetchAsset();
    }, []);

    useEffect(() => {
        console.log("answers: ", JSON.stringify(answers, null, 2));
        console.log("uploadedFile: ", JSON.stringify(uploadedFile, null, 2));
    }, [answers, uploadedFile]);

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

    const handleTakePhoto = async () => {
        setIsUploadModalOpen(false);
        const granted = await Camera.requestCameraPermissionsAsync();
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
                uri: result.assets[0].uri,
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
    };

    const removeFile = () => {
        setUploadedFile(null);
    };

    function updateAnswer(questionId: number, value: string, type: string) {
        setAnswers((prev) => {
            const existing = prev.find((a) => a.questionId === questionId);

            if (type === "checkbox") {
                if (existing) {
                    const current = (existing.answer as string[]) || [];

                    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];

                    return prev.map((a) => (a.questionId === questionId ? { ...a, answer: updated } : a));
                } else {
                    return [...prev, { questionId, answer: [value] }];
                }
            }

            if (existing) {
                return prev.map((a) => (a.questionId === questionId ? { ...a, answer: value } : a));
            } else {
                return [...prev, { questionId, answer: value }];
            }
        });
    }

    const activeQuestion = questions.find((q) => q.id === activeQuestionId);
    const selectedAnswer = answers.find((a) => a.questionId === activeQuestionId)?.answer;

    const isAnswered = (questionId: number) => {
        const ans = answers.find((a) => a.questionId === questionId)?.answer;

        if (Array.isArray(ans)) return ans.length > 0;
        return !!ans && ans !== "";
    };

    const currentIndex = questions.findIndex((q) => q.id === activeQuestionId);

    const canGoNext = activeQuestionId !== null && isAnswered(activeQuestionId);

    const canGoBack = currentIndex > 0;

    function convertToOptions(multiple_options: Record<string, string>) {
        return Object.entries(multiple_options).map(([value, label]) => ({ value, label }));
    }

    function handleBack() {
        const prev = questions[currentIndex - 1];
        if (prev) setActiveQuestionId(prev.id);
    }

    function handleNext() {
        const next = questions[currentIndex + 1];
        if (next) setActiveQuestionId(next.id);
        if (!next) {
            handleSubmit();
        }
    }

    async function handleSubmit() {
        const answerData = answers.map((a) => {
            const question = questions.find((q) => q.id === a.questionId);
            return {
                question: question?.question,
                answer: a.answer,
            };
        });

        const fitForUse = answerData.find((item) => item.question === "Fit for use?");
        const remarks = answerData.find((item) => item.question === "Remarks?");

        if (fitForUse?.answer === "No" && !uploadedFile) {
            Alert.alert("Image Required", "Please upload an Image");
            return;
        }

        const otherAnswers = answerData.filter(
            (item) => item.question !== "Fit for use?" && item.question !== "Remarks?"
        );

        const formData = new FormData();
        formData.append("asset_id", String(asset?.id));
        formData.append("pre_use_template_id", String(asset?.pre_use_template?.id));
        formData.append("user_id", String(user?.id));
        formData.append("answers", JSON.stringify(otherAnswers));
        formData.append("fit_for_use", fitForUse?.answer as string);
        formData.append("remarks", remarks?.answer as string);
        if (uploadedFile) {
            formData.append("image", {
                uri: uploadedFile.uri,
                name: uploadedFile.name,
                type: uploadedFile.mimeType ?? "application/octet-stream",
            } as any);
        }

        // console.log("submitted answers: ", JSON.stringify([...formData.entries()], null, 3));

        const result = await PreUseAnswers(formData);

        if (result.has_error && result.error_code === "PERMISSION_DENIED") {
            Alert.alert("Permission Denied", result.message);
        }

        if (result.has_error) {
            Alert.alert("Error", result.message);
        }

        if (!result.has_error) {
            Alert.alert("Pre Use Check", "Pre-use check submitted successfully", [
                {
                    text: "OK",
                    onPress: () => {
                        router.push({
                            pathname: "/(app)/(tabs)/search-asset/asset-detail",
                            params: { uid: asset?.tag?.uid },
                        });
                    },
                },
            ]);
        }
    }

    return (
        <View className='p-3 bg-white'>
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

            {errors.permission && <Text className='text-red-500'>{errors.permission}</Text>}
            {/* <Text className='text-xl font-bold'>{asset?.name}</Text> */}
            <View>
                <View className='question-bar flex-row gap-2 my-4 border rounded-2xl border-gray-300 p-2'>
                    {questions.map((question, index) => {
                        const isActive = question.id === activeQuestionId;
                        return (
                            <TouchableOpacity
                                key={question.id}
                                onPress={() => {
                                    const clickedIndex = index;

                                    if (isAnswered(question.id) || clickedIndex === currentIndex) {
                                        setActiveQuestionId(question.id);
                                    }
                                }}
                                className={`question-item flex-1 items-center p-3 rounded-xl border 
                                            ${isActive ? "bg-[#263f94] border-blue-500" : "bg-white border-gray-200"}`}>
                                <Text className={`${isActive ? "text-white" : "text-black"}`}>{index + 1}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {activeQuestion && (
                    <View className='gap-4 p-2'>
                        <Text className='text-lg font-semibold mb-2'>{activeQuestion.question}</Text>
                    </View>
                )}

                {activeQuestion?.type === "boolean" && (
                    <View className='gap-4 p-2'>
                        {["Yes", "No"].map((opt, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.container}
                                onPress={() => {
                                    updateAnswer(activeQuestion.id, opt, "boolean");

                                    if (activeQuestion?.question === "Fit for use?" && opt === "No") {
                                        return;
                                    }

                                    setTimeout(() => {
                                        const next = questions[currentIndex + 1];
                                        if (next) setActiveQuestionId(next.id);
                                    }, 200);
                                }}>
                                <View style={[styles.outerCircle, selectedAnswer === opt && styles.selectedOuter]}>
                                    {selectedAnswer === opt && <Ionicons name='checkmark' size={14} color='#fff' />}
                                </View>
                                <Text className='text-lg'>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {activeQuestion?.type === "text" && (
                    <View className='gap-4 p-2'>
                        <TextInput
                            className='border rounded-lg border-gray-400 bg-white p-2 text-lg'
                            placeholder='Type your answer here'
                            value={(selectedAnswer as string) || ""}
                            onChangeText={(val) => updateAnswer(activeQuestion.id, val, "text")}
                        />
                    </View>
                )}

                {activeQuestion?.type === "select" && (
                    <View className='gap-4 p-2'>
                        <NativeDropdown
                            data={convertToOptions(activeQuestion.multiselect_value as Record<string, string>)}
                            onChange={(text) => updateAnswer(activeQuestion.id, text, "select")}
                            value={(selectedAnswer as string) || ""}
                            placeholder='Select the Options'
                        />
                    </View>
                )}

                {activeQuestion?.type === "checkbox" && (
                    <View className='gap-4 p-2'>
                        {convertToOptions(activeQuestion.multiselect_value as Record<string, string>).map((option) => {
                            const selectedValues = (selectedAnswer as string[]) || [];
                            const isSelected = selectedValues.includes(option.value);

                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => updateAnswer(activeQuestion.id, option.value, "checkbox")}
                                    style={styles.container}>
                                    <View style={[styles.outerCircle, isSelected && styles.selectedOuter]}>
                                        {isSelected && <Ionicons name='checkmark' size={14} color='#fff' />}
                                    </View>

                                    <Text className='text-lg'>{option.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>

            {answers.find((a) => a.questionId === questions.find((q) => q.question === "Fit for use?")?.id)?.answer ===
                "No" && (
                <>
                    {uploadedFile && (
                        <View className='flex-row flex-wrap gap-2 mb-2'>
                            <View className='relative'>
                                {uploadedFile.uri ? (
                                    <Image
                                        source={{ uri: uploadedFile.uri }}
                                        className='w-20 h-20 rounded-xl bg-gray-100'
                                        resizeMethod='resize'
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
                            </View>
                        </View>
                    )}
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
                </>
            )}

            <View className='flex-row gap-3 p-4'>
                <TouchableOpacity
                    disabled={!canGoBack}
                    onPress={handleBack}
                    className={`flex-1 flex-row justify-center items-center py-3 rounded-xl border ${canGoBack ? "border-[#263f94]" : "border-gray-300"}`}>
                    <Text className={`text-sm font-medium ${canGoBack ? "text-[#263f94]" : "text-gray-400"}`}>
                        Back
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!canGoNext}
                    onPress={handleNext}
                    className={`flex-1 flex-row justify-center items-center py-3 rounded-xl ${canGoNext ? "bg-[#263f94]" : "bg-gray-300"}`}>
                    <Text className='text-white text-sm font-medium'>
                        {currentIndex === questions.length - 1 ? "Submit" : "Next"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PreUseCheck;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    // outerCircle: {
    //     height: 20,
    //     width: 20,
    //     // borderRadius: 10,
    //     borderWidth: 2,
    //     borderColor: "#333",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     marginRight: 8,
    // },
    outerCircle: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#263f94",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },

    selectedOuter: {
        backgroundColor: "#263f94",
    },
    checkIcon: {
        color: "#263f94",
        fontSize: 14,
        fontWeight: "bold",
    },
    innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: "#333",
    },
});
