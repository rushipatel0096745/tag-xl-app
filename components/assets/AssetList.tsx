import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/context/useDebounce";
import { GetAssetList } from "@/services/asset";
import { AssetItem } from "@/types/Aseet";
import { Href, router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
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
                source={{ uri: `https://api.tagxl.com/${item?.image}` }}
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
        </View>
    </TouchableOpacity>
);

const AssetList = () => {
    const navigation = useNavigation();

    const [list, setList] = useState<AssetItem[]>([]);
    const [userRole, setUserRole] = useState<string[]>([]);
    const [searchText, setSearchText] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const debouncedSearch = useDebounce(searchText, 500);

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

    async function fetchAssets() {
        try {
            setLoading(true);

            const filter = {
                field: "name",
                condition: "contains",
                text: searchText,
            };

            const result = await GetAssetList([filter], searchText !== "" ? 0 : 1);

            if (result.has_error && result.error_code === "PERMISSION_DENIED") {
                setErrors({ permission: result.message });
            }

            if (!result.has_error) {
                setList(result?.assets);
            }
        } catch (err) {
            console.error("Error fetching assets:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAssets();
        setUserRole(user?.role.permission.asset ?? []);
    }, [debouncedSearch]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);

        fetchAssets();

        setRefreshing(false);
    }, []);

    const [selectedId, setSelectedId] = useState<number>();

    const renderItem = ({ item }: { item: AssetItem }) => {
        const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#f9c2ff";
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
                backgroundColor={backgroundColor}
                textColor={color}
            />
        );
    };

    return (
        <View className='flex-1'>
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
                    {list.length !== 0 ? (
                        <FlatList
                            data={list}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id.toString()}
                            extraData={selectedId}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        />
                    ) : (
                        <Text>No records</Text>
                    )}
                </>
            )}
        </View>
    );
};

export default AssetList;
