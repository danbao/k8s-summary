import assert from 'node:assert/strict';
import { HtmlFormatter } from '../src/formatters/html';
import { SummaryData } from '../src/types';

const now = new Date('2024-06-01T12:00:00Z');
const earlier = new Date('2024-06-01T00:00:00Z');

const summary: SummaryData = {
  timeRange: {
    start: earlier,
    end: now
  },
  context: {
    namespace: 'production',
    hours: 12
  },
  pods: {
    total: 5,
    restarted: [
      {
        name: 'api-gateway-1',
        namespace: 'production',
        restartCount: 4,
        reason: 'CrashLoopBackOff',
        containerName: 'gateway',
        lastRestartTime: now
      }
    ],
    abnormal: [
      {
        name: 'checkout-service-0',
        namespace: 'production',
        status: 'Pending',
        reason: 'ImagePullBackOff',
        nodeName: 'node-a',
        startTime: earlier
      }
    ],
    failed: [
      {
        name: 'billing-service-2',
        namespace: 'production',
        status: 'Failed',
        reason: 'OOMKilled',
        nodeName: 'node-b',
        startTime: earlier
      }
    ],
    statusBreakdown: [
      { phase: 'Running', count: 3 },
      { phase: 'Failed', count: 2 }
    ]
  },
  jobs: {
    successful: 7,
    failed: [
      {
        name: 'daily-settlement',
        namespace: 'production',
        status: 'failed',
        duration: '5m20s',
        failureReason: 'DeadlineExceeded'
      }
    ],
    active: 1
  },
  events: {
    warnings: [
      {
        type: 'Warning',
        reason: 'BackOff',
        message: 'Back-off restarting failed container gateway in pod api-gateway-1',
        count: 6,
        firstTime: earlier,
        lastTime: now,
        involvedObject: {
          kind: 'Pod',
          name: 'api-gateway-1',
          namespace: 'production'
        }
      }
    ],
    total: 9
  }
};

const formatter = new HtmlFormatter();
const html = formatter.formatSummary(summary, ['1 failed pod requires investigation']);

assert.ok(html.includes('K8S Daily Summary Report'), 'should render report title');
assert.ok(html.includes('Namespace: production'), 'should include namespace context');
assert.ok(html.includes('🚨 Failed Pods'), 'should render failed pod section header');
assert.ok(/class=\"failed\"[\s\S]*billing-service-2/.test(html), 'failed pod rows should be highlighted');
assert.ok(html.includes('Recommended Metrics to Watch'), 'should render recommended metrics section');
assert.ok(html.includes('CrashLoopBackOff occurrences per workload'), 'recommended metrics list should include workload stability item');
assert.ok(html.includes('1 failed pod requires investigation'), 'insights should be rendered');

console.log('✓ HtmlFormatter renders expected sections');
