---
sidebar_position: 2
---

# 如何使用 SCE API

### 1.1 SCE API 请求 & 响应格式

##### 1.1.1 获取支援卡列表

```bash
https://api.oraclestar.cn/api/umasce
```

响应:

```json
{
  "source": "mongodb",  // 响应数据库
  "data": {
    "a1": "【0500·定刻通り】エイシンフラッシュ",
    "a2": "【1日の終わりに】スペシャルウィーク",
    "a3": "【2人のバウンス・シャッセ】キタサンブラック",
    "a4": "【43、8、1】ナカヤマフェスタ",
    "a5": "【7センチの先へ】エアシャカール",
    "a6": "【All'alba_vincerò!】テイエムオペラオー",
    "a7": "【Are_you_merry】エアグルーヴ",
    "a8": "【A_Win_Foreshadowed】シンボリクリスエス",
    "a9": "【Balliamo】ジェンティルドンナ",
    "a10": "【Ballroom_Tempest】ウオッカ",
    //...
    "anthor": "(BiliBili Wiki) https://wiki.biligame.com/umamusume/" // 数据来源
    }
}
```

##### 1.1.2 获取单个支援卡数据

```bash
https://api.oraclestar.cn/api/umasce?id=<id>
```

响应:

```json
// 以 https://api.oraclestar.cn/api/umasce?id=a1 为例
{
  "source": "mongodb",
  "data": {
    "CardName": "【0500·定刻通り】エイシンフラッシュ",
    "Type": 0,
    "Rarity": "SR",
    "friendshipBonus": { // 友情加成 各等级段效果
      "Lv1": 10,
      "Lv5": 11,
      "Lv10": 12,
      "Lv15": 13,
      "Lv20": 15,
      "Lv25": 15,
      "Lv30": 16,
      "Lv35": 18,
      "Lv40": 20,
      "Lv45": 20
    },
    "moodEffect": { // 干劲加成 各等级段效果
      "Lv1": 10,
      "Lv5": 15,
      "Lv10": 29,
      "Lv15": 27,
      "Lv20": 33,
      "Lv25": 40,
      "Lv30": 42,
      "Lv35": 45,
      "Lv40": 47,
      "Lv45": 50
    },
    "traningEffect": { //训练加成
        // ...
    },
    "specialtyPriority": { //得意率
        //...
    },
    "initalFriendship": { // 初期羁绊
        //...
    },
    "speedBonus": { // 速度加成
        //...
    },
    "staminaBonus": { // 耐力加成
        //...
    },
    "powerBonus": { // 力量加成
        //...
    },
    "gutsBonus": { // 根性加成
        //...
    },
    "witBonus": { // 智力加成
        //...
    },
    "spBonus": { // SP加成
        //...
    },
    "eventRecovery": { // 事件回复
        //...
    },
    "eventEffectiveness": { // 事件效果
        //...
    },
    "failureProtection": { // 失败率下降
        //...
    },
    "costReduction": { // 体力消耗降低
        //...
    },
    "friendshipRecovery": { // 智力回复量提升
        //...
    },
    "EfriendshipBonus": { // 固有友情加成
        //...
    },
    "EmoodEffect": { // 固有干劲加成
        //...
    },
    "EtraningEffect": { // 固有训练加成 
        //...
    },
    "EspecialtyPriority": { // 固有得意率
        //...
    },
    "EinitalFriendship": { // 固有初始羁绊
        //...
    },
    "EspeedBonus": { // 固有速度
        //...
    },
    "EstaminaBonus": { // 固有耐力
        //...
    },
    "EpowerBonus": { // 固有力量
        //...
    },
    "EgutsBonus": { // 固有根性
        //...
    },
    "EwitBonus": { // 固有智力 
        //...
    },
    "EspBonus": { // 固有SP
        //...
    },
    "initalSpeed": { // 初始速度
        //...
    },
    "initalStamina": { // 初始耐力
        //...
    },
    "initalPower": { // 初始力量
        //...
    },
    "initalGuts": { // 初始根性
        //...
    },
    "initalWit": { // 初始智力
        //...
    },
    "anthor": "(BiliBili Wiki) https://wiki.biligame.com/umamusume/"
  }
}
```

### 1.2 示例代码

以下为使用各语言调用 SCE API 的示例代码：

Python

```python
import requests

# 获取支援卡列表
response = requests.get("https://api.oraclestar.cn/api/umasce")
print(response.json())

# 获取单个支援卡数据
card_id = "a1"
response = requests.get(f"https://api.oraclestar.cn/api/umasce?id={card_id}")
print(response.json())
```

JavaScript (Node.js)

```javascript
const axios = require('axios');
// 获取支援卡列表
axios.get('https://api.oraclestar.cn/api/umasce')
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error(error);
    });

// 获取单个支援卡数据
const cardId = "a1";
axios.get(`https://api.oraclestar.cn/api/umasce?id=${cardId}`)
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error(error);
    });
```

Java

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
public class SCEApiExample {
    public static void main(String[] args) {
        try {
            // 获取支援卡列表
            URL url = new URL("https://api.oraclestar.cn/api/umasce");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            System.out.println(content.toString());

            // 获取单个支援卡数据
            String cardId = "a1";
            url = new URL("https://api.oraclestar.cn/api/umasce?id=" + cardId);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            content = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                content.append(inputLine);
            }
            in.close();
            System.out.println(content.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
