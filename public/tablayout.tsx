// app/(app)/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import { Home, Search, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: true,
                    tabBarStyle: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        overflow: "hidden",
                        // position: "absolute",
                        paddingTop: 10,
                        paddingBottom: 8,
                        height: 60 + insets.bottom,
                    },
                    tabBarItemStyle: {
                        alignItems: "center",
                        justifyContent: "center",
                    },
                }}>
                <Tabs.Screen
                    name='home'
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color }) => <Home color={color} />,
                        headerTitle: "Dashboard",
                        headerTitleAlign: "center",
                        headerShown: false,
                    }}
                />

                <Tabs.Screen
                    name='search-asset/index'
                    options={{
                        title: "Search",
                        tabBarIcon: ({ color }) => <Search color={color} />,
                        headerTitle: "Search Asset",
                        headerTitleAlign: "center",
                        animation: "fade",
                    }}
                />

                <Tabs.Screen
                    name='search-asset/asset-detail'
                    options={{
                        href: null,
                        headerTitle: "Asset Details",
                        headerTitleAlign: "center",
                    }}
                />

                <Tabs.Screen
                    name='profile'
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ color }) => <User color={color} />,
                        headerShown: false,
                    }}
                />
            </Tabs>
        </>
    );
}

// // const sheetRef = useRef<BottomSheet>(null);
// // const toggleSheet = () => {
// //     if (isOpenRef.current) {
// //         sheetRef.current?.close();
// //     } else {
// //         sheetRef.current?.expand();
// //     }
// //     isOpenRef.current = !isOpenRef.current;
// // };

// app/(app)/(tabs)/_layout.tsx
