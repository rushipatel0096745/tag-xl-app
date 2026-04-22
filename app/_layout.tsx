// app/_layout.tsx

import { AuthProvider } from "@/context/AuthContext";
import "@/global.css";
import { registerForPushNotificationsAsync } from "@/lib/notification";
import * as Notifications from "expo-notifications";
import { router, Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, Text, TextInput } from "react-native";

if ((Text as any).defaultProps == null) {
    (Text as any).defaultProps = {};
}
(Text as any).defaultProps.allowFontScaling = false;

if ((TextInput as any).defaultProps == null) {
    (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.allowFontScaling = false;

export default function RootLayout() {
    // useEffect(() => {
    //     // Register push
    //     registerForPushNotificationsAsync().then((token) => {
    //         if (token) {
    //             console.log("TOKEN:", token);
    //             // TODO: send to backend
    //         }
    //     });

    //     const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    //         console.log("Notification received:", notification);
    //     });

    //     const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    //         console.log("Notification clicked:", response);
    //     });

    //     return () => {
    //         receivedListener.remove();
    //         responseListener.remove();
    //     };
    // }, []);

    useEffect(() => {
        let responseListener: any;

        async function setupNotifications() {
            const token = await registerForPushNotificationsAsync();

            if (token) {
                console.log("TOKEN:", token);

                // Send to backend
                // await api.savePushToken(token);
            }
        }

        setupNotifications();

        //  When notification received (foreground)
        const receiveListener = Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
        });

        // When user taps notification
        responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification tapped:", response);

            const data = response.notification.request.content.data;

            // Handle navigation here
            if (data?.assetId) {
                console.log("Navigate to asset:", data.assetId);
                router.push(`/(app)/(tabs)/home/asset/${data.assetId}`);
            }
        });

        return () => {
            receiveListener.remove();
            responseListener?.remove();
        };
    }, []);

    return (
        <AuthProvider>
            {/* <NetworkProvider> */}
            <StatusBar style='dark' translucent={Platform.OS === "ios"} backgroundColor='transparent' />
            <Slot />
            {/* </NetworkProvider> */}
        </AuthProvider>
    );
}
