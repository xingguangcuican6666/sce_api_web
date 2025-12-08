(function(){
  // 简易工具
  function qs(name){ return new URLSearchParams(window.location.search).get(name); }
  function tryParseJSON(s){ try{ return JSON.parse(s); }catch(e){ return null; } }
  
  // DOM 元素
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userBox = document.getElementById('userBox');
  const userLoginBtn = document.getElementById('userLoginBtn');
  const genKeyBtn = document.getElementById('genKeyBtn');
  const revokeKeyBtn = document.getElementById('revokeKeyBtn');
  const apiKeyBox = document.getElementById('apiKeyBox');
  const callApiBtn = document.getElementById('callApiBtn');
  const apiResult = document.getElementById('apiResult');
  const useApiKey = document.getElementById('useApiKey');
  const useBearer = document.getElementById('useBearer');
  const cardIdInput = document.getElementById('cardId');
  const customApiKeyInput = document.getElementById('customApiKey');
  const customApiKeyGroup = document.getElementById('customApiKeyGroup');
  const heroDemoBtn = document.getElementById('heroDemoBtn');
  const heroDocBtn = document.getElementById('heroDocBtn');

  const LOGIN_GATEWAY_BASE = 'https://login.oralode.cn/login?callback=';

  function loginRedirect(){
    const cb = (window.location.origin + window.location.pathname);
    window.location.href = LOGIN_GATEWAY_BASE + cb;
  }
  loginBtn.addEventListener('click', loginRedirect);
  userLoginBtn.addEventListener('click', loginRedirect);
  
  // Hero 按钮事件
  heroDemoBtn.addEventListener('click', () => {
    document.getElementById('callApiBtn').scrollIntoView({ behavior: 'smooth' });
  });
  
  heroDocBtn.addEventListener('click', () => {
    window.open('https://docs.oraclestar.cn/docs/SCE_API/welcome', '_blank');
  });

  logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('sce_token');
    localStorage.removeItem('sce_user');
    updateUI();
    history.replaceState(null,'',window.location.pathname);
  });

  // 解析回调（兼容 user JSON 或 username/userId 单独字段）
  function handleCallbackParams(){
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
  }

  // API Key helpers（调用后端API）
  async function generateApiKey(name = '默认API Key', description = '', username = ''){
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
  }
  
  // 验证API Key
  async function verifyApiKey(){
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
  }
  
  // 检查用户是否已有API Key
  async function checkUserApiKey(username){
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
  }
  
  // 删除用户的所有API Key
  async function deleteUserApiKeys(username, token){
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
  }
  
  function revokeApiKey(){
    localStorage.removeItem('sce_api_key');
    localStorage.removeItem('sce_api_key_name');
    localStorage.removeItem('sce_api_key_description');
    localStorage.removeItem('sce_api_key_username');
    localStorage.removeItem('sce_api_key_created');
  }
  
  function getApiKeyInfo(){
    const key = localStorage.getItem('sce_api_key');
    const name = localStorage.getItem('sce_api_key_name');
    const description = localStorage.getItem('sce_api_key_description');
    const username = localStorage.getItem('sce_api_key_username');
    const created = localStorage.getItem('sce_api_key_created');
    return { key, name, description, username, created: created ? new Date(Number(created)) : null };
  }

  // 动画帮助：显示用户卡片动画
  function animateUserCard(){
    const el = document.getElementById('userCard');
    if(!el) return;
    el.classList.remove('anim-user');
    // 强制重绘以重触发动画
    void el.offsetWidth;
    el.classList.add('anim-user');
  }

  // 增强的 API Key 生成展示动画
  async function revealApiKeyAnim(key){
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
  }

  // 解析API响应数据
  function parseApiResponse(text) {
    try {
      // 从状态码和JSON中提取纯JSON部分
      const jsonMatch = text.match(/\{.*\}/);
      if (!jsonMatch) return '';
      
      const data = JSON.parse(jsonMatch[0]);
      let parsedHtml = '';
      
      if (data.data && typeof data.data === 'object') {
        // 检查是否为单个支援卡（包含详细属性的对象）
        const isSingleCard = !Array.isArray(data.data) && 
          typeof data.data === 'object' && 
          ('CardName' in data.data || 'Rarity' in data.data || 'Type' in data.data);
        
        // 检查是否为列表响应（键为a1, a2等格式，且不包含支援卡属性）
        const isListResponse = !isSingleCard &&
          Object.keys(data.data).length > 0 &&
          Object.keys(data.data).some(key => key.match(/^a\d+$/));
        
        if (isSingleCard) {
          // 单个支援卡信息展示
          const cardData = data.data;
          
          // 辅助函数：安全获取属性值
          const safeGet = (obj, path, defaultValue = '—') => {
            const keys = path.split('.');
            let current = obj;
            for (const key of keys) {
              if (current && typeof current === 'object' && key in current) {
                current = current[key];
              } else {
                  return defaultValue;
                }
            }
            // 如果结果是对象，尝试获取数值
            if (typeof current === 'object' && current !== null) {
              // 检查是否有常见的数值属性
              if ('value' in current) return current.value;
              if ('num' in current) return current.num;
              if ('amount' in current) return current.amount;
              // 如果是简单对象且有数值属性，取第一个数值
              const values = Object.values(current).filter(v => typeof v === 'number');
              if (values.length > 0) return values[0];
              return defaultValue;
            }
            return current;
          };
          
          // 辅助函数：获取等级属性值，如果不存在则返回0
          const getLevelValue = (obj, basePath, level) => {
            const path = `${basePath}.Lv${level}`;
            const value = safeGet(obj, path, 0);
            return value === '—' ? 0 : value;
          };
          
          // 辅助函数：获取多个等级的属性值
          const getLevelValues = (obj, basePath, levels = [1, 20, 30, 40, 45, 50]) => {
            return levels.map(level => ({
              level,
              value: getLevelValue(obj, basePath, level)
            }));
          };
          
          parsedHtml = `
            <div class="api-parsed-result">
              <h4>📋 支援卡信息</h4>
              <div class="api-data-grid">
                <div class="api-data-item">
                  <div class="api-data-label">卡片名称</div>
                  <div class="api-data-value">${cardData.CardName || '—'}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">稀有度</div>
                  <div class="api-data-value">${cardData.Rarity || '—'}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">类型</div>
                  <div class="api-data-value">${cardData.Type === 0 ? '速度型' : cardData.Type === 1 ? '耐力型' : cardData.Type === 2 ? '力量型' : cardData.Type === 3 ? '根性型' : cardData.Type === 4 ? '智力型' : '—'}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">初始羁绊</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'initalFriendship', 1)} | Lv20: ${getLevelValue(cardData, 'initalFriendship', 20)} | Lv30: ${getLevelValue(cardData, 'initalFriendship', 30)} | Lv40: ${getLevelValue(cardData, 'initalFriendship', 40)} | Lv45: ${getLevelValue(cardData, 'initalFriendship', 45)} | Lv50: ${getLevelValue(cardData, 'initalFriendship', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">初始速度</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'initalSpeed', 1)} | Lv20: ${getLevelValue(cardData, 'initalSpeed', 20)} | Lv30: ${getLevelValue(cardData, 'initalSpeed', 30)} | Lv40: ${getLevelValue(cardData, 'initalSpeed', 40)} | Lv45: ${getLevelValue(cardData, 'initalSpeed', 45)} | Lv50: ${getLevelValue(cardData, 'initalSpeed', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">初始耐力</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'initalStamina', 1)} | Lv20: ${getLevelValue(cardData, 'initalStamina', 20)} | Lv30: ${getLevelValue(cardData, 'initalStamina', 30)} | Lv40: ${getLevelValue(cardData, 'initalStamina', 40)} | Lv45: ${getLevelValue(cardData, 'initalStamina', 45)} | Lv50: ${getLevelValue(cardData, 'initalStamina', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">初始力量</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'initalPower', 1)} | Lv20: ${getLevelValue(cardData, 'initalPower', 20)} | Lv30: ${getLevelValue(cardData, 'initalPower', 30)} | Lv40: ${getLevelValue(cardData, 'initalPower', 40)} | Lv45: ${getLevelValue(cardData, 'initalPower', 45)} | Lv50: ${getLevelValue(cardData, 'initalPower', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">初始根性</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'initalGuts', 1)} | Lv20: ${getLevelValue(cardData, 'initalGuts', 20)} | Lv30: ${getLevelValue(cardData, 'initalGuts', 30)} | Lv40: ${getLevelValue(cardData, 'initalGuts', 40)} | Lv45: ${getLevelValue(cardData, 'initalGuts', 45)} | Lv50: ${getLevelValue(cardData, 'initalGuts', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">初始智力</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'initalWit', 1)} | Lv20: ${getLevelValue(cardData, 'initalWit', 20)} | Lv30: ${getLevelValue(cardData, 'initalWit', 30)} | Lv40: ${getLevelValue(cardData, 'initalWit', 40)} | Lv45: ${getLevelValue(cardData, 'initalWit', 45)} | Lv50: ${getLevelValue(cardData, 'initalWit', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">友情加成</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'friendshipBonus', 1)} | Lv20: ${getLevelValue(cardData, 'friendshipBonus', 20)} | Lv30: ${getLevelValue(cardData, 'friendshipBonus', 30)} | Lv40: ${getLevelValue(cardData, 'friendshipBonus', 40)} | Lv45: ${getLevelValue(cardData, 'friendshipBonus', 45)} | Lv50: ${getLevelValue(cardData, 'friendshipBonus', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">干劲加成</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'moodEffect', 1)} | Lv20: ${getLevelValue(cardData, 'moodEffect', 20)} | Lv30: ${getLevelValue(cardData, 'moodEffect', 30)} | Lv40: ${getLevelValue(cardData, 'moodEffect', 40)} | Lv45: ${getLevelValue(cardData, 'moodEffect', 45)} | Lv50: ${getLevelValue(cardData, 'moodEffect', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">训练加成</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'traningEffect', 1)} | Lv20: ${getLevelValue(cardData, 'traningEffect', 20)} | Lv30: ${getLevelValue(cardData, 'traningEffect', 30)} | Lv40: ${getLevelValue(cardData, 'traningEffect', 40)} | Lv45: ${getLevelValue(cardData, 'traningEffect', 45)} | Lv50: ${getLevelValue(cardData, 'traningEffect', 50)}</div>
                </div>
                <div class="api-data-item">
                  <div class="api-data-label">得意率</div>
                  <div class="api-data-value">Lv1: ${getLevelValue(cardData, 'specialtyPriority', 1)} | Lv20: ${getLevelValue(cardData, 'specialtyPriority', 20)} | Lv30: ${getLevelValue(cardData, 'specialtyPriority', 30)} | Lv40: ${getLevelValue(cardData, 'specialtyPriority', 40)} | Lv45: ${getLevelValue(cardData, 'specialtyPriority', 45)} | Lv50: ${getLevelValue(cardData, 'specialtyPriority', 50)}</div>
                </div>
              </div>
              <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">显示部分属性，全部属性请参考文档</div>
            `;
        } else if (isListResponse) {
          // 支援卡列表展示
          const entries = Object.entries(data.data);
          if (entries.length > 0) {
            parsedHtml = `
              <div class="api-parsed-result">
                <h4>📚 支援卡列表 (${entries.length}个)</h4>
                <div class="api-data-grid">
                  ${entries.slice(0, 12).map(([key, value]) => `
                    <div class="api-data-item">
                      <div class="api-data-label">${key}</div>
                      <div class="api-data-value">${value || '—'}</div>
                    </div>
                  `).join('')}
                </div>
                ${entries.length > 12 ? `<div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">显示前12个，共${entries.length}个支援卡</div>` : ''}
                <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.75rem;">
                  数据来源：${data.source || '—'}
                </div>
              </div>
            `;
          }
        }
      }
      
      return parsedHtml;
    } catch (e) {
      console.error('解析错误:', e);
      return '';
    }
  }

  // 优化的 API Result 动画展示
  async function revealApiResultAnim(text){
    const el = document.getElementById('apiResult');
    if(!el) return;
    
    console.log('原始响应:', text); // 调试日志
    
    // 解析响应数据
    const parsedContent = parseApiResponse(text);
    console.log('解析结果:', parsedContent); // 调试日志
    
    // 创建加载状态
    el.style.display = 'block';
    el.classList.add('anim-fade');
    
    el.innerHTML = `
      <div class="api-result-container anim-glow">
        <div class="row" style="margin-bottom:12px">
          <span class="spinner"></span>
          <span style="margin-left:8px">正在解析响应数据...</span>
        </div>
        ${parsedContent ? `
          <div id="apiParsedContent" style="opacity: 0; transition: opacity 0.5s;">
            ${parsedContent}
          </div>
        ` : ''}
        <div class="collapsible" id="rawDataCollapsible">
          <div class="collapsible-header" onclick="toggleCollapsible('rawDataCollapsible')">
            <span class="collapsible-title">📄 原始响应数据</span>
            <span class="collapsible-icon" id="rawDataIcon">▶</span>
          </div>
          <div class="collapsible-content" id="rawDataContent">
            <div class="collapsible-body">
              <pre id="apiResultBody" style="background:transparent;border:none;padding:0;margin:0;color:inherit;font-family:monospace;white-space:pre-wrap;max-height:400px;overflow:auto;font-size:0.85rem;"></pre>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const body = document.getElementById('apiResultBody');
    if(!body) return;
    
    // 添加渐变背景动画
    body.style.background = 'linear-gradient(90deg, transparent, rgba(15, 111, 255, 0.05), transparent)';
    body.style.backgroundSize = '200px 100%';
    body.style.animation = 'shimmer 1.5s infinite';
    
    const lines = String(text).split('\n');
    let currentContent = '';
    
    // 逐行显示效果
    for(let i=0;i<lines.length;i++){
      const line = lines[i];
      let lineContent = '';
      
      // 每行逐字符显示
      for(let j=0;j<line.length;j++){
        lineContent += line[j];
        body.textContent = currentContent + lineContent;
        
        // 智能延迟：每8个字符暂停
        if(j % 8 === 0) {
          await new Promise(r=>setTimeout(r,3));
        }
      }
      
      currentContent += lineContent;
      if(i < lines.length - 1) {
        currentContent += '\n';
        body.textContent = currentContent;
      }
      
      // 行间延迟
      await new Promise(r=>setTimeout(r,30));
    }
    
    // 完成后移除加载动画
    const container = el.querySelector('.api-result-container');
    if(container) {
      container.classList.remove('anim-glow');
      body.style.animation = '';
    }
    
    // 显示解析内容
    const parsedEl = document.getElementById('apiParsedContent');
    if(parsedEl) {
      setTimeout(() => {
        parsedEl.style.opacity = '1';
      }, 500);
    }
    
    // 淡出spinner
    const spinner = el.querySelector('.spinner');
    if(spinner) {
      spinner.style.transition = 'opacity 0.5s';
      spinner.style.opacity = '0';
      setTimeout(() => {
        const statusRow = el.querySelector('.row');
        if(statusRow) {
          statusRow.innerHTML = '<span style="color:#4ade80">✓ 响应完成</span>';
        }
      }, 500);
    }
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
  }

  function updateApiKeyUI(){
    const token = localStorage.getItem('sce_token');
    const info = getApiKeyInfo();

    // 未登录不展示具体 Key，仅提示登录以管理
    if(!token){
      apiKeyBox.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">请先登录</p>
        </div>
      `;
      revokeKeyBtn.style.display = 'none';
      genKeyBtn.disabled = true;
      genKeyBtn.innerHTML = '<span>✨</span> 生成';
      return;
    }

    genKeyBtn.disabled = false;
    if(info.key){
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
      revokeKeyBtn.style.display = 'inline-flex';
      genKeyBtn.innerHTML = '<span>🔄</span> 重新生成';
      
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
            const result = await verifyApiKey();
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
      
      if(username) {
        // 异步检查用户是否已有API Key
        checkUserApiKey(username).then(hasKey => {
          if(hasKey) {
            apiKeyBox.innerHTML = `
              <div style="text-align: center;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">检测到您已有API Key</p>
                <p style="color: var(--accent); font-size: 0.75rem; margin-top: 0.5rem;">点击"重新生成"将删除旧密钥并创建新密钥</p>
              </div>
            `;
          }
        }).catch(err => {
          console.warn('检查用户API Key失败:', err);
        });
      }
      
      apiKeyBox.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">未生成密钥</p>
        </div>
      `;
      revokeKeyBtn.style.display = 'none';
      genKeyBtn.innerHTML = '<span>✨</span> 生成';
    }
  }

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
          const hasKey = await checkUserApiKey(username);
          if(hasKey) {
            if(!confirm('检测到您已有API Key，是否要重新生成？重新生成将删除旧密钥并创建新密钥。')) {
              genKeyBtn.disabled = false;
              genKeyBtn.innerHTML = '<span>✨</span> 生成';
              return;
            }
            
            // 先删除旧的API Key
            genKeyBtn.innerHTML = '<span class="spinner"></span> 删除旧密钥...';
            try {
              const deleteResult = await deleteUserApiKeys(username, token);
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
      const key = await generateApiKey('默认API Key', '通过Web界面生成', username);
      
      // 使用动画展示生成的密钥
      await revealApiKeyAnim(key);
      updateApiKeyUI();
      checkAndShowCustomApiKeyInput();
    } catch(err) {
      alert('生成API Key失败: ' + err.message);
    } finally {
      genKeyBtn.disabled = false;
      genKeyBtn.innerHTML = '<span>🔄</span> 重新生成';
    }
  });

  revokeKeyBtn.addEventListener('click', ()=>{
    if(!confirm('确认撤销本地保存的 API Key？（仅本地演示）')) return;
    revokeApiKey();
    updateApiKeyUI();
  });

  // 更新用户显示（适配合并后的用户中心）
  function updateUI(){
    const token = localStorage.getItem('sce_token');
    const userRaw = localStorage.getItem('sce_user');

    if(token && userRaw){
      let user;
      try { user = JSON.parse(userRaw); } catch(e) { user = { username: String(userRaw) }; }
      
      // 更新用户卡片左侧信息
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
      
      logoutBtn.style.display = 'inline-flex';
      loginBtn.style.display = 'none';
      userLoginBtn.style.display = 'none';

      // 登录后启用 API Key 管理并显示
      genKeyBtn.disabled = false;
      updateApiKeyUI();
      checkAndShowCustomApiKeyInput();
    } else {
      // 未登录状态
      userBox.innerHTML = `
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔒</div>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">未登录</p>
        <button id="userLoginBtn" class="btn btn-primary" style="margin-top: 0;">
          立即登录
        </button>
      `;
      
      // 重新绑定登录按钮事件
      const newUserLoginBtn = document.getElementById('userLoginBtn');
      if(newUserLoginBtn) {
        newUserLoginBtn.addEventListener('click', loginRedirect);
      }
      
      logoutBtn.style.display = 'none';
      loginBtn.style.display = 'inline-flex';
      userLoginBtn.style.display = 'inline-flex';

      // 退出登录后隐藏 API Key 展示
      apiKeyBox.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
          <p style="color: var(--text-secondary); font-size: 0.85rem;">请先登录</p>
        </div>
      `;
      revokeKeyBtn.style.display = 'none';
      genKeyBtn.disabled = true;
      genKeyBtn.innerHTML = '<span>✨</span> 生成';
      checkAndShowCustomApiKeyInput();
    }
  }

  // 检查是否需要显示自定义API Key输入框
  function checkAndShowCustomApiKeyInput() {
    const token = localStorage.getItem('sce_token');
    const apiKey = localStorage.getItem('sce_api_key');
    const userRaw = localStorage.getItem('sce_user');
    
    // 如果已登录但没有本地API Key，显示输入框
    if(token && !apiKey && userRaw) {
      customApiKeyGroup.style.display = 'block';
    } else {
      customApiKeyGroup.style.display = 'none';
    }
  }

  // 调用 SCE API（支持API Key和Bearer Token两种认证方式）
  async function callUmasce(){
    apiResult.style.display = 'block';
    apiResult.innerHTML = '<div class="row"><span class="spinner"></span><span style="margin-left:8px">请求中...</span></div>';
    
    const id = (cardIdInput.value || '').trim();
    const url = id ? ('https://api.oraclestar.cn/api/umasce?id=' + encodeURIComponent(id)) : 'https://api.oraclestar.cn/api/umasce';
    const headers = {};
    const apiKey = localStorage.getItem('sce_api_key');
    const token = localStorage.getItem('sce_token');
    const customApiKey = (customApiKeyInput.value || '').trim();

    // 根据用户选择的认证方式设置请求头
    if(useApiKey.checked) {
      // 优先使用手动输入的API Key，然后是本地存储的API Key
      if(customApiKey) {
        headers['x-api-key'] = customApiKey;
      } else if(apiKey) {
        headers['x-api-key'] = apiKey;
      } else {
        apiResult.innerHTML = '<div style="color: #ef4444;">❌ 请输入API Key或生成新的API Key</div>';
        return;
      }
    } else if(useBearer.checked && token){
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

  callApiBtn.addEventListener('click', callUmasce);

  // 页面加载动画
  function initPageAnimations(){
    document.body.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);
  }

  // 流星动画系统
  function initMeteorAnimation() {
    const bgAnimation = document.querySelector('.bg-animation');
    if (!bgAnimation) return;

    // 创建流星
    function createMeteor() {
      const meteor = document.createElement('div');
      meteor.className = 'meteor';
      
      // 随机起始位置（屏幕右上方向）
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight * 0.3; // 上方30%区域
      
      // 随机终点位置（向左下方滑落）
      const angle = 120 + Math.random() * 60; // 120-180度角（向左下方）
      const distance = 400 + Math.random() * 600; // 400-1000px距离
      const radians = angle * Math.PI / 180;
      
      const endX = startX + Math.cos(radians) * distance;
      const endY = startY + Math.sin(radians) * distance;
      
      // 设置CSS变量
      meteor.style.setProperty('--tx', `${endX - startX}px`);
      meteor.style.setProperty('--ty', `${endY - startY}px`);
      meteor.style.setProperty('--angle', `${angle}deg`);
      meteor.style.left = `${startX}px`;
      meteor.style.top = `${startY}px`;
      
      // 随机动画持续时间
      const duration = 0.8 + Math.random() * 1.2; // 0.8-2秒
      meteor.style.animationDuration = `${duration}s`;
      
      // 随机大小
      const size = 1.5 + Math.random() * 3;
      meteor.style.width = `${size}px`;
      meteor.style.height = `${size}px`;
      
      // 随机亮度和颜色
      const brightness = 0.5 + Math.random() * 0.5;
      meteor.style.opacity = brightness;
      
      // 随机颜色（白色或淡蓝色）
      const colors = [
        'rgba(255, 255, 255, 0.9)',
        'rgba(200, 220, 255, 0.9)',
        'rgba(180, 200, 255, 0.9)'
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      meteor.style.background = color;
      meteor.style.boxShadow = `0 0 ${10 + size * 2}px ${size}px ${color}`;
      
      // 设置拖尾颜色
      meteor.style.setProperty('--tail-color', color);
      
      bgAnimation.appendChild(meteor);
      
      // 动画结束后移除元素
      setTimeout(() => {
        if (meteor.parentNode) {
          meteor.parentNode.removeChild(meteor);
        }
      }, duration * 1000);
    }

    // 定期创建流星
    function createMeteorShower() {
      // 每次创建1-2颗流星
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        setTimeout(() => createMeteor(), i * 100);
      }
    }

    // 立即创建一些流星
    createMeteorShower();
    
    // 提高生成频率：每0.5-1.5秒创建新的流星
    setInterval(createMeteorShower, 500 + Math.random() * 1000);
  }

  // 打字效果
  function typeWriter(element, text, speed = 100, onComplete = null, cursorElement = null) {
    let i = 0;
    element.textContent = '';
    
    // 显示光标
    if (cursorElement) {
      cursorElement.style.display = 'inline-block';
    }
    
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        // 打字完成后保留光标闪烁，不隐藏
        // 执行回调函数
        if (onComplete) {
          onComplete();
        }
      }
    }
    
    return type;
  }

  // 页面加载动画
  function initPageAnimations(){
    document.body.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);
    
    // 初始化流星动画
    initMeteorAnimation();
    
    // 初始化标题打字效果
    const titleElement = document.getElementById('typing-title');
    const subtitleElement = document.getElementById('typing-subtitle');
    const cursor = document.getElementById('main-cursor');
    
    if (titleElement && cursor) {
      // 主标题打字效果
      const titleTypeFunction = typeWriter(titleElement, '赛马娘支援卡数据 API', 120, () => {
        // 主标题完成后，将光标移动到副标题
        if (subtitleElement) {
          // 将光标从主标题移动到副标题
          titleElement.parentElement.removeChild(cursor);
          subtitleElement.parentElement.appendChild(cursor);
          
          // 开始副标题打字效果
          const subtitleTypeFunction = typeWriter(
            subtitleElement, 
            '高性能、稳定可靠的赛马娘支援卡数据接口，为开发者提供完整的支援卡信息查询服务', 
            50
          );
          subtitleTypeFunction();
        }
      }, cursor);
      
      // 延迟开始主标题打字效果
      setTimeout(() => {
        titleTypeFunction();
      }, 500);
    }
  }

  // 初始化
  handleCallbackParams();
  updateUI();
  checkAndShowCustomApiKeyInput();
  initPageAnimations();

  // 在本地打开文件服务器时，可能 URL 为 /sce_api_intro.html 或 /docs/sce_api_intro.html，兼容链接位置
})();