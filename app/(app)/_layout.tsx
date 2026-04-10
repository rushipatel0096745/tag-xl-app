// app/(app)/_layout.tsx

import { useAuth } from "@/context/AuthContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
                <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                <Stack.Screen name='maintenance-check' options={{ headerShown: true }} />
                <Stack.Screen name='pre-use-check' options={{ headerShown: true }} />
                {/* <Stack.Screen
                    //name='modal'
                    name="my-modal"
                    options={{
                        presentation: "transparentModal",
                        animation: "slide_from_bottom",
                        headerShown: false,
                    }}
                /> */}
            </Stack>
        </GestureHandlerRootView>
    );
}
