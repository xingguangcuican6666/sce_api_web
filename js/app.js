// 应用逻辑模块
(function() {
  'use strict';
  
  // DOM 元素
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userLoginBtn = document.getElementById('userLoginBtn');
  const genKeyBtn = document.getElementById('genKeyBtn');
  const revokeKeyBtn = document.getElementById('revokeKeyBtn');
  const callApiBtn = document.getElementById('callApiBtn');
  const apiResult = document.getElementById('apiResult');
  const useApiKey = document.getElementById('useApiKey');
  const useBearer = document.getElementById('useBearer');
  const cardIdInput = document.getElementById('cardId');
  const customApiKeyInput = document.getElementById('customApiKey');
  const customApiKeyGroup = document.getElementById('customApiKeyGroup');
  const heroDemoBtn = document.getElementById('heroDemoBtn');
  const heroDocBtn = document.getElementById('heroDocBtn');

  // Hero 按钮事件
  if (heroDemoBtn) {
    heroDemoBtn.addEventListener('click', () => {
      document.getElementById('callApiBtn').scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  if (heroDocBtn) {
    heroDocBtn.addEventListener('click', () => {
      window.open('https://docs.oraclestar.cn/docs/SCE_API/welcome', '_blank');
    });
  }

  // 登录按钮事件
  if (loginBtn) {
    loginBtn.addEventListener('click', loginRedirect);
  }
  
  if (userLoginBtn) {
    userLoginBtn.addEventListener('click', loginRedirect);
  }

  // 登出按钮事件
  if (logoutBtn) {
    logoutBtn.addEventListener('click', ()=>{
      localStorage.removeItem('sce_token');
      localStorage.removeItem('sce_user');
      if (window.updateUI) window.updateUI();
      history.replaceState(null,'',window.location.pathname);
    });
  }

  // API Key 生成按钮事件
  if (genKeyBtn) {
    genKeyBtn.addEventListener('click', async ()=>{
      const token = localStorage.getItem('sce_token');
      if(!token){
        // 需要先登录，直接跳转到登录（不再询问）
        return loginRedirect();
      }
      
      try {
        genKeyBtn.disabled = true;
        genKeyBtn.innerHTML = '<span class="spinner"></span> 生成中...';
        
        // 获取用户名
        const userRaw = localStorage.getItem('sce_user');
        let username = '';
        if(userRaw) {
          try {
            const user = JSON.parse(userRaw);
            username = user.username || user.userName || user.name || '';
          } catch(e) {
            console.error('解析用户信息失败:', e);
          }
        }
        
        // 检查用户是否已有API Key
        if(username) {
          try {
            // 确保checkUserApiKey函数可用
            const checkUser = window.checkUserApiKey || function() { return Promise.resolve(false); };
            const hasKey = await checkUser(username);
            if(hasKey) {
              if(!confirm('检测到您已有API Key，是否要重新生成？重新生成将删除旧密钥并创建新密钥。')) {
                genKeyBtn.disabled = false;
                genKeyBtn.innerHTML = '<span>✨</span> 生成';
                return;
              }
              
              // 先删除旧的API Key
              genKeyBtn.innerHTML = '<span class="spinner"></span> 删除旧密钥...';
              try {
                // 确保deleteUserApiKeys函数可用
                const deleteKeys = window.deleteUserApiKeys || function() { return Promise.resolve({}); };
                const deleteResult = await deleteKeys(username, token);
                console.log('删除API Key结果:', deleteResult);
              } catch(deleteErr) {
                throw new Error('删除旧API Key失败: ' + deleteErr.message);
              }
            }
          } catch(err) {
            console.warn('检查用户API Key失败:', err);
            // 即使检查失败也继续生成
          }
        }
        
        // 调用后端API生成API Key
        genKeyBtn.innerHTML = '<span class="spinner"></span> 生成新密钥...';
        // 确保generateApiKey函数可用
        const generateKey = window.generateApiKey || function() { 
          throw new Error('API Key生成功能不可用，请刷新页面重试'); 
        };
        const key = await generateKey('默认API Key', '通过Web界面生成', username);
        
        // 使用动画展示生成的密钥
        if (window.revealApiKeyAnim) await window.revealApiKeyAnim(key);
        if (window.updateApiKeyUI) window.updateApiKeyUI();
        if (window.checkAndShowCustomApiKeyInput) window.checkAndShowCustomApiKeyInput();
      } catch(err) {
        alert('生成API Key失败: ' + err.message);
      } finally {
        genKeyBtn.disabled = false;
        genKeyBtn.innerHTML = '<span>🔄</span> 重新生成';
      }
    });
  }

  // API Key 撤销按钮事件
  if (revokeKeyBtn) {
    revokeKeyBtn.addEventListener('click', ()=>{
      if(!confirm('确认撤销本地保存的 API Key？（仅本地演示）')) return;
      if (window.revokeApiKey) window.revokeApiKey();
      if (window.updateApiKeyUI) window.updateApiKeyUI();
    });
  }

  // 调用 SCE API（支持API Key和Bearer Token两种认证方式）
  async function callUmasce(){
    if (!apiResult) return;
    
    apiResult.style.display = 'block';
    apiResult.innerHTML = '<div class="row"><span class="spinner"></span><span style="margin-left:8px">请求中...</span></div>';
    
    const id = (cardIdInput ? cardIdInput.value || '' : '').trim();
    const url = id ? ('https://api.oraclestar.cn/api/umasce?id=' + encodeURIComponent(id)) : 'https://api.oraclestar.cn/api/umasce';
    const headers = {};
    const apiKey = localStorage.getItem('sce_api_key');
    const token = localStorage.getItem('sce_token');
    const customApiKey = (customApiKeyInput ? customApiKeyInput.value || '' : '').trim();

    // 根据用户选择的认证方式设置请求头
    if(useApiKey && useApiKey.checked) {
      // 优先使用手动输入的API Key，然后是本地存储的API Key
      if(customApiKey) {
        headers['x-api-key'] = customApiKey;
      } else if(apiKey) {
        headers['x-api-key'] = apiKey;
      } else {
        apiResult.innerHTML = '<div style="color: #ef4444;">❌ 请输入API Key或生成新的API Key</div>';
        return;
      }
    } else if(useBearer && useBearer.checked && token){
      headers['Authorization'] = 'Bearer ' + token;
    } else {
      // 如果没有选择认证方式或没有相应的凭证，尝试使用API Key
      if(customApiKey) {
        headers['x-api-key'] = customApiKey;
      } else if(apiKey) {
        headers['x-api-key'] = apiKey;
      } else if(token) {
        headers['Authorization'] = 'Bearer ' + token;
      } else {
        apiResult.innerHTML = '<div style="color: #ef4444;">❌ 请先登录或生成API Key</div>';
        return;
      }
    }

    try{
      const resp = await fetch(url, { method: 'GET', headers });
      
      if(!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
      }
      
      const text = await resp.text();
      // 使用解析展示函数而不是直接显示原始文本
      await revealApiResultAnim(text);
    }catch(err){
      console.error('API调用失败:', err);
      apiResult.innerHTML = `<div style="color: #ef4444;">❌ 请求失败：${err.message}</div>`;
    }
  }

  // API调用按钮事件
  if (callApiBtn) {
    callApiBtn.addEventListener('click', callUmasce);
  }

  // 折叠面板切换函数
  window.toggleCollapsible = function(id) {
    const collapsible = document.getElementById(id);
    const content = collapsible.querySelector('.collapsible-content');
    const icon = collapsible.querySelector('.collapsible-icon');
    
    if (content.classList.contains('expanded')) {
      content.classList.remove('expanded');
      icon.classList.remove('expanded');
    } else {
      content.classList.add('expanded');
      icon.classList.add('expanded');
    }
  };
})();