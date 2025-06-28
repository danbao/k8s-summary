# K8S Daily Summary - Quick Start Guide

[English](#english) | [中文](#中文)

## English

### 🚀 5-Minute Setup

1. **Install Dependencies**
   ```bash
   npm install
   npm run build
   ```

2. **Test Connection**
   ```bash
   # Make sure you can connect to your cluster
   kubectl cluster-info
   ```

3. **Run Basic Summary**
   ```bash
   npm run summary
   ```

4. **Generate Report**
   ```bash
   # Generate a markdown report
   npm run dev -- --format markdown --output daily-report.md
   ```

### 📊 Common Commands

```bash
# Quick health check
npm run summary

# Last 2 hours analysis
npm run dev -- --hours 2

# Production namespace only
npm run dev -- --namespace production

# JSON output for automation
npm run dev -- --format json --output cluster-status.json

# Full report with markdown
npm run dev -- --hours 24 --format markdown --output reports/$(date +%Y%m%d)-summary.md
```

### ⚡ One-Liner for Daily Reports

Add to your crontab for daily reports:
```bash
# Daily at 9 AM
0 9 * * * cd /path/to/k8s-summary && npm run dev -- --format markdown --output /var/reports/k8s-daily-$(date +\%Y\%m\%d).md
```

---

## 中文

### 🚀 5分钟快速开始

1. **安装依赖**
   ```bash
   npm install
   npm run build
   ```

2. **测试连接**
   ```bash
   # 确保可以连接到集群
   kubectl cluster-info
   ```

3. **运行基本摘要**
   ```bash
   npm run summary
   ```

4. **生成报告**
   ```bash
   # 生成 markdown 报告
   npm run dev -- --format markdown --output daily-report.md
   ```

### 📊 常用命令

```bash
# 快速健康检查
npm run summary

# 分析最近2小时
npm run dev -- --hours 2

# 仅分析生产环境命名空间
npm run dev -- --namespace production

# JSON输出用于自动化
npm run dev -- --format json --output cluster-status.json

# 生成完整markdown报告
npm run dev -- --hours 24 --format markdown --output reports/$(date +%Y%m%d)-summary.md
```

### ⚡ 每日报告一键命令

添加到 crontab 实现每日自动报告：
```bash
# 每天上午9点
0 9 * * * cd /path/to/k8s-summary && npm run dev -- --format markdown --output /var/reports/k8s-daily-$(date +\%Y\%m\%d).md
```