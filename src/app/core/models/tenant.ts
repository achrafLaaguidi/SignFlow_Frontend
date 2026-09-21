export interface TenantResponse {
    id: string;
    companyName: string;
    adminEmail: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
    createdAt: string;
}
