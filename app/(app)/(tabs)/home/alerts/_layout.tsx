import { Stack } from "expo-router";

export default function AlertsLayout() {
    return (
        <Stack
            screenOptions={{
                headerTitleAlign: "center",
            }}>
            <Stack.Screen name='alert-list' options={{ title: "Alerts" }} />
            <Stack.Screen name='[id]' options={{ title: "Alert" }} />
        </Stack>
    );
}
