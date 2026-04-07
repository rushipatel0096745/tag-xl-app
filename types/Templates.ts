export interface ManualTemplateListItem {
    id: number;
    name: string;
    description: string;
    files: {
        id: number;
        file_name: string;
        file_path: string;
    }[];
}

export interface PreUseTemplteListItem {
    id: number;
    title: string;
    questions: {
        id: number;
        question: string;
        type: string;
        multiselect_value?: Record<string, string>;
    }[];
}

export interface MaintenanceTemplteListItem {
    id: number;
    title: string;
    maintenance_frequency: number;
    questions: {
        id: number;
        question: string;
        type: string;
        multiselect_value?: Record<string, string>;
    }[];
}
