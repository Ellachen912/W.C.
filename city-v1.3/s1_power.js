/* Winston City 1 發電廠：家長 2026-11-11 12:41 改成 3 級。
   新 Lv1＝舊 Lv2（兩根煙囪、屋頂太陽能板、控制室）；新 Lv2＝舊 Lv4（冷卻塔、風車、儲能電池、海上風機）；新 Lv3＝舊 Lv5（木星觀景塔、浮動太陽能板、海浪發電、能源教室）。
   模型本體在 stage1.js 的 power(lv)，這裡只做等級對照。2026-11-11 17:21：屋頂和海上太陽能板換成 Kenney（models/ind），風車維持原本。 */
import { power2, power4, power5 } from './stage1.js';
export const POWER_MAP=[0,2,4,5];          // 新等級 → 舊 power(lv)
export const POWER_LV=[['power','發電廠 Lv1',power2,'whole'],['power2','發電廠 Lv2',power4,'whole'],['power3','發電廠 Lv3',power5,'whole']];
