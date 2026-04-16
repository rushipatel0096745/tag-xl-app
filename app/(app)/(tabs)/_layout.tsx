import SearchAsset from "@/components/search/SearchAsset";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs, useGlobalSearchParams, useRouter } from "expo-router";
import { Home, Search, User } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type TabType = "nfc" | "scan" | "manual";

export default function TabsLayout() {
    const params = useGlobalSearchParams();
    const router = useRouter();

    const insets = useSafeAreaInsets();
    const TAB_BAR_HEIGHT = 60 + insets.bottom;
    const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

    const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [sheetConfig, setSheetConfig] = useState({
        initialTab: "manual" as TabType,
        allowedTabs: ["nfc", "scan", "manual"] as TabType[],
        sheetMode: "DEFAULT" as "ADD_ASSET" | "EDIT_ASSET" | "DEFAULT",
    });

    useEffect(() => {
        if (params.sheetOpen) {
            openSheet({
                initialTab: params.sheetOpen as "nfc" | "scan" | "manual",
                allowedTabs: [params.sheetAllowed as any],
                sheetMode: (params.sheetMode as "ADD_ASSET" | "EDIT_ASSET" | "DEFAULT") || "DEFAULT",
            });

            router.setParams({
                sheetOpen: undefined,
                sheetAllowed: undefined,
                sheetMode: undefined,
            });
        }
    }, [params.sheetOpen]);

    // const openSheet = () => {
    //     if (isOpen) {
    //         closeSheet();
    //         return;
    //     }
    //     setMounted(true);
    //     setIsOpen(true);
    //     Animated.spring(slideAnim, {
    //         toValue: 0,
    //         useNativeDriver: true,
    //         damping: 20,
    //         stiffness: 150,
    //     }).start();
    // };

    const openSheet = (config?: {
        initialTab?: TabType;
        allowedTabs?: TabType[];
        sheetMode?: "ADD_ASSET" | "EDIT_ASSET" | "DEFAULT";
    }) => {
        if (isOpen) {
            closeSheet();
            return;
        }

        if (config) {
            setSheetConfig({
                initialTab: config.initialTab ?? "manual",
                allowedTabs: config.allowedTabs ?? ["nfc", "scan", "manual"],
                sheetMode: config.sheetMode ?? "DEFAULT",
            });
        }

        setMounted(true);
        setIsOpen(true);

        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 150,
        }).start();
    };

    const closeSheet = () => {
        Animated.timing(slideAnim, {
            toValue: SHEET_HEIGHT,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsOpen(false);
            setMounted(false);
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <Tabs
                tabBar={(props) => (
                    <View pointerEvents='box-none'>
                        {isOpen && (
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={closeSheet}
                                style={{
                                    position: "absolute",
                                    bottom: TAB_BAR_HEIGHT,
                                    left: 0,
                                    right: 0,
                                    height: SCREEN_HEIGHT,
                                    backgroundColor: "rgba(0,0,0,0.4)",
                                }}
                            />
                        )}
                        {mounted && (
                            <View
                                style={{
                                    position: "absolute",
                                    bottom: TAB_BAR_HEIGHT,
                                    left: 0,
                                    right: 0,
                                    height: SCREEN_HEIGHT,
                                }}
                                pointerEvents='box-none'>
                                <Animated.View
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        bottom: -100,
                                        height: SHEET_HEIGHT + 100,
                                        paddingBottom: 100,
                                        transform: [{ translateY: slideAnim }],
                                        backgroundColor: "#fff",
                                        borderTopLeftRadius: 20,
                                        borderTopRightRadius: 20,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: -4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 12,
                                        elevation: 10,
                                        paddingVertical: 12,
                                    }}>
                                    <SearchAsset
                                        onClose={closeSheet}
                                        initialTab={sheetConfig.initialTab}
                                        allowedTabs={sheetConfig.allowedTabs}
                                        sheetMode={sheetConfig.sheetMode}
                                    />
                                </Animated.View>
                            </View>
                        )}
                        <BottomTabBar {...props} />
                    </View>
                )}
                screenOptions={{
                    headerShown: true,
                    tabBarStyle: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        // borderColor: "black",
                        overflow: "hidden",
                        paddingTop: 10,
                        paddingBottom: 8,
                        height: TAB_BAR_HEIGHT,
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
                        tabBarIcon: ({ color }) => <Ionicons name="wifi" size={24} color={"#263f94"} />,
                        tabBarButton: (props) => (
                            <TouchableOpacity {...(props as any)} onPress={openSheet} style={props.style} />
                        ),
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
        </View>
    );
}

//  <Tabs.Screen
//                 name='search-asset/index'
//                 options={{
//                     title: "Search",
//                     tabBarIcon: ({ color }) => <Search color={isOpen ? "#263f94" : color} />,

//                     tabBarButton: (props) => (
//                         <TouchableOpacity
//                             {...(props as any)}
//                             onPress={openSheet}
//                             style={{
//                                 justifyContent: "center",
//                                 alignItems: "center",
//                             }}>
//                             <View
//                                 style={{
//                                     width: 65,
//                                     height: 65,
//                                     borderRadius: 25,
//                                     backgroundColor: "#263f94",
//                                     justifyContent: "center",
//                                     alignItems: "center",
//                                     shadowColor: "#000",
//                                     shadowOffset: { width: 0, height: 3 },
//                                     shadowOpacity: 0.3,
//                                     shadowRadius: 4,
//                                 }}>
//                                 {/* <Wifi color='white' size={26} /> */}
//                                 <Ionicons name='wifi' size={26} color='white' />
//                             </View>
//                         </TouchableOpacity>
//                     ),
//                 }}
//             />
