"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseSyncService = void 0;
// Placeholder for Odoo Client (Gateway)
class OdooGateway {
    constructor(url) {
        this.url = url;
    }
    async write(model, data) {
        console.log(`[OdooGateway] Writing ${data.length} records to ${model} at ${this.url}`);
        // Simulate latency
        await new Promise(resolve => setTimeout(resolve, 500));
        return data.length;
    }
}
class WarehouseSyncService {
    constructor() {
        this.jobs = new Map();
        // Determine Odoo URL (mocked for now, but ready for localhost:8069)
        this.odoo = new OdooGateway(process.env.ODOO_URL || 'http://localhost:8069');
    }
    async startSync(jobId, sourceApiUrl, targetModel) {
        const job = {
            sourceApi: sourceApiUrl,
            targetModel,
            status: 'pending',
            recordsSynced: 0
        };
        this.jobs.set(jobId, job);
        // Run sync in background
        this.runSyncProcess(jobId, job);
        return job;
    }
    getJobStatus(jobId) {
        return this.jobs.get(jobId);
    }
    async runSyncProcess(jobId, job) {
        try {
            job.status = 'running';
            // 1. Fetch from 3rd Party API (Mock)
            const mockData = [
                { id: 1, name: 'Imported Item A', price: 100 },
                { id: 2, name: 'Imported Item B', price: 200 },
                { id: 3, name: 'Imported Item C', price: 300 },
            ];
            // 2. Transform (Simple mapping)
            const transformedData = mockData.map(item => ({
                external_id: item.id,
                name: item.name,
                list_price: item.price,
                source: job.sourceApi
            }));
            // 3. Load into Odoo
            const count = await this.odoo.write(job.targetModel, transformedData);
            job.recordsSynced = count;
            job.status = 'completed';
            console.log(`[WarehouseSync] Job ${jobId} completed. Synced ${count} records.`);
        }
        catch (error) {
            console.error(`[WarehouseSync] Job ${jobId} failed`, error);
            job.status = 'failed';
        }
    }
}
exports.WarehouseSyncService = WarehouseSyncService;
//# sourceMappingURL=warehouse-sync.service.js.map