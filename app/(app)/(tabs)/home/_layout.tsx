// app/(app)/(tabs)/home/_layout.tsx

import { Stack } from "expo-router";

export default function HomeLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitleAlign: "center",
            }}>
            <Stack.Screen
                name='index'
                options={{
                    headerTitle: "Dashboard",
                }}
            />
            <Stack.Screen name='asset' options={{ headerShown: false }} />
            <Stack.Screen name='alerts' options={{ headerShown: false }} />
        </Stack>
    );
}
