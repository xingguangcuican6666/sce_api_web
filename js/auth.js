// 用户认证相关功能模块
(function() {
  'use strict';
  
  const LOGIN_GATEWAY_BASE = 'https://login.oralode.cn/login?callback=';
  
  // 简易工具
  window.qs = function(name) { 
    return new URLSearchParams(window.location.search).get(name); 
  };
  
  window.tryParseJSON = function(s) { 
    try { 
      return JSON.parse(s); 
    } catch(e) { 
      return null; 
    } 
  };
  
  // 登录重定向
  window.loginRedirect = function() {
    const cb = (window.location.origin + window.location.pathname);
    window.location.href = LOGIN_GATEWAY_BASE + cb;
  };
  
  // 解析回调（兼容 user JSON 或 username/userId 单独字段）
  window.handleCallbackParams = function() {
    const token = qs('token');
    const userParam = qs('user');
    const username = qs('username');
    const userId = qs('userId');
    const timestamp = qs('timestamp');
    
    if(token) localStorage.setItem('sce_token', token);
    if(userParam){
      try{
        const decoded = decodeURIComponent(userParam);
        const parsed = tryParseJSON(decoded) || decoded;
        localStorage.setItem('sce_user', typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
      }catch(e){}
    } else if(username || userId){
      const obj = {};
      if(username) obj.username = username;
      if(userId) obj.userId = isNaN(userId) ? userId : Number(userId);
      localStorage.setItem('sce_user', JSON.stringify(obj));
    }
    if(token || userParam || username || userId || timestamp){
      history.replaceState(null,'',window.location.pathname);
    }
  };
  
  // API Key helpers（调用后端API）
  window.generateApiKey = async function(name = '默认API Key', description = '', username = '') {
    const token = localStorage.getItem('sce_token');
    if(!token) throw new Error('需要先登录');
    
    // 如果没有提供用户名，尝试从登录信息中获取
    if(!username) {
      const userRaw = localStorage.getItem('sce_user');
      console.log('用户原始数据:', userRaw); // 调试日志
      if(userRaw) {
        try {
          const user = JSON.parse(userRaw);
          console.log('解析后的用户数据:', user); // 调试日志
          username = user.username || user.userName || user.name || '';
          console.log('获取到的用户名:', username); // 调试日志
        } catch(e) {
          console.error('解析用户信息失败:', e);
        }
      }
    }
    
    if(!username) {
      throw new Error('无法获取用户名，请重新登录');
    }
    
    const requestBody = { name, description, username };
    console.log('发送的请求体:', requestBody); // 调试日志
    
    try {
      const response = await fetch('https://api.oraclestar.cn/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(requestBody)
      });
      
      if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '创建API Key失败');
      }
      
      const data = await response.json();
      const now = Date.now();
      localStorage.setItem('sce_api_key', data.api_key);
      localStorage.setItem('sce_api_key_name', data.name);
      localStorage.setItem('sce_api_key_description', data.description || '');
      localStorage.setItem('sce_api_key_username', data.username);
      localStorage.setItem('sce_api_key_created', String(now));
      return data.api_key;
    } catch(err) {
      console.error('生成API Key失败:', err);
      throw err;
    }
  };
  
  // 验证API Key
  window.verifyApiKey = async function() {
    const apiKey = localStorage.getItem('sce_api_key');
    if(!apiKey) throw new Error('没有API Key');
    
    try {
      const response = await fetch('https://api.oraclestar.cn/api/keys/verify', {
        method: 'GET',
        headers: {
          'x-api-key': apiKey
        }
      });
      
      if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API Key验证失败');
      }
      
      const data = await response.json();
      return data;
    } catch(err) {
      console.error('验证API Key失败:', err);
      throw err;
    }
  };
  
  // 检查用户是否已有API Key
  window.checkUserApiKey = async function(username) {
    try {
      const response = await fetch(`https://api.oraclestar.cn/api/keys/check?username=${encodeURIComponent(username)}`, {
        method: 'GET'
      });
      
      if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '检查用户API Key失败');
      }
      
      const data = await response.json();
      return data.exists;
    } catch(err) {
      console.error('检查用户API Key失败:', err);
      throw err;
    }
  };
  
  // 删除用户的所有API Key
  window.deleteUserApiKeys = async function(username, token) {
    try {
      const response = await fetch('https://api.oraclestar.cn/api/keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ username })
      });
      
      if(!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '删除API Key失败');
      }
      
      const data = await response.json();
      return data;
    } catch(err) {
      console.error('删除API Key失败:', err);
      throw err;
    }
  };
  
  window.revokeApiKey = function() {
    localStorage.removeItem('sce_api_key');
    localStorage.removeItem('sce_api_key_name');
    localStorage.removeItem('sce_api_key_description');
    localStorage.removeItem('sce_api_key_username');
    localStorage.removeItem('sce_api_key_created');
  };
  
  window.getApiKeyInfo = function() {
    const key = localStorage.getItem('sce_api_key');
    const name = localStorage.getItem('sce_api_key_name');
    const description = localStorage.getItem('sce_api_key_description');
    const username = localStorage.getItem('sce_api_key_username');
    const created = localStorage.getItem('sce_api_key_created');
    return { key, name, description, username, created: created ? new Date(Number(created)) : null };
  };
})();