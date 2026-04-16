// app/_layout.tsx

import { AuthProvider } from "@/context/AuthContext";
import "@/global.css";
import { Slot } from "expo-router";
import { Text, TextInput } from "react-native";

if ((Text as any).defaultProps == null) {
  (Text as any).defaultProps = {};
}
(Text as any).defaultProps.allowFontScaling = false;

if ((TextInput as any).defaultProps == null) {
  (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.allowFontScaling = false;

export default function RootLayout() {
    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    );  
}   
