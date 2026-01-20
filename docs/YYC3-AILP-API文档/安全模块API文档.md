# YYC³ 学习平台 - 安全模块 API 文档

> ***YanYuCloudCube***
> **标语**：言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> **标语**：万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 属性         | 内容                             |
| ------------ | -------------------------------- |
| **文档标题** | YYC³学习平台 - 安全模块 API 文档 |
| **文档版本** | v1.0.0                           |
| **创建时间** | 2026-02-05                       |
| **适用范围** | YYC³学习平台安全模块 API 接口    |

---

## 📖 概述

本文档描述了YYC³学习平台安全模块提供的API接口，包括加密工具和输入验证工具。

### 模块列表

1. **加密工具模块** (`lib/security/encryption.ts`)
2. **输入验证模块** (`lib/security/input-validator.ts`)
3. **安全审计日志模块** (`lib/security/audit-log.ts`)

---

## 🔐 加密工具模块 API

### 1. 加密数据

**函数名**: `encrypt`

**描述**: 使用AES-256-GCM算法加密数据

**参数**:

| 参数名    | 类型   | 必需 | 描述     |
| --------- | ------ | ---- | -------- |
| plaintext | string | 是   | 明文数据 |
| password  | string | 是   | 加密密码 |

**返回值**: `string` - 加密后的数据（Base64编码）

**示例**:

```typescript
import { encrypt } from '@/lib/security/encryption';

const plaintext = 'Hello, World!';
const password = 'my-secret-password';
const encrypted = encrypt(plaintext, password);
console.log(encrypted); // Base64编码的加密数据
```

**注意事项**:

- 使用AES-256-GCM算法
- 随机生成盐值和初始化向量
- 密码使用PBKDF2进行密钥派生

---

### 2. 解密数据

**函数名**: `decrypt`

**描述**: 解密使用AES-256-GCM算法加密的数据

**参数**:

| 参数名     | 类型   | 必需 | 描述                   |
| ---------- | ------ | ---- | ---------------------- |
| ciphertext | string | 是   | 密文数据（Base64编码） |
| password   | string | 是   | 加密密码               |

**返回值**: `string` - 解密后的明文

**异常**: 解密失败时抛出错误

**示例**:

```typescript
import { decrypt } from '@/lib/security/encryption';

const ciphertext = '...'; // Base64编码的加密数据
const password = 'my-secret-password';
try {
  const decrypted = decrypt(ciphertext, password);
  console.log(decrypted); // Hello, World!
} catch (error) {
  console.error('解密失败:', error);
}
```

---

### 3. 生成哈希值

**函数名**: `hash`

**描述**: 生成数据的哈希值

**参数**:

| 参数名    | 类型   | 必需 | 描述                     |
| --------- | ------ | ---- | ------------------------ |
| data      | string | 是   | 待哈希的数据             |
| algorithm | string | 否   | 哈希算法（默认：sha256） |

**返回值**: `string` - 哈希值（十六进制）

**示例**:

```typescript
import { hash } from '@/lib/security/encryption';

const data = 'Hello, World!';
const hashValue = hash(data, 'sha256');
console.log(hashValue); // SHA-256哈希值
```

---

### 4. 生成随机盐值

**函数名**: `generateSalt`

**描述**: 生成随机盐值

**参数**:

| 参数名 | 类型   | 必需 | 描述                 |
| ------ | ------ | ---- | -------------------- |
| length | number | 否   | 盐值长度（默认：64） |

**返回值**: `string` - 随机盐值（Base64编码）

**示例**:

```typescript
import { generateSalt } from '@/lib/security/encryption';

const salt = generateSalt(64);
console.log(salt); // 随机盐值
```

---

### 5. 验证哈希值

**函数名**: `verifyHash`

**描述**: 验证数据的哈希值是否匹配

**参数**:

| 参数名    | 类型   | 必需 | 描述                     |
| --------- | ------ | ---- | ------------------------ |
| data      | string | 是   | 原始数据                 |
| hashValue | string | 是   | 哈希值                   |
| algorithm | string | 否   | 哈希算法（默认：sha256） |

**返回值**: `boolean` - 是否匹配

**示例**:

```typescript
import { hash, verifyHash } from '@/lib/security/encryption';

const data = 'Hello, World!';
const hashValue = hash(data);
const isValid = verifyHash(data, hashValue);
console.log(isValid); // true
```

---

### 6. 生成随机字符串

**函数名**: `generateRandomString`

**描述**: 生成指定长度的随机字符串

**参数**:

| 参数名 | 类型   | 必需 | 描述       |
| ------ | ------ | ---- | ---------- |
| length | number | 是   | 字符串长度 |

**返回值**: `string` - 随机字符串

**示例**:

```typescript
import { generateRandomString } from '@/lib/security/encryption';

const randomString = generateRandomString(16);
console.log(randomString); // 16位随机字符串
```

---

### 7. 生成UUID

**函数名**: `generateUUID`

**描述**: 生成UUID v4

**返回值**: `string` - UUID字符串

**示例**:

```typescript
import { generateUUID } from '@/lib/security/encryption';

const uuid = generateUUID();
console.log(uuid); // UUID v4字符串
```

---

### 8. 哈希密码

**函数名**: `hashPassword`

**描述**: 使用bcrypt哈希密码

**参数**:

| 参数名     | 类型   | 必需 | 描述                 |
| ---------- | ------ | ---- | -------------------- |
| password   | string | 是   | 明文密码             |
| saltRounds | number | 否   | 盐值轮数（默认：10） |

**返回值**: `Promise<string>` - 哈希后的密码

**示例**:

```typescript
import { hashPassword } from '@/lib/security/encryption';

const password = 'my-password';
const hashedPassword = await hashPassword(password, 10);
console.log(hashedPassword); // bcrypt哈希后的密码
```

---

### 9. 验证密码

**函数名**: `verifyPassword`

**描述**: 验证密码是否匹配哈希值

**参数**:

| 参数名         | 类型   | 必需 | 描述         |
| -------------- | ------ | ---- | ------------ |
| password       | string | 是   | 明文密码     |
| hashedPassword | string | 是   | 哈希后的密码 |

**返回值**: `Promise<boolean>` - 是否匹配

**示例**:

```typescript
import { hashPassword, verifyPassword } from '@/lib/security/encryption';

const password = 'my-password';
const hashedPassword = await hashPassword(password);
const isValid = await verifyPassword(password, hashedPassword);
console.log(isValid); // true
```

---

### 10. 敏感数据脱敏

**函数名**: `maskSensitiveData`

**描述**: 对敏感数据进行脱敏处理

**参数**:

| 参数名       | 类型   | 必需 | 描述                      |
| ------------ | ------ | ---- | ------------------------- |
| data         | string | 是   | 原始数据                  |
| maskChar     | string | 否   | 掩码字符（默认：*）       |
| visibleStart | number | 否   | 开头可见字符数（默认：2） |
| visibleEnd   | number | 否   | 结尾可见字符数（默认：2） |

**返回值**: `string` - 脱敏后的数据

**示例**:

```typescript
import { maskSensitiveData } from '@/lib/security/encryption';

const phone = '13800138000';
const masked = maskSensitiveData(phone, '*', 3, 4);
console.log(masked); // 138****8000
```

---

### 11. 邮箱脱敏

**函数名**: `maskEmail`

**描述**: 对邮箱地址进行脱敏处理

**参数**:

| 参数名 | 类型   | 必需 | 描述     |
| ------ | ------ | ---- | -------- |
| email  | string | 是   | 邮箱地址 |

**返回值**: `string` - 脱敏后的邮箱

**示例**:

```typescript
import { maskEmail } from '@/lib/security/encryption';

const email = 'user@example.com';
const masked = maskEmail(email);
console.log(masked); // us**@example.com
```

---

### 12. 手机号脱敏

**函数名**: `maskPhone`

**描述**: 对手机号进行脱敏处理

**参数**:

| 参数名 | 类型   | 必需 | 描述   |
| ------ | ------ | ---- | ------ |
| phone  | string | 是   | 手机号 |

**返回值**: `string` - 脱敏后的手机号

**示例**:

```typescript
import { maskPhone } from '@/lib/security/encryption';

const phone = '13800138000';
const masked = maskPhone(phone);
console.log(masked); // 138****8000
```

---

### 13. 身份证号脱敏

**函数名**: `maskIdCard`

**描述**: 对身份证号进行脱敏处理

**参数**:

| 参数名 | 类型   | 必需 | 描述     |
| ------ | ------ | ---- | -------- |
| idCard | string | 是   | 身份证号 |

**返回值**: `string` - 脱敏后的身份证号

**示例**:

```typescript
import { maskIdCard } from '@/lib/security/encryption';

const idCard = '110101199001011234';
const masked = maskIdCard(idCard);
console.log(masked); // 110***********1234
```

---

### 14. 生成HMAC签名

**函数名**: `generateHMAC`

**描述**: 生成数据的HMAC签名

**参数**:

| 参数名    | 类型   | 必需 | 描述                 |
| --------- | ------ | ---- | -------------------- |
| data      | string | 是   | 数据                 |
| secret    | string | 是   | 密钥                 |
| algorithm | string | 否   | 算法（默认：sha256） |

**返回值**: `string` - 签名（十六进制）

**示例**:

```typescript
import { generateHMAC } from '@/lib/security/encryption';

const data = 'Hello, World!';
const secret = 'my-secret-key';
const signature = generateHMAC(data, secret, 'sha256');
console.log(signature); // HMAC签名
```

---

### 15. 验证HMAC签名

**函数名**: `verifyHMAC`

**描述**: 验证数据的HMAC签名是否匹配

**参数**:

| 参数名    | 类型   | 必需 | 描述                 |
| --------- | ------ | ---- | -------------------- |
| data      | string | 是   | 数据                 |
| signature | string | 是   | 签名                 |
| secret    | string | 是   | 密钥                 |
| algorithm | string | 否   | 算法（默认：sha256） |

**返回值**: `boolean` - 是否匹配

**示例**:

```typescript
import { generateHMAC, verifyHMAC } from '@/lib/security/encryption';

const data = 'Hello, World!';
const secret = 'my-secret-key';
const signature = generateHMAC(data, secret);
const isValid = verifyHMAC(data, signature, secret);
console.log(isValid); // true
```

---

## ✅ 输入验证模块 API

### 1. 验证字符串

**函数名**: `validateString`

**描述**: 验证字符串是否符合要求

**参数**:

| 参数名 | 类型             | 必需 | 描述       |
| ------ | ---------------- | ---- | ---------- |
| value  | string           | 是   | 待验证的值 |
| config | ValidationConfig | 否   | 验证配置   |

**ValidationConfig接口**:

| 属性            | 类型                       | 必需 | 描述                        |
| --------------- | -------------------------- | ---- | --------------------------- |
| maxLength       | number                     | 否   | 最大长度                    |
| minLength       | number                     | 否   | 最小长度                    |
| pattern         | RegExp                     | 否   | 允许的正则表达式            |
| allowEmpty      | boolean                    | 否   | 是否允许空值（默认：false） |
| customValidator | (value: string) => boolean | 否   | 自定义验证函数              |

**返回值**: `ValidationResult` - 验证结果

**ValidationResult接口**:

| 属性  | 类型    | 描述     |
| ----- | ------- | -------- |
| valid | boolean | 是否有效 |
| error | string  | 错误消息 |

**示例**:

```typescript
import { validateString } from '@/lib/security/input-validator';

const result = validateString('hello', {
  minLength: 3,
  maxLength: 10
});
console.log(result); // { valid: true }
```

---

### 2. 验证邮箱地址

**函数名**: `validateEmail`

**描述**: 验证邮箱地址格式

**参数**:

| 参数名 | 类型   | 必需 | 描述     |
| ------ | ------ | ---- | -------- |
| email  | string | 是   | 邮箱地址 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateEmail } from '@/lib/security/input-validator';

const result = validateEmail('user@example.com');
console.log(result); // { valid: true }
```

---

### 3. 验证URL

**函数名**: `validateURL`

**描述**: 验证URL格式

**参数**:

| 参数名 | 类型   | 必需 | 描述    |
| ------ | ------ | ---- | ------- |
| url    | string | 是   | URL地址 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateURL } from '@/lib/security/input-validator';

const result = validateURL('https://example.com');
console.log(result); // { valid: true }
```

---

### 4. 验证手机号

**函数名**: `validatePhone`

**描述**: 验证手机号格式（中国大陆）

**参数**:

| 参数名 | 类型   | 必需 | 描述   |
| ------ | ------ | ---- | ------ |
| phone  | string | 是   | 手机号 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validatePhone } from '@/lib/security/input-validator';

const result = validatePhone('13800138000');
console.log(result); // { valid: true }
```

---

### 5. 验证身份证号

**函数名**: `validateIdCard`

**描述**: 验证身份证号格式（中国大陆）

**参数**:

| 参数名 | 类型   | 必需 | 描述     |
| ------ | ------ | ---- | -------- |
| idCard | string | 是   | 身份证号 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateIdCard } from '@/lib/security/input-validator';

const result = validateIdCard('110101199001011234');
console.log(result); // { valid: true }
```

---

### 6. 验证密码强度

**函数名**: `validatePasswordStrength`

**描述**: 验证密码强度

**参数**:

| 参数名   | 类型   | 必需 | 描述 |
| -------- | ------ | ---- | ---- |
| password | string | 是   | 密码 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validatePasswordStrength } from '@/lib/security/input-validator';

const result = validatePasswordStrength('MyPassword123!');
console.log(result); // { valid: true }
```

---

### 7. 清理HTML内容

**函数名**: `sanitizeHTML`

**描述**: 清理HTML内容（防止XSS攻击）

**参数**:

| 参数名 | 类型   | 必需 | 描述     |
| ------ | ------ | ---- | -------- |
| html   | string | 是   | HTML内容 |

**返回值**: `string` - 清理后的内容

**示例**:

```typescript
import { sanitizeHTML } from '@/lib/security/input-validator';

const html = '<script>alert("XSS")</script>Hello';
const sanitized = sanitizeHTML(html);
console.log(sanitized); // &lt;script&gt;alert("XSS")&lt;/script&gt;Hello
```

---

### 8. 清理SQL查询参数

**函数名**: `sanitizeSQL`

**描述**: 清理SQL查询参数（防止SQL注入）

**参数**:

| 参数名 | 类型   | 必需 | 描述     |
| ------ | ------ | ---- | -------- |
| input  | string | 是   | 输入内容 |

**返回值**: `string` - 清理后的内容

**示例**:

```typescript
import { sanitizeSQL } from '@/lib/security/input-validator';

const input = "'; DROP TABLE users; --";
const sanitized = sanitizeSQL(input);
console.log(sanitized); //  DROP TABLE users --
```

---

### 9. 清理文件名

**函数名**: `sanitizeFilename`

**描述**: 清理文件名

**参数**:

| 参数名   | 类型   | 必需 | 描述   |
| -------- | ------ | ---- | ------ |
| filename | string | 是   | 文件名 |

**返回值**: `string` - 清理后的文件名

**示例**:

```typescript
import { sanitizeFilename } from '@/lib/security/input-validator';

const filename = '../../../etc/passwd';
const sanitized = sanitizeFilename(filename);
console.log(sanitized); // _etc_passwd
```

---

### 10. 清理路径

**函数名**: `sanitizePath`

**描述**: 清理路径（防止路径遍历攻击）

**参数**:

| 参数名 | 类型   | 必需 | 描述 |
| ------ | ------ | ---- | ---- |
| path   | string | 是   | 路径 |

**返回值**: `string` - 清理后的路径

**示例**:

```typescript
import { sanitizePath } from '@/lib/security/input-validator';

const path = '../../../etc/passwd';
const sanitized = sanitizePath(path);
console.log(sanitized); // etc/passwd
```

---

### 11. 验证数字范围

**函数名**: `validateNumberRange`

**描述**: 验证数字是否在指定范围内

**参数**:

| 参数名 | 类型   | 必需 | 描述   |
| ------ | ------ | ---- | ------ |
| value  | number | 是   | 数值   |
| min    | number | 是   | 最小值 |
| max    | number | 是   | 最大值 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateNumberRange } from '@/lib/security/input-validator';

const result = validateNumberRange(5, 1, 10);
console.log(result); // { valid: true }
```

---

### 12. 验证数组长度

**函数名**: `validateArrayLength`

**描述**: 验证数组长度是否在指定范围内

**参数**:

| 参数名    | 类型   | 必需 | 描述     |
| --------- | ------ | ---- | -------- |
| array     | T[]    | 是   | 数组     |
| minLength | number | 是   | 最小长度 |
| maxLength | number | 是   | 最大长度 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateArrayLength } from '@/lib/security/input-validator';

const array = [1, 2, 3];
const result = validateArrayLength(array, 1, 10);
console.log(result); // { valid: true }
```

---

### 13. 验证对象属性

**函数名**: `validateObjectProps`

**描述**: 验证对象是否包含必需属性

**参数**:

| 参数名        | 类型                | 必需 | 描述         |
| ------------- | ------------------- | ---- | ------------ |
| obj           | Record<string, any> | 是   | 对象         |
| requiredProps | string[]            | 是   | 必需属性列表 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateObjectProps } from '@/lib/security/input-validator';

const obj = { name: 'John', age: 30 };
const result = validateObjectProps(obj, ['name', 'age', 'email']);
console.log(result); // { valid: false, error: '缺少必需属性: email' }
```

---

### 14. 验证JSON格式

**函数名**: `validateJSON`

**描述**: 验证JSON格式是否正确

**参数**:

| 参数名 | 类型   | 必需 | 描述       |
| ------ | ------ | ---- | ---------- |
| json   | string | 是   | JSON字符串 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateJSON } from '@/lib/security/input-validator';

const json = '{"name": "John", "age": 30}';
const result = validateJSON(json);
console.log(result); // { valid: true }
```

---

### 15. 验证日期格式

**函数名**: `validateDate`

**描述**: 验证日期格式

**参数**:

| 参数名 | 类型   | 必需 | 描述       |
| ------ | ------ | ---- | ---------- |
| date   | string | 是   | 日期字符串 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateDate } from '@/lib/security/input-validator';

const date = '2026-02-05';
const result = validateDate(date);
console.log(result); // { valid: true }
```

---

### 16. 验证时间格式

**函数名**: `validateTime`

**描述**: 验证时间格式

**参数**:

| 参数名 | 类型   | 必需 | 描述       |
| ------ | ------ | ---- | ---------- |
| time   | string | 是   | 时间字符串 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateTime } from '@/lib/security/input-validator';

const time = '14:30:00';
const result = validateTime(time);
console.log(result); // { valid: true }
```

---

### 17. 验证日期时间格式

**函数名**: `validateDateTime`

**描述**: 验证日期时间格式

**参数**:

| 参数名   | 类型   | 必需 | 描述           |
| -------- | ------ | ---- | -------------- |
| datetime | string | 是   | 日期时间字符串 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateDateTime } from '@/lib/security/input-validator';

const datetime = '2026-02-05T14:30:00Z';
const result = validateDateTime(datetime);
console.log(result); // { valid: true }
```

---

### 18. 验证IP地址

**函数名**: `validateIP`

**描述**: 验证IP地址格式

**参数**:

| 参数名 | 类型   | 必需 | 描述   |
| ------ | ------ | ---- | ------ |
| ip     | string | 是   | IP地址 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateIP } from '@/lib/security/input-validator';

const ip = '192.168.1.1';
const result = validateIP(ip);
console.log(result); // { valid: true }
```

---

### 19. 验证端口号

**函数名**: `validatePort`

**描述**: 验证端口号

**参数**:

| 参数名 | 类型   | 必需 | 描述   |
| ------ | ------ | ---- | ------ |
| port   | number | 是   | 端口号 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validatePort } from '@/lib/security/input-validator';

const port = 3000;
const result = validatePort(port);
console.log(result); // { valid: true }
```

---

### 20. 验证用户名

**函数名**: `validateUsername`

**描述**: 验证用户名格式

**参数**:

| 参数名   | 类型   | 必需 | 描述   |
| -------- | ------ | ---- | ------ |
| username | string | 是   | 用户名 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateUsername } from '@/lib/security/input-validator';

const username = 'john_doe123';
const result = validateUsername(username);
console.log(result); // { valid: true }
```

---

### 21. 验证文件大小

**函数名**: `validateFileSize`

**描述**: 验证文件大小

**参数**:

| 参数名  | 类型   | 必需 | 描述             |
| ------- | ------ | ---- | ---------------- |
| size    | number | 是   | 文件大小（字节） |
| maxSize | number | 是   | 最大大小（字节） |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateFileSize } from '@/lib/security/input-validator';

const size = 1024 * 1024; // 1MB
const maxSize = 5 * 1024 * 1024; // 5MB
const result = validateFileSize(size, maxSize);
console.log(result); // { valid: true }
```

---

### 22. 验证文件类型

**函数名**: `validateFileType`

**描述**: 验证文件类型

**参数**:

| 参数名       | 类型     | 必需 | 描述           |
| ------------ | -------- | ---- | -------------- |
| filename     | string   | 是   | 文件名         |
| allowedTypes | string[] | 是   | 允许的类型列表 |

**返回值**: `ValidationResult` - 验证结果

**示例**:

```typescript
import { validateFileType } from '@/lib/security/input-validator';

const filename = 'document.pdf';
const allowedTypes = ['pdf', 'doc', 'docx'];
const result = validateFileType(filename, allowedTypes);
console.log(result); // { valid: true }
```

---

### 23. 批量验证

**函数名**: `validateBatch`

**描述**: 批量验证多个字段

**参数**:

| 参数名     | 类型                                             | 必需 | 描述       |
| ---------- | ------------------------------------------------ | ---- | ---------- |
| data       | Record<string, any>                              | 是   | 数据对象   |
| validators | Record<string, (value: any) => ValidationResult> | 是   | 验证器映射 |

**返回值**: `Record<string, ValidationResult>` - 验证结果映射

**示例**:

```typescript
import { validateBatch, validateEmail, validatePhone } from '@/lib/security/input-validator';

const data = {
  email: 'user@example.com',
  phone: '13800138000'
};

const results = validateBatch(data, {
  email: (value) => validateEmail(value),
  phone: (value) => validatePhone(value)
});
console.log(results); // { email: { valid: true }, phone: { valid: true } }
```

---

### 24. 检查批量验证是否全部通过

**函数名**: `isAllValid`

**描述**: 检查批量验证是否全部通过

**参数**:

| 参数名  | 类型                             | 必需 | 描述         |
| ------- | -------------------------------- | ---- | ------------ |
| results | Record<string, ValidationResult> | 是   | 验证结果映射 |

**返回值**: `boolean` - 是否全部通过

**示例**:

```typescript
import { validateBatch, isAllValid, validateEmail, validatePhone } from '@/lib/security/input-validator';

const data = {
  email: 'user@example.com',
  phone: '13800138000'
};

const results = validateBatch(data, {
  email: (value) => validateEmail(value),
  phone: (value) => validatePhone(value)
});
const allValid = isAllValid(results);
console.log(allValid); // true
```

---

## � 安全审计日志模块 API

### 1. 记录安全事件

**函数名**: `logSecurityEvent`

**描述**: 记录安全事件到审计日志

**参数**:

| 参数名 | 类型                                     | 必需 | 描述                                |
| ------ | ---------------------------------------- | ---- | ----------------------------------- |
| event  | Omit<SecurityEvent, 'id' \| 'timestamp'> | 是   | 安全事件数据（不包含id和timestamp） |

**返回值**: `void`

**示例**:

```typescript
import { logSecurityEvent, SecurityEventType, SecuritySeverity } from '@/lib/security/audit-log';

logSecurityEvent({
  eventType: SecurityEventType.AUTHENTICATION,
  severity: SecuritySeverity.INFO,
  action: 'login',
  userId: '123',
  ipAddress: '192.168.1.1',
  success: true,
});
```

---

### 2. 记录认证事件

**函数名**: `logAuthenticationEvent`

**描述**: 记录认证相关事件（登录、注册、登出等）

**参数**:

| 参数名       | 类型                                                   | 必需 | 描述     |
| ------------ | ------------------------------------------------------ | ---- | -------- |
| action       | 'login' \| 'logout' \| 'register' \| 'password_change' | 是   | 认证动作 |
| success      | boolean                                                | 是   | 是否成功 |
| userId       | string \| undefined                                    | 否   | 用户ID   |
| ipAddress    | string \| undefined                                    | 否   | IP地址   |
| errorMessage | string \| undefined                                    | 否   | 错误消息 |

**返回值**: `void`

**示例**:

```typescript
import { logAuthenticationEvent } from '@/lib/security/audit-log';

logAuthenticationEvent('login', true, '123', '192.168.1.1');
```

---

### 3. 记录授权事件

**函数名**: `logAuthorizationEvent`

**描述**: 记录授权相关事件

**参数**:

| 参数名       | 类型                | 必需 | 描述     |
| ------------ | ------------------- | ---- | -------- |
| action       | string              | 是   | 授权动作 |
| success      | boolean             | 是   | 是否成功 |
| userId       | string \| undefined | 否   | 用户ID   |
| resource     | string \| undefined | 否   | 资源     |
| ipAddress    | string \| undefined | 否   | IP地址   |
| errorMessage | string \| undefined | 否   | 错误消息 |

**返回值**: `void`

**示例**:

```typescript
import { logAuthorizationEvent } from '@/lib/security/audit-log';

logAuthorizationEvent('access_resource', true, '123', '/api/users', '192.168.1.1');
```

---

### 4. 记录速率限制事件

**函数名**: `logRateLimitEvent`

**描述**: 记录速率限制触发事件

**参数**:

| 参数名    | 类型                             | 必需 | 描述               |
| --------- | -------------------------------- | ---- | ------------------ |
| action    | string                           | 是   | 触发速率限制的动作 |
| ipAddress | string \| undefined              | 否   | IP地址             |
| userId    | string \| undefined              | 否   | 用户ID             |
| details   | Record<string, any> \| undefined | 否   | 详细信息           |

**返回值**: `void`

**示例**:

```typescript
import { logRateLimitEvent } from '@/lib/security/audit-log';

logRateLimitEvent('login', '192.168.1.1', '123', { attempts: 5 });
```

---

### 5. 记录数据访问事件

**函数名**: `logDataAccessEvent`

**描述**: 记录数据访问事件

**参数**:

| 参数名    | 类型                             | 必需 | 描述     |
| --------- | -------------------------------- | ---- | -------- |
| action    | string                           | 是   | 访问动作 |
| resource  | string                           | 是   | 资源     |
| success   | boolean                          | 是   | 是否成功 |
| userId    | string \| undefined              | 否   | 用户ID   |
| ipAddress | string \| undefined              | 否   | IP地址   |
| details   | Record<string, any> \| undefined | 否   | 详细信息 |

**返回值**: `void`

**示例**:

```typescript
import { logDataAccessEvent } from '@/lib/security/audit-log';

logDataAccessEvent('get_questions', 'questions', true, '123', '192.168.1.1', { page: 1, pageSize: 20 });
```

---

### 6. 记录数据修改事件

**函数名**: `logDataModificationEvent`

**描述**: 记录数据修改事件

**参数**:

| 参数名       | 类型                             | 必需 | 描述     |
| ------------ | -------------------------------- | ---- | -------- |
| action       | string                           | 是   | 修改动作 |
| resource     | string                           | 是   | 资源     |
| success      | boolean                          | 是   | 是否成功 |
| userId       | string \| undefined              | 否   | 用户ID   |
| ipAddress    | string \| undefined              | 否   | IP地址   |
| details      | Record<string, any> \| undefined | 否   | 详细信息 |
| errorMessage | string \| undefined              | 否   | 错误消息 |

**返回值**: `void`

**示例**:

```typescript
import { logDataModificationEvent } from '@/lib/security/audit-log';

logDataModificationEvent('create_question', 'questions', true, '123', '192.168.1.1', { questionId: 1 });
```

---

### 7. 记录验证错误事件

**函数名**: `logValidationErrorEvent`

**描述**: 记录验证错误事件

**参数**:

| 参数名       | 类型                             | 必需 | 描述     |
| ------------ | -------------------------------- | ---- | -------- |
| action       | string                           | 是   | 验证动作 |
| errorMessage | string                           | 是   | 错误消息 |
| userId       | string \| undefined              | 否   | 用户ID   |
| ipAddress    | string \| undefined              | 否   | IP地址   |
| details      | Record<string, any> \| undefined | 否   | 详细信息 |

**返回值**: `void`

**示例**:

```typescript
import { logValidationErrorEvent } from '@/lib/security/audit-log';

logValidationErrorEvent('delete_questions', 'Missing question IDs', '123', '192.168.1.1');
```

---

### 8. 记录可疑活动事件

**函数名**: `logSuspiciousActivityEvent`

**描述**: 记录可疑活动事件

**参数**:

| 参数名    | 类型                             | 必需 | 描述         |
| --------- | -------------------------------- | ---- | ------------ |
| action    | string                           | 是   | 可疑活动动作 |
| ipAddress | string \| undefined              | 否   | IP地址       |
| userId    | string \| undefined              | 否   | 用户ID       |
| details   | Record<string, any> \| undefined | 否   | 详细信息     |

**返回值**: `void`

**示例**:

```typescript
import { logSuspiciousActivityEvent } from '@/lib/security/audit-log';

logSuspiciousActivityEvent('multiple_failed_logins', '192.168.1.1', '123', { attempts: 10 });
```

---

### 9. 获取最近的安全事件

**函数名**: `getRecentEvents`

**描述**: 获取最近的安全事件

**参数**:

| 参数名 | 类型   | 必需 | 描述                      |
| ------ | ------ | ---- | ------------------------- |
| limit  | number | 否   | 返回数量限制（默认：100） |

**返回值**: `SecurityEvent[]` - 安全事件数组

**示例**:

```typescript
import { getRecentEvents } from '@/lib/security/audit-log';

const events = getRecentEvents(50);
console.log(events);
```

---

### 10. 按类型获取安全事件

**函数名**: `getEventsByType`

**描述**: 按事件类型获取安全事件

**参数**:

| 参数名    | 类型              | 必需 | 描述                      |
| --------- | ----------------- | ---- | ------------------------- |
| eventType | SecurityEventType | 是   | 安全事件类型              |
| limit     | number            | 否   | 返回数量限制（默认：100） |

**返回值**: `SecurityEvent[]` - 安全事件数组

**示例**:

```typescript
import { getEventsByType, SecurityEventType } from '@/lib/security/audit-log';

const authEvents = getEventsByType(SecurityEventType.AUTHENTICATION, 50);
console.log(authEvents);
```

---

### 11. 按严重级别获取安全事件

**函数名**: `getEventsBySeverity`

**描述**: 按严重级别获取安全事件

**参数**:

| 参数名   | 类型             | 必需 | 描述                      |
| -------- | ---------------- | ---- | ------------------------- |
| severity | SecuritySeverity | 是   | 安全严重级别              |
| limit    | number           | 否   | 返回数量限制（默认：100） |

**返回值**: `SecurityEvent[]` - 安全事件数组

**示例**:

```typescript
import { getEventsBySeverity, SecuritySeverity } from '@/lib/security/audit-log';

const criticalEvents = getEventsBySeverity(SecuritySeverity.CRITICAL, 50);
console.log(criticalEvents);
```

---

### 12. 按用户获取安全事件

**函数名**: `getEventsByUser`

**描述**: 按用户ID获取安全事件

**参数**:

| 参数名 | 类型   | 必需 | 描述                      |
| ------ | ------ | ---- | ------------------------- |
| userId | string | 是   | 用户ID                    |
| limit  | number | 否   | 返回数量限制（默认：100） |

**返回值**: `SecurityEvent[]` - 安全事件数组

**示例**:

```typescript
import { getEventsByUser } from '@/lib/security/audit-log';

const userEvents = getEventsByUser('123', 50);
console.log(userEvents);
```

---

### 13. 按IP地址获取安全事件

**函数名**: `getEventsByIPAddress`

**描述**: 按IP地址获取安全事件

**参数**:

| 参数名    | 类型   | 必需 | 描述                      |
| --------- | ------ | ---- | ------------------------- |
| ipAddress | string | 是   | IP地址                    |
| limit     | number | 否   | 返回数量限制（默认：100） |

**返回值**: `SecurityEvent[]` - 安全事件数组

**示例**:

```typescript
import { getEventsByIPAddress } from '@/lib/security/audit-log';

const ipEvents = getEventsByIPAddress('192.168.1.1', 50);
console.log(ipEvents);
```

---

### 14. 获取安全统计信息

**函数名**: `getSecurityStatistics`

**描述**: 获取安全事件统计信息

**返回值**: 安全统计信息对象

**返回值结构**:

```typescript
{
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  successRate: number;
}
```

**示例**:

```typescript
import { getSecurityStatistics } from '@/lib/security/audit-log';

const stats = getSecurityStatistics();
console.log(stats);
// {
//   totalEvents: 1000,
//   eventsByType: { authentication: 500, authorization: 300, ... },
//   eventsBySeverity: { info: 600, warning: 300, error: 80, critical: 20 },
//   successRate: 95.5
// }
```

---

### 15. 清理旧的安全事件

**函数名**: `clearOldEvents`

**描述**: 清理指定天数之前的安全事件

**参数**:

| 参数名  | 类型   | 必需 | 描述             |
| ------- | ------ | ---- | ---------------- |
| daysOld | number | 否   | 天数（默认：30） |

**返回值**: `number` - 清理的事件数量

**示例**:

```typescript
import { clearOldEvents } from '@/lib/security/audit-log';

const clearedCount = clearOldEvents(30);
console.log(`清理了 ${clearedCount} 个旧事件`);
```

---

## �📚 使用示例

### 完整的注册流程示例

```typescript
import {
  validateEmail,
  validatePhone,
  validatePasswordStrength,
  validateUsername,
  isAllValid,
  validateBatch
} from '@/lib/security/input-validator';
import {
  hashPassword,
  encrypt,
  maskEmail,
  maskPhone
} from '@/lib/security/encryption';

async function registerUser(userData: {
  username: string;
  email: string;
  phone: string;
  password: string;
}) {
  // 1. 验证输入
  const validationResults = validateBatch(userData, {
    username: (value) => validateUsername(value),
    email: (value) => validateEmail(value),
    phone: (value) => validatePhone(value),
    password: (value) => validatePasswordStrength(value)
  });

  if (!isAllValid(validationResults)) {
    throw new Error('输入验证失败');
  }

  // 2. 哈希密码
  const hashedPassword = await hashPassword(userData.password);

  // 3. 加密敏感数据
  const encryptedPhone = encrypt(userData.phone, process.env.ENCRYPTION_KEY!);

  // 4. 保存用户数据
  const user = await saveUser({
    username: userData.username,
    email: userData.email,
    phone: encryptedPhone,
    password: hashedPassword
  });

  // 5. 返回脱敏后的用户数据
  return {
    ...user,
    email: maskEmail(user.email),
    phone: maskPhone(user.phone)
  };
}
```

---

## 🔒 安全最佳实践

### 1. 加密使用建议

- **敏感数据加密**: 使用AES-256-GCM加密敏感数据
- **密码哈希**: 使用bcrypt哈希密码，不要加密密码
- **密钥管理**: 使用环境变量管理密钥，不要硬编码
- **盐值生成**: 每次加密都生成新的随机盐值

### 2. 验证使用建议

- **输入验证**: 所有用户输入都必须经过验证
- **输出清理**: 所有输出到HTML的内容都必须经过清理
- **SQL查询**: 使用参数化查询，不要拼接SQL
- **文件上传**: 验证文件类型和大小，清理文件名

### 3. 脱敏使用建议

- **日志脱敏**: 日志中记录脱敏后的敏感数据
- **显示脱敏**: 用户界面显示脱敏后的敏感数据
- **存储加密**: 敏感数据加密存储，不存储明文

---

## 📖 参考资料

- [Node.js Crypto API](https://nodejs.org/api/crypto.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)

---

## 📄 文档标尾 (Footer)

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
