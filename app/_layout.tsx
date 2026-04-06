// app/_layout.tsx

import { AuthProvider } from "@/context/AuthContext";
import "@/global.css";
import { Slot } from "expo-router";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    );
}
