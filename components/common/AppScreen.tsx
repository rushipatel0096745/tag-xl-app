// components/ui/AppScreen.tsx

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
    children: React.ReactNode;
    scroll?: boolean;
    gestureSafe?: boolean;
    loading?: boolean;
    hasHeader?: boolean;
};

export default function AppScreen({ children, scroll = false, loading = false, hasHeader = false }: Props) {
    const tabBarHeight = useBottomTabBarHeight();

    const edges = hasHeader
        ? ["left", "right", "bottom"]
        : ["top", "left", "right", "bottom"];

    return (
        <SafeAreaView style={{ flex: 1 }} edges={edges as any}>
            {/* <StatusBar style='dark' translucent backgroundColor="transparent" /> */}

            {scroll ? (
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarHeight + 10 }}>
                    {children}
                </ScrollView>
            ) : (
                <View style={{ flex: 1, paddingBottom: 0 }}>{children}</View>
            )}

            {/* GLOBAL OVERLAY */}
            {loading && (
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.4)",
                        zIndex: 999,
                        elevation: 10,
                    }}>
                    <ActivityIndicator size='large' color='#fff' />
                </View>
            )}
        </SafeAreaView>
    );
}
