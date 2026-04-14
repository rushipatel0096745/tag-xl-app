import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProfileHeaderProps {
    firstname: string;
    lastname: string;
    role?: string;
}

const ProfileHeader = ({ firstname, lastname, role }: ProfileHeaderProps) => {
    const insets = useSafeAreaInsets();
    const initials = `${firstname?.[0] ?? ""}${lastname?.[0] ?? ""}`.toUpperCase();
    const fullName = `${firstname} ${lastname}`;

    return (
        <View className='items-center pb-8 bg-blue-50' style={{ paddingTop: insets.top + 16 }}>
            <View className='w-24 h-24 rounded-full bg-[#263f94] items-center justify-center mb-4'>
                <Text className='text-white text-3xl font-bold'>{initials}</Text>
            </View>

            <Text className='text-2xl font-bold text-gray-900'>{fullName}</Text>

            {role && <Text className='text-base text-gray-500 mt-1'>{role}</Text>}
        </View>
    );
};

export default ProfileHeader;
