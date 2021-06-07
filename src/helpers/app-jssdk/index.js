/*
 * @Author: 黄德辉
 * @Date: 2021-06-07 18:32:01
 * @Last Modified by: 黄德辉
 * @Last Modified time: 2021-06-07 18:33:58
 */

import jsBridge from "./jsBridge";
import { isIPhone, actionsText } from "@/src/utils";

// 观察者模式注册
const actions = {
  subscribe: (...args) => jsBridge.subscribe(...args),

  unSubscribe: (...args) => jsBridge.unSubscribe(...args),

  getDeviceInfo: (params) =>
    isIPhone()
      ? Promise.resolve({ camera: 1 })
      : jsBridge.postMessage("getDeviceInfo", params),
};

actionsText.map((v) => {
  actions[v] = (params) => jsBridge.postMessage(v, params);
});

export default {
  ...actions,
};
