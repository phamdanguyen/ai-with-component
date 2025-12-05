"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
exports.getMetricsService = getMetricsService;
class MetricsService {
    constructor() {
        this.metrics = [];
        this.maxMetricsSize = 10000; // Keep last 10k metrics
    }
    /**
     * Record a generation metric
     */
    recordMetric(metric) {
        this.metrics.push(metric);
        // Keep memory bounded
        if (this.metrics.length > this.maxMetricsSize) {
            this.metrics = this.metrics.slice(-this.maxMetricsSize);
        }
        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            this.logMetric(metric);
        }
    }
    /**
     * Get all metrics (for analysis)
     */
    getAllMetrics() {
        return this.metrics;
    }
    /**
     * Get metrics for a specific session
     */
    getSessionMetrics(sessionId) {
        return this.metrics.filter((m) => m.sessionId === sessionId);
    }
    /**
     * Get metrics in time range
     */
    getMetricsByTimeRange(startTime, endTime) {
        return this.metrics.filter((m) => m.timestamp >= startTime && m.timestamp <= endTime);
    }
    /**
     * Get failed metrics
     */
    getFailedMetrics() {
        return this.metrics.filter((m) => !m.success);
    }
    /**
     * Generate aggregated report
     */
    generateReport(startTime, endTime) {
        const now = Date.now();
        const start = startTime || now - 24 * 60 * 60 * 1000; // Last 24h
        const end = endTime || now;
        const filtered = this.getMetricsByTimeRange(start, end);
        if (filtered.length === 0) {
            return this.emptyReport(start, end);
        }
        const successful = filtered.filter((m) => m.success).length;
        const failed = filtered.filter((m) => !m.success).length;
        const totalTime = filtered.reduce((sum, m) => sum + m.executionTime, 0);
        const avgTime = totalTime / filtered.length;
        // Calculate average message length
        const totalMsgLength = filtered.reduce((sum, m) => sum + (m.messageLength || 0), 0);
        const avgMsgLength = totalMsgLength / filtered.length;
        // Calculate average retry count
        const totalRetries = filtered.reduce((sum, m) => sum + (m.retryCount || 0), 0);
        const avgRetries = totalRetries / filtered.length;
        // Group by component type
        const byComponent = {};
        filtered.forEach((m) => {
            const type = m.componentType || 'unknown';
            if (!byComponent[type])
                byComponent[type] = [];
            byComponent[type].push(m);
        });
        // Group by query type
        const byQuery = {};
        filtered.forEach((m) => {
            const type = m.queryType || 'unknown';
            if (!byQuery[type])
                byQuery[type] = [];
            byQuery[type].push(m);
        });
        // Group by error type
        const errorsByType = {};
        const failedMetrics = filtered.filter((m) => !m.success);
        failedMetrics.forEach((m) => {
            const errorType = m.errorType || 'unknown';
            if (!errorsByType[errorType])
                errorsByType[errorType] = [];
            if (m.failureReason) {
                errorsByType[errorType].push(m.failureReason);
            }
        });
        // Top failures
        const failureMap = new Map();
        failedMetrics.forEach((m) => {
            const reason = m.failureReason || m.errorType || 'unknown';
            failureMap.set(reason, (failureMap.get(reason) || 0) + 1);
        });
        const topFailures = Array.from(failureMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([reason, count]) => ({
            reason,
            count,
            lastOccurred: Math.max(...failedMetrics
                .filter((m) => (m.failureReason || m.errorType) === reason)
                .map((m) => m.timestamp)),
        }));
        // Success rate as decimal (0-1)
        const successRateDecimal = successful / filtered.length;
        return {
            // Flat properties for easy access (tests expect these)
            totalMetrics: filtered.length,
            successRate: successRateDecimal,
            totalFailures: failed,
            avgExecutionTime: avgTime,
            avgMessageLength: avgMsgLength,
            avgRetryCount: avgRetries,
            // Nested structure
            period: {
                startTime: start,
                endTime: end,
                duration: end - start,
            },
            summary: {
                totalRequests: filtered.length,
                successfulRequests: successful,
                failedRequests: failed,
                successRate: successRateDecimal * 100, // percentage for summary
                avgExecutionTime: avgTime,
            },
            byComponentType: Object.fromEntries(Object.entries(byComponent).map(([type, metrics]) => [
                type,
                {
                    count: metrics.length,
                    successRate: metrics.filter((m) => m.success).length / metrics.length, // decimal 0-1
                    avgTime: metrics.reduce((sum, m) => sum + m.executionTime, 0) /
                        metrics.length,
                    topErrors: this.getTopErrors(metrics.filter((m) => !m.success)),
                },
            ])),
            byQueryType: Object.fromEntries(Object.entries(byQuery).map(([type, metrics]) => [
                type,
                {
                    count: metrics.length,
                    successRate: metrics.filter((m) => m.success).length / metrics.length, // decimal 0-1
                    avgTime: metrics.reduce((sum, m) => sum + m.executionTime, 0) /
                        metrics.length,
                },
            ])),
            errors: Object.entries(errorsByType).map(([type, examples]) => ({
                errorType: type,
                count: examples.length,
                examples: [...new Set(examples)].slice(0, 3),
            })),
            topFailures,
        };
    }
    /**
     * Print report to console
     */
    printReport(report) {
        const rep = report || this.generateReport();
        console.log('\n' + '='.repeat(60));
        console.log('📊 GENERATION METRICS REPORT');
        console.log('='.repeat(60));
        console.log(`\n📅 Period: ${new Date(rep.period.startTime).toISOString()} to ${new Date(rep.period.endTime).toISOString()}`);
        console.log('\n📈 Summary:');
        console.log(`  Total Requests:      ${rep.summary.totalRequests}`);
        console.log(`  Successful:          ${rep.summary.successfulRequests} (${rep.summary.successRate.toFixed(1)}%)`);
        console.log(`  Failed:              ${rep.summary.failedRequests}`);
        console.log(`  Avg Execution Time:  ${rep.summary.avgExecutionTime.toFixed(0)}ms`);
        if (Object.keys(rep.byComponentType).length > 0) {
            console.log('\n📦 By Component Type:');
            Object.entries(rep.byComponentType).forEach(([type, stats]) => {
                console.log(`  ${type}: ${stats.count} requests, ${stats.successRate.toFixed(1)}% success, ${stats.avgTime.toFixed(0)}ms avg`);
                if (stats.topErrors.length > 0) {
                    stats.topErrors.slice(0, 2).forEach((err) => {
                        console.log(`    ⚠ ${err.error} (${err.count}x)`);
                    });
                }
            });
        }
        if (Object.keys(rep.byQueryType).length > 0) {
            console.log('\n🎯 By Query Type:');
            Object.entries(rep.byQueryType).forEach(([type, stats]) => {
                console.log(`  ${type}: ${stats.count} requests, ${stats.successRate.toFixed(1)}% success, ${stats.avgTime.toFixed(0)}ms avg`);
            });
        }
        if (rep.errors.length > 0) {
            console.log('\n❌ Error Analysis:');
            rep.errors.forEach((err) => {
                console.log(`  ${err.errorType}: ${err.count} occurrences`);
                err.examples.forEach((ex) => {
                    console.log(`    Example: ${ex.substring(0, 80)}`);
                });
            });
        }
        if (rep.topFailures.length > 0) {
            console.log('\n🔥 Top Failures:');
            rep.topFailures.slice(0, 5).forEach((failure) => {
                const when = new Date(failure.lastOccurred).toLocaleTimeString();
                console.log(`  ${failure.reason} (${failure.count}x, last: ${when})`);
            });
        }
        console.log('\n' + '='.repeat(60) + '\n');
    }
    /**
     * Export metrics as JSON
     * Returns array of metrics for easy processing
     */
    exportAsJSON() {
        return JSON.stringify(this.metrics, null, 2);
    }
    /**
     * Export metrics as CSV
     */
    exportAsCSV() {
        const headers = [
            'requestId',
            'timestamp',
            'queryType',
            'componentType',
            'success',
            'errorType',
            'executionTime',
            'retryCount',
            'usedFallback',
            'messageLength',
        ];
        const rows = this.metrics.map((m) => [
            m.requestId,
            new Date(m.timestamp).toISOString(),
            m.queryType,
            m.componentType || '',
            m.success ? 'true' : 'false',
            m.errorType || '',
            m.executionTime,
            m.retryCount,
            m.usedFallback ? 'true' : 'false',
            m.messageLength,
        ]);
        return [
            headers.join(','),
            ...rows.map((r) => r.map((v) => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v)).join(',')),
        ].join('\n');
    }
    /**
     * Clear all metrics
     */
    clear() {
        this.metrics = [];
    }
    // ===== Private Helper Methods =====
    logMetric(metric) {
        const status = metric.success ? '✅' : '❌';
        const component = metric.componentType || 'unknown';
        const time = `${metric.executionTime}ms`;
        const retries = metric.retryCount > 0 ? ` (retried ${metric.retryCount}x)` : '';
        console.log(`${status} [${metric.queryType}] ${component} ${time}${retries}`);
        if (!metric.success && metric.failureReason) {
            console.log(`   Reason: ${metric.failureReason}`);
        }
    }
    getTopErrors(metrics) {
        const errorMap = new Map();
        metrics.forEach((m) => {
            const error = m.failureReason || m.errorType || 'unknown';
            errorMap.set(error, (errorMap.get(error) || 0) + 1);
        });
        return Array.from(errorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([error, count]) => ({ error, count }));
    }
    emptyReport(startTime, endTime) {
        return {
            // Flat properties
            totalMetrics: 0,
            successRate: 0,
            totalFailures: 0,
            avgExecutionTime: 0,
            avgMessageLength: 0,
            avgRetryCount: 0,
            // Nested structure
            period: {
                startTime,
                endTime,
                duration: endTime - startTime,
            },
            summary: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                successRate: 0,
                avgExecutionTime: 0,
            },
            byComponentType: {},
            byQueryType: {},
            errors: [],
            topFailures: [],
        };
    }
}
exports.MetricsService = MetricsService;
// Global singleton instance
let metricsInstance = null;
function getMetricsService() {
    if (!metricsInstance) {
        metricsInstance = new MetricsService();
    }
    return metricsInstance;
}
//# sourceMappingURL=metrics.service.js.map