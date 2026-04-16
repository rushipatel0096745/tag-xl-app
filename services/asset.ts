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

export const GetDashboardData = async function () {
    const result = await clientFetch("/company/dashboard-overview", {
        method: "GET",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
    });
    return result;
};

export const GetAssetList = async function (filter: Filter[] = [], show_all_records = 0) {
    const result = await clientFetch("/company/asset/list", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            show_all_records: show_all_records,
            filters: filter,
        }),
    });
    return result;
};

export const GetAsset = async function (id: number) {
    const result = await clientFetch("/company/asset/get/" + id, {
        method: "GET",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
    });
    return result;
};

export const GetAssetWithTag = async function (uid: string) {
    const result = await clientFetch("/company/asset/get-with-tag/" + uid, {
        method: "GET",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
    });
    return result;
};

export const CreateAsset = async function (formData: FormData) {
    const result = await clientFetch("/company/asset/create", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            // "Content-Type": "application/json",
        },
        body: formData,
    });

    return result;
};

export const UpdateAsset = async function (id: number, formData: FormData) {
    const result = await clientFetch("/company/asset/update/" + id, {
        method: "PUT",
        headers: {
            ...(await getAuthHeaders()),
            // "Content-Type": "application/json",
        },
        body: formData,
    });

    return result;
};

export const CreateTag = async function (uid: string, tag_type: string) {
    const result = await clientFetch("/company/tag/create", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            tags: [
                {
                    uid: uid,
                    tag_type: tag_type,
                    is_assigned: 0,
                },
            ],
        }),
    });

    return result;
};

export const UnassignTag = async function (data: any) {
    const result = await clientFetch("/company/tag/unassigned-asset", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return result;
};

export const AssignTag = async function (data: any) {
    const result = await clientFetch("/company/tag/assigned-asset", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return result;
};

export const CheckTagAssigned = async function (tagId: string) {
    const result = await clientFetch("/company/tag/check-assigned", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: tagId }),
    });
    return result;
};

export const GetLocationList = async function (filter: Filter[] = [], show_all_records = 0) {
    const result = await clientFetch("/company/location/list", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            show_all_records: show_all_records,
            filters: filter,
        }),
    });
    return result;
};

export const CreateLocation = async function (name: string) {
    const result = await clientFetch("/company/location/create", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name,
        }),
    });

    return result;
};

export const PreUseAnswers = async function (formData: FormData) {
    const result = await clientFetch("/company/asset/save-pre-use-answers", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
        },
        body: formData,
    });

    return result;
};

export const MaintenanceAnswers = async function (formData: FormData) {
    const result = await clientFetch("/company/asset/save-maintenance-answers", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
        },
        body: formData,
    });

    return result;
};

export const AssetInspectionLog = async function (asset_id: number, page: number = 1, page_size: number = 10) {
    const result = await clientFetch("/company/asset/inspection-logs", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            asset_id: asset_id,
            page: page,
            page_size: page_size,
        }),
    });
    return result;
};
