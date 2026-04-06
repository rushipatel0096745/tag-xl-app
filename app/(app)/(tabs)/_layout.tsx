// app/(app)/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import { Home, User } from "lucide-react-native";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: true }}>
            <Tabs.Screen
                name='home/index'
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <Home color={color} />,
                    headerTitle: "Dashboard",
                    headerTitleAlign: "center",
                }}
            />

            <Tabs.Screen
                name='profile'
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => <User color={color} />,
                }}
            />

            <Tabs.Screen
                name='home/asset'
                options={{
                    href: null,
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
