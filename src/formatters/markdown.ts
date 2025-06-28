import { SummaryData } from '../types';

export class MarkdownFormatter {
  formatSummary(summary: SummaryData, insights?: string[]): string {
    const output: string[] = [];

    output.push('# K8S Daily Summary Report');
    output.push('');
    output.push(`**Time Range:** ${summary.timeRange.start.toLocaleString()} - ${summary.timeRange.end.toLocaleString()}`);
    output.push('');

    output.push(this.formatPodSummary(summary));
    output.push('');
    output.push(this.formatJobSummary(summary));
    output.push('');
    output.push(this.formatEventSummary(summary));

    if (insights && insights.length > 0) {
      output.push('');
      output.push(this.formatInsights(insights));
    }

    return output.join('\n');
  }

  private formatPodSummary(summary: SummaryData): string {
    const output: string[] = [];
    output.push('## Pod Status Summary');
    output.push('');
    output.push(`- **Total Pods:** ${summary.pods.total}`);
    output.push(`- **Restarted Pods:** ${summary.pods.restarted.length}`);
    output.push(`- **Abnormal Pods:** ${summary.pods.abnormal.length}`);

    if (summary.pods.restarted.length > 0) {
      output.push('');
      output.push('### Pod Restarts');
      output.push('');
      output.push('| Pod Name | Namespace | Restarts | Reason | Last Restart |');
      output.push('|----------|-----------|----------|--------|--------------|');

      for (const pod of summary.pods.restarted.slice(0, 10)) {
        const lastRestart = pod.lastRestartTime ? pod.lastRestartTime.toLocaleString() : 'Unknown';
        output.push(`| ${pod.name} | ${pod.namespace} | ${pod.restartCount} | ${pod.reason || 'Unknown'} | ${lastRestart} |`);
      }

      if (summary.pods.restarted.length > 10) {
        output.push('');
        output.push(`*... and ${summary.pods.restarted.length - 10} more pods with restarts*`);
      }
    }

    if (summary.pods.abnormal.length > 0) {
      output.push('');
      output.push('### Abnormal Pods');
      output.push('');
      output.push('| Pod Name | Namespace | Status | Reason |');
      output.push('|----------|-----------|--------|--------|');

      for (const pod of summary.pods.abnormal.slice(0, 10)) {
        output.push(`| ${pod.name} | ${pod.namespace} | ${pod.status} | ${pod.reason || 'Unknown'} |`);
      }

      if (summary.pods.abnormal.length > 10) {
        output.push('');
        output.push(`*... and ${summary.pods.abnormal.length - 10} more abnormal pods*`);
      }
    }

    return output.join('\n');
  }

  private formatJobSummary(summary: SummaryData): string {
    const output: string[] = [];
    output.push('## Job Health Summary');
    output.push('');
    output.push(`- **Successful Jobs:** ${summary.jobs.successful}`);
    output.push(`- **Failed Jobs:** ${summary.jobs.failed.length}`);
    output.push(`- **Active Jobs:** ${summary.jobs.active}`);

    if (summary.jobs.failed.length > 0) {
      output.push('');
      output.push('### Failed Jobs');
      output.push('');
      output.push('| Job Name | Namespace | Duration | Failure Reason |');
      output.push('|----------|-----------|----------|----------------|');

      for (const job of summary.jobs.failed.slice(0, 10)) {
        output.push(`| ${job.name} | ${job.namespace} | ${job.duration || 'Unknown'} | ${job.failureReason || 'Unknown'} |`);
      }

      if (summary.jobs.failed.length > 10) {
        output.push('');
        output.push(`*... and ${summary.jobs.failed.length - 10} more failed jobs*`);
      }
    }

    return output.join('\n');
  }

  private formatEventSummary(summary: SummaryData): string {
    const output: string[] = [];
    output.push('## Event Summary');
    output.push('');
    output.push(`- **Warning Events:** ${summary.events.warnings.length}`);
    output.push(`- **Total Events:** ${summary.events.total}`);

    if (summary.events.warnings.length > 0) {
      output.push('');
      output.push('### Top Warning Events');
      output.push('');
      output.push('| Reason | Count | Object | Last Seen |');
      output.push('|--------|-------|--------|-----------|');

      for (const event of summary.events.warnings.slice(0, 10)) {
        const objectName = `${event.involvedObject.kind}/${event.involvedObject.name}`;
        output.push(`| ${event.reason} | ${event.count} | ${objectName} | ${event.lastTime.toLocaleString()} |`);
      }

      if (summary.events.warnings.length > 10) {
        output.push('');
        output.push(`*... and ${summary.events.warnings.length - 10} more warning events*`);
      }
    }

    return output.join('\n');
  }

  private formatInsights(insights: string[]): string {
    const output: string[] = [];
    output.push('## Key Insights');
    output.push('');
    
    for (const insight of insights) {
      output.push(`- ${insight}`);
    }

    return output.join('\n');
  }
}