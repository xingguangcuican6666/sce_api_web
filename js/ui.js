// UI相关功能模块
(function() {
  'use strict';
  
  // 增强的 API Key 生成展示动画
  window.revealApiKeyAnim = async function(key) {
    const box = document.getElementById('apiKeyBox');
    if(!box) return;
    
    // 创建容器
    box.innerHTML = `
      <div class="key-reveal-container" style="opacity:0;transform:scale(0.95)">
        <div class="key-header" style="margin-bottom:12px;color:var(--accent);font-weight:500">
          <span class="key-status">🔑 正在生成安全密钥...</span>
        </div>
        <div class="key-wrap" style="background:linear-gradient(135deg, #eef6ff 0%, #e0f2fe 100%);border:1px solid rgba(15, 111, 255, 0.2);border-radius:8px;padding:12px;position:relative;overflow:hidden">
          <div class="key-progress" style="position:absolute;top:0;left:0;height:100%;width:0;background:linear-gradient(90deg, transparent, rgba(15, 111, 255, 0.1), transparent);transition:width 0.3s"></div>
          <span class="typewriter-mask" style="display:inline-block;overflow:hidden;vertical-align:top">
            <span class="key-text" style="font-family:'Courier New', monospace;letter-spacing:2px;font-weight:600;color:#0f1724"></span>
          </span>
        </div>
        <div class="key-actions" style="margin-top:12px;opacity:0;transform:translateY(10px)"></div>
      </div>
    `;
    
    const container = box.querySelector('.key-reveal-container');
    const statusEl = box.querySelector('.key-status');
    const textEl = box.querySelector('.key-text');
    const progressBar = box.querySelector('.key-progress');
    const actionsEl = box.querySelector('.key-actions');
    
    // 淡入容器
    container.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      container.style.opacity = '1';
      container.style.transform = 'scale(1)';
    }, 100);
    
    // 模拟打字效果
    for(let i=0;i<key.length;i++){
      textEl.textContent = key.slice(0,i+1);
      // 更新进度条
      progressBar.style.width = ((i+1)/key.length * 100) + '%';
      
      // 动态延迟，营造真实感
      const delay = 15 + Math.floor(Math.random() * 20);
      await new Promise(r=>setTimeout(r, delay));
      
      // 更新状态文本
      if(i === key.length - 1) {
        statusEl.textContent = '✅ 密钥生成完成';
      } else if(i > key.length * 0.7) {
        statusEl.textContent = '🔐 正在加密...';
      } else if(i > key.length * 0.4) {
        statusEl.textContent = '🔑 正在生成...';
      }
    }
    
    // 完成动画
    progressBar.style.background = 'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.2), transparent)';
    
    // 添加操作按钮
    setTimeout(() => {
      actionsEl.innerHTML = `
        <button class="copy" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:500;transition:all 0.3s;margin-right:8px">
          📋 复制密钥
        </button>
        <button class="share" style="background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:500;transition:all 0.3s">
          🔗 分享
        </button>
      `;
      
      actionsEl.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      actionsEl.style.opacity = '1';
      actionsEl.style.transform = 'translateY(0)';
      
      // 添加事件监听
      const copyBtn = actionsEl.querySelector('.copy');
      const shareBtn = actionsEl.querySelector('.share');
      
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(key).then(() => {
          copyBtn.textContent = '✅ 已复制';
          copyBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
          setTimeout(() => {
            copyBtn.textContent = '📋 复制密钥';
            copyBtn.style.background = '';
          }, 2000);
        });
      });
      
      shareBtn.addEventListener('click', () => {
        if(navigator.share) {
          navigator.share({
            title: 'SCE API Key',
            text: `我的API密钥: ${key}`,
          });
        } else {
          navigator.clipboard.writeText(key).then(() => {
            shareBtn.textContent = '✅ 已复制到剪贴板';
            setTimeout(() => {
              shareBtn.textContent = '🔗 分享';
            }, 2000);
          });
        }
      });
      
      // 添加悬停效果
      [copyBtn, shareBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-2px) scale(1.05)';
          btn.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = '';
          btn.style.boxShadow = '';
        });
      });
    }, 300);
  };

  // 动画帮助：显示用户卡片动画
  window.animateUserCard = function() {
    const el = document.getElementById('userCard');
    if(!el) return;
    el.classList.remove('anim-user');
    // 强制重绘以重触发动画
    void el.offsetWidth;
    el.classList.add('anim-user');
  };

  // 检查是否需要显示自定义API Key输入框
  window.checkAndShowCustomApiKeyInput = function() {
    const token = localStorage.getItem('sce_token');
    const apiKey = localStorage.getItem('sce_api_key');
    const userRaw = localStorage.getItem('sce_user');
    
    // 如果已登录但没有本地API Key，显示输入框
    if(token && !apiKey && userRaw) {
      const customApiKeyGroup = document.getElementById('customApiKeyGroup');
      if (customApiKeyGroup) {
        customApiKeyGroup.style.display = 'block';
      }
    } else {
      const customApiKeyGroup = document.getElementById('customApiKeyGroup');
      if (customApiKeyGroup) {
        customApiKeyGroup.style.display = 'none';
      }
    }
  };

  // 更新API Key UI
  window.updateApiKeyUI = function() {
    const token = localStorage.getItem('sce_token');
    // 确保getApiKeyInfo函数可用
    const info = window.getApiKeyInfo ? window.getApiKeyInfo() : {
      key: localStorage.getItem('sce_api_key'),
      name: localStorage.getItem('sce_api_key_name'),
      description: localStorage.getItem('sce_api_key_description'),
      username: localStorage.getItem('sce_api_key_username'),
      created: localStorage.getItem('sce_api_key_created')
    };
    const apiKeyBox = document.getElementById('apiKeyBox');
    const revokeKeyBtn = document.getElementById('revokeKeyBtn');
    const genKeyBtn = document.getElementById('genKeyBtn');

    // 未登录不展示具体 Key，仅提示登录以管理
    if(!token){
      if (apiKeyBox) {
        apiKeyBox.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">请先登录</p>
          </div>
        `;
      }
      if (revokeKeyBtn) revokeKeyBtn.style.display = 'none';
      if (genKeyBtn) {
        genKeyBtn.disabled = true;
        genKeyBtn.innerHTML = '<span>✨</span> 生成';
      }
      return;
    }

    if (genKeyBtn) genKeyBtn.disabled = false;
    if(info.key){
      if (apiKeyBox) {
        apiKeyBox.innerHTML = `
          <div class="key-display" style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 8px; padding: 0.75rem;">
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">API Key:</div>
            <div style="font-family: 'Courier New', monospace; font-size: 0.8rem; word-break: break-all; color: var(--primary-light);">${info.key.substring(0, 20)}...</div>
            <div style="margin-top: 0.25rem; font-size: 0.7rem; color: var(--text-secondary);">
              ${info.username ? `用户名: ${info.username}` : ''}
              ${info.name ? ` | 名称: ${info.name}` : ''}
            </div>
            ${info.description ? `
              <div style="margin-top: 0.25rem; font-size: 0.7rem; color: var(--text-secondary);">
                描述: ${info.description}
              </div>
            ` : ''}
            <div style="margin-top: 0.25rem; font-size: 0.7rem; color: var(--text-secondary);">
              ${info.created ? info.created.toLocaleDateString() : '—'}
            </div>
          </div>
        `;
      }
      if (revokeKeyBtn) revokeKeyBtn.style.display = 'inline-flex';
      if (genKeyBtn) genKeyBtn.innerHTML = '<span>🔄</span> 重新生成';
      
      // 添加验证、复制功能到按钮组
      setTimeout(() => {
        // 移除旧按钮
        const oldButtons = apiKeyBox.parentElement.querySelectorAll('.verify-key-btn, .copy-key-btn');
        oldButtons.forEach(btn => btn.remove());
        
        // 验证按钮
        const verifyBtn = document.createElement('button');
        verifyBtn.className = 'btn btn-secondary verify-key-btn';
        verifyBtn.style.flex = '1';
        verifyBtn.style.fontSize = '0.9rem';
        verifyBtn.style.padding = '0.75rem 1rem';
        verifyBtn.innerHTML = '<span>✅</span> 验证';
        verifyBtn.addEventListener('click', async () => {
          verifyBtn.disabled = true;
          verifyBtn.innerHTML = '<span class="spinner"></span> 验证中...';
          
          try {
            // 确保verifyApiKey函数可用
            const verifyKey = window.verifyApiKey || function() { 
              throw new Error('API Key验证功能不可用，请刷新页面重试'); 
            };
            const result = await verifyKey();
            alert('API Key验证成功！\n用户名: ' + result.key_info.username + 
                  '\n名称: ' + result.key_info.name + 
                  (result.key_info.description ? '\n描述: ' + result.key_info.description : '') +
                  '\n创建时间: ' + new Date(result.key_info.created_at).toLocaleString());
          } catch(err) {
            alert('API Key验证失败: ' + err.message);
          } finally {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<span>✅</span> 验证';
          }
        });
        
        // 复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn btn-secondary copy-key-btn';
        copyBtn.style.flex = '1';
        copyBtn.style.fontSize = '0.9rem';
        copyBtn.style.padding = '0.75rem 1rem';
        copyBtn.innerHTML = '<span>📋</span> 复制';
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(info.key).then(() => {
            copyBtn.innerHTML = '<span>✅</span> 已复制';
            setTimeout(() => {
              copyBtn.innerHTML = '<span>📋</span> 复制';
            }, 2000);
          });
        });
        
        // 插入到按钮组中
        const buttonContainer = apiKeyBox.parentElement.querySelector('div[style*="display: flex"]');
        if (buttonContainer) {
          buttonContainer.appendChild(verifyBtn);
          buttonContainer.appendChild(copyBtn);
        }
      }, 100);
    } else {
      // 检查用户是否已有API Key
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
      
      if(username && apiKeyBox) {
        // 异步检查用户是否已有API Key
        // 确保checkUserApiKey函数可用
        const checkUser = window.checkUserApiKey || function() { return Promise.resolve(false); };
        checkUser(username).then(hasKey => {
          if(hasKey) {
            apiKeyBox.innerHTML = `
              <div style="text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">检测到您已有API Key</p>
                <p style="color: var(--accent); font-size: 0.75rem; margin-top: 0.5rem;">点击"重新生成"将删除旧密钥并创建新密钥</p>
              </div>
            `;
          } else {
            // 只有在没有API Key时才显示未生成密钥的提示
            apiKeyBox.innerHTML = `
              <div style="text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">未生成密钥</p>
              </div>
            `;
          }
        }).catch(err => {
          console.warn('检查用户API Key失败:', err);
          // 检查失败时也显示未生成密钥的提示
          if (apiKeyBox) {
            apiKeyBox.innerHTML = `
              <div style="text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">未生成密钥</p>
              </div>
            `;
          }
        });
      } else if (apiKeyBox) {
        // 没有用户名时显示未生成密钥的提示
        apiKeyBox.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">未生成密钥</p>
          </div>
        `;
      }
      if (revokeKeyBtn) revokeKeyBtn.style.display = 'none';
      if (genKeyBtn) genKeyBtn.innerHTML = '<span>✨</span> 生成';
    }
  };

  // 更新用户显示（适配合并后的用户中心）
  window.updateUI = function() {
    const token = localStorage.getItem('sce_token');
    const userRaw = localStorage.getItem('sce_user');
    const userBox = document.getElementById('userBox');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');
    const userLoginBtn = document.getElementById('userLoginBtn');

    if(token && userRaw){
      let user;
      try { user = JSON.parse(userRaw); } catch(e) { user = { username: String(userRaw) }; }
      
      // 更新用户卡片左侧信息
      if (userBox) {
        userBox.innerHTML = `
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">👤</div>
          <h4 style="margin-bottom: 0.5rem; color: var(--text-primary); font-size: 1.2rem;">${user.username||user.userName||user.name||'—'}</h4>
          <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.25rem;">ID: ${user.userId||user.id||'—'}</p>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">${user.role||'普通用户'}</p>
          <div style="margin-top: 0.75rem;">
            <span class="status-indicator" style="background: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.3); color: #22c55e; font-size: 0.8rem; padding: 0.5rem 1rem;">
              ✓ 已登录
            </span>
          </div>
        `;
        
        // 重新绑定登录按钮事件
        const newUserLoginBtn = document.getElementById('userLoginBtn');
        if(newUserLoginBtn && window.loginRedirect) {
          newUserLoginBtn.addEventListener('click', window.loginRedirect);
        }
      }
      
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
      if (loginBtn) loginBtn.style.display = 'none';
      if (userLoginBtn) userLoginBtn.style.display = 'none';

      // 登录后启用 API Key 管理并显示
      const genKeyBtn = document.getElementById('genKeyBtn');
      if (genKeyBtn) genKeyBtn.disabled = false;
      updateApiKeyUI();
      checkAndShowCustomApiKeyInput();
    } else {
      // 未登录状态
      if (userBox) {
        userBox.innerHTML = `
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔒</div>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">未登录</p>
          <button id="userLoginBtn" class="btn btn-primary" style="margin-top: 0;">
            立即登录
          </button>
        `;
        
        // 重新绑定登录按钮事件
        const newUserLoginBtn = document.getElementById('userLoginBtn');
        if(newUserLoginBtn && window.loginRedirect) {
          newUserLoginBtn.addEventListener('click', window.loginRedirect);
        }
      }
      
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (userLoginBtn) userLoginBtn.style.display = 'inline-flex';

      // 退出登录后隐藏 API Key 展示
      const apiKeyBox = document.getElementById('apiKeyBox');
      if (apiKeyBox) {
        apiKeyBox.innerHTML = `
          <div style="text-align: center;">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">请先登录</p>
          </div>
        `;
      }
      const revokeKeyBtn = document.getElementById('revokeKeyBtn');
      if (revokeKeyBtn) revokeKeyBtn.style.display = 'none';
      const genKeyBtn = document.getElementById('genKeyBtn');
      if (genKeyBtn) {
        genKeyBtn.disabled = true;
        genKeyBtn.innerHTML = '<span>✨</span> 生成';
      }
      checkAndShowCustomApiKeyInput();
    }
  };
})();