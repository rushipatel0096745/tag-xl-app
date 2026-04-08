// components/ui/AppScreen.tsx

import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
    children: React.ReactNode;
    scroll?: boolean;
    gestureSafe?: boolean;
};

export default function AppScreen({ children, scroll = false }: Props) {
    if (!scroll) {
        return <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 10}}>{children}</ScrollView>
        </SafeAreaView>
    );
}
