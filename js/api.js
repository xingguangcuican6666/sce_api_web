// API相关功能模块
(function() {
  'use strict';
  
  // 解析API响应数据
  window.parseApiResponse = function(text) {
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
  };
})();