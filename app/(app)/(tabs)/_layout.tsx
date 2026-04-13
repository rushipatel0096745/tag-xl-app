// app/(app)/(tabs)/_layout.tsx

import AppBottomSheet from "@/components/AppBottomSheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { Tabs } from "expo-router";
import { Home, Search, User } from "lucide-react-native";
import { useRef } from "react";

export default function TabsLayout() {
    // const [openSheet, setOpenSheet] = useState(false);
    const sheetRef = useRef<BottomSheet>(null);
    const isOpenRef = useRef(false);

    const toggleSheet = () => {
        if (isOpenRef.current) {
            sheetRef.current?.close();
        } else {
            sheetRef.current?.expand();
        }
        isOpenRef.current = !isOpenRef.current;
    };

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: true,
                    tabBarStyle: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        overflow: "hidden",
                        position: "absolute",
                        paddingTop: 10,
                    },
                }}>
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
                    name='search-asset/index'
                    options={{
                        title: "Search",
                        tabBarIcon: ({ color }) => <Search color={color} />,
                        headerTitle: "Search Asset",
                        headerTitleAlign: "center",
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
                

                {/* <Tabs.Screen
                name='modal-trigger'
                options={{
                    title: "Modal",
                    tabBarButton: (props) => (
                        <TouchableOpacity {...(props as any)} onPress={() => router.push("/modal")}>
                            {props.children}
                        </TouchableOpacity>
                    ),
                }}
            /> */}

                {/* <Tabs.Screen
                    name='my-modal'
                    options={{
                        tabBarButton: () => (
                            <TouchableOpacity onPress={() => router.push("/(app)/(tabs)/my-modal")}>
                                <Text>Open Modal</Text>
                            </TouchableOpacity>
                        ),
                    }}
                /> */}
                {/* <Tabs.Screen
                    name='modal-trigger'
                    options={{
                        title: "Modal",
                        tabBarButton: () => (
                            <TouchableOpacity
                                onPress={toggleSheet}
                                style={{
                                    top: -30,
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30,
                                    backgroundColor: "#2563eb",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    elevation: 5,
                                }}>
                                <Plus size={28} color='white' />
                            </TouchableOpacity>
                        ),
                    }}
                /> */}

                <Tabs.Screen
                    name='profile'
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ color }) => <User color={color} />,
                    }}
                />

                <Tabs.Screen
                    name='my-modal'
                    options={{
                        href: null,
                        headerShown: false,
                    }}
                />

                <Tabs.Screen
                    name='modal-trigger'
                    options={{
                        href: null,
                        headerShown: false,
                    }}
                />

                <Tabs.Screen
                    name='home/asset'
                    options={{
                        href: null,
                        headerShown: false,
                    }}
                />

                <Tabs.Screen
                    name='home/alerts'
                    options={{
                        href: null,
                        headerShown: false,
                    }}
                />
            </Tabs>
            <AppBottomSheet ref={sheetRef} />
        </>
    );
}
