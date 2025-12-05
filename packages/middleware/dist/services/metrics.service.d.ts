/**
 * MetricsService
 *
 * Tracks generation metrics for all requests
 * Used for Week 3 failure analysis and A/B testing
 *
 * Features:
 * - In-memory storage of metrics
 * - Aggregation by type/query type
 * - Report generation
 * - Time-series analysis
 */
import type { GenerationMetrics, GenerationReport } from '../types/core.types';
export declare class MetricsService {
    private metrics;
    private readonly maxMetricsSize;
    /**
     * Record a generation metric
     */
    recordMetric(metric: GenerationMetrics): void;
    /**
     * Get all metrics (for analysis)
     */
    getAllMetrics(): GenerationMetrics[];
    /**
     * Get metrics for a specific session
     */
    getSessionMetrics(sessionId: string): GenerationMetrics[];
    /**
     * Get metrics in time range
     */
    getMetricsByTimeRange(startTime: number, endTime: number): GenerationMetrics[];
    /**
     * Get failed metrics
     */
    getFailedMetrics(): GenerationMetrics[];
    /**
     * Generate aggregated report
     */
    generateReport(startTime?: number, endTime?: number): GenerationReport;
    /**
     * Print report to console
     */
    printReport(report?: GenerationReport): void;
    /**
     * Export metrics as JSON
     * Returns array of metrics for easy processing
     */
    exportAsJSON(): string;
    /**
     * Export metrics as CSV
     */
    exportAsCSV(): string;
    /**
     * Clear all metrics
     */
    clear(): void;
    private logMetric;
    private getTopErrors;
    private emptyReport;
}
export declare function getMetricsService(): MetricsService;
//# sourceMappingURL=metrics.service.d.ts.map