import { useAuth } from "@/context/AuthContext";
import { clientFetch } from "@/lib/utils";
import { LoginFormData } from "@/types/Auth";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        companyId: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>();
    const [loading, setLoading] = useState(false);

    const { sessionId, companyId, logIn, logOut, user, isLoading } = useAuth();

    const validate = function () {
        const newErrors = {} as Record<string, string>;
        if (!formData?.email) newErrors.email = "Email is required";
        if (!formData?.password) newErrors.password = "Company Id is required";
        if (!formData?.companyId) newErrors.companyId = "Password is required";

        setErrors(newErrors);
        return Object.entries(newErrors).length === 0;
    };

    const Login = async function () {
        setLoading(true);
        if (!validate()) return;
        // console.log("logges in");
        const result = await clientFetch("/company/company-login", {
            method: "POST",
            headers: {
                "X-Company-ID": formData.companyId,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
        });

        if (!result.has_error) {
            console.log("Log in response: ", result);
            await logIn(result?.company_id, result?.sid, result?.user);
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className='flex-1 bg-gray-100 justify-center items-center px-6'>
            <View className='bg-white p-6 rounded-2xl shadow-md'> 
                <View className='mb-8'>
                    <Text className='text-gray-600 text-2xl text-center'>Sign in to continue</Text>
                </View>

                <View className='space-y-4 flex flex-col justify-center gap-2'>
                    <TextInput
                        className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                        placeholder='Email'
                        value={formData?.email}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                        placeholderTextColor='#9CA3AF'
                    />
                    {errors?.email && <Text className='text-red-500'>{errors.email}</Text>}

                    <View className='relative'>
                        <TextInput
                            className='border border-gray-200 rounded-xl p-4 pr-12 bg-gray-50 text-gray-800'
                            placeholder='Password'
                            value={formData?.password}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
                            placeholderTextColor='#9CA3AF'
                            secureTextEntry={!showPassword}
                        />

                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className='absolute right-4 top-4'>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color='#6B7280' />
                        </TouchableOpacity>
                        {errors?.password && <Text className='text-red-500'>{errors.password}</Text>}
                    </View>
                    <TextInput
                        className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800'
                        placeholder='Company Id'
                        value={formData?.companyId}
                        onChangeText={(text) => setFormData((prev) => ({ ...prev, companyId: text }))}
                        inputMode='numeric'
                        keyboardType='numeric'
                        placeholderTextColor='#9CA3AF'
                    />
                    {errors?.companyId && <Text className='text-red-500'>{errors.companyId}</Text>}
                </View>

                <View className='relative'>
                    <TouchableOpacity className='bg-blue-600 rounded-xl p-2 mt-6 active:opacity-80' onPress={Login}>
                        <Text className='text-white text-center font-semibold text-lg'>Login</Text>
                    </TouchableOpacity>

                    {loading && <ActivityIndicator className='absolute right-10 top-9' color={'#fff'}/>}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SignIn;
