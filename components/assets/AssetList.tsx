import { useAuth } from "@/context/AuthContext";
import { GetAssetList } from "@/services/asset";
import { AssetItem } from "@/types/Aseet";
import { Href, router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ItemProps = {
    item: AssetItem;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
};

const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => (
    <TouchableOpacity onPress={onPress} className='flex flex-row items-center border-b border-gray-300 gap-3 p-3'>
        <View className='w-16'>
            <Image
                source={
                    item?.image
                        ? { uri: `https://api.tagxl.com/${item?.image}` }
                        : require("@/assets/images/image_placeholder.png")
                }
                style={{ width: 50, height: 50 }}
                resizeMode='cover'
                className='rounded-xl'
            />
        </View>

        <View className='flex-1 justify-center'>
            <Text className='font-semibold text-base'>{item.name}</Text>
            <Text className='text-gray-500 text-sm'>{item.batch_code}</Text>
        </View>

        <View className='justify-center items-end'>
            {item.status === 0 && (
                <Text className='text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-semibold'>GOOD</Text>
            )}

            {item.status === 1 && (
                <Text className='text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-xs font-semibold'>
                    WARNING
                </Text>
            )}

            {item.status === 2 && (
                <Text className='text-red-600 bg-red-100 px-3 py-1 rounded-full text-xs font-semibold'>DAMAGED</Text>
            )}
        </View>
    </TouchableOpacity>
);

const AssetList = () => {
    const navigation = useNavigation();

    const [list, setList] = useState<AssetItem[]>([]);
    const [userRole, setUserRole] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");

    const { user, logOut } = useAuth();
    // const debouncedSearch = useDebounce(searchText, 500);

    const [refreshing, setRefreshing] = useState(false);

    // useEffect(() => {
    //     navigation.setOptions({
    //         headerLeft: () => (
    //             <TouchableOpacity onPress={() => router.back()}>
    //                 <ChevronLeft size={24} color='#000' />
    //             </TouchableOpacity>
    //         ),
    //     });
    // }, [navigation]);

    const fetchAssets = async (pageNumber = 1, isLoadMore = false) => {
        try {
            if (!isLoadMore && pageNumber === 1 && list.length === 0) {
                setLoading(true);
            }

            const res = await GetAssetList([], 0, pageNumber, 20, search);

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
    };

    const handleLoadMore = () => {
        if (list.length >= total) return;

        const nextPage = page + 1;
        setPage(nextPage);
        fetchAssets(nextPage, true);
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            setPage(1);
            fetchAssets(1, false);
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    useEffect(() => {
        fetchAssets(1, false);
        setUserRole(user?.role.permission.asset ?? []);
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setSearch("");
        setPage(1);
        await fetchAssets(1, false);

        setRefreshing(false);
    }, []);

    const [selectedId, setSelectedId] = useState<number>();

    const renderItem = ({ item }: { item: AssetItem }) => {
        // const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#f9c2ff";
        const color = item.id === selectedId ? "white" : "black";
        return (
            <Item
                item={item}
                onPress={() => {
                    setSelectedId(item.id);
                    router.push({
                        pathname: "/(app)/(tabs)/home/asset/[id]",
                        params: { id: item.id },
                    } as Href);
                }}
                backgroundColor='#ffff'
                textColor={color}
            />
        );
    };

    return (
        <View className='flex-1'>
            {errors.permission && <Text className='text-red-500'>{errors.permission}</Text>}

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
                    {list.length !== 0 ? (
                        <FlatList
                            data={list}
                            renderItem={renderItem}
                            style={{ backgroundColor: "#ffff" }}
                            keyExtractor={(item) => item.id.toString()}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            extraData={selectedId}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        />
                    ) : (
                        <Text className='text-xl font-semibold text-center'>Data Not Found</Text>
                    )}
                </>
            )}
        </View>
    );
};

export default AssetList;

//    async function fetchAssets() {
//         try {
//             setLoading(true);

//             const filter = {
//                 field: "name",
//                 condition: "contains",
//                 text: searchText,
//             };

//             const result = await GetAssetList([filter], searchText !== "" ? 0 : 1);

//             if (result.has_error && result.error_code === "PERMISSION_DENIED") {
//                 setErrors({ permission: result.message });
//                 Alert.alert("Error", result.message);
//             }

//             if (result.has_error && result.message === "Invalid or expired session") {
//                 Alert.alert("Session Expired", result.message, [
//                     {
//                         text: "Ok",
//                         onPress: () => router.replace("/(auth)/sign-in"),
//                     },
//                 ]);
//             }

//             if (!result.has_error) {
//                 setList(result?.assets);
//             }
//         } catch (err) {
//             console.error("Error fetching assets:", err);
//         } finally {
//             setLoading(false);
//         }
//     }
