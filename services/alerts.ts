import { clientFetch } from "@/lib/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Filter = {
    field: string;
    condition: string;
    text: string;
};

const getAuthHeaders = async () => {
    const [sessionId, companyId] = await Promise.all([
        AsyncStorage.getItem("sessionId"),
        AsyncStorage.getItem("companyId"),
    ]);

    return {
        "X-Session-ID": sessionId ?? "",
        "X-Company-ID": companyId ?? "",
    };
};

export const GetAlertList = async function (filter: Filter[] = [], serach: string = "", page: number = 1, page_size: number = 10, show_all_records = 0) {
    const result = await clientFetch("/company/alerts", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            page: page,
            page_size: page_size,
            show_all_records: show_all_records,
            filters: filter,
            search: serach,
        }),
    });
    return result;
};

export const GetAssetsInMaintenance = async function (
    filter: Filter[] = [],
    serach: string = "",
    page: number = 1,
    page_size: number = 10,
    show_all_records = 0
) {
    const result = await clientFetch("/company/alerts/asset-in-maintenance", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            page: page,
            page_size: page_size,
            show_all_records: show_all_records,
            filters: filter,
            search: serach,
        }),
    });
    return result;
};

export const GetAssetFailure = async function (filter: Filter[] = [], serach: string = "", page: number = 1, page_size: number = 10, show_all_records = 0) {
    const result = await clientFetch("/company/alerts/asset-failure", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            page: page,
            page_size: page_size,
            show_all_records: show_all_records,
            filters: filter,
            search: serach,
        }),
    });
    return result;
};

export const GetAlert = async function (id: number) {
    const result = await clientFetch("/company/alerts/get/" + id, {
        method: "GET",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
    });
    return result;
};

export const UpdateAlert = async function (data: any) {
    const result = await clientFetch("/company/alerts/status/update", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return result;
};
