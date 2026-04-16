export interface AssetItem {
    id: number;
    tag: Tag;
    name: string;
    location: Location;
    batch_code: string;
    image?: string;
    status: number;
    created_at: string;
    updated_at: string;
}

export interface Tag {
    id: number;
    uid: string;
    tag_type: string;
}

export interface Location {
    id: number;
    location_name: string;
}

export interface AssetDetail {
    id: number;
    tag: Tag;
    name: string;
    location: Location;
    batch_code: string;
    image: string;
    manual_template: ManualTemplate;
    status: number;
    oem_certificate: string;
    third_party_certificate: ThirdPartyCertificate[];
    pre_use_template: PreUseTemplate;
    maintenance_template: MaintenanceTemplate;
    asset_pre_use_questions: any;
    asset_maintenance_questions: any;
    last_maintenance_check: any;
    last_pre_use_check: any;
    is_maintenance_required: boolean;
    is_asset_fail: boolean;
    is_certificate_expired: boolean;
    created_at: string;
    updated_at: string;
}

export interface ManualTemplate {
    id: number;
    name: string;
    description: string;
    files: File[];
}

export interface File {
    id: number;
    file_name: string;
    file_path: string;
}

export interface ThirdPartyCertificate {
    id: number;
    third_party_certificate: string;
    third_party_start_date: string;
    third_party_expiry_date: string;
    created_at: string;
}

export interface PreUseTemplate {
    id: number;
    title: string;
    questions: Question[];
}

export interface MaintenanceTemplate {
    id: number;
    title: string;
    maintenance_frequency: number;
    questions: Question[];
}

export interface Question {
    id: number;
    question: string;
    type: string;
    multiselect_value?: Record<string, string>;
}

export interface AssetAccessLog {
    id: number;
    asset_id: number;
    log_type: string;
    pre_use_answers_id: number;
    maintenance_answers_id: any;
    submitted_by: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
    created_at: string;
}
