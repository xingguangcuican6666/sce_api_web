# API Key 用户名功能说明

## 功能概述

API Key 系统现已支持用户名关联功能，每个 API Key 都会绑定一个用户名，便于管理和查询。

## 主要变更

### 1. 数据库结构更新

- `api_keys` 表新增 `username` 字段（必填）
- 支持所有数据库类型：Azure SQL、MySQL、MongoDB

### 2. API 端点变更

#### 添加 API Key
- **端点**: `POST /api/keys`
- **请求参数**:
  ```json
  {
    "name": "API Key名称",
    "description": "描述信息（可选）",
    "username": "用户名（必填）"
  }
  ```
- **认证**: 需要 JWT Token
- **响应**:
  ```json
  {
    "message": "API Key创建成功",
    "api_key": "ske_xxxxxxxxxxxx",
    "name": "API Key名称",
    "description": "描述信息",
    "username": "用户名"
  }
  ```

#### 检查用户名是否存在
- **端点**: `GET /api/keys/check`
- **请求参数**:
  - `username`: 要检查的用户名
- **示例**: `GET /api/keys/check?username=testuser`
- **响应**:
  ```json
  {
    "exists": true
  }
  ```
  或
  ```json
  {
    "exists": false
  }
  ```

## 使用场景

1. **用户管理**: 通过用户名快速识别 API Key 的归属
2. **权限控制**: 基于用户名实现不同的访问策略
3. **使用统计**: 按用户名统计 API 调用情况
4. **安全审计**: 追踪特定用户的 API 使用行为

## 注意事项

1. 用户名字段为必填项，创建 API Key 时必须提供
2. 用户名在数据库中可以重复（不强制唯一）
3. 检查功能只返回是否存在，不返回具体的 API Key 信息
4. 所有现有的 API Key 验证逻辑保持不变

## 数据库初始化

如需使用新功能，请运行数据库初始化脚本：
```bash
node init_db.js
```

该脚本会自动为所有数据库添加 `username` 字段。