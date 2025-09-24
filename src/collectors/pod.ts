import * as k8s from '@kubernetes/client-node';
import { K8sClient } from '../utils/k8s-client';
import { PodRestart, PodHealthRecord, PodPhaseSummary } from '../types';

export class PodCollector {
  private client: K8sClient;

  constructor(client: K8sClient) {
    this.client = client;
  }

  async collectPodRestarts(hoursBack: number = 24, namespace?: string): Promise<PodRestart[]> {
    const restarts: PodRestart[] = [];
    const coreV1 = this.client.getCoreV1Api();
    
    try {
      const response = namespace 
        ? await coreV1.listNamespacedPod(namespace)
        : await coreV1.listPodForAllNamespaces();
      
      const pods = response.body.items;
      const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      for (const pod of pods) {
        if (!pod.status?.containerStatuses) continue;

        for (const containerStatus of pod.status.containerStatuses) {
          const restartCount = containerStatus.restartCount || 0;
          
          if (restartCount > 0) {
            let lastRestartTime: Date | undefined;
            let reason: string | undefined;

            if (containerStatus.lastState?.terminated) {
              const terminatedTime = containerStatus.lastState.terminated.finishedAt;
              if (terminatedTime) {
                lastRestartTime = new Date(terminatedTime);
                reason = containerStatus.lastState.terminated.reason;
              }
            }

            if (!lastRestartTime || lastRestartTime >= cutoffTime) {
              restarts.push({
                name: pod.metadata?.name || 'unknown',
                namespace: pod.metadata?.namespace || 'default',
                restartCount,
                lastRestartTime,
                reason,
                containerName: containerStatus.name
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error collecting pod restarts:', error);
    }

    return restarts.sort((a, b) => b.restartCount - a.restartCount);
  }

  async collectAbnormalPods(namespace?: string): Promise<PodHealthRecord[]> {
    const abnormalPods: PodHealthRecord[] = [];
    
    const coreV1 = this.client.getCoreV1Api();
    
    try {
      const response = namespace 
        ? await coreV1.listNamespacedPod(namespace)
        : await coreV1.listPodForAllNamespaces();
      
      const pods = response.body.items;
      const abnormalStatuses = ['Pending', 'Failed', 'Unknown'];

      for (const pod of pods) {
        const phase = pod.status?.phase;
        if (phase && abnormalStatuses.includes(phase)) {
          let reason: string | undefined;
          
          if (pod.status?.containerStatuses) {
            for (const containerStatus of pod.status.containerStatuses) {
              if (containerStatus.state?.waiting) {
                reason = containerStatus.state.waiting.reason;
                break;
              } else if (containerStatus.state?.terminated) {
                reason = containerStatus.state.terminated.reason;
                break;
              }
            }
          }

          abnormalPods.push({
            name: pod.metadata?.name || 'unknown',
            namespace: pod.metadata?.namespace || 'default',
            status: phase,
            reason,
            nodeName: pod.spec?.nodeName,
            startTime: pod.status?.startTime ? new Date(pod.status.startTime) : undefined
          });
        }
      }
    } catch (error) {
      console.error('Error collecting abnormal pods:', error);
    }

    return abnormalPods;
  }

  async collectPodPhaseBreakdown(namespace?: string): Promise<PodPhaseSummary[]> {
    const breakdownMap = new Map<string, number>();
    const coreV1 = this.client.getCoreV1Api();

    try {
      const response = namespace
        ? await coreV1.listNamespacedPod(namespace)
        : await coreV1.listPodForAllNamespaces();

      for (const pod of response.body.items) {
        const phase = pod.status?.phase || 'Unknown';
        breakdownMap.set(phase, (breakdownMap.get(phase) || 0) + 1);
      }
    } catch (error) {
      console.error('Error collecting pod phase breakdown:', error);
    }

    return Array.from(breakdownMap.entries())
      .map(([phase, count]) => ({ phase, count }))
      .sort((a, b) => a.phase.localeCompare(b.phase));
  }

  async getTotalPodCount(namespace?: string): Promise<number> {
    const coreV1 = this.client.getCoreV1Api();
    
    try {
      const response = namespace 
        ? await coreV1.listNamespacedPod(namespace)
        : await coreV1.listPodForAllNamespaces();
      
      return response.body.items.length;
    } catch (error) {
      console.error('Error getting total pod count:', error);
      return 0;
    }
  }
}
