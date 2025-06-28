import Table from 'cli-table3';
import * as chalk from 'chalk';
import { SummaryData } from '../types';

export class ConsoleFormatter {
  formatSummary(summary: SummaryData, insights?: string[]): string {
    const output: string[] = [];

    output.push(chalk.bold.blue('=== K8S Daily Summary Report ==='));
    output.push(chalk.gray(`Time Range: ${summary.timeRange.start.toLocaleString()} - ${summary.timeRange.end.toLocaleString()}`));
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
    output.push(chalk.bold.yellow('## Pod Status Summary'));
    output.push(chalk.green(`- Total Pods: ${summary.pods.total}`));
    output.push(chalk.yellow(`- Restarted Pods: ${summary.pods.restarted.length}`));
    output.push(chalk.red(`- Abnormal Pods: ${summary.pods.abnormal.length}`));

    if (summary.pods.restarted.length > 0) {
      output.push('');
      output.push(chalk.bold('Pod Restarts:'));
      
      const restartTable = new Table({
        head: [
          chalk.bold('Pod Name'),
          chalk.bold('Namespace'),
          chalk.bold('Restarts'),
          chalk.bold('Reason'),
          chalk.bold('Last Restart')
        ],
        colWidths: [30, 20, 10, 20, 25]
      });

      for (const pod of summary.pods.restarted.slice(0, 10)) {
        restartTable.push([
          pod.name,
          pod.namespace,
          chalk.red(pod.restartCount.toString()),
          pod.reason || 'Unknown',
          pod.lastRestartTime ? pod.lastRestartTime.toLocaleString() : 'Unknown'
        ]);
      }

      output.push(restartTable.toString());

      if (summary.pods.restarted.length > 10) {
        output.push(chalk.gray(`... and ${summary.pods.restarted.length - 10} more pods with restarts`));
      }
    }

    if (summary.pods.abnormal.length > 0) {
      output.push('');
      output.push(chalk.bold('Abnormal Pods:'));
      
      const abnormalTable = new Table({
        head: [
          chalk.bold('Pod Name'),
          chalk.bold('Namespace'),
          chalk.bold('Status'),
          chalk.bold('Reason')
        ],
        colWidths: [30, 20, 15, 30]
      });

      for (const pod of summary.pods.abnormal.slice(0, 10)) {
        abnormalTable.push([
          pod.name,
          pod.namespace,
          this.colorizeStatus(pod.status),
          pod.reason || 'Unknown'
        ]);
      }

      output.push(abnormalTable.toString());

      if (summary.pods.abnormal.length > 10) {
        output.push(chalk.gray(`... and ${summary.pods.abnormal.length - 10} more abnormal pods`));
      }
    }

    return output.join('\n');
  }

  private formatJobSummary(summary: SummaryData): string {
    const output: string[] = [];
    output.push(chalk.bold.yellow('## Job Health Summary'));
    output.push(chalk.green(`- Successful Jobs: ${summary.jobs.successful}`));
    output.push(chalk.red(`- Failed Jobs: ${summary.jobs.failed.length}`));
    output.push(chalk.blue(`- Active Jobs: ${summary.jobs.active}`));

    if (summary.jobs.failed.length > 0) {
      output.push('');
      output.push(chalk.bold('Failed Jobs:'));
      
      const jobTable = new Table({
        head: [
          chalk.bold('Job Name'),
          chalk.bold('Namespace'),
          chalk.bold('Duration'),
          chalk.bold('Failure Reason')
        ],
        colWidths: [30, 20, 15, 40]
      });

      for (const job of summary.jobs.failed.slice(0, 10)) {
        jobTable.push([
          job.name,
          job.namespace,
          job.duration || 'Unknown',
          job.failureReason || 'Unknown'
        ]);
      }

      output.push(jobTable.toString());

      if (summary.jobs.failed.length > 10) {
        output.push(chalk.gray(`... and ${summary.jobs.failed.length - 10} more failed jobs`));
      }
    }

    return output.join('\n');
  }

  private formatEventSummary(summary: SummaryData): string {
    const output: string[] = [];
    output.push(chalk.bold.yellow('## Event Summary'));
    output.push(chalk.yellow(`- Warning Events: ${summary.events.warnings.length}`));
    output.push(chalk.gray(`- Total Events: ${summary.events.total}`));

    if (summary.events.warnings.length > 0) {
      output.push('');
      output.push(chalk.bold('Top Warning Events:'));
      
      const eventTable = new Table({
        head: [
          chalk.bold('Reason'),
          chalk.bold('Count'),
          chalk.bold('Object'),
          chalk.bold('Last Seen')
        ],
        colWidths: [25, 8, 30, 25]
      });

      for (const event of summary.events.warnings.slice(0, 10)) {
        const objectName = `${event.involvedObject.kind}/${event.involvedObject.name}`;
        eventTable.push([
          event.reason,
          chalk.red(event.count.toString()),
          objectName,
          event.lastTime.toLocaleString()
        ]);
      }

      output.push(eventTable.toString());

      if (summary.events.warnings.length > 10) {
        output.push(chalk.gray(`... and ${summary.events.warnings.length - 10} more warning events`));
      }
    }

    return output.join('\n');
  }

  private formatInsights(insights: string[]): string {
    const output: string[] = [];
    output.push(chalk.bold.magenta('## Key Insights'));
    
    for (const insight of insights) {
      output.push(chalk.cyan(`• ${insight}`));
    }

    return output.join('\n');
  }

  private colorizeStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return chalk.yellow(status);
      case 'failed':
        return chalk.red(status);
      case 'unknown':
        return chalk.gray(status);
      default:
        return status;
    }
  }
}