import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Step1 from "./Step1";
import Step2 from "./Step2";

const AddAsset = () => {
    const [formData, setFormData] = useState({
        tag_type: "Manual",
        uid: "",
        tag_id: "",
        name: "",
        location_id: "",
        batch_code: "",
        image: null as null | File,
        manual_template_id: "",
        status: null,
        oem_certificate: null as null | File,
        third_party_certificate: null as null | File,
        third_party_start_date: "",
        third_party_expiry_date: "",
        pre_use_template_id: "",
        maintenance_template_id: "",
        asset_pre_use_questions: "",
        asset_maintenance_questions: "",
    });
    const [currentStep, setCurrentStep] = useState(1);

    const [errors, setErrors] = useState<any>({});

    const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
    const MAX_FILE_SIZE_MB = 5;

    const updateForm = function (name: string, value: any) {
        if ((name === "oem_certificate" || name === "third_party_certificate") && value instanceof File) {
            if (!ALLOWED_IMAGE_TYPES.includes(value.type)) {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: "Only PNG, JPG, or JPEG images are allowed",
                }));
                return;
            }
            if (value.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                setErrors((prev: any) => ({
                    ...prev,
                    [name]: `Upload File Less than ${MAX_FILE_SIZE_MB}MB`,
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
            } else if (formData.oem_certificate instanceof File) {
                if (!ALLOWED_IMAGE_TYPES.includes(formData.oem_certificate.type)) {
                    newErrors.oem_certificate = "Only PNG, JPG, or JPEG images are allowed";
                } else if (formData.oem_certificate.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                    newErrors.oem_certificate = `Upload File Less than ${MAX_FILE_SIZE_MB}MB`;
                }
            }

            if (formData.third_party_certificate) {
                if (formData.third_party_certificate instanceof File) {
                    if (!ALLOWED_IMAGE_TYPES.includes(formData.third_party_certificate.type)) {
                        newErrors.third_party_certificate = "Only PNG, JPG, or JPEG images are allowed";
                    } else if (formData.third_party_certificate.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                        newErrors.third_party_certificate = `Upload File Less than ${MAX_FILE_SIZE_MB}MB`;
                    }
                }
                if (!formData.third_party_start_date)
                    newErrors.third_party_start_date = "Third party start date required";
                if (!formData.third_party_expiry_date)
                    newErrors.third_party_expiry_date = "Third party expiry date required";
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

    return (
        <SafeAreaProvider>
            <SafeAreaView className='flex-1'>
                <View>
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
                    {/*
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
            )} */}
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default AddAsset;
