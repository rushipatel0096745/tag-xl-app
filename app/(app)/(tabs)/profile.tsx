import { useAuth } from "@/context/AuthContext";
import { Link } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
    const { logOut } = useAuth();
    return (
        <View>
            <Text>Profile</Text>
            <TouchableOpacity className='bg-blue-600 rounded-xl p-2 mt-6 active:opacity-80' onPress={logOut}>
                <Text className='text-white text-center font-semibold text-lg'>Logout</Text>
            </TouchableOpacity>

            <Link href={"/(app)/(tabs)/asset/asset-list"}>
                <Text>Go to asset</Text>
            </Link>
        </View>
    );
};

export default Profile;
