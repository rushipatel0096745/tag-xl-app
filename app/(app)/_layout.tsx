import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
    const { sessionId, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size='large' />
            </View>
        );
    }

    if (!sessionId) return <Redirect href='/(auth)/sign-in' />;

    return (
        <Stack>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            {/* <Stack.Screen name='(tabs)/asset/asset-list' options={{ headerShown: false }} /> */}
        </Stack>
        // <Slot />
    );
}
