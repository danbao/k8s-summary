export interface PodRestart {
  name: string;
  namespace: string;
  restartCount: number;
  lastRestartTime?: Date;
  reason?: string;
  containerName?: string;
}

export interface JobStatus {
  name: string;
  namespace: string;
  status: 'succeeded' | 'failed' | 'active';
  startTime?: Date;
  completionTime?: Date;
  duration?: string;
  failureReason?: string;
}

export interface EventInfo {
  type: string;
  reason: string;
  message: string;
  count: number;
  firstTime: Date;
  lastTime: Date;
  involvedObject: {
    kind: string;
    name: string;
    namespace?: string;
  };
}

export interface SummaryData {
  timeRange: {
    start: Date;
    end: Date;
  };
  pods: {
    total: number;
    restarted: PodRestart[];
    abnormal: Array<{
      name: string;
      namespace: string;
      status: string;
      reason?: string;
    }>;
  };
  jobs: {
    successful: number;
    failed: JobStatus[];
    active: number;
  };
  events: {
    warnings: EventInfo[];
    total: number;
  };
}

export interface CLIOptions {
  hours?: number;
  namespace?: string;
  format?: 'console' | 'json' | 'markdown';
  output?: string;
  kubeconfig?: string;
}