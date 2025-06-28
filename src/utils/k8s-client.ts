import * as k8s from '@kubernetes/client-node';

export class K8sClient {
  private kc: k8s.KubeConfig;
  private coreV1Api: k8s.CoreV1Api;
  private batchV1Api: k8s.BatchV1Api;
  private appsV1Api: k8s.AppsV1Api;

  constructor(kubeconfigPath?: string) {
    this.kc = new k8s.KubeConfig();
    
    if (kubeconfigPath) {
      this.kc.loadFromFile(kubeconfigPath);
    } else {
      this.kc.loadFromDefault();
    }

    this.coreV1Api = this.kc.makeApiClient(k8s.CoreV1Api);
    this.batchV1Api = this.kc.makeApiClient(k8s.BatchV1Api);
    this.appsV1Api = this.kc.makeApiClient(k8s.AppsV1Api);
  }

  getCoreV1Api(): k8s.CoreV1Api {
    return this.coreV1Api;
  }

  getBatchV1Api(): k8s.BatchV1Api {
    return this.batchV1Api;
  }

  getAppsV1Api(): k8s.AppsV1Api {
    return this.appsV1Api;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.coreV1Api.listNamespace();
      return true;
    } catch (error) {
      console.error('Failed to connect to Kubernetes cluster:', error);
      return false;
    }
  }
}