# API Key 管理功能使用说明

## 环境变量配置

在启动API服务前，请确保设置以下环境变量：

```bash
# JWT配置
set JWT_SECRET=jwt_of_oraclestar
set JWT_EXPIRES_IN=1h
# 会话配置
set "SESSION_SECRET=x7K9@mN2#pQ5$vR8!wE3*tY6&uI1"
# Azure数据库密码
set AZURE_SQL_PASSWORD=你的Azure数据库密码
```

## 数据库初始化

首次使用前需要初始化数据库表结构：

```bash
npm run init-db
```

## API端点说明

### 1. 添加API Key

**端点**: `POST /api/keys`

**鉴权**: Bearer Token (JWT)

**请求头**:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**请求体**:
```json
{
  "name": "API Key名称",
  "description": "API Key描述（可选）"
}
```

**响应**:
```json
{
  "message": "API Key创建成功",
  "api_key": "ske_abcdef123456...",
  "name": "API Key名称",
  "description": "API Key描述"
}
```

### 2. 验证API Key

**端点**: `GET /api/keys/verify`

**鉴权**: API Key (两种方式任选其一)

**方式1 - x-api-key头部**:
```
x-api-key: ske_abcdef123456...
```

**方式2 - Bearer Token**:
```
Authorization: Bearer ske_abcdef123456...
```

**响应**:
```json
{
  "valid": true,
  "key_info": {
    "name": "API Key名称",
    "description": "API Key描述",
    "created_at": "2023-12-07T10:00:00.000Z"
  }
}
```

### 3. 赛马娘数据查询

**端点**: `GET /api/umasce`

**鉴权**: API Key (两种方式任选其一)

**方式1 - x-api-key头部**:
```
x-api-key: ske_abcdef123456...
```

**方式2 - Bearer Token**:
```
Authorization: Bearer ske_abcdef123456...
```

**速率限制**: 每个API Key每分钟最多15次请求

**查询参数**:
- `id`: 卡牌ID（可选，不提供则返回所有卡牌索引）

**响应**:
```json
{
  "source": "数据源类型",
  "data": "查询结果"
}
```

## 使用流程

1. 使用有效的JWT Token调用 `POST /api/keys` 创建API Key
2. 保存生成的API Key（ske_开头）
3. 在后续请求中使用API Key进行鉴权
4. API Key每分钟限制15次请求，超出限制将返回错误

## 注意事项

- API Key创建后请妥善保存，系统不会再次显示完整密钥
- JWT Token由其他服务提供，本API只负责验证
- 所有数据库都会同步存储API Key信息，确保高可用性
- 速率限制基于API Key而非IP地址
- 支持CORS跨域访问