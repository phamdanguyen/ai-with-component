
// Placeholder for Odoo Client (Gateway)
class OdooGateway {
    constructor(private url: string) { }

    async write(model: string, data: any[]): Promise<number> {
        console.log(`[OdooGateway] Writing ${data.length} records to ${model} at ${this.url}`);
        // Simulate latency
        await new Promise(resolve => setTimeout(resolve, 500));
        return data.length;
    }
}

interface SyncJob {
    sourceApi: string;
    targetModel: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    recordsSynced: number;
}

export class WarehouseSyncService {
    private odoo: OdooGateway;
    private jobs: Map<string, SyncJob> = new Map();

    constructor() {
        // Determine Odoo URL (mocked for now, but ready for localhost:8069)
        this.odoo = new OdooGateway(process.env.ODOO_URL || 'http://localhost:8069');
    }

    async startSync(jobId: string, sourceApiUrl: string, targetModel: string): Promise<SyncJob> {
        const job: SyncJob = {
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

    getJobStatus(jobId: string): SyncJob | undefined {
        return this.jobs.get(jobId);
    }

    private async runSyncProcess(jobId: string, job: SyncJob) {
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

        } catch (error) {
            console.error(`[WarehouseSync] Job ${jobId} failed`, error);
            job.status = 'failed';
        }
    }
}
