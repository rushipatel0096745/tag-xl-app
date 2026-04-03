import { Tabs } from "expo-router";
import { Home, User } from "lucide-react-native";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: true }}>
            <Tabs.Screen
                name='index'
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
                name='asset'
                options={{
                    href: null,
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
