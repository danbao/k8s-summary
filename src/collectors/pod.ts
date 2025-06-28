import * as k8s from '@kubernetes/client-node';
import { K8sClient } from '../utils/k8s-client';
import { PodRestart } from '../types';

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

  async collectAbnormalPods(namespace?: string) {
    const abnormalPods: Array<{
      name: string;
      namespace: string;
      status: string;
      reason?: string;
    }> = [];
    
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
            reason
          });
        }
      }
    } catch (error) {
      console.error('Error collecting abnormal pods:', error);
    }

    return abnormalPods;
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