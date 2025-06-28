# K8S Daily Summary Report

**Time Range:** 2024-03-20 00:00:00 - 2024-03-21 00:00:00

## Pod Status Summary

- **Total Pods:** 150
- **Restarted Pods:** 5
- **Abnormal Pods:** 2

### Pod Restarts

| Pod Name | Namespace | Restarts | Reason | Last Restart |
|----------|-----------|----------|--------|--------------|
| app-backend-xyz | default | 3 | OOMKilled | 2024/3/20 10:30:00 |
| worker-abc | jobs | 2 | Error | 2024/3/20 09:15:00 |
| frontend-pod-123 | web | 1 | CrashLoopBackOff | 2024/3/20 08:45:00 |

### Abnormal Pods

| Pod Name | Namespace | Status | Reason |
|----------|-----------|--------|--------|
| stuck-pod-456 | default | Pending | Insufficient memory |
| failed-job-789 | batch | Failed | ImagePullBackOff |

## Job Health Summary

- **Successful Jobs:** 45
- **Failed Jobs:** 2
- **Active Jobs:** 3

### Failed Jobs

| Job Name | Namespace | Duration | Failure Reason |
|----------|-----------|----------|----------------|
| data-sync-job | default | 15m 30s | BackoffLimitExceeded |
| backup-job | backup | 1h 5m | DeadlineExceeded |

## Event Summary

- **Warning Events:** 12
- **Total Events:** 156

### Top Warning Events

| Reason | Count | Object | Last Seen |
|--------|-------|--------|-----------|
| BackOff | 5 | Pod/app-backend-xyz | 2024/3/20 10:35:00 |
| FailedScheduling | 3 | Pod/stuck-pod-456 | 2024/3/20 09:20:00 |
| FailedMount | 2 | Pod/storage-pod | 2024/3/20 08:15:00 |

## Key Insights

- Found 5 pods with restarts (total: 6 restarts)
- 1 pods were OOMKilled - consider increasing memory limits
- 1 pods in CrashLoopBackOff - check application logs
- 2 pods in abnormal state require attention
- 2 jobs failed - review job configurations and logs
- Most common warning: "BackOff" (5 occurrences)