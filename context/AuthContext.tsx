import { User } from "@/types/User";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
    sessionId: string | null;
    user: User | null;
    // getUser: () => User | null | void;
    companyId: string | null;
    isLoading: boolean;
    logIn: (companyId: string, sessionId: string, user: User) => Promise<void>;
    logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [sessionId, companyId, user] = await Promise.all([
                AsyncStorage.getItem("sessionId"),
                AsyncStorage.getItem("companyId"),
                AsyncStorage.getItem("user"),
            ]);

            setSessionId(sessionId);
            setCompanyId(companyId);
            setUser(user ? JSON.parse(user) : null);

            setIsLoading(false);
        };

        loadData();
    }, []);

    const logIn = async (companyId: string, sessionId: string, user: User) => {
        await AsyncStorage.setItem("companyId", companyId);
        await AsyncStorage.setItem("sessionId", sessionId);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        setSessionId(sessionId);
        setCompanyId(companyId);
        setUser(user);
    };

    const logOut = async () => {
        await AsyncStorage.multiRemove(["companyId", "sessionId", "user"]);

        setSessionId(null);
        setCompanyId(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ sessionId, companyId, user, isLoading, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
