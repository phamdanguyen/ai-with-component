interface SyncJob {
    sourceApi: string;
    targetModel: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    recordsSynced: number;
}
export declare class WarehouseSyncService {
    private odoo;
    private jobs;
    constructor();
    startSync(jobId: string, sourceApiUrl: string, targetModel: string): Promise<SyncJob>;
    getJobStatus(jobId: string): SyncJob | undefined;
    private runSyncProcess;
}
export {};
//# sourceMappingURL=warehouse-sync.service.d.ts.map