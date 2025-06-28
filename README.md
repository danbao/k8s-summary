# K8S Daily Summary CLI

English | [中文](./README_CN.md) | [Quick Start](./QUICK_START.md)

A TypeScript-based command-line tool for collecting and summarizing daily Kubernetes cluster status. This tool helps you quickly understand the health of your K8s cluster by analyzing pod restarts, job failures, and warning events.

## ✨ Features

- **Pod Status Monitoring** 📊
  - Track pod restarts with detailed reasons (OOMKilled, CrashLoopBackOff, etc.)
  - Monitor abnormal pod states (Pending, Failed, Unknown)
  - Display restart times and associated namespaces
  
- **Job Health Analysis** 🔍
  - Statistics on successful/failed jobs
  - Detailed failure reasons and execution duration
  - CronJob execution status analysis
  
- **Event Aggregation** ⚠️
  - Collect and summarize Warning-level events
  - Group events by type and count occurrences
  - Show event frequency and recent occurrence times
  
- **Multiple Output Formats** 📄
  - **Console**: Colorized tables for terminal viewing
  - **JSON**: Machine-readable format for integration
  - **Markdown**: Perfect for generating reports
  
- **Flexible Configuration** ⚙️
  - Customizable time ranges (default 24 hours)
  - Namespace filtering
  - Custom kubeconfig paths
  - File output support

## 🛠️ Installation

### Prerequisites
- Node.js 16+ and npm
- Access to a Kubernetes cluster
- Valid kubeconfig file
- Appropriate RBAC permissions

### Setup

```bash
# Clone or download the project
cd k8s-summary

# Install dependencies
npm install

# Build the project
npm run build
```

## 🚀 Usage

### Basic Usage

```bash
# Analyze last 24 hours (default)
npm run summary

# Or use the built binary
./dist/index.js

# Or run in development mode
npm run dev
```

### Advanced Options

```bash
# Analyze specific time range
npm run dev -- --hours 48

# Focus on specific namespace
npm run dev -- --namespace production

# Output to JSON format
npm run dev -- --format json --output summary.json

# Output to Markdown
npm run dev -- --format markdown --output report.md

# Use custom kubeconfig
npm run dev -- --kubeconfig ~/.kube/config-prod

# Combine multiple options
npm run dev -- --hours 12 --namespace default --format markdown --output daily-report.md
```

### Command Line Options

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `-h, --hours` | Number of hours to look back | 24 | `--hours 48` |
| `-n, --namespace` | Specific namespace to analyze | All | `--namespace production` |
| `-f, --format` | Output format: console/json/markdown | console | `--format json` |
| `-o, --output` | Output file path | None (terminal) | `--output report.md` |
| `-k, --kubeconfig` | Path to kubeconfig file | Default location | `--kubeconfig ~/.kube/config` |

## 📋 Example Output

### Console Format
```
=== K8S Daily Summary Report ===
Time Range: 2024-03-20 00:00 - 2024-03-21 00:00

## Pod Status Summary
- Total Pods: 150
- Restarted Pods: 5
- Abnormal Pods: 2

Pod Restarts:
┌──────────────────────────────┬────────────────────┬──────────┬──────────────────────┬─────────────────────────┐
│ Pod Name                     │ Namespace          │ Restarts │ Reason               │ Last Restart            │
├──────────────────────────────┼────────────────────┼──────────┼──────────────────────┼─────────────────────────┤
│ app-backend-xyz              │ default            │ 3        │ OOMKilled            │ 3/20/2024, 10:30:00 AM │
│ worker-abc                   │ jobs               │ 2        │ Error                │ 3/20/2024, 9:15:00 AM  │
└──────────────────────────────┴────────────────────┴──────────┴──────────────────────┴─────────────────────────┘

## Job Health Summary
- Successful Jobs: 45
- Failed Jobs: 2
- Active Jobs: 3

Failed Jobs:
┌──────────────────────────────┬────────────────────┬──────────┬──────────────────────────────────────┐
│ Job Name                     │ Namespace          │ Duration │ Failure Reason                       │
├──────────────────────────────┼────────────────────┼──────────┼──────────────────────────────────────┤
│ data-sync-job                │ default            │ 15m 30s  │ BackoffLimitExceeded                 │
│ backup-job                   │ backup             │ 1h 5m    │ DeadlineExceeded                     │
└──────────────────────────────┴────────────────────┴──────────┴──────────────────────────────────────┘

## Event Summary
- Warning Events: 12
- Total Events: 156

## Key Insights
• Found 5 pods with restarts (total: 8 restarts)
• 1 pods were OOMKilled - consider increasing memory limits
• Most common warning: "BackOff" (5 occurrences)
```

### JSON Format Output
```json
{
  "summary": {
    "timeRange": {
      "start": "2024-03-20T00:00:00.000Z",
      "end": "2024-03-21T00:00:00.000Z"
    },
    "pods": {
      "total": 150,
      "restarted": [
        {
          "name": "app-backend-xyz",
          "namespace": "default",
          "restartCount": 3,
          "reason": "OOMKilled",
          "lastRestartTime": "2024-03-20T10:30:00.000Z"
        }
      ],
      "abnormal": []
    },
    "jobs": {
      "successful": 45,
      "failed": [],
      "active": 3
    },
    "events": {
      "warnings": [],
      "total": 156
    }
  },
  "insights": [
    "Found 5 pods with restarts (total: 8 restarts)",
    "1 pods were OOMKilled - consider increasing memory limits"
  ]
}
```

## 🔐 Kubernetes Permissions

Your service account or user needs the following permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: k8s-summary-reader
rules:
- apiGroups: [""]
  resources: ["pods", "events", "namespaces"]
  verbs: ["get", "list"]
- apiGroups: ["batch"]
  resources: ["jobs", "cronjobs"]
  verbs: ["get", "list"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list"]
```

Apply the permissions:
```bash
kubectl apply -f rbac.yaml
kubectl create clusterrolebinding k8s-summary-binding \
  --clusterrole=k8s-summary-reader \
  --user=<your-username>
```

## 🏗️ Project Architecture

```
k8s-summary/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   ├── collectors/           # Data collection modules
│   │   ├── pod.ts           # Pod status collector
│   │   ├── job.ts           # Job health collector
│   │   └── event.ts         # Event collector
│   ├── analyzers/           # Data analysis modules
│   │   └── summary.ts       # Summary analyzer
│   ├── formatters/          # Output formatters
│   │   ├── console.ts       # Console output with colors
│   │   └── markdown.ts      # Markdown output
│   └── utils/              # Utility functions
│       └── k8s-client.ts   # Kubernetes client wrapper
├── dist/                   # Compiled JavaScript files
├── scripts/               # Helper scripts
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development

### Development Setup

```bash
# Run in development mode
npm run dev

# Build the project
npm run build

# Run the built version
npm start

# Test project structure
node scripts/test-structure.js
```

### Core Components

1. **Collectors**
   - `PodCollector`: Gathers pod restarts and abnormal states
   - `JobCollector`: Monitors job and cronjob health
   - `EventCollector`: Aggregates cluster events

2. **Analyzers**
   - `SummaryAnalyzer`: Generates comprehensive summaries and insights

3. **Formatters**
   - `ConsoleFormatter`: Creates colorized terminal output
   - `MarkdownFormatter`: Generates markdown reports

## ❗ Troubleshooting

### Connection Issues
```bash
# Check cluster connectivity
kubectl cluster-info

# Verify kubeconfig
kubectl config current-context

# Test permissions
kubectl auth can-i list pods --all-namespaces
```

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Cannot connect to cluster | Check network and kubeconfig |
| `Forbidden` | Insufficient permissions | Configure proper RBAC permissions |
| `No data returned` | No data in time range | Adjust time range or check cluster activity |
| `Namespace not found` | Specified namespace doesn't exist | Use `kubectl get ns` to verify namespaces |

### Debug Mode
```bash
# Enable verbose logging
DEBUG=k8s-summary npm run dev

# Test specific components
npm run dev -- --namespace kube-system --hours 1
```

## 🎯 Use Cases

### 1. Daily Health Checks
```bash
# Generate daily reports
npm run dev -- --format markdown --output "reports/daily-$(date +%Y%m%d).md"
```

### 2. Incident Investigation
```bash
# Analyze recent issues
npm run dev -- --hours 2 --namespace production
```

### 3. Scheduled Monitoring
```bash
# Integrate with cron jobs
0 9 * * * cd /path/to/k8s-summary && npm run dev -- --format json --output /var/log/k8s-summary.json
```

### 4. CI/CD Integration
```bash
# Check cluster status after deployments
npm run dev -- --hours 1 --format json | jq '.summary.pods.restarted | length'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow existing code style
- Add appropriate error handling
- Write tests for new features

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Kubernetes JavaScript Client](https://github.com/kubernetes-client/javascript)
- [Commander.js](https://github.com/tj/commander.js)
- [cli-table3](https://github.com/cli-table/cli-table3)
- [Chalk](https://github.com/chalk/chalk)

---

If this tool helps you, please give it a ⭐ Star!