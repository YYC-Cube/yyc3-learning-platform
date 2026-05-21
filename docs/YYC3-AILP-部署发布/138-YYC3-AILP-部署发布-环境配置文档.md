---
@file: 138-YYC3-AILP-部署发布-环境配置文档.md
@description: YYC3-AILP 生产、预生产环境的服务器、数据库、中间件的配置规范
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2026-01-24
@status: published
@tags: [部署发布],[环境配置],[生产环境]
---

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> **_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**

---

# 138-YYC3-AILP-部署发布-环境配置文档

## 📋 文档信息

| 属性         | 内容                             |
| ------------ | -------------------------------- |
| **文档标题** | YYC3-AILP-部署发布-环境配置文档  |
| **文档版本** | v1.0.0                           |
| **创建时间** | 2026-01-24                       |
| **适用范围** | YYC3-AILP学习平台环境配置        |
| **文档类型** | 环境配置、服务器配置、数据库配置 |

---

## 📖 文档概述

本文档详细描述YYC³ AILP学习平台的生产、预生产环境配置规范，包括服务器配置、数据库配置、中间件配置、网络配置、安全配置等关键内容。通过本文档，运维团队可以全面了解环境配置要求，确保按照YYC³团队的「五高五标五化」核心理念进行标准化、规范化的环境配置。

---

## 🏗️ 环境架构体系

### 🎯 环境分类架构

```
┌─────────────────────────────────────────────────────────────┐
│                    YYC³ AILP 环境架构              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ 开发环境     │    │ 测试环境     │    │ 预生产环境     │   │
│  │ Development │    │ Testing    │    │ Staging    │   │
│  │ 4核8G      │    │ 8核16G     │    │ 16核32G     │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │ 生产环境     │    │ 灾备环境     │    │ 监控环境     │   │
│  │ Production │    │ Disaster   │    │ Monitoring │   │
│  │ 32核64G     │    │ 16核32G     │    │ 8核16G      │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              网络架构              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │ 负载均衡     │  │ 防火墙     │  │ CDN分发     ││   │
│  │  │ Load Balancer│  │ Firewall  │  │ CDN       ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ 服务器配置规范

### 🎯 生产环境配置

**硬件配置**:

```typescript
// 生产环境服务器配置
interface ProductionServerConfig {
  // 应用服务器
  applicationServers: {
    quantity: 4;
    specifications: {
      cpu: '32 Cores (Intel Xeon Gold 6338)';
      memory: '64GB DDR4 ECC';
      storage: '2TB NVMe SSD RAID 10';
      network: '10Gbps Dual Network Card';
    };

    purpose: '主应用服务、API服务';
    deployment: 'Docker Container';
    orchestration: 'Kubernetes';
  };

  // 数据库服务器
  databaseServers: {
    quantity: 3;
    specifications: {
      cpu: '32 Cores (Intel Xeon Gold 6338)';
      memory: '128GB DDR4 ECC';
      storage: '4TB NVMe SSD RAID 10';
      network: '10Gbps Dual Network Card';
    };

    purpose: 'MySQL集群、数据存储';
    deployment: 'MySQL Group Replication';
    backup: 'Daily Full Backup + Hourly Incremental';
  };

  // 缓存服务器
  cacheServers: {
    quantity: 2;
    specifications: {
      cpu: '16 Cores (Intel Xeon Silver 4310)';
      memory: '64GB DDR4 ECC';
      storage: '1TB NVMe SSD';
      network: '10Gbps Network Card';
    };

    purpose: 'Redis集群、缓存服务';
    deployment: 'Redis Cluster';
    persistence: 'RDB + AOF';
  };

  // 文件服务器
  fileServers: {
    quantity: 2;
    specifications: {
      cpu: '16 Cores (Intel Xeon Silver 4310)';
      memory: '32GB DDR4 ECC';
      storage: '8TB HDD RAID 6 + 1TB SSD Cache';
      network: '10Gbps Network Card';
    };

    purpose: '文件存储、静态资源';
    deployment: 'MinIO Distributed';
    backup: 'Daily Full Backup';
  };
}
```

**软件配置**:

```typescript
// 生产环境软件配置
interface ProductionSoftwareConfig {
  // 操作系统
  operatingSystem: {
    name: 'Ubuntu Server';
    version: '22.04 LTS';
    kernel: '5.15.0';
    architecture: 'x86_64';

    security: {
      firewall: 'UFW + Fail2ban';
      antivirus: 'ClamAV';
      intrusionDetection: 'OSSEC';
    };
  };

  // 容器化平台
  containerPlatform: {
    runtime: 'Docker';
    version: '24.0.5';
    orchestration: 'Kubernetes';
    kubernetesVersion: '1.28.2';

    networking: {
      cni: 'Calico';
      ingress: 'Nginx Ingress Controller';
      loadBalancer: 'HAProxy';
    };
  };

  // 监控系统
  monitoringSystem: {
    metrics: 'Prometheus';
    version: '2.47.0';
    visualization: 'Grafana';
    version: '10.2.0';
    alerting: 'AlertManager';
    version: '0.26.0';

    logging: {
      collection: 'Fluentd';
      storage: 'Elasticsearch';
      visualization: 'Kibana';
    };
  };
}
```

### 🎯 预生产环境配置

**硬件配置**:

```typescript
// 预生产环境服务器配置
interface StagingServerConfig {
  // 应用服务器
  applicationServers: {
    quantity: 2;
    specifications: {
      cpu: '16 Cores (Intel Xeon Silver 4310)';
      memory: '32GB DDR4 ECC';
      storage: '1TB NVMe SSD RAID 1';
      network: '10Gbps Network Card';
    };

    purpose: '预生产验证、用户验收';
    deployment: 'Docker Container';
    orchestration: 'Kubernetes';
  };

  // 数据库服务器
  databaseServers: {
    quantity: 1;
    specifications: {
      cpu: '16 Cores (Intel Xeon Silver 4310)';
      memory: '64GB DDR4 ECC';
      storage: '2TB NVMe SSD RAID 1';
      network: '10Gbps Network Card';
    };

    purpose: '预生产数据、测试验证';
    deployment: 'MySQL Single Instance';
    backup: 'Daily Full Backup';
  };

  // 缓存服务器
  cacheServers: {
    quantity: 1;
    specifications: {
      cpu: '8 Cores (Intel Xeon Silver 4210)';
      memory: '32GB DDR4 ECC';
      storage: '512GB NVMe SSD';
      network: '1Gbps Network Card';
    };

    purpose: '预生产缓存、会话存储';
    deployment: 'Redis Single Instance';
    persistence: 'RDB';
  };
}
```

---

## 🗄️ 数据库配置规范

### 🎯 MySQL配置

**生产环境MySQL配置**:

```sql
-- MySQL生产环境配置
[mysqld]
# 基本配置
server-id = 1
port = 3306
bind-address = 0.0.0.0
socket = /var/run/mysqld/mysqld.sock
pid-file = /var/run/mysqld/mysqld.pid

# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
init_connect = 'SET NAMES utf8mb4'

# 内存配置
innodb_buffer_pool_size = 32G
innodb_buffer_pool_instances = 8
innodb_log_file_size = 2G
innodb_log_buffer_size = 256M
key_buffer_size = 256M
tmp_table_size = 256M
max_heap_table_size = 256M

# 连接配置
max_connections = 2000
max_connect_errors = 10000
wait_timeout = 28800
interactive_timeout = 28800

# 查询缓存
query_cache_type = 1
query_cache_size = 256M
query_cache_limit = 2M

# 二进制日志
log-bin = mysql-bin
binlog_format = ROW
binlog_cache_size = 32M
max_binlog_size = 1G
expire_logs_days = 7

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# InnoDB配置
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000
innodb_read_io_threads = 8
innodb_write_io_threads = 8
```

**预生产环境MySQL配置**:

```sql
-- MySQL预生产环境配置
[mysqld]
# 基本配置
server-id = 2
port = 3306
bind-address = 0.0.0.0
socket = /var/run/mysqld/mysqld.sock
pid-file = /var/run/mysqld/mysqld.pid

# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
init_connect = 'SET NAMES utf8mb4'

# 内存配置
innodb_buffer_pool_size = 16G
innodb_buffer_pool_instances = 4
innodb_log_file_size = 1G
innodb_log_buffer_size = 128M
key_buffer_size = 128M
tmp_table_size = 128M
max_heap_table_size = 128M

# 连接配置
max_connections = 1000
max_connect_errors = 5000
wait_timeout = 28800
interactive_timeout = 28800

# 查询缓存
query_cache_type = 1
query_cache_size = 128M
query_cache_limit = 1M

# 二进制日志
log-bin = mysql-bin
binlog_format = ROW
binlog_cache_size = 16M
max_binlog_size = 512M
expire_logs_days = 3

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1

# InnoDB配置
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_io_capacity = 1000
innodb_io_capacity_max = 2000
innodb_read_io_threads = 4
innodb_write_io_threads = 4
```

### 🎯 Redis配置

**生产环境Redis配置**:

```conf
# Redis生产环境配置

# 网络配置
bind 0.0.0.0
port 6379
timeout 300
tcp-keepalive 60

# 内存配置
maxmemory 32gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# 持久化配置
save 900 1
save 300 10
save 60 10000
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# AOF配置
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# 日志配置
loglevel notice
logfile /var/log/redis/redis.log

# 安全配置
requirepass your_strong_password
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""

# 性能配置
tcp-backlog 511
databases 16
always-show-logo yes
```

---

## 🌐 网络配置规范

### 🎯 负载均衡配置

**HAProxy配置**:

```conf
# HAProxy生产环境配置
global
    daemon
    maxconn 4096
    user haproxy
    group haproxy
    log /dev/log local0
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
    log global
    mode http
    option httplog
    option dontlognull
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 408 /etc/haproxy/errors/408.http
    errorfile 500 /etc/haproxy/errors/500.http
    errorfile 502 /etc/haproxy/errors/502.http
    errorfile 503 /etc/haproxy/errors/503.http
    errorfile 504 /etc/haproxy/errors/504.http

frontend http_front
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/yyc3.pem
    redirect scheme https if !{ ssl_fc }
    default_backend http_back

frontend stats_front
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE

backend http_back
    balance roundrobin
    server web1 10.0.1.10:80 check
    server web2 10.0.1.11:80 check
    server web3 10.0.1.12:80 check
    server web4 10.0.1.13:80 check

backend api_back
    balance roundrobin
    server api1 10.0.1.20:8080 check
    server api2 10.0.1.21:8080 check
    server api3 10.0.1.22:8080 check
    server api4 10.0.1.23:8080 check
```

### 🎯 防火墙配置

**UFW防火墙规则**:

```bash
#!/bin/bash
# UFW防火墙配置脚本

# 重置防火墙规则
ufw --force reset

# 默认策略
ufw default deny incoming
ufw default allow outgoing

# 允许SSH
ufw allow 22/tcp
ufw limit 22/tcp

# 允许HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 允许MySQL (仅内网)
ufw allow from 10.0.0.0/8 to any port 3306/tcp
ufw allow from 172.16.0.0/12 to any port 3306/tcp
ufw allow from 192.168.0.0/16 to any port 3306/tcp

# 允许Redis (仅内网)
ufw allow from 10.0.0.0/8 to any port 6379/tcp
ufw allow from 172.16.0.0/12 to any port 6379/tcp
ufw allow from 192.168.0.0/16 to any port 6379/tcp

# 允许监控端口 (仅内网)
ufw allow from 10.0.0.0/8 to any port 9100/tcp
ufw allow from 172.16.0.0/12 to any port 9100/tcp
ufw allow from 192.168.0.0/16 to any port 9100/tcp

# 启用防火墙
ufw --force enable

# 显示状态
ufw status verbose
```

---

## 🔒 安全配置规范

### 🎯 SSL/TLS配置

**Nginx SSL配置**:

```nginx
# Nginx SSL配置
server {
    listen 443 ssl http2;
    server_name yyc3-ailp.com;

    # SSL证书配置
    ssl_certificate /etc/ssl/certs/yyc3-ailp.com.crt;
    ssl_certificate_key /etc/ssl/private/yyc3-ailp.com.key;

    # SSL协议配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # SSL加密套件配置
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

    # SSL会话配置
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # 其他安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # 应用配置
    root /var/www/yyc3-ailp;
    index index.html index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 🎯 系统安全加固

**系统安全配置**:

```bash
#!/bin/bash
# 系统安全加固脚本

# 更新系统
apt update && apt upgrade -y

# 安装安全工具
apt install -y fail2ban ufw clamav rkhunter chkrootkit

# 配置fail2ban
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

# 启动fail2ban
systemctl enable fail2ban
systemctl start fail2ban

# 配置SSH安全
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PermitEmptyPasswords no/PermitEmptyPasswords no/' /etc/ssh/sshd_config
sed -i 's/#X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config

# 重启SSH服务
systemctl restart ssh

# 配置内核安全参数
cat > /etc/sysctl.d/99-security.conf << EOF
# IP转发
net.ipv4.ip_forward = 0

# SYN保护
net.ipv4.tcp_syncookies = 1

# 记录可疑数据包
net.ipv4.conf.all.log_martians = 1

# 忽略ICMP重定向
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# 忽略ping
net.ipv4.icmp_echo_ignore_all = 1

# 禁用源路由
net.ipv4.conf.all.accept_source_route = 0

# 禁用IPv6
net.ipv6.conf.all.disable_ipv6 = 1
EOF

# 应用内核参数
sysctl -p /etc/sysctl.d/99-security.conf

# 配置文件权限
chmod 644 /etc/passwd
chmod 600 /etc/shadow
chmod 644 /etc/group
chmod 600 /etc/gshadow

# 设置文件默认权限
echo "umask 027" >> /etc/profile

# 创建安全日志目录
mkdir -p /var/log/security
chmod 700 /var/log/security

# 配置日志轮转
cat > /etc/logrotate.d/security << EOF
/var/log/security/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
```

---

## 📊 环境监控配置

### 🎯 Prometheus配置

**Prometheus配置**:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'rules/*.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

scrape_configs:
  # Prometheus自监控
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter
  - job_name: 'node'
    static_configs:
      - targets: ['10.0.1.10:9100', '10.0.1.11:9100', '10.0.1.12:9100', '10.0.1.13:9100']

  # MySQL Exporter
  - job_name: 'mysql'
    static_configs:
      - targets: ['10.0.1.20:9104', '10.0.1.21:9104', '10.0.1.22:9104']

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['10.0.1.30:9121', '10.0.1.31:9121']

  # Nginx Exporter
  - job_name: 'nginx'
    static_configs:
      - targets: ['10.0.1.40:9113']

  # 应用监控
  - job_name: 'application'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['10.0.1.10:8080', '10.0.1.11:8080', '10.0.1.12:8080', '10.0.1.13:8080']
```

### 🎯 Grafana仪表板

**系统监控仪表板**:

```json
{
  "dashboard": {
    "title": "YYC3 AILP 系统监控",
    "panels": [
      {
        "title": "CPU使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "内存使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "磁盘使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_filesystem_avail_bytes{mountpoint=\"/\"} / node_filesystem_size_bytes{mountpoint=\"/\"})) * 100",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "网络流量",
        "type": "graph",
        "targets": [
          {
            "expr": "irate(node_network_receive_bytes_total[5m]) * 8",
            "legendFormat": "入站 {{instance}}"
          },
          {
            "expr": "irate(node_network_transmit_bytes_total[5m]) * 8",
            "legendFormat": "出站 {{instance}}"
          }
        ]
      }
    ]
  }
}
```

---

## 📄 文档标尾

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
