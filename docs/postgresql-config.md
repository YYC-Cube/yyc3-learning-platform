# PostgreSQL 数据库配置指南

## 1. 环境变量配置

以下是PostgreSQL数据库的完整环境变量配置示例：

```env
# PostgreSQL 数据库配置
DB_HOST=localhost          # 数据库主机地址
DB_PORT=5432              # 数据库端口（PostgreSQL默认端口为5432）
DB_USER=postgres          # 数据库用户名
DB_PASS=your_secure_password_here  # 数据库密码
DB_NAME=ai_learning       # 数据库名称
DB_SSL=false              # 是否启用SSL连接（生产环境建议启用）
DB_CONNECTION_LIMIT=10    # 数据库连接池限制
DB_IDLE_TIMEOUT=30000     # 连接空闲超时时间（毫秒）
DB_MAX_LIFETIME=600000    # 连接最大生命周期（毫秒）
```

## 2. 配置说明

### 2.1 基本连接配置

| 配置项 | 描述 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库服务器地址 | localhost |
| DB_PORT | 数据库服务器端口 | 5432 |
| DB_USER | 数据库用户名 | postgres |
| DB_PASS | 数据库用户密码 | - |
| DB_NAME | 数据库名称 | ai_learning |
| DB_SSL | 是否启用SSL连接 | false |

### 2.2 连接池配置

| 配置项 | 描述 | 默认值 |
|--------|------|--------|
| DB_CONNECTION_LIMIT | 最大连接数 | 10 |
| DB_IDLE_TIMEOUT | 连接空闲超时时间（毫秒） | 30000 |
| DB_MAX_LIFETIME | 连接最大生命周期（毫秒） | 600000 |

## 3. 数据库初始化

项目提供了PostgreSQL数据库初始化脚本，用于创建表结构和初始数据：

```bash
npx tsx scripts/init-db.ts
```

## 4. 数据库测试

可以使用以下命令测试数据库连接：

```bash
npx tsx scripts/test-db.ts
```

## 5. 数据库迁移

如果需要进行数据库迁移，可以考虑使用以下工具：

- [Prisma](https://www.prisma.io/)
- [TypeORM](https://typeorm.io/)
- [Knex.js](https://knexjs.org/)

## 6. 生产环境配置建议

1. **启用SSL连接**：
   ```env
   DB_SSL=true
   ```

2. **增加连接池限制**：
   ```env
   DB_CONNECTION_LIMIT=20
   ```

3. **设置合理的超时时间**：
   ```env
   DB_IDLE_TIMEOUT=60000
   DB_MAX_LIFETIME=1200000
   ```

4. **使用强密码**：
   ```env
   DB_PASS=your-strong-password-with-special-characters
   ```

## 7. 常见问题

### 7.1 连接失败：role "postgres" does not exist

这是因为系统中没有postgres用户。可以使用以下命令创建：

```bash
sudo -u postgres createuser -s your-username
```

或者修改.env文件中的DB_USER为系统中存在的用户：

```env
DB_USER=your-username
```

### 7.2 数据库不存在

可以使用以下命令创建数据库：

```bash
createdb -U your-username your-database-name
```

或者修改.env文件中的DB_NAME为已存在的数据库：

```env
DB_NAME=existing-database-name
```

## 8. 相关文件

- `.env`：本地开发环境配置
- `.env.example`：环境变量示例
- `scripts/init-db.ts`：数据库初始化脚本
- `scripts/test-db.ts`：数据库连接测试脚本
- `lib/database.ts`：数据库连接配置
- `lib/env.ts`：环境变量验证
