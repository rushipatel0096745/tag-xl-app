import { CreateAsset } from "@/services/asset";
import { router, useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";

const AddAsset = () => {
    const navigation = useNavigation();

    const INITIAL_STATE = {
        tag_type: "Manual",
        uid: "",
        tag_id: "",
        name: "",
        location_id: "",
        batch_code: "",
        // image: null as null | File,
        image: "" as any | null,
        manual_template_id: "",
        status: null,
        // oem_certificate: null as null | File,
        oem_certificate: "" as any | null,
        // third_party_certificate: null as null | File,
        third_party_certificate: "" as any,
        third_party_start_date: "",
        third_party_expiry_date: "",
        pre_use_template_id: "",
        maintenance_template_id: "",
        asset_pre_use_questions: "",
        asset_maintenance_questions: "",
    };

    const [formData, setFormData] = useState(INITIAL_STATE);
    const [currentStep, setCurrentStep] = useState(1);

    // useEffect(() => {
    //     navigation.setOptions({
    //         headerLeft: () => (
    //             <TouchableOpacity onPress={() => router.replace("/(app)/(tabs)/home")}>
    //                 <ChevronLeft size={24} color='#000' />
    //             </TouchableOpacity>
    //         ),
    //     });
    // }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            setFormData(INITIAL_STATE);
            setCurrentStep(1);
        }, [])
    );

    const [errors, setErrors] = useState<any>({});

    const [formError, setFormError] = useState("");

    const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
    const ALLOWED_THIRD_PARTY_TYPES = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];
    const MAX_FILE_SIZE_MB = 5;

    const updateForm = function (name: string, value: any) {
        if ((name === "oem_certificate" || name === "third_party_certificate") && value) {
            if (!ALLOWED_THIRD_PARTY_TYPES.includes(value.type)) {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "Only PNG, JPG, or JPEG images and PDFs are allowed",
                }));
                return;
            }
        }

        if (name === "image" && value) {
            if (!ALLOWED_IMAGE_TYPES.includes(value.type)) {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "Only PNG, JPG, or JPEG images are allowed",
                }));
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev: any) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = function () {
        const newErrors: any = {};

        if (currentStep === 1) {
            // if (!formData.tag_id) newErrors.tag_id = "Tag id is required";
            if (!formData.tag_type) newErrors.tag_type = "Select the Tag Type is required";
            if (!formData.uid) newErrors.uid = "Tag uid is required";
        }

        if (currentStep === 2) {
            if (!formData.name) newErrors.name = "Name is required";
            if (!formData.location_id) newErrors.location_id = "Location is required";
            if (!formData.batch_code) newErrors.batch_code = "Batch code is required";
            if (formData.image && formData.image instanceof File) {
                if (!ALLOWED_IMAGE_TYPES.includes(formData.image.type)) {
                    newErrors.image = "Only PNG, JPG, or JPEG images are allowed";
                } else if (formData.image.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                    newErrors.image = `Upload File Less than ${MAX_FILE_SIZE_MB}MB`;
                }
            }
        }

        if (currentStep === 3) {
            if (!formData.oem_certificate) {
                newErrors.oem_certificate = "OEM Certificate is required";
            } else {
                if (!ALLOWED_THIRD_PARTY_TYPES.includes(formData.oem_certificate.type)) {
                    newErrors.oem_certificate = "Only PNG, JPG, or JPEG images and PDFs are allowed";
                }
            }

            if (formData.third_party_certificate) {
                if (!ALLOWED_THIRD_PARTY_TYPES.includes(formData.third_party_certificate.type)) {
                    newErrors.third_party_certificate = "Only PNG, JPG, or JPEG images and PDFs are allowed";
                }

                if (!formData.third_party_start_date) {
                    newErrors.third_party_start_date = "Third party start date required";
                }

                if (!formData.third_party_expiry_date) {
                    newErrors.third_party_expiry_date = "Third party expiry date required";
                }

                if (
                    formData.third_party_start_date &&
                    formData.third_party_expiry_date &&
                    new Date(formData.third_party_expiry_date) < new Date(formData.third_party_start_date)
                ) {
                    newErrors.third_party_expiry_date = "Expiry must be after start date";
                }
            }

            if (
                (formData.third_party_start_date || formData.third_party_expiry_date) &&
                !formData.third_party_certificate
            ) {
                newErrors.third_party_certificate = "Third party certificate is required";
            }
        }

        if (currentStep === 4) {
            if (!formData.pre_use_template_id) newErrors.pre_use_template_id = "Select the pre use template";
            if (!formData.maintenance_template_id)
                newErrors.maintenance_template_id = "Select the maintenance template";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const prevStep = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const handleSave = async function () {
        const data = formData;
        console.log(data);
        const assetFormData = new FormData();
        assetFormData.append("tag_id", formData.tag_id);
        assetFormData.append("name", formData.name);
        assetFormData.append("location_id", formData.location_id);
        assetFormData.append("batch_code", formData.batch_code);
        formData.image && assetFormData.append("image", formData.image);
        formData.manual_template_id && assetFormData.append("manual_template_id", formData.manual_template_id);
        assetFormData.append("status", String(Number(formData.status) || 0));
        assetFormData.append("oem_certificate", formData.oem_certificate);
        if (formData.third_party_certificate) {
            assetFormData.append("third_party_certificate", formData.third_party_certificate);
            assetFormData.append("third_party_start_date", formData.third_party_start_date);
            assetFormData.append("third_party_expiry_date", formData.third_party_expiry_date);
        }
        assetFormData.append("pre_use_template_id", formData.pre_use_template_id);
        assetFormData.append("maintenance_template_id", formData.maintenance_template_id);
        formData.asset_pre_use_questions &&
            assetFormData.append("asset_pre_use_questions", formData.asset_pre_use_questions);
        formData.asset_maintenance_questions &&
            assetFormData.append("asset_maintenance_questions", formData.asset_maintenance_questions);
        // Note: React Native's FormData doesn't support .entries() or .get()
        // Use the original data for logging/debugging
        console.log("Saving Asset Data:", formData);
        const result = await CreateAsset(assetFormData);
        console.log("response for create asset: ", result);
        if (!result?.has_error) {
            Alert.alert("Asset", `Asset ${formData.name} is created`, [
                {
                    text: "Ok",
                    onPress: () => router.replace("/(app)/(tabs)/home/asset/asset-list"),
                },
            ]);
            return;
        }
        if (result?.has_error) {
            setFormError(result?.message);
        }
    };

    return (
        <View className='flex-1'>
            {currentStep === 1 && (
                <Step1
                    next={nextStep}
                    updateForm={updateForm}
                    validate={validate}
                    errors={errors}
                    formData={formData}
                />
            )}

            {currentStep === 2 && (
                <Step2
                    prev={prevStep}
                    next={nextStep}
                    updateForm={updateForm}
                    validate={validate}
                    errors={errors}
                    formData={formData}
                />
            )}
            {currentStep === 3 && (
                <Step3
                    prev={prevStep}
                    next={nextStep}
                    updateForm={updateForm}
                    validate={validate}
                    errors={errors}
                    formData={formData}
                />
            )}

            {currentStep === 4 && (
                <Step4
                    prev={prevStep}
                    next={nextStep}
                    updateForm={updateForm}
                    validate={validate}
                    errors={errors}
                    formData={formData}
                    handleSubmit={handleSave}
                    formError={formError}
                />
            )}
        </View>
    );
};

export default AddAsset;
