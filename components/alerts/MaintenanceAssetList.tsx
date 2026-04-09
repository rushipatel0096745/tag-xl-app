import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/context/useDebounce";
import { GetAlertList, GetAssetsInMaintenance } from "@/services/alerts";
import { AlertListItem } from "@/types/Alert";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

type ItemProps = {
    item: AlertListItem;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
};

const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => (
    <TouchableOpacity onPress={onPress} className='flex flex-row border-b border-gray-300 gap-2 p-2'>
        <View className='img w-20'>
            <Image
                source={{ uri: `https://api.tagxl.com/${item?.asset.image}` }}
                style={{ width: 50, height: 50 }}
                contentFit='cover'
                className='border-0 rounded-2xl'
            />
        </View>
        <View className='content w-60 content-center'>
            <Text className='font-semibold'>{item.asset.name}</Text>
            <Text className='color-gray-500'>{item.asset.batch_code}</Text>
        </View>
        <View className='content w-20 content-center'>
            {item.status === 0 && (
                <Text className='text-green-500 bg-green-100 rounded-full px-1 py-1 text-xs font-extrabold'>GOOD</Text>
            )}
        </View>
    </TouchableOpacity>
);

const MaintenanceAssetList = () => {
    const [list, setList] = useState<AlertListItem[]>([]);
    const [userRole, setUserRole] = useState<string[]>([]);
    const [searchText, setSearchText] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const debouncedSearch = useDebounce(searchText, 500);

    async function fetchAlerts() {
        try {
            setLoading(true);

            const filter = {
                field: "alert_type",
                condition: "equals",
                text: "certificate_expired",
            };

            const result = await GetAssetsInMaintenance([], searchText, searchText !== "" ? 0 : 1);

            if (result.has_error && result.error_code === "PERMISSION_DENIED") {
                setErrors({ permission: result.message });
            }

            if (!result.has_error) {
                setList(result?.alerts);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAlerts();
        setUserRole(user?.role.permission.asset ?? []);
    }, [debouncedSearch]);

    const [selectedId, setSelectedId] = useState<number>();

    const renderItem = ({ item }: { item: AlertListItem }) => {
        const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#f9c2ff";
        const color = item.id === selectedId ? "white" : "black";
        return (
            <Item
                item={item}
                onPress={() => {
                    setSelectedId(item.id);
                    router.push({
                        pathname: "/(app)/(tabs)/home/alerts/[id]",
                        params: { id: item.id },
                    } as Href);
                }}
                backgroundColor={backgroundColor}
                textColor={color}
            />
        );
    };

    return (
        <View>
            {errors.permission && <Text className='text-red-500'>{errors.permission}</Text>}
            {loading ? (
                <View className='flex flex-row justify-center items-center'>
                    <ActivityIndicator size='large' />
                </View>
            ) : (
                <>
                    <View className='search-bar p-2'>
                        <TextInput
                            className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 focus:border-gray-400'
                            placeholder='Type Asset Name'
                            value={searchText}
                            onChangeText={(text) => setSearchText(text)}
                            placeholderTextColor='#9CA3AF'
                        />
                    </View>
                    {list?.length !== 0 ? (
                        <FlatList
                            data={list}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            extraData={selectedId}
                        />
                    ) : (
                        <Text className="text-xl font-semibold text-center">Data Not Found</Text>
                    )}
                </>
            )}
        </View>
    );
};

export default MaintenanceAssetList;
