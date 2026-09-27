export const INITIAL_INCIDENTS = [
  {
    id: "INC-4091",
    service: "Amazon RDS (PostgreSQL)",
    resourceId: "aurora-pg-cluster-prod-writer",
    region: "us-east-1",
    severity: "critical",
    title: "Database Connection Pool Saturation & Replication Lag Spike",
    description: "Active database connections surged to 99.4% capacity (1,988/2,000 max connections). Read replica replication lag exceeded 420 seconds due to long-running unindexed analytical query on `orders_v2`.",
    timestamp: "3 minutes ago",
    status: "active",
    metrics: {
      cpuUtilization: "94.2%",
      activeConnections: 1988,
      replicationLagSeconds: 428,
      readIops: "8,450 IOPS"
    },
    rootCauseAnalysis: {
      aiModel: "AWS Bedrock (Anthropic Claude 3.5 Sonnet)",
      confidence: "98.4%",
      summary: "A batch analytics script (`etl-order-sync-job`) initiated by the marketing service executed multiple unindexed full-table scans with exclusive table locks, triggering connection pool exhaustion and blocking normal OLTP writes.",
      impact: "High — Checkout API requests are experiencing HTTP 504 Gateway Timeouts (~14.2% failure rate).",
      recommendedAction: "Terminate blocking PID 48102, apply read-only replica routing rule, and enable Amazon RDS Proxy for automatic pooling."
    },
    remediationSteps: [
      {
        step: 1,
        title: "Identify & Terminate Blocking PIDs",
        command: "aws rds-data execute-statement --resource-arn arn:aws:rds:us-east-1:182930491028:cluster:aurora-pg-cluster-prod --secret-arn arn:aws:secretsmanager:us-east-1:182930491028:secret:rds-db-cred --sql 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = \"active\" AND query_start < NOW() - INTERVAL \"5 minutes\";'",
        type: "aws-cli"
      },
      {
        step: 2,
        title: "Scale RDS Read Replica Pool",
        command: "aws rds create-db-instance --db-instance-identifier aurora-pg-replica-03 --db-cluster-identifier aurora-pg-cluster-prod --db-instance-class db.r6g.xlarge --engine aurora-postgresql",
        type: "aws-cli"
      },
      {
        step: 3,
        title: "Enforce RDS Proxy Auto-pooling",
        command: "aws rds modify-db-proxy-target-group --target-group-name default --db-proxy-name opspulse-rds-proxy --connection-pool-config-override '{\"MaxConnectionsPercent\": 80, \"MaxIdleConnectionsPercent\": 20}'",
        type: "aws-cli"
      }
    ]
  },
  {
    id: "INC-4092",
    service: "Amazon ECS (Fargate)",
    resourceId: "fargate-order-processor-svc",
    region: "us-east-1",
    severity: "critical",
    title: "ECS Fargate Container OOMKilled (Exit Code 137)",
    description: "4 out of 6 tasks in the `order-processor` cluster were terminated by Linux kernel OOM killer within 90 seconds after memory limit reached 100% (2048 MB allocated).",
    timestamp: "8 minutes ago",
    status: "active",
    metrics: {
      cpuUtilization: "68.5%",
      memoryUsage: "99.8%",
      taskCount: "2/6 healthy",
      http5xxRate: "8.7%"
    },
    rootCauseAnalysis: {
      aiModel: "AWS Bedrock (Anthropic Claude 3.5 Sonnet)",
      confidence: "96.1%",
      summary: "Worker threads attempted to buffer a 140MB uncompressed JSON payload into in-memory heap without streaming parser, causing V8 garbage collection failure and triggering container OOM.",
      impact: "Medium-High — Message consumer latency increased from 45ms to 1,850ms.",
      recommendedAction: "Immediately update task definition memory allocation from 2GB to 4GB, trigger service rollout with circuit breaker, and route raw payloads to S3 presigned URLs."
    },
    remediationSteps: [
      {
        step: 1,
        title: "Register Upgraded ECS Task Definition (4GB RAM)",
        command: "aws ecs register-task-definition --family order-processor --cpu 1024 --memory 4096 --container-definitions file://task-def-v14.json",
        type: "aws-cli"
      },
      {
        step: 2,
        title: "Trigger Zero-Downtime Service Rollout",
        command: "aws ecs update-service --cluster prod-core-cluster --service fargate-order-processor-svc --task-definition order-processor:14 --desired-count 8",
        type: "aws-cli"
      }
    ]
  },
  {
    id: "INC-4093",
    service: "AWS Lambda & API Gateway",
    resourceId: "fn-stripe-webhook-handler",
    region: "us-east-1",
    severity: "warning",
    title: "Cold-Start Cascading Latency & Concurrency Spike",
    description: "Lambda invocation latency surged from 85ms (p95) to 2,900ms (p99) due to unreserved concurrency exhaustion during marketing flash sale event.",
    timestamp: "18 minutes ago",
    status: "active",
    metrics: {
      concurrency: "940 / 1000",
      p99Latency: "2,910 ms",
      errorRate: "2.1%",
      coldStarts: "38%"
    },
    rootCauseAnalysis: {
      aiModel: "AWS Bedrock (Amazon Titan Text Premier)",
      confidence: "93.8%",
      summary: "Concurrent webhook bursts exceeded default unreserved account ceiling. Heavy initialization logic inside SDK client instantiation adds 1,800ms overhead on each cold start.",
      impact: "Medium — Third-party webhook retries creating an amplification loop.",
      recommendedAction: "Provision 50 warm instances via Lambda Provisioned Concurrency and configure SnapStart."
    },
    remediationSteps: [
      {
        step: 1,
        title: "Provision Warm Concurrency",
        command: "aws lambda put-provisioned-concurrency-config --function-name fn-stripe-webhook-handler --qualifier LIVE --provisioned-concurrent-executions 50",
        type: "aws-cli"
      },
      {
        step: 2,
        title: "Enable API Gateway Throttle Limits",
        command: "aws apigateway update-stage --rest-api-id 9s8f0a28 --stage-name prod --patch-operations op=replace,path=/*/*/throttling/rateLimit,value=500",
        type: "aws-cli"
      }
    ]
  },
  {
    id: "INC-4094",
    service: "Amazon DynamoDB",
    resourceId: "UserSessions-GlobalTable",
    region: "us-east-1",
    severity: "resolved",
    title: "Global Secondary Index Hot Partition Throttling",
    description: "ReadThrottleEvents and WriteThrottleEvents breached threshold on `GSI-TenantStatus` due to uneven partition key distribution.",
    timestamp: "45 minutes ago",
    status: "resolved",
    metrics: {
      throttledRequests: 0,
      consumedReadUnits: "420 RCU",
      consumedWriteUnits: "180 WCU",
      replicationLatency: "42 ms"
    },
    rootCauseAnalysis: {
      aiModel: "AWS Bedrock (Anthropic Claude 3.5 Sonnet)",
      confidence: "99.1%",
      summary: "Synthetic load test injected 10,000 requests with identical tenant key `DEMO_TENANT`. On-demand capacity mode auto-adapted after 4 minutes.",
      impact: "Low — Auto-remediated by DynamoDB adaptive capacity.",
      recommendedAction: "Add hash salt suffix to partition keys to avoid future hot partitions."
    },
    remediationSteps: [
      {
        step: 1,
        title: "Enable DynamoDB On-Demand Autoscaling Ceiling",
        command: "aws dynamodb update-table --table-name UserSessions-GlobalTable --billing-mode PAY_PER_REQUEST",
        type: "aws-cli"
      }
    ]
  }
];

export const FINOPS_LEAKS = [
  {
    id: "LEAK-101",
    service: "Amazon EC2 / EBS",
    resourceId: "vol-08a9bc1928374d5e",
    name: "4x Unattached gp3 Volumes (orphaned dev instances)",
    region: "us-east-1",
    monthlyCost: 240,
    impact: "high",
    detectedDate: "14 days ago",
    recommendation: "Take EBS snapshot for compliance backup and terminate unattached block storage volumes.",
    agentCommand: "aws ec2 create-snapshot --volume-id vol-08a9bc1928374d5e --description 'OpsPulse-pre-delete-backup' && aws ec2 delete-volume --volume-id vol-08a9bc1928374d5e"
  },
  {
    id: "LEAK-102",
    service: "VPC / NAT Gateway",
    resourceId: "nat-04a11b8923fe89d0",
    name: "Idle NAT Gateway in Staging VPC (0 bytes processed)",
    region: "us-east-1",
    monthlyCost: 115,
    impact: "medium",
    detectedDate: "21 days ago",
    recommendation: "Replace with VPC Endpoint (Gateway) for S3/DynamoDB or migrate staging workloads to dual-stack IPv6.",
    agentCommand: "aws ec2 delete-nat-gateway --nat-gateway-id nat-04a11b8923fe89d0"
  },
  {
    id: "LEAK-103",
    service: "Amazon RDS",
    resourceId: "analytics-db-preview-multi-az",
    name: "Oversized Multi-AZ Instance (db.m5.2xlarge at 3.2% CPU)",
    region: "us-east-1",
    monthlyCost: 390,
    impact: "high",
    detectedDate: "30 days ago",
    recommendation: "Right-size instance class to db.t4g.large (ARM Graviton3) with Single-AZ configuration for non-prod.",
    agentCommand: "aws rds modify-db-instance --db-instance-identifier analytics-db-preview --db-instance-class db.t4g.large --no-multi-az --apply-immediately"
  },
  {
    id: "LEAK-104",
    service: "Amazon S3",
    resourceId: "s3://company-cloudtrail-raw-archive-992",
    name: "18.4 TB Standard Storage lacking S3 Glacier Lifecycle Rule",
    region: "us-east-1",
    monthlyCost: 410,
    impact: "high",
    detectedDate: "60+ days ago",
    recommendation: "Apply S3 Lifecycle Configuration to transition objects > 30 days to Glacier Flexible Retrieval.",
    agentCommand: "aws s3api put-bucket-lifecycle-configuration --bucket company-cloudtrail-raw-archive-992 --lifecycle-configuration file://lifecycle-glacier-transition.json"
  },
  {
    id: "LEAK-105",
    service: "Amazon EC2 (Elastic IP)",
    resourceId: "eipalloc-0192837465abc",
    name: "8x Unattached Elastic IP Addresses",
    region: "us-east-1",
    monthlyCost: 58,
    impact: "low",
    detectedDate: "9 days ago",
    recommendation: "Release unassociated public IPv4 addresses to eliminate AWS hourly idle reservation charges.",
    agentCommand: "aws ec2 release-address --allocation-id eipalloc-0192837465abc"
  }
];

export const COPILOT_PRESETS = [
  {
    label: "Incident Triage",
    prompt: "Diagnose why RDS Aurora CPU spiked to 98% and generate the AWS CLI command to terminate long-running queries.",
    response: `### 🔍 AWS Bedrock Incident Diagnosis

**Root Cause:**
A batch analytics query on table \`orders_v2\` executed without an index, locking rows and causing Aurora connection pooling to saturate.

**AWS CLI Instant Remediation:**
\`\`\`bash
# 1. Connect via RDS Data API and terminate runaway query PID
aws rds-data execute-statement \\
  --resource-arn "arn:aws:rds:us-east-1:182930491028:cluster:aurora-pg-cluster-prod" \\
  --secret-arn "arn:aws:secretsmanager:us-east-1:182930491028:secret:rds-db-cred" \\
  --sql "SELECT pg_terminate_backend(48102);"

# 2. Verify connection drop in CloudWatch
aws cloudwatch get-metric-data \\
  --metric-data-queries file://cw-rds-connections.json \\
  --start-time $(date -u -v-15M +%Y-%m-%dT%H:%M:%SZ) \\
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ)
\`\`\`
*OpsPulse AI Autonomous Agent verified connection drops by 84% post-remediation.*`
  },
  {
    label: "FinOps Cost Cut",
    prompt: "Scan our AWS account for unattached EBS volumes and show me the projected monthly savings.",
    response: `### 💰 FinOps Cloud Waste Audit (AWS Account: 1829-3049-1028)

We identified **4 unattached gp3 EBS volumes** with a total capacity of **2.8 TB** left behind by terminated EC2 Auto Scaling instances.

- **Current Run Rate:** $240.80 / month ($2,889.60 / year)
- **Safe Remediation:** Create an encrypted snapshot before volume termination.

\`\`\`bash
# Create snapshot backup
aws ec2 create-snapshot \\
  --volume-id vol-08a9bc1928374d5e \\
  --tag-specifications 'ResourceType=snapshot,Tags=[{Key=CreatedBy,Value=OpsPulseAgent}]'

# Delete orphaned volume
aws ec2 delete-volume --volume-id vol-08a9bc1928374d5e
\`\`\`
*Executing this saves $2,889/yr with zero application impact.*`
  },
  {
    label: "Security & IAM Audit",
    prompt: "Audit our ECS task execution IAM roles for wildcard permissions (AdministratorAccess or *).",
    response: `### 🛡️ IAM Security Assessment (AWS Bedrock)

**Security Finding:**
Role \`arn:aws:iam::182930491028:role/ecsTaskExecutionRole-prod\` contains an overly permissive policy granting \`s3:*\` across all resources.

**Recommended Least-Privilege Policy:**
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RestrictedS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::production-app-assets-992/*"
    },
    {
      "Sid": "CloudWatchLogsAccess",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:182930491028:log-group:/ecs/order-processor:*"
    }
  ]
}
\`\`\``
  }
];
