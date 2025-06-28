import * as k8s from '@kubernetes/client-node';
import { K8sClient } from '../utils/k8s-client';
import { EventInfo } from '../types';

export class EventCollector {
  private client: K8sClient;

  constructor(client: K8sClient) {
    this.client = client;
  }

  async collectEvents(hoursBack: number = 24, namespace?: string): Promise<{
    warnings: EventInfo[];
    total: number;
  }> {
    const coreV1 = this.client.getCoreV1Api();
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    const warnings: EventInfo[] = [];
    let total = 0;

    try {
      const response = namespace 
        ? await coreV1.listNamespacedEvent(namespace)
        : await coreV1.listEventForAllNamespaces();
      
      const events = response.body.items;

      const eventMap = new Map<string, EventInfo>();

      for (const event of events) {
        const eventTime = event.lastTimestamp ? new Date(event.lastTimestamp) : 
                         event.eventTime ? new Date(event.eventTime) : new Date();
        
        if (eventTime < cutoffTime) continue;
        
        total++;

        if (event.type === 'Warning') {
          const key = `${event.reason}-${event.involvedObject?.name}-${event.involvedObject?.namespace}`;
          
          if (eventMap.has(key)) {
            const existing = eventMap.get(key)!;
            existing.count++;
            if (eventTime > existing.lastTime) {
              existing.lastTime = eventTime;
            }
            if (eventTime < existing.firstTime) {
              existing.firstTime = eventTime;
            }
          } else {
            const eventInfo: EventInfo = {
              type: event.type || 'Unknown',
              reason: event.reason || 'Unknown',
              message: event.message || '',
              count: event.count || 1,
              firstTime: event.firstTimestamp ? new Date(event.firstTimestamp) : eventTime,
              lastTime: eventTime,
              involvedObject: {
                kind: event.involvedObject?.kind || 'Unknown',
                name: event.involvedObject?.name || 'Unknown',
                namespace: event.involvedObject?.namespace
              }
            };
            eventMap.set(key, eventInfo);
          }
        }
      }

      warnings.push(...Array.from(eventMap.values()));
      warnings.sort((a, b) => b.count - a.count);

    } catch (error) {
      console.error('Error collecting events:', error);
    }

    return {
      warnings,
      total
    };
  }

  async getEventStats(hoursBack: number = 24, namespace?: string): Promise<{
    [reason: string]: number;
  }> {
    const { warnings } = await this.collectEvents(hoursBack, namespace);
    const stats: { [reason: string]: number } = {};

    for (const warning of warnings) {
      stats[warning.reason] = (stats[warning.reason] || 0) + warning.count;
    }

    return stats;
  }
}