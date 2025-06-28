# K8S 每日状态摘要 CLI

[English](./README.md) | 中文 | [快速开始](./QUICK_START.md)

一个基于 TypeScript 开发的命令行工具，用于收集和汇总 Kubernetes 集群的每日运行状态。此工具通过分析 Pod 重启、Job 失败和警告事件，帮助您快速了解 K8s 集群的健康状况。

## ✨ 核心功能

- **Pod 状态监控** 📊
  - 追踪 Pod 重启次数和重启原因（OOMKilled、CrashLoopBackOff 等）
  - 监控异常状态的 Pod（Pending、Failed、Unknown）
  - 显示重启时间和所属命名空间
  
- **Job 健康分析** 🔍
  - 统计成功/失败的 Job 数量
  - 详细显示失败 Job 的失败原因和执行时长
  - 支持 CronJob 执行状态分析
  
- **事件聚合分析** ⚠️
  - 收集和汇总 Warning 级别事件
  - 按事件类型分组统计
  - 显示事件发生频率和最近发生时间
  
- **多种输出格式** 📄
  - **终端输出**：彩色表格，直观易读
  - **JSON 格式**：便于程序化处理和集成
  - **Markdown 格式**：适合生成报告文档
  
- **灵活配置选项** ⚙️
  - 自定义时间范围（默认 24 小时）
  - 命名空间过滤
  - 自定义 kubeconfig 路径
  - 支持输出到文件

## 🛠️ 安装说明

### 环境要求
- Node.js 16+ 和 npm
- 可访问的 Kubernetes 集群
- 有效的 kubeconfig 文件
- 适当的 RBAC 权限

### 安装步骤

```bash
# 克隆或下载项目
cd k8s-summary

# 安装依赖
npm install

# 构建项目
npm run build
```

## 🚀 使用指南

### 基本使用

```bash
# 分析最近 24 小时（默认）
npm run summary

# 或者使用构建后的二进制文件
./dist/index.js

# 或者直接运行开发模式
npm run dev
```

### 高级选项

```bash
# 指定时间范围
npm run dev -- --hours 48

# 分析特定命名空间
npm run dev -- --namespace production

# 输出为 JSON 格式
npm run dev -- --format json --output summary.json

# 输出为 Markdown 格式
npm run dev -- --format markdown --output report.md

# 使用自定义 kubeconfig
npm run dev -- --kubeconfig ~/.kube/config-prod

# 组合多个选项
npm run dev -- --hours 12 --namespace default --format markdown --output daily-report.md
```

### 命令行参数

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `-h, --hours` | 向前追溯的小时数 | 24 | `--hours 48` |
| `-n, --namespace` | 指定要分析的命名空间 | 全部 | `--namespace production` |
| `-f, --format` | 输出格式：console/json/markdown | console | `--format json` |
| `-o, --output` | 输出文件路径 | 无（终端输出） | `--output report.md` |
| `-k, --kubeconfig` | kubeconfig 文件路径 | 默认位置 | `--kubeconfig ~/.kube/config` |

## 📋 输出示例

### 终端格式输出
```
=== K8S Daily Summary Report ===
时间范围: 2024-03-20 00:00 - 2024-03-21 00:00

## Pod 状态摘要
- 总 Pod 数量: 150
- 重启的 Pod: 5
- 异常状态 Pod: 2

Pod 重启详情:
┌──────────────────────────────┬────────────────────┬──────────┬──────────────────────┬─────────────────────────┐
│ Pod 名称                      │ 命名空间            │ 重启次数  │ 重启原因              │ 最后重启时间             │
├──────────────────────────────┼────────────────────┼──────────┼──────────────────────┼─────────────────────────┤
│ app-backend-xyz              │ default            │ 3        │ OOMKilled            │ 2024/3/20 10:30:00     │
│ worker-abc                   │ jobs               │ 2        │ Error                │ 2024/3/20 09:15:00     │
└──────────────────────────────┴────────────────────┴──────────┴──────────────────────┴─────────────────────────┘

## Job 健康状况摘要
- 成功的 Job: 45
- 失败的 Job: 2
- 活跃的 Job: 3

失败的 Job 详情:
┌──────────────────────────────┬────────────────────┬──────────┬──────────────────────────────────────┐
│ Job 名称                      │ 命名空间            │ 执行时长  │ 失败原因                              │
├──────────────────────────────┼────────────────────┼──────────┼──────────────────────────────────────┤
│ data-sync-job                │ default            │ 15m 30s  │ BackoffLimitExceeded                 │
│ backup-job                   │ backup             │ 1h 5m    │ DeadlineExceeded                     │
└──────────────────────────────┴────────────────────┴──────────┴──────────────────────────────────────┘

## 事件摘要
- 警告事件: 12
- 总事件数: 156

## 关键洞察
• 发现 5 个 Pod 重启（总计 8 次重启）
• 1 个 Pod 因 OOMKilled 重启 - 建议增加内存限制
• 最常见的警告: "BackOff" (5 次出现)
```

### JSON 格式输出
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
    "发现 5 个 Pod 重启（总计 8 次重启）",
    "1 个 Pod 因 OOMKilled 重启 - 建议增加内存限制"
  ]
}
```

## 🔐 Kubernetes 权限要求

您的服务账户或用户需要以下权限：

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

应用权限：
```bash
kubectl apply -f rbac.yaml
kubectl create clusterrolebinding k8s-summary-binding \
  --clusterrole=k8s-summary-reader \
  --user=<your-username>
```

## 🏗️ 项目架构

```
k8s-summary/
├── src/
│   ├── index.ts              # CLI 入口点
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts
│   ├── collectors/           # 数据收集模块
│   │   ├── pod.ts           # Pod 状态收集器
│   │   ├── job.ts           # Job 健康监控器
│   │   └── event.ts         # 事件收集器
│   ├── analyzers/           # 数据分析模块
│   │   └── summary.ts       # 摘要分析器
│   ├── formatters/          # 输出格式化器
│   │   ├── console.ts       # 终端彩色输出
│   │   └── markdown.ts      # Markdown 格式输出
│   └── utils/              # 工具函数
│       └── k8s-client.ts   # Kubernetes 客户端封装
├── dist/                   # 编译后的 JavaScript 文件
├── scripts/               # 辅助脚本
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 开发指南

### 开发环境设置

```bash
# 开发模式运行
npm run dev

# 构建项目
npm run build

# 运行构建后的版本
npm start

# 测试项目结构
node scripts/test-structure.js
```

### 核心组件说明

1. **数据收集器 (Collectors)**
   - `PodCollector`: 收集 Pod 重启和异常状态
   - `JobCollector`: 监控 Job 和 CronJob 健康状况
   - `EventCollector`: 聚合集群事件

2. **数据分析器 (Analyzers)**
   - `SummaryAnalyzer`: 生成综合摘要和智能洞察

3. **格式化器 (Formatters)**
   - `ConsoleFormatter`: 生成彩色终端输出
   - `MarkdownFormatter`: 生成 Markdown 报告

## ❗ 故障排除

### 连接问题
```bash
# 检查集群连接
kubectl cluster-info

# 验证 kubeconfig
kubectl config current-context

# 测试权限
kubectl auth can-i list pods --all-namespaces
```

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `ECONNREFUSED` | 无法连接到集群 | 检查网络和 kubeconfig |
| `Forbidden` | 权限不足 | 配置正确的 RBAC 权限 |
| `No data returned` | 时间范围内无数据 | 调整时间范围或检查集群活动 |
| `Namespace not found` | 指定的命名空间不存在 | 使用 `kubectl get ns` 确认命名空间 |

### 调试模式
```bash
# 启用详细日志
DEBUG=k8s-summary npm run dev

# 测试特定组件
npm run dev -- --namespace kube-system --hours 1
```

## 🎯 使用场景

### 1. 每日健康检查
```bash
# 生成每日报告
npm run dev -- --format markdown --output "reports/daily-$(date +%Y%m%d).md"
```

### 2. 故障排查
```bash
# 分析最近 2 小时的问题
npm run dev -- --hours 2 --namespace production
```

### 3. 定期监控
```bash
# 集成到 cron 作业
0 9 * * * cd /path/to/k8s-summary && npm run dev -- --format json --output /var/log/k8s-summary.json
```

### 4. CI/CD 集成
```bash
# 在部署后检查集群状态
npm run dev -- --hours 1 --format json | jq '.summary.pods.restarted | length'
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 开发规范
- 使用 TypeScript 进行类型安全开发
- 遵循现有的代码风格
- 添加适当的错误处理
- 为新功能编写测试

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Kubernetes JavaScript Client](https://github.com/kubernetes-client/javascript)
- [Commander.js](https://github.com/tj/commander.js)
- [cli-table3](https://github.com/cli-table/cli-table3)
- [Chalk](https://github.com/chalk/chalk)

---

如果这个工具对您有帮助，请给个 ⭐ Star！