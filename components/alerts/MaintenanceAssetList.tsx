import { useAuth } from "@/context/AuthContext";
import { GetAssetsInMaintenance } from "@/services/alerts";
import { MaintenanceAssetItem } from "@/types/Alert";
import { Image } from "expo-image";
import { Href, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";

type ItemProps = {
    item: MaintenanceAssetItem;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
};

const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => (
    <TouchableOpacity onPress={onPress} className='flex flex-row border-b border-gray-300 gap-2 p-2'>
        <View className='img w-20'>
            <Image
                source={
                    item?.image
                        ? { uri: `https://api.tagxl.com/${item?.image}` }
                        : require("@/assets/images/image_placeholder.png")
                }
                style={{ width: 50, height: 50 }}
                contentFit='cover'
                className='border-0 rounded-2xl'
            />
        </View>
        <View className='content w-60 content-center'>
            <Text className='font-semibold'>{item?.name}</Text>
            <Text className='color-gray-500'>{item?.batch_code}</Text>
        </View>
        <View className='content w-20 content-center'>
            {item.alert.status === 0 && (
                <Text className='text-yellow-600 bg-yellow-200 rounded-full px-1 py-1 text-xs font-extrabold'>
                    PENDING
                </Text>
            )}

            {item.alert.status === 1 && (
                <Text className='text-blue-600 bg-blue-200 rounded-full px-1 py-1 text-xs font-extrabold'>
                    PROCESSING
                </Text>
            )}

            {item.alert.status === 2 && (
                <Text className='text-green-600 bg-green-200 rounded-full px-1 py-1 text-xs font-extrabold'>
                    COMPLETE
                </Text>
            )}

            {item.alert.status === 3 && (
                <Text className='text-red-600 bg-red-200 rounded-full px-1 py-1 text-xs font-extrabold'>DAMAGED</Text>
            )}
        </View>
    </TouchableOpacity>
);

const MaintenanceAssetList = () => {
    const [list, setList] = useState<MaintenanceAssetItem[]>([]);
    const [userRole, setUserRole] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const { user, logOut } = useAuth();

    async function fetchAlerts(pageNumber = 1, isLoadMore = false) {
        try {
            if (!isLoadMore && pageNumber === 1 && list.length === 0) {
                setLoading(true);
            }

            const res = await GetAssetsInMaintenance([], search, pageNumber, 20, 0);

            // console.log("alerts: ", JSON.stringify(res, null, 2));

            if (res.has_error && res.message === "Invalid or expired session") {
                Alert.alert("Session Over", "", [
                    {
                        text: "OK",
                        onPress: () => {
                            logOut();
                            router.replace("/(auth)/sign-in");
                        },
                    },
                ]);
                return;
            }

            const newData = res?.assets || [];
            const totalCount = res?.total || 0;

            setTotal(totalCount);

            if (isLoadMore) {
                setList((prev) => [...prev, ...newData]);
            } else {
                setList(newData);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }

    const handleLoadMore = () => {
        if (list.length >= total) return;

        const nextPage = page + 1;
        setPage(nextPage);
        fetchAlerts(nextPage, true);
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            setPage(1);
            fetchAlerts(1, false);
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    useEffect(() => {
        fetchAlerts(1, false);
        setUserRole(user?.role.permission.asset ?? []);
    }, []);

    const [selectedId, setSelectedId] = useState<number>();

    const renderItem = ({ item }: { item: MaintenanceAssetItem }) => {
        const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#f9c2ff";
        const color = item.id === selectedId ? "white" : "black";
        return (
            <Item
                item={item}
                onPress={() => {
                    setSelectedId(item.alert.id);
                    router.push({
                        pathname: "/(app)/(tabs)/home/alerts/[id]",
                        params: { id: item.alert.id },
                    } as Href);
                }}
                backgroundColor={backgroundColor}
                textColor={color}
            />
        );
    };

    return (
        <View>
            <View className='search-bar p-2'>
                <TextInput
                    className='border border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 focus:border-gray-400'
                    placeholder='Type Asset Name'
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor='#9CA3AF'
                />
            </View>

            {loading && initialLoad && list.length === 0 ? (
                <View className='flex flex-row justify-center items-center'>
                    <ActivityIndicator size='large' />
                </View>
            ) : (
                <>
                    <Text style={{ marginHorizontal: 10 }} className='text-gray-500 text-xl p-2'>
                        Showing {list.length} of {total || list.length}
                    </Text>
                    {list?.length !== 0 ? (
                        <FlatList
                            data={list}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            extraData={selectedId}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                        />
                    ) : (
                        <Text className='text-xl font-semibold text-center'>Data Not Found</Text>
                    )}
                </>
            )}
        </View>
    );
};

export default MaintenanceAssetList;
