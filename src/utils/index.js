/*
 * @Author: 黄德辉
 * @Date: 2021-06-07 18:24:55
 * @Last Modified by: 黄德辉
 * @Last Modified time: 2021-06-07 18:31:16
 */

// 判断当前环境
export const isDev = process.env.APP_ENV === "dev";

// 判断是否为手机端
export const isIPhone = () =>
  (navigator.appVersion.match(/iphone/gi) || []).length > 0;

// 生成一段唯一的随机码
export function uuid(len, radix) {
  let i;
  const uuidArr = [];
  const chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  radix = radix || chars.length;

  if (len) {
    for (i = 0; i < len; i++) uuidArr[i] = chars[0 | (Math.random() * radix)];
  } else {
    let r;
    uuidArr[8] = uuidArr[13] = uuidArr[18] = uuidArr[23] = "-";
    uuidArr[14] = "4";
    for (i = 0; i < 36; i++) {
      if (!uuidArr[i]) {
        r = 0 | (Math.random() * 16);
        uuidArr[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuidArr.join("");
}

// H5主动与APP通信的自定义事件，下列距离
export const actionsText = [
  "httpRequest", // 请求
  "scanQrcode", // 扫码
  "enterGoodsDetailAppToolBar", // 进入外卖详情页
  "leaveGoodsDetailAppToolBar", // 离开外卖详情页
];
