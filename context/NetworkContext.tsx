// NetworkContext.tsx
import NetInfo from "@react-native-community/netinfo";
import React, { createContext, useEffect, useState } from "react";

export const NetworkContext = createContext({ isConnected: true });

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsub = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected ?? false);
        });

        return () => unsub();
    }, []);

    return <NetworkContext.Provider value={{ isConnected }}>{children}</NetworkContext.Provider>;
};
