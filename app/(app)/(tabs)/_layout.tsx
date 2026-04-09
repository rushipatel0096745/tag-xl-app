// app/(app)/(tabs)/_layout.tsx

import NfcBottomSheet from "@/components/NfcBottomSheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Tabs } from "expo-router";
import { Home, User } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function TabsLayout() {
    const [openSheet, setOpenSheet] = useState(false);

    return (
        <BottomSheetModalProvider>
            <View className='flex-1'>
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
                        name='nfc-dummy'
                        options={{
                            title: "",
                            tabBarButton: ({ onPress, accessibilityState }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        console.log("OPEN SHEET");
                                        setOpenSheet(true);
                                    }}
                                    activeOpacity={0.8}
                                    style={{
                                        top: -20,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}>
                                    <View
                                        style={{
                                            backgroundColor: "#1e3a8a",
                                            padding: 20,
                                            borderRadius: 40,
                                        }}>
                                        <Text style={{ color: "white" }}>📡</Text>
                                    </View>
                                </TouchableOpacity>
                            ),
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

                    <Tabs.Screen
                        name='home/alerts'
                        options={{
                            href: null,
                            headerShown: false,
                        }}
                    />
                </Tabs>

                <NfcBottomSheet open={openSheet} setOpen={setOpenSheet} />
            </View>
        </BottomSheetModalProvider>
    );
}
