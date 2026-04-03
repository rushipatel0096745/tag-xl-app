import { Stack } from "expo-router";

export default function AssetStack() {
    return (
        <Stack
            screenOptions={{
                headerTitleAlign: "center",
            }}>
            <Stack.Screen name='index' options={{ title: "Home" }} />
            <Stack.Screen name='asset-list' options={{ title: "Asset List" }} />
            <Stack.Screen name='[id]' options={{ title: "Asset Details" }} />
            <Stack.Screen name='asset-add' options={{ title: "Asset Add" }} />
        </Stack>
    );
}
