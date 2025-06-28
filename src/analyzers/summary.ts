import { K8sClient } from '../utils/k8s-client';
import { PodCollector } from '../collectors/pod';
import { JobCollector } from '../collectors/job';
import { EventCollector } from '../collectors/event';
import { SummaryData, CLIOptions } from '../types';

export class SummaryAnalyzer {
  private client: K8sClient;
  private podCollector: PodCollector;
  private jobCollector: JobCollector;
  private eventCollector: EventCollector;

  constructor(client: K8sClient) {
    this.client = client;
    this.podCollector = new PodCollector(client);
    this.jobCollector = new JobCollector(client);
    this.eventCollector = new EventCollector(client);
  }

  async generateSummary(options: CLIOptions): Promise<SummaryData> {
    const hours = options.hours || 24;
    const namespace = options.namespace;
    
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

    console.log(`Collecting data for the last ${hours} hours...`);

    const [
      totalPods,
      podRestarts,
      abnormalPods,
      jobStats,
      eventStats
    ] = await Promise.all([
      this.podCollector.getTotalPodCount(namespace),
      this.podCollector.collectPodRestarts(hours, namespace),
      this.podCollector.collectAbnormalPods(namespace),
      this.jobCollector.collectJobs(hours, namespace),
      this.eventCollector.collectEvents(hours, namespace)
    ]);

    const summary: SummaryData = {
      timeRange: {
        start: startTime,
        end: endTime
      },
      pods: {
        total: totalPods,
        restarted: podRestarts,
        abnormal: abnormalPods
      },
      jobs: {
        successful: jobStats.successful,
        failed: jobStats.failed,
        active: jobStats.active
      },
      events: {
        warnings: eventStats.warnings,
        total: eventStats.total
      }
    };

    return summary;
  }

  async testConnection(): Promise<boolean> {
    return await this.client.testConnection();
  }

  generateInsights(summary: SummaryData): string[] {
    const insights: string[] = [];

    if (summary.pods.restarted.length > 0) {
      const totalRestarts = summary.pods.restarted.reduce((sum, pod) => sum + pod.restartCount, 0);
      insights.push(`Found ${summary.pods.restarted.length} pods with restarts (total: ${totalRestarts} restarts)`);
      
      const oomKilledPods = summary.pods.restarted.filter(pod => pod.reason === 'OOMKilled');
      if (oomKilledPods.length > 0) {
        insights.push(`${oomKilledPods.length} pods were OOMKilled - consider increasing memory limits`);
      }

      const crashLoopPods = summary.pods.restarted.filter(pod => pod.reason === 'CrashLoopBackOff');
      if (crashLoopPods.length > 0) {
        insights.push(`${crashLoopPods.length} pods in CrashLoopBackOff - check application logs`);
      }
    }

    if (summary.pods.abnormal.length > 0) {
      insights.push(`${summary.pods.abnormal.length} pods in abnormal state require attention`);
    }

    if (summary.jobs.failed.length > 0) {
      insights.push(`${summary.jobs.failed.length} jobs failed - review job configurations and logs`);
    }

    if (summary.events.warnings.length > 10) {
      insights.push(`High number of warning events (${summary.events.warnings.length}) - check cluster health`);
    }

    const topWarningReason = summary.events.warnings[0];
    if (topWarningReason && topWarningReason.count > 5) {
      insights.push(`Most common warning: "${topWarningReason.reason}" (${topWarningReason.count} occurrences)`);
    }

    if (insights.length === 0) {
      insights.push('No significant issues detected in the specified time range');
    }

    return insights;
  }
}