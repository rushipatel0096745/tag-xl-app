import { useAuth } from "@/context/AuthContext";
import { GetAlertList } from "@/services/alerts";
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
        <View className='img w-16'>
            <Image
                source={{ uri: `https://api.tagxl.com/${item?.asset.image}` }}
                style={{ width: 50, height: 50 }}
                contentFit='cover'
                className='border-0 rounded-2xl'
            />
        </View>
        <View className='flex-1 justify-center'>
            <Text className='font-semibold'>{item.asset.name}</Text>
            <Text className='color-gray-500'>
                Alert:
                <Text className='text-black'>
                    {item.alert_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
            </Text>
        </View>
        <View className='justify-center items-end p-2'>
            {item.status === 2 && (
                <Text className='text-green-600 bg-green-200 rounded-full px-1 py-1 text-xs font-extrabold'>
                    COMPLETED
                </Text>
            )}
            {item.status === 0 && (
                <Text className='text-yellow-600 bg-yellow-200 rounded-full px-1 py-1 text-xs font-extrabold'>
                    PENDING
                </Text>
            )}
            {item.status === 1 && (
                <Text className='text-red-600 bg-red-200 rounded-full px-1 py-1 text-xs font-extrabold'>
                    IN PROGRESS
                </Text>
            )}
        </View>
    </TouchableOpacity>
);

const AllAlertsList = () => {
    const [list, setList] = useState<AlertListItem[]>([]);
    const [userRole, setUserRole] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    const { user } = useAuth();

    const fetchAlerts = async (pageNumber = 1, isLoadMore = false) => {
        try {
            if (!isLoadMore && pageNumber === 1 && list.length === 0) {
                setLoading(true);
            }

            const res = await GetAlertList([], search, pageNumber, 20, 0);

            const newData = res?.alerts || [];
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
                    {list?.length !== 0 ? (
                        <FlatList
                            data={list}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            extraData={selectedId}
                        />
                    ) : (
                        <Text className='text-xl font-semibold text-center'>Data Not Found</Text>
                    )}
                </>
            )}
        </View>
    );
};

export default AllAlertsList;

// async function fetchAlerts() {
//         try {
//             setLoading(true);

//             const filter = {
//                 field: "name",
//                 condition: "contains",
//                 text: searchText,
//             };

//             const result = await GetAlertList([], searchText, searchText !== "" ? 0 : 1);

//             if (result.has_error && result.error_code === "PERMISSION_DENIED") {
//                 setErrors({ permission: result.message });
//             }

//             if (!result.has_error) {
//                 setList(result?.alerts);
//             }
//         } catch (err) {
//             console.error("Error fetching assets:", err);
//         } finally {
//             setLoading(false);
//         }
//     }
