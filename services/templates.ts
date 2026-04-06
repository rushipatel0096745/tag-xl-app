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

export const GetManualTemplateAssetList = async function (show_all_records = 1) {
    const result = await clientFetch("/company/asset/manual-template/list", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            show_all_records: show_all_records,
        }),
    });
    return result;
};

export const GetPreUseTemplateAssetList = async function (show_all_records = 1) {
    const result = await clientFetch("/company/asset/pre-use-template/list", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            show_all_records: show_all_records,
        }),
    });
    return result;
};

export const GetMaintenanceTemplateAssetList = async function (show_all_records = 1) {
    const result = await clientFetch("/company/asset/maintenance-template/list", {
        method: "POST",
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            show_all_records: show_all_records,
        }),
    });
    return result;
};
