# 删除 API Key 功能使用说明

## 功能概述

新增根据用户名删除所有 API Key 的功能，支持一次性删除指定用户名下的所有 API Key。

## API 端点

### 删除用户名下的所有 API Key

- **端点**: `DELETE /api/keys`
- **认证方式**: Bearer Token（JWT）
- **请求头**:
  ```
  Authorization: Bearer <your_jwt_token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "username": "要删除的用户名"
  }
  ```

- **成功响应** (200):
  ```json
  {
    "message": "API Key删除成功",
    "username": "xingguangcuican",
    "deleted_count": 3
  }
  ```

- **错误响应**:
  - 400: 缺少username参数
    ```json
    {
      "error": "需要提供username参数"
    }
    ```
  - 401: 无效的JWT Token
    ```json
    {
      "error": "需要Bearer Token认证"
    }
    ```
  - 500: 服务器错误
    ```json
    {
      "error": "API Key删除失败"
    }
    ```

## 使用示例

### cURL 示例

```bash
curl -X DELETE https://api.oraclestar.cn/api/keys \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"username": "xingguangcuican"}'
```

### JavaScript 示例

```javascript
const deleteApiKeys = async (username, jwtToken) => {
  const response = await fetch('https://api.oraclestar.cn/api/keys', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  });
  
  const result = await response.json();
  
  if (response.ok) {
    console.log(`成功删除 ${result.deleted_count} 个 API Key`);
  } else {
    console.error('删除失败:', result.error);
  }
  
  return result;
};

// 使用示例
deleteApiKeys('xingguangcuican', 'your_jwt_token_here');
```

### Python 示例

```python
import requests
import json

def delete_api_keys(username, jwt_token):
    url = 'https://api.oraclestar.cn/api/keys'
    headers = {
        'Authorization': f'Bearer {jwt_token}',
        'Content-Type': 'application/json'
    }
    data = {'username': username}
    
    response = requests.delete(url, headers=headers, json=data)
    result = response.json()
    
    if response.status_code == 200:
        print(f"成功删除 {result['deleted_count']} 个 API Key")
    else:
        print(f"删除失败: {result['error']}")
    
    return result

# 使用示例
delete_api_keys('xingguangcuican', 'your_jwt_token_here')
```

## 注意事项

1. **权限要求**: 需要有效的 JWT Token 才能执行删除操作
2. **批量删除**: 此操作会删除指定用户名下的所有 API Key，不可恢复
3. **数据库同步**: 删除操作会在所有配置的数据库中执行
4. **日志记录**: 所有删除操作都会记录在日志文件中
5. **安全建议**: 
   - 在执行删除操作前，建议先使用检查端点确认用户名
   - 保留重要 API Key 的备份
   - 定期审查和清理不需要的 API Key

## 相关端点

- `GET /api/keys/check?username=<用户名>` - 检查用户名是否存在 API Key
- `POST /api/keys` - 创建新的 API Key（需要用户名参数）
- `GET /api/keys/verify` - 验证 API Key 有效性

## 故障排除

如果删除操作失败，请检查：

1. JWT Token 是否有效且未过期
2. 用户名参数是否正确提供
3. 网络连接是否正常
4. 服务器日志文件中的详细错误信息