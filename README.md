# K8S Daily Summary CLI

`k8s-daily-summary` 是一个用 TypeScript 编写的 Kubernetes 巡检 CLI，可以在指定时间窗口内汇总 Pod、Job 与 Event 的关键指标，并以终端彩色表格、JSON、Markdown 或 HTML 的形式输出健康报告。

## 亮点功能
- **Pod 健康**：统计总量、阶段分布，列出发生重启、处于异常或失败状态的 Pod，并展示重启原因与时间。
- **批处理作业**：统计成功/失败/活跃的 Job，为失败 Job 给出执行时长与失败原因。
- **事件告警**：聚合 Warning 级别事件，呈现出现次数、关联对象以及最近发生时间。
- **智能洞察**：自动生成 OOMKilled、CrashLoopBackOff 等高频问题提示，帮助快速定位风险。
- **多格式输出**：支持 `console`、`json`、`markdown`、`html` 四种格式，可通过 `--output` 将结果落盘。
- **灵活连接**：默认读取本地 kubeconfig，也支持通过 `--kubeconfig` 指定路径。

## 快速开始
```bash
npm install
npm run build

# 以开发模式运行，统计最近 24 小时的所有命名空间
npm run dev
```

常用命令示例：
```bash
# 指定时间范围与命名空间
npm run dev -- --hours 12 --namespace production

# 以 JSON 输出供自动化脚本解析
npm run dev -- --format json

# 生成 Markdown 报告并写入文件
npm run dev -- --format markdown --output reports/daily.md

# 生成 HTML 仪表板
npm run dev -- --format html --output reports/daily.html
```

## 命令行参数
| 参数 | 说明 | 默认值 |
|------|------|---------|
| `-h, --hours <number>` | 统计过去 N 小时的数据，必须为正整数 | 24 |
| `-n, --namespace <string>` | 仅分析指定命名空间 | 所有命名空间 |
| `-f, --format <format>` | 输出格式：`console` / `json` / `markdown` / `html` | `console` |
| `-o, --output <file>` | 将结果写入指定文件路径 | 直接输出到终端 |
| `-k, --kubeconfig <path>` | 指定 kubeconfig 文件 | 从默认位置加载 |

## 运行时细节
- 连接测试：工具会先调用 Kubernetes API 列出命名空间验证连通性，失败时会立即退出并提示检查权限或 kubeconfig。
- 环境变量：设置 `K8S_SUMMARY_SKIP_CONNECT=1` 可跳过集群连接流程（便于离线测试）。
- 数据采集：Pod、Job、Event 统计会并发执行，可在较大集群中保持良好速度。

## 文档
- 项目功能与使用说明：[`docs/功能与使用说明.md`](./docs/功能与使用说明.md)

## 开发与测试
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行结构校验
node scripts/test-structure.js

# HTML Formatter 快速测试
K8S_SUMMARY_SKIP_CONNECT=1 npm run dev -- --format html
```

欢迎基于 `src/analyzers/summary.ts`、`src/collectors/*` 与 `src/formatters/*` 扩展更多数据源或输出格式，提交改进建议或 PR！
