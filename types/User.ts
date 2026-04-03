export interface User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    last_logged_in: string;
    role: Role;
}

export interface Role {
    id: number;
    role_name: string;
    permission: Permission;
}

export interface Permission {
    role: string[];
    tags: string[];
    user: string[];
    asset: string[];
    alerts: string[];
    location: string[];
    manual_template: string[];
    pre_use_template: string[];
    maintenance_template: string[];
}
