import * as k8s from '@kubernetes/client-node';
import * as fs from 'fs';
import { execSync } from 'child_process';

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

  /**
   * Best-effort resolve current namespace from kubeconfig context or in-cluster serviceaccount.
   * Returns undefined if not specified (defaults to "default" at API server).
   */
  getCurrentContextNamespace(): string | undefined {
    try {
      const ctxName = this.kc.getCurrentContext();
      const ctx = this.kc.getContextObject(ctxName || '');
      if (ctx && ctx.namespace) {
        return ctx.namespace;
      }
    } catch (_) {
      // ignore
    }

    // Attempt in-cluster namespace file if present
    try {
      const nsPath = (k8s as any).Config?.SERVICEACCOUNT_NAMESPACE_PATH;
      if (nsPath && fs.existsSync(nsPath)) {
        const ns = fs.readFileSync(nsPath, 'utf8').trim();
        if (ns) return ns;
      }
    } catch (_) {
      // ignore
    }

    // Fallback to kubectl current-context namespace if available
    try {
      const out = execSync("kubectl config view --minify --output jsonpath='{..namespace}'", { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim()
        .replace(/^'|'$/g, '');
      if (out) return out;
    } catch (_) {
      // ignore
    }

    return undefined;
  }

  async testConnection(namespace?: string): Promise<boolean> {
    try {
      if (namespace) {
        // Use a namespaced, read-only call that works with namespace-scoped RBAC
        await this.coreV1Api.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, undefined, 1);
      } else {
        // Fallback: cluster-scope check when no namespace is provided
        await this.coreV1Api.listNamespace();
      }
      return true;
    } catch (error) {
      console.error('Failed to connect to Kubernetes cluster:', error);
      return false;
    }
  }
}
