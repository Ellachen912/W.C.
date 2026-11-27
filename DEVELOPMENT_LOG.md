# Winston City 開發紀錄
## 2026-11-26
- Phase 5 Touch：建築知識、探索紀錄、右前方跟隨鏡頭、縮放、單指旋轉及長按平移。整合狀態待原始碼核對。
- Phase 6 Walkfix：兩位主角平滑跟隨修正，手機實測待確認。
- 獨立頁 mayor-motion-v4.html、Avery-motion-v1.html：站立、走路、揮手、原地慶祝；原版、微笑、大笑。
- courtyard-preview-v1.html：戶外座椅與散步；使用者截圖確認可渲染。
- courtyard-preview-v2.html：花瓣、涼亭白色雙人椅、10 秒休息及水池環行；已提交 GitHub（98914430e015dcf542e6273c536527a20c5ddc8b），待實測。
- 不將獨立測試或 ZIP 誤記為正式發布。
## 2026-11-27（V1.3 整合候選版，資料夾 city-v1.3/）
以 WinstonCity_phase6_walkfix.zip 為底，整合以下項目（程式修改）：
- mayor.js：九重葛與噴水旁花圃改成五瓣花＋花心（取自 courtyard-preview-v2）；Lv5 左側涼亭內加白色羅馬風雙人石椅（座面頂 0.315）。Phase 6 門前原本沒有椅子，不需移除（兩張木椅只存在於 courtyard V1 測試頁）。Lv5 狗的繞圈半徑 1.12→1.0，讓出步道；有人靠近 0.42 以內時狗停下讓路。
- vip_mayor.js、vip_avery.js：坐下／平滑起身（0.9 秒 smoothstep，完全站起才移動）；原地開心慶祝（取自 mayor-motion-v4、Avery-motion-v1，腳不離地）。未加入跑、跳、驚訝。
- life.js：戶外休息流程。市長家 Lv5：沿真實人行道（最短路）走到門口 → 並排進涼亭坐石椅 → 兩人坐定後 10 秒 → 起身 → 繞噴水池約一圈（Avery 平滑跟隨）→ 從右前方路口接回城市道路。市政廳 Lv2／3／5：坐廣場長椅 10 秒 → 廣場走一段（Lv5 走噴水池前弧，後方離柱廊台階太近不走）→ 接回道路。不進室內。約每 100～160 秒一次。蓋好／升級時兩人原地慶祝（ui.js 送出 wc-cheer 事件）。
- people.js：換成 GitHub residents-professions-v7（69b6a8f）的服裝，新增太空人、船長、列車長、畫家、農夫、牧場主人、老師；依家長 11-27 指示，斗笠不再是一般居民配件（只有農夫工作服戴）。對應：天文台太空人、碼頭船長、火車站列車長、美術館畫家、菜園／果園／茶園農夫、牧場牧場主人、學校 Lv2 起多一位老師。texts.js、zy.js 加入新職業的話與注音。
- index.html：life 取得建築群組（lotGroup）；測試用 window.__T、__game.scene 等除錯掛勾。

測試（Chrome 無頭瀏覽器＋SwiftShader，非實機）：
- 城市載入無 JS 錯誤；新職業居民有出現。
- 以射線障礙圖檢查所有路線（市長家 Lv5、市政廳 Lv2／5）：無柱子、花圃、水池、樹、台階碰撞（僅涼亭地板 0.11 的上台階）。
- 加速模擬完整流程（市長家、市政廳 Lv2、Lv5）：走到門口 → 坐下 → 10 秒 → 起身 → 散步 → 接回道路全部完成；兩人最近距離 ≥ 0.24（碰撞約 0.15）。截圖確認坐姿高度正確。
未測：iPhone／iPad 實機觸控與效能、舊存檔與備份匯入、鏡頭跟隨細節、Lv3 市政廳路線模擬。

## 2026-11-27 12:30（運動中心接進 city-v1.3/、跟隨鏡頭）
- 新增 s3_gym.js（運動中心，2 格，GYM_LV／GYM_TOP，座標同天文台：兩格中間為原點、x 沿兩格、正門朝 +z）。
  - Lv1：左格運動公園（架高 0.3 的石材基座＋階梯、8 水道泳池、獨立跳水池、三層跳水塔、1 米／3 米彈跳板、玻璃欄杆；兩面網球場、擋風布、裁判椅、LED 燈桿；可愛的圓樹）；右格草地。
  - Lv2：右格木星棒球場，用家長給的 Winston_City_Park_Civic_Edition_26.blend（01～06、08、09 圖層）匯出 models/ballpark.glb（約 2.5 萬面、1.7MB，蓋了才載入）。英文字物件拿掉，中文貼回原位置。正門朝前、縮 0.9 倍放進格子。
  - 和 winston-city-park／winston-island-park（另一條線的展示頁）分開，那兩個沒有動。
- data.js：gym 改 size:2、maxLv:2、cost C(5,2)、stage:2（拿掉 soon）。佔 2 格找鄰格時，先找左右相鄰（不同欄）的格子，正面才會朝前。
- index.html：S1B／S1TOP 加 gym；FOLLOW_ELEVATION 25 度 → 8 度（家長 11-27 12:23：小人物鏡頭接近平視）。
- life.js 市長介紹、explore.js 探索（教練：運動前要暖身）加運動中心；zy.js 用 addzy 只新增注音。
- thumbs/gym.png。
- 測試（無頭瀏覽器＋SwiftShader，非實機）：遊戲載入無錯誤；測試模式在 HEX-029＋030 蓋 Lv1、Lv2 截圖正常、在六角格內。未測：iPad 實機、跟隨鏡頭實際手感。

## 2026-11-27 13:00（運動中心修改、對話框、膚色；家長 12:29～12:59）
- 棒球場正門改朝運動公園那一格（BP.face='side'，原尺寸），步道穿過兩格中間的路接到正門；跳水池前面加矮的救生員椅；gym 升 Lv2 改 4 顆（cost [0,5,4]）。
- 新增 trees.js（共用的樹）：社區公園 low_poly_tree_set 四種（p04、p06、p12、p13）＋Blender 檔的城市樹（city），可改顏色（pink、lime、deep）。家長 12:39：以後種樹從這幾種挑、不要整排同一種（規則記在專案《樹木規則（設定）》）。
- 優化（家長 12:42）：s3_gym.js 自己的 rbox／sphere 改省面版；棒球場 LED 小燈改四邊形。Lv1 約 13.4 萬 → 1.4 萬個三角形，Lv2 約 14.4 萬 → 3.5 萬；ballpark.glb 1.7MB → 1.4MB。
- 閃圖（家長 12:48 錄影）：球場地面幾層原本只差 0.5～1 毫米 → 匯出時離地高度放大 8 倍（順序不變）；屋頂接縫、白線等用 polygonOffset（userData.keep，不被合併）；泳池水面、網球場、草地墊高。
- 對話框（家長 12:48）：.talk 加 width:max-content（跟隨時不再擠成一直條）；life.js 把對話框夾在畫面內、不蓋到左上城市名牌，位置平滑跟隨、取整數像素（不晃）。
- 膚色（家長 12:52、12:54）：people.js 膚色清單拿掉 #ffd9c0（太白），改成 #f2c4a2、#e8b48e（新）、#d9a27c；固定用 #ffd9c0 的阿姨、小孩、小女孩、奶奶改 #f2c4a2；vip_avery.js Avery 膚色 #ffdcc6 → #f2c4a2。
- 測試：無頭瀏覽器（非實機）。遊戲載入無錯誤、運動中心 Lv1／Lv2、手機大小畫面點小人物對話框正常。
- 11-27 15:30 海生館整合（家長在 Artifact 確認後上傳）：新增 aq_fix.js（stripAquariumGround 移除 City soil/sidewalk/sports zone、aquariumPad 石板地、aquariumLift 墊高、中文招牌、whaleSpout 鯨魚噴水：每 7 秒噴 1.8 秒、高約 0.3）；s2_aquarium.js 接上；models/aquarium-animated.glb 換成瘦身版（工具 aq_slim.py：拿掉地台與英文字、正面材質頂點沿法線外推 1.5mm 修 z-fighting、珊瑚減面、頂點色合併材質，約 34 個 draw call、3.65 萬三角形）。data.js：aquarium cost [0,7]、stage 2；reqList 支援 hallLv，海生館與運動中心 hallLv:4。
