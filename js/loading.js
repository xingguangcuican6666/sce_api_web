// 加载提示模块
(function() {
  'use strict';
  
  // 创建加载提示元素
  window.createLoadingTip = function() {
    const loadingTip = document.createElement('div');
    loadingTip.id = 'loading-tip';
    loadingTip.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #ffffff;
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    document.body.appendChild(loadingTip);
    return loadingTip;
  };
  
  // 显示加载提示
  window.showLoadingTip = function(filename) {
    let loadingTip = document.getElementById('loading-tip');
    if (!loadingTip) {
      loadingTip = createLoadingTip();
    }
    
    loadingTip.textContent = `正在加载 ${filename} ...`;
    loadingTip.style.opacity = '1';
  };
  
  // 隐藏加载提示
  window.hideLoadingTip = function() {
    const loadingTip = document.getElementById('loading-tip');
    if (loadingTip) {
      loadingTip.style.opacity = '0';
    }
  };
  
  // 动态加载JS文件
  window.loadScript = function(src, callback) {
    const filename = src.split('/').pop();
    showLoadingTip(filename);
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = function() {
      setTimeout(() => {
        hideLoadingTip();
        if (callback) callback();
      }, 500);
    };
    script.onerror = function() {
      hideLoadingTip();
      console.error(`加载脚本失败: ${src}`);
    };
    document.head.appendChild(script);
  };
  
  // 动态加载CSS文件
  window.loadCSS = function(src, callback) {
    const filename = src.split('/').pop();
    showLoadingTip(filename);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = src;
    link.onload = function() {
      setTimeout(() => {
        hideLoadingTip();
        if (callback) callback();
      }, 500);
    };
    link.onerror = function() {
      hideLoadingTip();
      console.error(`加载样式失败: ${src}`);
    };
    document.head.appendChild(link);
  };
})();