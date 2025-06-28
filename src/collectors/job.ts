import * as k8s from '@kubernetes/client-node';
import { K8sClient } from '../utils/k8s-client';
import { JobStatus } from '../types';

export class JobCollector {
  private client: K8sClient;

  constructor(client: K8sClient) {
    this.client = client;
  }

  async collectJobs(hoursBack: number = 24, namespace?: string): Promise<{
    successful: number;
    failed: JobStatus[];
    active: number;
  }> {
    const batchV1 = this.client.getBatchV1Api();
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    let successful = 0;
    let active = 0;
    const failed: JobStatus[] = [];

    try {
      const response = namespace 
        ? await batchV1.listNamespacedJob(namespace)
        : await batchV1.listJobForAllNamespaces();
      
      const jobs = response.body.items;

      for (const job of jobs) {
        const startTime = job.status?.startTime ? new Date(job.status.startTime) : undefined;
        const completionTime = job.status?.completionTime ? new Date(job.status.completionTime) : undefined;
        
        if (startTime && startTime < cutoffTime && !completionTime) {
          continue;
        }

        const jobInfo: JobStatus = {
          name: job.metadata?.name || 'unknown',
          namespace: job.metadata?.namespace || 'default',
          status: 'active',
          startTime,
          completionTime
        };

        if (completionTime && startTime) {
          const duration = Math.round((completionTime.getTime() - startTime.getTime()) / 1000);
          jobInfo.duration = this.formatDuration(duration);
        }

        if (job.status?.succeeded && job.status.succeeded > 0) {
          jobInfo.status = 'succeeded';
          successful++;
        } else if (job.status?.failed && job.status.failed > 0) {
          jobInfo.status = 'failed';
          jobInfo.failureReason = this.getJobFailureReason(job);
          failed.push(jobInfo);
        } else if (job.status?.active && job.status.active > 0) {
          jobInfo.status = 'active';
          active++;
        }
      }
    } catch (error) {
      console.error('Error collecting jobs:', error);
    }

    return {
      successful,
      failed: failed.sort((a, b) => (b.startTime?.getTime() || 0) - (a.startTime?.getTime() || 0)),
      active
    };
  }

  async collectCronJobs(namespace?: string): Promise<Array<{
    name: string;
    namespace: string;
    schedule: string;
    lastScheduleTime?: Date;
    active: number;
    suspended: boolean;
  }>> {
    const batchV1 = this.client.getBatchV1Api();
    const cronJobs: Array<{
      name: string;
      namespace: string;
      schedule: string;
      lastScheduleTime?: Date;
      active: number;
      suspended: boolean;
    }> = [];

    try {
      const response = namespace 
        ? await batchV1.listNamespacedCronJob(namespace)
        : await batchV1.listCronJobForAllNamespaces();
      
      const jobs = response.body.items;

      for (const cronJob of jobs) {
        cronJobs.push({
          name: cronJob.metadata?.name || 'unknown',
          namespace: cronJob.metadata?.namespace || 'default',
          schedule: cronJob.spec?.schedule || 'unknown',
          lastScheduleTime: cronJob.status?.lastScheduleTime ? new Date(cronJob.status.lastScheduleTime) : undefined,
          active: cronJob.status?.active?.length || 0,
          suspended: cronJob.spec?.suspend || false
        });
      }
    } catch (error) {
      console.error('Error collecting cron jobs:', error);
    }

    return cronJobs;
  }

  private getJobFailureReason(job: k8s.V1Job): string | undefined {
    if (job.status?.conditions) {
      for (const condition of job.status.conditions) {
        if (condition.type === 'Failed' && condition.status === 'True') {
          return condition.reason || condition.message;
        }
      }
    }
    return 'Unknown failure reason';
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}