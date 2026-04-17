// app/(app)/(tabs)/home/asset/_layout.tsx

import { Stack } from "expo-router";

export default function AssetStack() {
    return (
        <Stack
            initialRouteName="asset-list"
            screenOptions={{
                headerTitleAlign: "center",
            }}>
            <Stack.Screen name='asset-list' options={{ title: "Asset List" }} />
            <Stack.Screen name='asset-list-temp' options={{ title: "Asset List" }} />
            <Stack.Screen name='asset-add' options={{ title: "Add Asset" }} />
            <Stack.Screen name='[id]' options={{ title: "Asset Details" }} />
            <Stack.Screen name='asset-edit' options={{ title: "Edit Asset" }} />
        </Stack>
    );
}
