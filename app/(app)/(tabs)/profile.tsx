import AppScreen from "@/components/common/AppScreen";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
    const { user, logOut } = useAuth();
    return (
        <AppScreen hasHeader>
            <ProfileHeader
                firstname={user?.firstname ?? ""}
                lastname={user?.lastname ?? ""}
                role={user?.role?.role_name}
            />
            <View className='flex-1 p-6 gap-6 bg-white'>
                <View className='gap-2'>
                    <Text className='text-xl font-semibold text-gray-600'>First Name</Text>
                    <Text className='text-2xl font-bold'>{user?.firstname}</Text>
                </View>

                <View className='gap-2'>
                    <Text className='text-xl font-semibold text-gray-600'>Last Name</Text>
                    <Text className='text-2xl font-bold'>{user?.lastname}</Text>
                </View>

                <View className='gap-2'>
                    <Text className='text-xl font-semibold text-gray-600'>Email</Text>
                    <Text className='text-2xl font-bold'>{user?.email}</Text>
                </View>

                <View className='gap-2'>
                    <Text className='text-xl font-semibold text-gray-600'>Designation</Text>
                    <Text className='text-2xl font-bold'>{user?.role.role_name}</Text>
                </View>
                <TouchableOpacity className='bg-orange-600 rounded-3xl p-3 mt-6 active:opacity-80' onPress={logOut}>
                    <Text className='text-white text-center font-bold text-xl'>Logout</Text>
                </TouchableOpacity>
            </View>
        </AppScreen>
    );
};

export default Profile;
