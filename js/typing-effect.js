// 打字效果模块
(function() {
  'use strict';
  
  // 打字效果
  window.typeWriter = function(element, text, speed = 100, onComplete = null, cursorElement = null) {
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
  };
  
  // 初始化打字效果
  window.initTypingEffect = function() {
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
  };
})();