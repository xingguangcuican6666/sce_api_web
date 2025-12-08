// 主JavaScript文件，协调所有模块
(function() {
  'use strict';
  
  // 页面加载动画
  function initPageAnimations() {
    document.body.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 100);
    
    // 初始化流星动画
    initMeteorAnimation();
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

  // 优化的 API Result 动画展示
  window.revealApiResultAnim = async function(text) {
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
  };

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

  // 初始化所有功能
  function initApp() {
    // 处理登录回调参数
    if (window.handleCallbackParams) window.handleCallbackParams();
    
    // 初始化页面动画
    initPageAnimations();
    
    // 初始化打字效果
    if (window.initTypingEffect) window.initTypingEffect();
    
    // 初始化UI
    if (window.updateUI) window.updateUI();
    if (window.checkAndShowCustomApiKeyInput) window.checkAndShowCustomApiKeyInput();
  }

  // 等待所有资源加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();