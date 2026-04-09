// components/ui/AppScreen.tsx

import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
    children: React.ReactNode;
    scroll?: boolean;
    gestureSafe?: boolean;
    loading?: boolean;
};

export default function AppScreen({ children, scroll = false, loading = false }: Props) {
    // if (!scroll) {
    //     return <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>;
    // }

    // return (
    //     <SafeAreaView style={{ flex: 1 }}>
    //         <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{children}</ScrollView>
    //     </SafeAreaView>
    // );

    return (
        <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
            {scroll ? <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{children}</ScrollView> : children}

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
