---
@file: 150-YYC3-AILP-部署发布-安全加固与合规指南.md
@description: YYC3-AILP 安全加固与合规指南文档，确保系统安全性和合规性
@author: YanYuCloudCube Team
@version: v1.0.0
@created: 2025-12-29
@updated: 2025-12-29
@status: published
@tags: [部署发布],[安全加固],[合规指南],[安全防护]
---

> **_YanYuCloudCube_**
> **标语**：言启象限 | 语枢未来
> **_Words Initiate Quadrants, Language Serves as Core for the Future_**
> **标语**：万象归元于云枢 | 深栈智启新纪元
> **_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**

---

# 150-YYC3-AILP-部署发布-安全加固与合规指南

## 概述

本文档详细描述YYC3-AILP平台的安全加固措施和合规要求，确保系统在部署和运营过程中满足高安全性标准，并符合相关法律法规要求。

## 核心内容

### 1. 背景与目标

#### 1.1 项目背景

YYC³(YanYuCloudCube)-AILP平台作为智能教育系统，处理大量敏感用户数据和教育资源，面临各种安全威胁和合规要求。建立全面的安全加固体系和合规管理机制，是保障系统安全运行和用户数据保护的基础。

#### 1.2 文档目标

- 建立全面的安全加固体系，提高系统安全性
- 确保系统符合相关法律法规和行业标准
- 提供安全配置和管理的最佳实践
- 建立安全事件响应和应急处理机制

### 2. 设计原则

#### 2.1 五高原则

- **高可用性**：确保安全服务7x24小时可用
- **高性能**：优化安全检查和防护性能
- **高安全性**：多层次安全防护，零信任架构
- **高扩展性**：支持安全策略的弹性扩展
- **高可维护性**：简化安全管理，自动化安全运维

#### 2.2 五标体系

- **标准化**：统一的安全标准和配置规范
- **规范化**：严格的安全管理和操作规范
- **自动化**：自动安全检查和威胁检测
- **智能化**：智能威胁分析和安全决策
- **可视化**：直观的安全状态和风险展示

#### 2.3 五化架构

- **流程化**：标准化的安全工作流程
- **文档化**：完善的安全策略和文档
- **工具化**：高效的安全工具和平台
- **数字化**：数据驱动的安全决策
- **生态化**：集成的安全生态系统

### 3. 安全架构设计

#### 3.1 零信任安全架构

```typescript
// zero_trust_architecture.ts - 零信任安全架构实现
export interface ZeroTrustPolicy {
  // 身份验证策略
  authentication: {
    methods: string[]; // 认证方法
    mfa_required: boolean; // 是否需要多因素认证
    session_timeout: number; // 会话超时时间(秒)
  };

  // 授权策略
  authorization: {
    rbac_enabled: boolean; // 是否启用基于角色的访问控制
    abac_enabled: boolean; // 是否启用基于属性的访问控制
    min_privilege: boolean; // 是否启用最小权限原则
  };

  // 网络安全策略
  network_security: {
    microsegmentation: boolean; // 是否启用微分段
    encryption_required: boolean; // 是否要求加密
    certificate_validation: boolean; // 是否验证证书
  };

  // 数据安全策略
  data_security: {
    encryption_at_rest: boolean; // 静态数据加密
    encryption_in_transit: boolean; // 传输中数据加密
    data_classification: boolean; // 数据分类
    data_loss_prevention: boolean; // 数据丢失防护
  };
}

// 零信任安全服务
export class ZeroTrustSecurityService {
  private policy: ZeroTrustPolicy;
  private identityProvider: IdentityProvider;
  private accessManager: AccessManager;
  private threatDetector: ThreatDetector;

  constructor(policy: ZeroTrustPolicy) {
    this.policy = policy;
    this.identityProvider = new IdentityProvider();
    this.accessManager = new AccessManager();
    this.threatDetector = new ThreatDetector();
  }

  // 身份验证
  async authenticate(credentials: UserCredentials): Promise<AuthenticationResult> {
    try {
      // 多因素认证
      if (this.policy.authentication.mfa_required) {
        const mfaResult = await this.identityProvider.authenticateWithMFA(credentials);
        if (!mfaResult.success) {
          return { success: false, reason: '多因素认证失败' };
        }
      }

      // 主认证
      const authResult = await this.identityProvider.authenticate(credentials);

      if (authResult.success) {
        // 创建安全会话
        const session = await this.createSecureSession(authResult.user);
        return { success: true, session };
      } else {
        return { success: false, reason: '认证失败' };
      }
    } catch (error) {
      console.error('身份验证失败:', error);
      return { success: false, reason: '系统错误' };
    }
  }

  // 授权检查
  async authorize(
    session: SecureSession,
    resource: string,
    action: string
  ): Promise<AuthorizationResult> {
    try {
      // 基于角色的访问控制
      if (this.policy.authorization.rbac_enabled) {
        const rbacResult = await this.accessManager.checkRbac(session.user, resource, action);
        if (!rbacResult.allowed) {
          return { allowed: false, reason: 'RBAC权限不足' };
        }
      }

      // 基于属性的访问控制
      if (this.policy.authorization.abac_enabled) {
        const abacResult = await this.accessManager.checkAbac(
          session.user,
          resource,
          action,
          session.context
        );
        if (!abacResult.allowed) {
          return { allowed: false, reason: 'ABAC权限不足' };
        }
      }

      // 威胁检测
      const threatResult = await this.threatDetector.analyzeAccess(session, resource, action);
      if (threatResult.risk > this.getRiskThreshold()) {
        return { allowed: false, reason: '访问风险过高' };
      }

      return { allowed: true };
    } catch (error) {
      console.error('授权检查失败:', error);
      return { allowed: false, reason: '系统错误' };
    }
  }

  // 创建安全会话
  private async createSecureSession(user: User): Promise<SecureSession> {
    const sessionId = this.generateSecureSessionId();
    const expiresAt = new Date(Date.now() + this.policy.authentication.session_timeout * 1000);

    // 记录会话信息
    await this.recordSession({
      sessionId,
      userId: user.id,
      createdAt: new Date(),
      expiresAt,
      ipAddress: user.ipAddress,
      userAgent: user.userAgent,
    });

    return {
      sessionId,
      user,
      createdAt: new Date(),
      expiresAt,
      context: await this.buildSecurityContext(user),
    };
  }

  // 构建安全上下文
  private async buildSecurityContext(user: User): Promise<SecurityContext> {
    return {
      userId: user.id,
      roles: await this.getUserRoles(user.id),
      attributes: await this.getUserAttributes(user.id),
      location: await this.getUserLocation(user.ipAddress),
      deviceFingerprint: await this.getDeviceFingerprint(user.userAgent),
      riskScore: await this.calculateUserRiskScore(user.id),
    };
  }

  // 辅助方法
  private generateSecureSessionId(): string {
    // 生成安全的会话ID
    return crypto.randomBytes(32).toString('hex');
  }

  private getRiskThreshold(): number {
    // 获取风险阈值
    return 0.7;
  }

  private async recordSession(sessionInfo: SessionInfo): Promise<void> {
    // 记录会话信息
  }

  private async getUserRoles(userId: string): Promise<string[]> {
    // 获取用户角色
    return [];
  }

  private async getUserAttributes(userId: string): Promise<Record<string, any>> {
    // 获取用户属性
    return {};
  }

  private async getUserLocation(ipAddress: string): Promise<string> {
    // 获取用户位置
    return 'unknown';
  }

  private async getDeviceFingerprint(userAgent: string): Promise<string> {
    // 获取设备指纹
    return 'unknown';
  }

  private async calculateUserRiskScore(userId: string): Promise<number> {
    // 计算用户风险评分
    return 0.1;
  }
}
```

#### 3.2 深度防御策略

```yaml
# defense_in_depth.yaml - 深度防御策略配置
defense_in_depth:
  # 网络层防御
  network_layer:
    firewall:
      enabled: true
      default_policy: 'deny'
      rules:
        - name: 'allow_https'
          source: 'any'
          destination: 'any'
          port: 443
          protocol: 'tcp'
          action: 'allow'

        - name: 'allow_ssh_admin'
          source: 'admin_network'
          destination: 'management_servers'
          port: 22
          protocol: 'tcp'
          action: 'allow'

    ddos_protection:
      enabled: true
      threshold: '10000 requests/minute'
      mitigation: 'automatic'

    intrusion_detection:
      enabled: true
      system: 'suricata'
      rules_update: 'daily'

  # 主机层防御
  host_layer:
    os_hardening:
      enabled: true
      measures:
        - '最小化安装'
        - '定期更新补丁'
        - '禁用不必要服务'
        - '文件系统加密'

    host_based_firewall:
      enabled: true
      default_policy: 'deny'
      outbound_filtering: true

    anti_malware:
      enabled: true
      real_time_scanning: true
      scheduled_scans: 'daily'

  # 应用层防御
  application_layer:
    web_application_firewall:
      enabled: true
      mode: 'prevention'
      ruleset: 'owasp_modsecurity_crs'

    input_validation:
      enabled: true
      strict_validation: true
      encoding: 'utf-8'

    output_encoding:
      enabled: true
      context_aware: true

    authentication:
      strong_passwords: true
      mfa_required: true
      session_management: true

  # 数据层防御
  data_layer:
    encryption:
      at_rest: true
      in_transit: true
      key_management: 'hsm'

    access_control:
      rbac: true
      abac: true
      audit_logging: true

    data_loss_prevention:
      enabled: true
      classification: true
      monitoring: true
```

### 4. 系统安全加固

#### 4.1 操作系统加固

##### 4.1.1 Linux系统加固脚本

```bash
#!/bin/bash
# os_hardening.sh - Linux操作系统加固脚本

set -euo pipefail

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 系统更新
update_system() {
    log "开始系统更新..."

    # 更新软件包列表
    apt-get update -y

    # 升级已安装软件包
    apt-get upgrade -y

    # 安装安全更新
    apt-get dist-upgrade -y

    log "系统更新完成"
}

# 用户和权限加固
harden_users_permissions() {
    log "开始用户和权限加固..."

    # 禁用root登录
    sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

    # 创建管理员用户
    if ! id "admin" &>/dev/null; then
        useradd -m -s /bin/bash admin
        echo "admin:$(openssl rand -base64 32)" | chpasswd
        usermod -aG sudo admin
        log "创建管理员用户admin"
    fi

    # 设置密码策略
    cat > /etc/security/pwquality.conf << EOF
# 最小密码长度
minlen = 12
# 至少包含一个小写字母
lcredit = -1
# 至少包含一个大写字母
ucredit = -1
# 至少包含一个数字
dcredit = -1
# 至少包含一个特殊字符
ocredit = -1
# 禁止使用常见密码
dictcheck = 1
EOF

    # 配置登录失败处理
    cat > /etc/pam.d/common-account << EOF
account required pam_nologin.so
account required pam_unix.so
account required pam_tally2.so deny=5 unlock_time=900 onerr=fail
EOF

    log "用户和权限加固完成"
}

# 网络安全加固
harden_network() {
    log "开始网络安全加固..."

    # 配置内核参数
    cat > /etc/sysctl.d/99-security.conf << EOF
# IP转发控制
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0

# 禁用源路由包
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0

# 禁用ICMP重定向
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# 禁用发送ICMP重定向
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# 启用SYN cookies保护
net.ipv4.tcp_syncookies = 1

# 记录可疑数据包
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# 忽略ICMP广播请求
net.ipv4.icmp_echo_ignore_broadcasts = 1

# 忽略ping请求
net.ipv4.icmp_echo_ignore_all = 0

# 禁用IPv6
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
EOF

    # 应用内核参数
    sysctl -p /etc/sysctl.d/99-security.conf

    # 配置防火墙
    apt-get install -y ufw

    # 默认策略
    ufw default deny incoming
    ufw default allow outgoing

    # 允许SSH（仅限管理员网络）
    ufw allow from 192.168.1.0/24 to any port 22 proto tcp

    # 允许HTTP和HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp

    # 启用防火墙
    ufw --force enable

    log "网络安全加固完成"
}

# 服务加固
harden_services() {
    log "开始服务加固..."

    # 禁用不必要的服务
    systemctl disable rpcbind
    systemctl disable nfs-server
    systemctl disable avahi-daemon
    systemctl disable cups

    # 配置SSH安全
    cat > /etc/ssh/sshd_config.d/99-security.conf << EOF
# SSH安全配置
Port 22
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no
EOF

    # 重启SSH服务
    systemctl restart ssh

    # 配置日志轮转
    cat > /etc/logrotate.d/security << EOF
/var/log/auth.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    copytruncate
}

/var/log/ufw.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    copytruncate
}
EOF

    log "服务加固完成"
}

# 文件系统加固
harden_filesystem() {
    log "开始文件系统加固..."

    # 设置关键文件权限
    chmod 644 /etc/passwd
    chmod 600 /etc/shadow
    chmod 644 /etc/group
    chmod 600 /etc/gshadow

    # 查找并修复SUID文件
    find / -type f -perm +4000 -exec ls -la {} \; > /tmp/suid_files.txt
    log "SUID文件列表已保存到 /tmp/suid_files.txt"

    # 设置/tmp目录权限
    chmod 1777 /tmp

    # 创建不可变文件
    chattr +i /etc/passwd
    chattr +i /etc/shadow
    chattr +i /etc/group
    chattr +i /etc/gshadow

    log "文件系统加固完成"
}

# 安装安全工具
install_security_tools() {
    log "开始安装安全工具..."

    # 安装基本安全工具
    apt-get install -y fail2ban rkhunter chkrootkit aide lynis

    # 配置fail2ban
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
destemail = admin@yyc3.com
sender = fail2ban@yyc3.com
mta = sendmail

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

    # 初始化AIDE
    aide --init
    mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

    # 创建AIDE检查定时任务
    cat > /etc/cron.daily/aide << EOF
#!/bin/bash
/usr/bin/aide --check
EOF
    chmod +x /etc/cron.daily/aide

    log "安全工具安装完成"
}

# 主函数
main() {
    log "开始操作系统安全加固..."

    # 检查是否为root用户
    if [ "$EUID" -ne 0 ]; then
        echo "请以root用户运行此脚本"
        exit 1
    fi

    # 执行加固步骤
    update_system
    harden_users_permissions
    harden_network
    harden_services
    harden_filesystem
    install_security_tools

    log "操作系统安全加固完成"

    # 生成加固报告
    lynis audit system --report-file /tmp/os_hardening_report.txt
    log "加固报告已生成: /tmp/os_hardening_report.txt"
}

# 执行主函数
main "$@"
```

##### 4.1.2 Docker容器加固

```bash
#!/bin/bash
# docker_hardening.sh - Docker容器安全加固脚本

set -euo pipefail

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Docker守护进程加固
harden_docker_daemon() {
    log "开始Docker守护进程加固..."

    # 创建Docker配置目录
    mkdir -p /etc/docker

    # 配置Docker守护进程
    cat > /etc/docker/daemon.json << EOF
{
  "live-restore": true,
  "userland-proxy": false,
  "experimental": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "default-runtime": "runc",
  "runtimes": {
    "runc": {
      "path": "runc"
    }
  },
  "bridge": "none",
  "ip-forward": false,
  "iptables": false,
  "ip-masq": false,
  "userns-remap": "default",
  "no-new-privileges": true,
  "seccomp-profile": "/etc/docker/seccomp/default.json",
  "cgroup-parent": "/docker.slice",
  "default-shm-size": "64m",
  "debug": false,
  "tls": true,
  "tlscacert": "/etc/docker/certs/ca.pem",
  "tlscert": "/etc/docker/certs/server-cert.pem",
  "tlskey": "/etc/docker/certs/server-key.pem",
  "tlsverify": true
}
EOF

    # 创建Docker用户命名空间
    echo "dockremap:165536:65536" >> /etc/subuid
    echo "dockremap:165536:65536" >> /etc/subgid

    # 重启Docker服务
    systemctl restart docker

    log "Docker守护进程加固完成"
}

# 创建安全配置文件
create_security_configs() {
    log "开始创建安全配置文件..."

    # 创建AppArmor配置
    mkdir -p /etc/apparmor.d/docker
    cat > /etc/apparmor.d/docker/docker-default << EOF
#include <tunables/global>

profile docker-default flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>

  # 网络访问
  network inet tcp,
  network inet udp,
  network inet6 tcp,
  network inet6 udp,

  # 文件系统访问
  / r,
  /bin/** ix,
  /sbin/** ix,
  /usr/bin/** ix,
  /usr/sbin/** ix,
  /lib/** mr,
  /lib64/** mr,
  /etc/** r,
  /var/** r,
  /tmp/** rw,
  /home/** rw,

  # 拒绝特权操作
  deny capability sys_admin,
  deny capability sys_module,
  deny capability sys_rawio,
  deny capability sys_ptrace,
  deny capability sys_time,
  deny capability sys_boot,
  deny capability mac_admin,
  deny capability mac_override,

  # 拒绝敏感文件访问
  deny /proc/sys/** w,
  deny /sys/** w,
  deny /dev/mem r,
  deny /dev/kmem r,
  deny /dev/port r,

  # 拒绝挂载操作
  deny mount,
  deny umount,

  # 拒绝模块操作
  deny /sbin/insmod ix,
  deny /sbin/rmmod ix,
  deny /sbin/modprobe ix,
  deny /bin/kmod ix,
}
EOF

    # 加载AppArmor配置
    apparmor_parser -r /etc/apparmor.d/docker/docker-default

    # 创建Seccomp配置
    mkdir -p /etc/docker/seccomp
    cat > /etc/docker/seccomp/default.json << EOF
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": [
    "SCMP_ARCH_X86_64",
    "SCMP_ARCH_X86",
    "SCMP_ARCH_X32"
  ],
  "syscalls": [
    {
      "names": [
        "accept",
        "accept4",
        "access",
        "adjtimex",
        "alarm",
        "bind",
        "brk",
        "capget",
        "capset",
        "chdir",
        "chmod",
        "chown",
        "chown32",
        "clock_getres",
        "clock_gettime",
        "clock_nanosleep",
        "close",
        "connect",
        "copy_file_range",
        "creat",
        "dup",
        "dup2",
        "dup3",
        "epoll_create",
        "epoll_create_old",
        "epoll_ctl",
        "epoll_ctl_old",
        "epoll_pwait",
        "epoll_wait",
        "epoll_wait_old",
        "eventfd",
        "eventfd2",
        "execve",
        "execveat",
        "exit",
        "exit_group",
        "faccessat",
        "fadvise64",
        "fadvise64_64",
        "fallocate",
        "fanotify_mark",
        "fchdir",
        "fchmod",
        "fchmodat",
        "fchown",
        "fchown32",
        "fchownat",
        "fcntl",
        "fcntl64",
        "fdatasync",
        "fgetxattr",
        "flistxattr",
        "flock",
        "fork",
        "fremovexattr",
        "fsetxattr",
        "fstat",
        "fstat64",
        "fstatat64",
        "fstatfs",
        "fstatfs64",
        "fsync",
        "ftruncate",
        "ftruncate64",
        "futex",
        "getcwd",
        "getdents",
        "getdents64",
        "getegid",
        "getegid32",
        "geteuid",
        "geteuid32",
        "getgid",
        "getgid32",
        "getgroups",
        "getgroups32",
        "getitimer",
        "getpeername",
        "getpgid",
        "getpgrp",
        "getpid",
        "getppid",
        "getpriority",
        "getrandom",
        "getresgid",
        "getresgid32",
        "getresuid",
        "getresuid32",
        "getrlimit",
        "get_robust_list",
        "getrusage",
        "getsid",
        "getsockname",
        "getsockopt",
        "get_thread_area",
        "gettid",
        "gettimeofday",
        "getuid",
        "getuid32",
        "getxattr",
        "inotify_add_watch",
        "inotify_init",
        "inotify_init1",
        "inotify_rm_watch",
        "io_cancel",
        "ioctl",
        "io_destroy",
        "io_getevents",
        "ioprio_get",
        "ioprio_set",
        "io_setup",
        "io_submit",
        "ipc",
        "kill",
        "lchown",
        "lchown32",
        "lgetxattr",
        "link",
        "linkat",
        "listen",
        "listxattr",
        "llistxattr",
        "lremovexattr",
        "lseek",
        "lsetxattr",
        "lstat",
        "lstat64",
        "madvise",
        "memfd_create",
        "mincore",
        "mkdir",
        "mkdirat",
        "mknod",
        "mknodat",
        "mlock",
        "mlock2",
        "mlockall",
        "mmap",
        "mmap2",
        "mprotect",
        "mq_getsetattr",
        "mq_notify",
        "mq_open",
        "mq_timedreceive",
        "mq_timedsend",
        "mq_unlink",
        "mremap",
        "msgctl",
        "msgget",
        "msgrcv",
        "msgsnd",
        "msync",
        "munlock",
        "munlockall",
        "munmap",
        "nanosleep",
        "newfstatat",
        "open",
        "openat",
        "pause",
        "pipe",
        "pipe2",
        "poll",
        "ppoll",
        "prctl",
        "pread64",
        "preadv",
        "prlimit64",
        "pselect6",
        "ptrace",
        "pwrite64",
        "pwritev",
        "read",
        "readahead",
        "readlink",
        "readlinkat",
        "readv",
        "recv",
        "recvfrom",
        "recvmmsg",
        "recvmsg",
        "remap_file_pages",
        "removexattr",
        "rename",
        "renameat",
        "renameat2",
        "restart_syscall",
        "rmdir",
        "rt_sigaction",
        "rt_sigpending",
        "rt_sigprocmask",
        "rt_sigqueueinfo",
        "rt_sigreturn",
        "rt_sigsuspend",
        "rt_sigtimedwait",
        "rt_tgsigqueueinfo",
        "sched_getaffinity",
        "sched_getattr",
        "sched_getparam",
        "sched_get_priority_max",
        "sched_get_priority_min",
        "sched_getscheduler",
        "sched_rr_get_interval",
        "sched_setaffinity",
        "sched_setattr",
        "sched_setparam",
        "sched_setscheduler",
        "sched_yield",
        "seccomp",
        "select",
        "semctl",
        "semget",
        "semop",
        "semtimedop",
        "send",
        "sendfile",
        "sendfile64",
        "sendmmsg",
        "sendmsg",
        "sendto",
        "setfsgid",
        "setfsgid32",
        "setfsuid",
        "setfsuid32",
        "setgid",
        "setgid32",
        "setgroups",
        "setgroups32",
        "setitimer",
        "setpgid",
        "setpriority",
        "setregid",
        "setregid32",
        "setresgid",
        "setresgid32",
        "setresuid",
        "setresuid32",
        "setreuid",
        "setreuid32",
        "setrlimit",
        "set_robust_list",
        "setsid",
        "setsockopt",
        "set_thread_area",
        "set_tid_address",
        "setuid",
        "setuid32",
        "setxattr",
        "shmat",
        "shmctl",
        "shmdt",
        "shmget",
        "shutdown",
        "sigaltstack",
        "signalfd",
        "signalfd4",
        "sigreturn",
        "socket",
        "socketcall",
        "socketpair",
        "splice",
        "stat",
        "stat64",
        "statfs",
        "statfs64",
        "statx",
        "symlink",
        "symlinkat",
        "sync",
        "sync_file_range",
        "syncfs",
        "sysinfo",
        "tee",
        "tgkill",
        "time",
        "timer_create",
        "timer_delete",
        "timerfd_create",
        "timerfd_gettime",
        "timerfd_settime",
        "timer_getoverrun",
        "timer_gettime",
        "timer_settime",
        "times",
        "tkill",
        "truncate",
        "truncate64",
        "ugetrlimit",
        "umask",
        "uname",
        "unlink",
        "unlinkat",
        "utime",
        "utimensat",
        "utimes",
        "vfork",
        "vmsplice",
        "wait4",
        "waitid",
        "waitpid",
        "write",
        "writev"
      ],
      "action": "SCMP_ACT_ALLOW"
    },
    {
      "names": [
        "acct",
        "add_key",
        "bpf",
        "clock_adjtime",
        "create_module",
        "delete_module",
        "finit_module",
        "get_kernel_syms",
        "init_module",
        "ioperm",
        "iopl",
        "kcmp",
        "kexec_file_load",
        "kexec_load",
        "keyctl",
        "lookup_dcookie",
        "mount",
        "move_pages",
        "name_to_handle_at",
        "nfsservctl",
        "open_by_handle_at",
        "perf_event_open",
        "personality",
        "pivot_root",
        "process_vm_readv",
        "process_vm_writev",
        "ptrace",
        "query_module",
        "quotactl",
        "reboot",
        "request_key",
        "set_mempolicy",
        "setdomainname",
        "sethostname",
        "setns",
        "settimeofday",
        "stime",
        "swapoff",
        "swapon",
        "sysfs",
        "_sysctl",
        "umount",
        "umount2",
        "unshare",
        "uselib",
        "userfaultfd",
        "ustat",
        "vm86",
        "vm86old"
      ],
      "action": "SCMP_ACT_ERRNO"
    }
  ]
}
EOF

    log "安全配置文件创建完成"
}

# 创建安全容器模板
create_secure_container_template() {
    log "开始创建安全容器模板..."

    # 创建Docker Compose模板
    cat > /opt/docker/templates/secure-app.yml << EOF
version: '3.8'

services:
  app:
    image: \${IMAGE_NAME}
    container_name: \${CONTAINER_NAME}
    restart: unless-stopped

    # 安全配置
    security_opt:
      - no-new-privileges:true
      - apparmor:docker-default
      - seccomp:/etc/docker/seccomp/default.json

    # 用户配置
    user: "1000:1000"

    # 资源限制
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M

    # 文件系统配置
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/tmp:noexec,nosuid,size=50m
      - /run:noexec,nosuid,size=50m

    # 网络配置
    networks:
      - app-network

    # 只读根文件系统
    read_only: true

    # 临时目录
    volumes:
      - app-data:/data:rw

    # 健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    # 环境变量
    environment:
      - NODE_ENV=production
      - PORT=3000

networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  app-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/data/app
EOF

    log "安全容器模板创建完成"
}

# 主函数
main() {
    log "开始Docker容器安全加固..."

    # 检查是否为root用户
    if [ "$EUID" -ne 0 ]; then
        echo "请以root用户运行此脚本"
        exit 1
    fi

    # 创建目录
    mkdir -p /opt/docker/templates
    mkdir -p /etc/docker/certs

    # 执行加固步骤
    harden_docker_daemon
    create_security_configs
    create_secure_container_template

    log "Docker容器安全加固完成"

    # 生成加固报告
    docker system df > /tmp/docker_security_report.txt
    log "加固报告已生成: /tmp/docker_security_report.txt"
}

# 执行主函数
main "$@"
```

#### 4.2 应用安全加固

##### 4.2.1 Node.js应用安全配置

```javascript
// security_middleware.js - Node.js应用安全中间件
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const express = require('express');

// 安全配置
const securityConfig = {
  // CSP配置
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },

  // CORS配置
  corsOptions: {
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000'];

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS策略不允许此来源'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  },

  // 速率限制配置
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP最多100个请求
    message: '请求过于频繁，请稍后再试',
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
      // 记录速率限制违规
      console.warn(`速率限制违规: IP=${req.ip}, URL=${req.originalUrl}`);
      res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        retryAfter: Math.round(this.windowMs / 1000),
      });
    },
  },

  // CSRF配置
  csrfOptions: {
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  },
};

// 初始化安全中间件
function initSecurityMiddleware(app) {
  // 基础安全头设置
  app.use(
    helmet({
      contentSecurityPolicy: securityConfig.contentSecurityPolicy,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  );

  // CORS配置
  app.use(cors(securityConfig.corsOptions));

  // 速率限制
  app.use(rateLimit(securityConfig.rateLimitOptions));

  // Cookie解析器
  app.use(cookieParser());

  // CSRF保护
  if (process.env.NODE_ENV === 'production') {
    app.use(csrf(securityConfig.csrfOptions));

    // 提供CSRF令牌
    app.get('/api/csrf-token', (req, res) => {
      res.json({ csrfToken: req.csrfToken() });
    });
  }

  // 请求日志记录
  app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      };

      // 记录慢请求
      if (duration > 1000) {
        console.warn('慢请求检测:', logData);
      }

      // 记录错误请求
      if (res.statusCode >= 400) {
        console.error('错误请求:', logData);
      }
    });

    next();
  });
}

module.exports = {
  securityConfig,
  initSecurityMiddleware,
};
```

##### 4.2.2 数据库安全配置

```sql
-- mysql_security_hardening.sql - MySQL数据库安全加固脚本

-- 创建安全用户
CREATE USER 'security_admin'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON *.* TO 'security_admin'@'localhost' WITH GRANT OPTION;

-- 创建应用用户（最小权限原则）
CREATE USER 'yyc3_app'@'%' IDENTIFIED BY 'AppPassword123!';
GRANT SELECT, INSERT, UPDATE, DELETE ON yyc3_ailp.* TO 'yyc3_app'@'%';

-- 创建只读用户
CREATE USER 'yyc3_readonly'@'%' IDENTIFIED BY 'ReadonlyPassword123!';
GRANT SELECT ON yyc3_ailp.* TO 'yyc3_readonly'@'%';

-- 删除默认用户和数据库
DROP USER ''@'localhost';
DROP USER ''@'hostname';
DROP DATABASE IF EXISTS test;

-- 设置密码策略
INSTALL PLUGIN validate_password SONAME 'validate_password.so';
SET GLOBAL validate_password.policy = 'STRONG';
SET GLOBAL validate_password.length = 12;
SET GLOBAL validate_password.mixed_case_count = 1;
SET GLOBAL validate_password.number_count = 1;
SET GLOBAL validate_password.special_char_count = 1;

-- 配置SSL
SHOW VARIABLES LIKE '%ssl%';

-- 启用查询日志（仅用于安全审计）
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/general.log';

-- 配置二进制日志（用于恢复和审计）
SET GLOBAL log_bin = 'ON';
SET GLOBAL binlog_format = 'ROW';
SET GLOBAL binlog_row_image = 'FULL';

-- 创建审计表
CREATE TABLE security_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_name VARCHAR(100) NOT NULL,
    host VARCHAR(100) NOT NULL,
    connection_id INT NOT NULL,
    query_type VARCHAR(20) NOT NULL,
    database_name VARCHAR(100),
    table_name VARCHAR(100),
    sql_text TEXT NOT NULL,
    rows_affected INT DEFAULT 0,
    INDEX idx_event_time (event_time),
    INDEX idx_user_name (user_name),
    INDEX idx_query_type (query_type)
) ENGINE=InnoDB;

-- 创建审计触发器
DELIMITER //

CREATE TRIGGER audit_users_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO security_audit (user_name, host, connection_id, query_type, database_name, table_name, sql_text, rows_affected)
    VALUES (CURRENT_USER(), @@hostname, CONNECTION_ID(), 'INSERT', DATABASE(), 'users', 'INSERT INTO users', 1);
END//

CREATE TRIGGER audit_users_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO security_audit (user_name, host, connection_id, query_type, database_name, table_name, sql_text, rows_affected)
    VALUES (CURRENT_USER(), @@hostname, CONNECTION_ID(), 'UPDATE', DATABASE(), 'users', CONCAT('UPDATE users WHERE id=', NEW.id), ROW_COUNT());
END//

CREATE TRIGGER audit_users_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO security_audit (user_name, host, connection_id, query_type, database_name, table_name, sql_text, rows_affected)
    VALUES (CURRENT_USER(), @@hostname, CONNECTION_ID(), 'DELETE', DATABASE(), 'users', CONCAT('DELETE FROM users WHERE id=', OLD.id), 1);
END//

DELIMITER ;

-- 创建安全视图
CREATE VIEW security_events AS
SELECT
    event_time,
    user_name,
    host,
    query_type,
    database_name,
    table_name,
    sql_text,
    rows_affected
FROM security_audit
WHERE event_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY event_time DESC;

-- 创建安全存储过程
DELIMITER //

CREATE PROCEDURE security_report(IN days INT)
BEGIN
    SELECT
        query_type,
        COUNT(*) AS count,
        COUNT(DISTINCT user_name) AS unique_users
    FROM security_audit
    WHERE event_time >= DATE_SUB(NOW(), INTERVAL days DAY)
    GROUP BY query_type
    ORDER BY count DESC;
END//

CREATE PROCEDURE user_activity_report(IN days INT, IN user VARCHAR(100))
BEGIN
    SELECT
        event_time,
        query_type,
        database_name,
        table_name,
        sql_text,
        rows_affected
    FROM security_audit
    WHERE event_time >= DATE_SUB(NOW(), INTERVAL days DAY)
      AND user_name = user
    ORDER BY event_time DESC;
END//

DELIMITER ;

-- 授予安全权限
GRANT SELECT ON yyc3_ailp.security_events TO 'yyc3_readonly'@'%';
GRANT EXECUTE ON PROCEDURE yyc3_ailp.security_report TO 'yyc3_readonly'@'%';
GRANT EXECUTE ON PROCEDURE yyc3_ailp.user_activity_report TO 'yyc3_readonly'@'%';

-- 刷新权限
FLUSH PRIVILEGES;
```

### 5. 合规性管理

#### 5.1 数据保护合规

```typescript
// data_protection_compliance.ts - 数据保护合规管理
export interface DataProtectionPolicy {
  // 数据分类
  dataClassification: {
    public: DataClass;
    internal: DataClass;
    confidential: DataClass;
    restricted: DataClass;
  };

  // 保留策略
  retentionPolicy: {
    [key: string]: {
      retentionPeriod: number; // 保留期限（天）
      archivalRequired: boolean; // 是否需要归档
      deletionMethod: string; // 删除方法
    };
  };

  // 处理依据
  lawfulBasis: {
    [key: string]: {
      basis: string; // 处理依据
      purpose: string; // 处理目的
      documentation: string; // 文档记录
    };
  };

  // 数据主体权利
  dataSubjectRights: {
    rightOfAccess: boolean;
    rightToRectification: boolean;
    rightToErasure: boolean;
    rightToRestrictProcessing: boolean;
    rightToDataPortability: boolean;
    rightToObject: boolean;
    rightsRelatedToAutomatedDecisionMaking: boolean;
  };
}

// 数据保护合规服务
export class DataProtectionComplianceService {
  private policy: DataProtectionPolicy;
  private auditLogger: AuditLogger;
  private dataMapper: DataMapper;

  constructor(policy: DataProtectionPolicy) {
    this.policy = policy;
    this.auditLogger = new AuditLogger();
    this.dataMapper = new DataMapper();
  }

  // 数据分类
  async classifyData(data: any): Promise<string> {
    try {
      // 分析数据内容
      const analysis = await this.analyzeDataContent(data);

      // 确定数据分类
      let classification = 'public';

      if (analysis.containsPersonalData) {
        if (analysis.containsSensitiveData) {
          classification = 'restricted';
        } else {
          classification = 'confidential';
        }
      } else if (analysis.containsInternalData) {
        classification = 'internal';
      }

      // 记录分类决策
      await this.auditLogger.log('data_classification', {
        classification,
        analysis,
        timestamp: new Date(),
      });

      return classification;
    } catch (error) {
      console.error('数据分类失败:', error);
      throw new Error('数据分类失败');
    }
  }

  // 数据保留管理
  async manageDataRetention(dataId: string, classification: string): Promise<void> {
    try {
      // 获取保留策略
      const retentionPolicy = this.policy.retentionPolicy[classification];
      if (!retentionPolicy) {
        throw new Error(`未找到分类 ${classification} 的保留策略`);
      }

      // 检查数据年龄
      const dataAge = await this.getDataAge(dataId);

      if (dataAge > retentionPolicy.retentionPeriod) {
        // 检查是否需要归档
        if (retentionPolicy.archivalRequired) {
          await this.archiveData(dataId);
        }

        // 删除数据
        await this.deleteData(dataId, retentionPolicy.deletionMethod);

        // 记录删除操作
        await this.auditLogger.log('data_deletion', {
          dataId,
          classification,
          dataAge,
          deletionMethod: retentionPolicy.deletionMethod,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('数据保留管理失败:', error);
      throw new Error('数据保留管理失败');
    }
  }

  // 数据主体权利处理
  async handleDataSubjectRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    try {
      // 验证请求
      const validationResult = await this.validateDataSubjectRequest(request);
      if (!validationResult.valid) {
        return {
          status: 'rejected',
          reason: validationResult.reason,
        };
      }

      let response: DataSubjectResponse;

      switch (request.type) {
        case 'access':
          response = await this.handleAccessRequest(request);
          break;
        case 'rectification':
          response = await this.handleRectificationRequest(request);
          break;
        case 'erasure':
          response = await this.handleErasureRequest(request);
          break;
        case 'restriction':
          response = await this.handleRestrictionRequest(request);
          break;
        case 'portability':
          response = await this.handlePortabilityRequest(request);
          break;
        case 'objection':
          response = await this.handleObjectionRequest(request);
          break;
        default:
          response = {
            status: 'rejected',
            reason: '不支持的请求类型',
          };
      }

      // 记录请求处理
      await this.auditLogger.log('data_subject_request', {
        requestId: request.id,
        type: request.type,
        status: response.status,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      console.error('数据主体权利处理失败:', error);
      throw new Error('数据主体权利处理失败');
    }
  }

  // 数据保护影响评估
  async conductDPIA(processingActivity: ProcessingActivity): Promise<DPIAResult> {
    try {
      // 评估风险
      const riskAssessment = await this.assessRisks(processingActivity);

      // 确定风险等级
      let riskLevel = 'low';
      if (riskAssessment.highRiskFactors.length > 0) {
        riskLevel = 'high';
      } else if (riskAssessment.mediumRiskFactors.length > 0) {
        riskLevel = 'medium';
      }

      // 生成缓解措施
      const mitigationMeasures = await this.generateMitigationMeasures(riskAssessment);

      // 创建DPIA结果
      const dpiaResult: DPIAResult = {
        processingActivity,
        riskLevel,
        riskAssessment,
        mitigationMeasures,
        approved: riskLevel !== 'high',
        reviewDate: new Date(),
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后
      };

      // 记录DPIA
      await this.auditLogger.log('dpia_conducted', {
        activityId: processingActivity.id,
        riskLevel,
        approved: dpiaResult.approved,
        timestamp: new Date(),
      });

      return dpiaResult;
    } catch (error) {
      console.error('数据保护影响评估失败:', error);
      throw new Error('数据保护影响评估失败');
    }
  }

  // 辅助方法
  private async analyzeDataContent(data: any): Promise<any> {
    // 实现数据内容分析
    return {
      containsPersonalData: false,
      containsSensitiveData: false,
      containsInternalData: false,
    };
  }

  private async getDataAge(dataId: string): Promise<number> {
    // 实现获取数据年龄的逻辑
    return 0;
  }

  private async archiveData(dataId: string): Promise<void> {
    // 实现数据归档的逻辑
  }

  private async deleteData(dataId: string, method: string): Promise<void> {
    // 实现数据删除的逻辑
  }

  private async validateDataSubjectRequest(request: DataSubjectRequest): Promise<any> {
    // 实现验证数据主体请求的逻辑
    return { valid: true };
  }

  private async handleAccessRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    // 实现处理访问请求的逻辑
    return { status: 'approved', data: {} };
  }

  private async handleRectificationRequest(
    request: DataSubjectRequest
  ): Promise<DataSubjectResponse> {
    // 实现处理纠正请求的逻辑
    return { status: 'approved' };
  }

  private async handleErasureRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    // 实现处理删除请求的逻辑
    return { status: 'approved' };
  }

  private async handleRestrictionRequest(
    request: DataSubjectRequest
  ): Promise<DataSubjectResponse> {
    // 实现处理限制请求的逻辑
    return { status: 'approved' };
  }

  private async handlePortabilityRequest(
    request: DataSubjectRequest
  ): Promise<DataSubjectResponse> {
    // 实现处理可携带性请求的逻辑
    return { status: 'approved', data: {} };
  }

  private async handleObjectionRequest(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    // 实现处理异议请求的逻辑
    return { status: 'approved' };
  }

  private async assessRisks(processingActivity: ProcessingActivity): Promise<any> {
    // 实现风险评估的逻辑
    return {
      highRiskFactors: [],
      mediumRiskFactors: [],
      lowRiskFactors: [],
    };
  }

  private async generateMitigationMeasures(riskAssessment: any): Promise<string[]> {
    // 实现生成缓解措施的逻辑
    return [];
  }
}
```

### 6. 安全事件响应

#### 6.1 安全事件响应流程

```yaml
# incident_response_process.yaml - 安全事件响应流程
incident_response:
  # 事件分类
  incident_classification:
    critical:
      description: '对业务造成严重影响的安全事件'
      examples: ['数据泄露', '系统瘫痪', '大规模DDoS攻击']
      response_time: '15分钟'
      escalation: '立即'

    high:
      description: '对业务造成较大影响的安全事件'
      examples: ['重要系统被入侵', '敏感数据访问异常', '服务中断']
      response_time: '1小时'
      escalation: '2小时'

    medium:
      description: '对业务造成一定影响的安全事件'
      examples: ['一般系统被入侵', '非敏感数据泄露', '性能下降']
      response_time: '4小时'
      escalation: '24小时'

    low:
      description: '对业务影响较小的安全事件'
      examples: ['异常登录尝试', '配置错误', '误报']
      response_time: '24小时'
      escalation: '72小时'

  # 响应阶段
  response_phases:
    preparation:
      description: '准备阶段'
      activities:
        - '建立应急响应团队'
        - '制定响应计划'
        - '准备工具和资源'
        - '进行培训和演练'

    detection_analysis:
      description: '检测与分析阶段'
      activities:
        - '事件检测'
        - '初步分析'
        - '确定影响范围'
        - '事件分类'

    containment_eradication:
      description: '遏制与根除阶段'
      activities:
        - '短期遏制'
        - '系统备份'
        - '长期遏制'
        - '根除原因'

    recovery:
      description: '恢复阶段'
      activities:
        - '系统恢复'
        - '数据恢复'
        - '验证恢复'
        - '监控状态'

    lessons_learned:
      description: '经验总结阶段'
      activities:
        - '事件分析'
        - '改进措施'
        - '更新计划'
        - '知识分享'

  # 沟通计划
  communication_plan:
    internal:
      technical_team:
        channel: 'Slack专用频道'
        frequency: '实时更新'
        content: '技术细节、处理进展'

      management:
        channel: '邮件+电话'
        frequency: '每小时'
        content: '业务影响、处理进展'

      employees:
        channel: '内部公告'
        frequency: '根据需要'
        content: '事件概况、注意事项'

    external:
      customers:
        channel: '邮件+应用内通知'
        frequency: '根据需要'
        content: '影响范围、恢复时间'

      regulators:
        channel: '正式报告'
        frequency: '按法规要求'
        content: '事件详情、影响评估'

      public:
        channel: '官方声明'
        frequency: '根据需要'
        content: '事件概况、处理进展'
```

#### 6.2 安全事件响应脚本

```bash
#!/bin/bash
# incident_response.sh - 安全事件响应脚本

set -euo pipefail

# 配置变量
INCIDENT_ID="${1:-}"
INCIDENT_TYPE="${2:-}"
SEVERITY="${3:-medium}"
LOG_FILE="/var/log/incident_response.log"

# 日志函数
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 创建事件记录
create_incident_record() {
    local incident_id="$1"
    local incident_type="$2"
    local severity="$3"

    log "创建事件记录: ID=$incident_id, 类型=$incident_type, 严重程度=$severity"

    # 创建事件目录
    mkdir -p "/opt/incidents/$incident_id"

    # 创建事件记录文件
    cat > "/opt/incidents/$incident_id/incident_info.json" << EOF
{
  "incident_id": "$incident_id",
  "incident_type": "$incident_type",
  "severity": "$severity",
  "status": "open",
  "created_at": "$(date -Iseconds)",
  "updated_at": "$(date -Iseconds)",
  "assigned_to": "",
  "description": "",
  "affected_systems": [],
  "impact_assessment": "",
  "containment_actions": [],
  "eradication_actions": [],
  "recovery_actions": [],
  "lessons_learned": ""
}
EOF

    log "事件记录已创建: /opt/incidents/$incident_id/incident_info.json"
}

# 系统隔离
isolate_system() {
    local incident_id="$1"
    local system_ip="$2"

    log "隔离系统: IP=$system_ip"

    # 记录隔离操作
    echo "$(date -Iseconds),isolate_system,$system_ip" >> "/opt/incidents/$incident_id/actions.log"

    # 防火墙隔离
    iptables -A INPUT -s "$system_ip" -j DROP
    iptables -A OUTPUT -d "$system_ip" -j DROP

    # 保存防火墙规则
    iptables-save > "/opt/incidents/$incident_id/iptables_$(date +%s).rules"

    log "系统已隔离: IP=$system_ip"
}

# 收集证据
collect_evidence() {
    local incident_id="$1"
    local system_ip="$2"
    local evidence_dir="/opt/incidents/$incident_id/evidence"

    log "收集证据: 系统=$system_ip"

    # 创建证据目录
    mkdir -p "$evidence_dir"

    # 收集系统信息
    ssh "$system_ip" "uname -a > /tmp/uname.txt"
    scp "$system_ip:/tmp/uname.txt" "$evidence_dir/uname.txt"

    # 收集进程信息
    ssh "$system_ip" "ps aux > /tmp/processes.txt"
    scp "$system_ip:/tmp/processes.txt" "$evidence_dir/processes.txt"

    # 收集网络连接
    ssh "$system_ip" "netstat -tuln > /tmp/netstat.txt"
    scp "$system_ip:/tmp/netstat.txt" "$evidence_dir/netstat.txt"

    # 收集系统日志
    ssh "$system_ip" "journalctl --since '1 day ago' > /tmp/journal.log"
    scp "$system_ip:/tmp/journal.log" "$evidence_dir/journal.log"

    # 创建证据哈希
    find "$evidence_dir" -type f -exec sha256sum {} \; > "$evidence_dir/evidence_hashes.txt"

    log "证据收集完成: $evidence_dir"
}

# 恶意软件扫描
scan_malware() {
    local incident_id="$1"
    local system_ip="$2"
    local scan_dir="/opt/incidents/$incident_id/scans"

    log "恶意软件扫描: 系统=$system_ip"

    # 创建扫描目录
    mkdir -p "$scan_dir"

    # 执行恶意软件扫描
    ssh "$system_ip" "clamscan -r / --log=/tmp/clamscan.log" || true
    scp "$system_ip:/tmp/clamscan.log" "$scan_dir/clamscan.log"

    # 分析扫描结果
    local infected_files=$(grep "FOUND" "$scan_dir/clamscan.log" | wc -l)

    if [ "$infected_files" -gt 0 ]; then
        log "发现 $infected_files 个感染文件"
        grep "FOUND" "$scan_dir/clamscan.log" > "$scan_dir/infected_files.txt"
    else
        log "未发现感染文件"
    fi

    log "恶意软件扫描完成"
}

# 系统加固
harden_system() {
    local incident_id="$1"
    local system_ip="$2"

    log "系统加固: 系统=$system_ip"

    # 更新系统
    ssh "$system_ip" "apt-get update && apt-get upgrade -y"

    # 禁用不必要的服务
    ssh "$system_ip" "systemctl disable rpcbind || true"
    ssh "$system_ip" "systemctl disable nfs-server || true"

    # 配置防火墙
    ssh "$system_ip" "ufw default deny incoming"
    ssh "$system_ip" "ufw default allow outgoing"
    ssh "$system_ip" "ufw allow from 192.168.1.0/24 to any port 22 proto tcp"
    ssh "$system_ip" "ufw allow 80/tcp"
    ssh "$system_ip" "ufw allow 443/tcp"
    ssh "$system_ip" "ufw --force enable"

    # 安装安全工具
    ssh "$system_ip" "apt-get install -y fail2ban rkhunter"
    ssh "$system_ip" "systemctl enable fail2ban"
    ssh "$system_ip" "systemctl start fail2ban"

    log "系统加固完成: $system_ip"
}

# 恢复系统
restore_system() {
    local incident_id="$1"
    local system_ip="$2"
    local backup_date="$3"

    log "恢复系统: 系统=$system_ip, 备份日期=$backup_date"

    # 从备份恢复系统
    # 这里应该包含实际的恢复逻辑
    # 例如：从备份恢复文件、数据库等

    log "系统恢复完成: $system_ip"
}

# 验证恢复
verify_recovery() {
    local incident_id="$1"
    local system_ip="$2"

    log "验证恢复: 系统=$system_ip"

    # 检查系统状态
    local system_status=$(ssh "$system_ip" "systemctl is-active yyc3-ailp" || echo "inactive")

    if [ "$system_status" = "active" ]; then
        log "系统服务运行正常"
    else
        log "警告: 系统服务未运行"
    fi

    # 检查网络连接
    if ping -c 3 "$system_ip" &> /dev/null; then
        log "网络连接正常"
    else
        log "警告: 网络连接异常"
    fi

    # 检查应用功能
    local app_status=$(curl -s -o /dev/null -w "%{http_code}" "http://$system_ip/health" || echo "000")

    if [ "$app_status" = "200" ]; then
        log "应用功能正常"
    else
        log "警告: 应用功能异常，状态码: $app_status"
    fi

    log "恢复验证完成"
}

# 生成事件报告
generate_incident_report() {
    local incident_id="$1"

    log "生成事件报告: $incident_id"

    # 创建报告目录
    local report_dir="/opt/incidents/$incident_id/report"
    mkdir -p "$report_dir"

    # 生成报告
    cat > "$report_dir/incident_report.md" << EOF
# 安全事件报告

## 事件信息

- 事件ID: $incident_id
- 事件类型: $(jq -r '.incident_type' "/opt/incidents/$incident_id/incident_info.json")
- 严重程度: $(jq -r '.severity' "/opt/incidents/$incident_id/incident_info.json")
- 创建时间: $(jq -r '.created_at' "/opt/incidents/$incident_id/incident_info.json")
- 更新时间: $(jq -r '.updated_at' "/opt/incidents/$incident_id/incident_info.json")

## 事件描述

$(jq -r '.description' "/opt/incidents/$incident_id/incident_info.json")

## 影响评估

$(jq -r '.impact_assessment' "/opt/incidents/$incident_id/incident_info.json")

## 遏制措施

$(jq -r '.containment_actions[]' "/opt/incidents/$incident_id/incident_info.json")

## 根除措施

$(jq -r '.eradication_actions[]' "/opt/incidents/$incident_id/incident_info.json")

## 恢复措施

$(jq -r '.recovery_actions[]' "/opt/incidents/$incident_id/incident_info.json")

## 经验教训

$(jq -r '.lessons_learned' "/opt/incidents/$incident_id/incident_info.json")

## 证据清单

$(find "/opt/incidents/$incident_id/evidence" -type f -exec basename {} \; | sort | sed 's/^/- /')

## 扫描结果

$(if [ -f "/opt/incidents/$incident_id/scans/clamscan.log" ]; then
    echo "\`\`\`"
    cat "/opt/incidents/$incident_id/scans/clamscan.log"
    echo "\`\`\`"
else
    echo "无扫描结果"
fi)

EOF

    log "事件报告已生成: $report_dir/incident_report.md"
}

# 主函数
main() {
    local incident_id="$1"
    local incident_type="$2"
    local severity="$3"
    local action="${4:-all}"

    log "开始安全事件响应: ID=$incident_id, 类型=$incident_type, 严重程度=$severity, 操作=$action"

    # 创建事件记录
    create_incident_record "$incident_id" "$incident_type" "$severity"

    # 根据操作类型执行相应操作
    case "$action" in
        "isolate")
            isolate_system "$incident_id" "${5:-}"
            ;;
        "collect_evidence")
            collect_evidence "$incident_id" "${5:-}"
            ;;
        "scan_malware")
            scan_malware "$incident_id" "${5:-}"
            ;;
        "harden")
            harden_system "$incident_id" "${5:-}"
            ;;
        "restore")
            restore_system "$incident_id" "${5:-}" "${6:-}"
            ;;
        "verify")
            verify_recovery "$incident_id" "${5:-}"
            ;;
        "report")
            generate_incident_report "$incident_id"
            ;;
        "all")
            # 执行完整响应流程
            isolate_system "$incident_id" "${5:-}"
            collect_evidence "$incident_id" "${5:-}"
            scan_malware "$incident_id" "${5:-}"
            harden_system "$incident_id" "${5:-}"
            restore_system "$incident_id" "${5:-}" "${6:-}"
            verify_recovery "$incident_id" "${5:-}"
            generate_incident_report "$incident_id"
            ;;
        *)
            echo "错误: 不支持的操作类型 $action"
            exit 1
            ;;
    esac

    log "安全事件响应完成"
}

# 检查参数
if [ $# -lt 3 ]; then
    echo "用法: $0 <事件ID> <事件类型> <严重程度> [操作] [参数...]"
    echo "操作类型: isolate, collect_evidence, scan_malware, harden, restore, verify, report, all"
    exit 1
fi

# 执行主函数
main "$@"
```

### 7. 安全最佳实践

#### 7.1 安全开发实践

1. **安全编码规范**
   - 输入验证和输出编码
   - 参数化查询防止SQL注入
   - 安全的密码存储和验证
   - 安全的错误处理和日志记录

2. **依赖安全管理**
   - 定期更新依赖库
   - 使用依赖扫描工具
   - 评估第三方组件安全性
   - 建立依赖白名单

3. **安全测试**
   - 静态应用安全测试(SAST)
   - 动态应用安全测试(DAST)
   - 交互式应用安全测试(IAST)
   - 渗透测试

4. **安全代码审查**
   - 代码安全审查清单
   - 安全专家参与审查
   - 自动化安全检查工具
   - 安全培训与意识提升

#### 7.2 运维安全实践

1. **访问控制**
   - 最小权限原则
   - 多因素认证
   - 特权账户管理
   - 定期权限审查

2. **系统监控**
   - 实时安全监控
   - 异常行为检测
   - 安全事件告警
   - 日志分析与审计

3. **补丁管理**
   - 定期安全更新
   - 漏洞扫描与评估
   - 补丁测试与验证
   - 紧急补丁流程

4. **备份与恢复**
   - 定期数据备份
   - 备份加密与保护
   - 恢复测试与验证
   - 灾难恢复计划

---

## 总结

YYC3-AILP平台的安全加固与合规指南基于「五高五标五化」理念，建立了全面的安全防护体系和合规管理机制。通过零信任安全架构、深度防御策略、系统安全加固、合规性管理和安全事件响应，确保平台在各种威胁和挑战下的安全性和合规性，为用户提供安全可靠的教育服务。

---

> 「**_YanYuCloudCube_**」
> 「**_<admin@0379.email>_**」
> 「**_Words Initiate Quadrants, Language Serves as Core for the Future_**」
> 「**_All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence_**」
