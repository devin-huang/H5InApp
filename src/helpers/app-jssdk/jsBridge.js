/*
 * @Author: 黄德辉
 * @Date: 2021-06-07 18:34:12
 * @Last Modified by: 黄德辉
 * @Last Modified time: 2021-06-07 19:19:54
 */

import { uuid, isDev } from "@/src/utils";

/**
 * 观察者模式类
 *
 * @class MessageSubscription
 */
class MessageSubscription {
  constructor() {
    this.mqList = [];
  }

  /**
   * 订阅消息
   *
   * @param {*} action
   * @param {*} callback
   * @memberof MessageSubscription
   */
  subscribe(action, callback) {
    const list = this.mqList[action];
    if (list) {
      list.push(callback);
    } else {
      this.mqList[action] = [callback];
    }
  }

  unSubscribe(action, callback) {
    if (this.mqList[action]) {
      this.mqList[action] = this.mqList[action].filter((v) => v !== callback);
    }
  }

  /**
   * 广播消息到所有监听
   *
   * @param {*} action
   * @param {*} message
   * @memberof MessageSubscription
   */
  broadcastMessage(action, message) {
    console.warn("消息推送：", action, message);
    const list = this.mqList[action];
    if (list) {
      list.forEach((v) => {
        if (typeof v === "function") v(message);
      });
    }
  }
}

// APP通信类
class JSBridge {
  constructor() {
    this.messageHub = new MessageSubscription();

    this.callbacksMap = new Map();

    const plateform = this.getPlateform();

    // 这里判断条件目的是获取APP绑定在window上面的postMessage、receiveMessage方法，非手机端则自己定义空函数
    // postMessage 用于从 H5 发送到 APP，receiveMessage 则是 H5 接收 APP 回调值
    if (plateform === "android") {
      this.jsBridge = window.THJSBridge;
    } else if (plateform === "ios") {
      try {
        this.jsBridge =
          window.webkit && window.webkit.messageHandlers.THJSBridge;
      } catch (e) {
        console.warn(e);
      }
    } else {
      this.jsBridge = {
        postMessage: () => {},
        receiveMessage: () => {},
      };
    }

    this.initReceiveMessage();
  }

  /**
   * 监听app 推送事件
   *
   * @param {*} args
   * @returns
   * @memberof JSBridge
   */
  subscribe(...args) {
    return this.messageHub && this.messageHub.subscribe(...args);
  }

  unSubscribe(...args) {
    return this.messageHub && this.messageHub.unSubscribe(...args);
  }

  /**
   * 根据ua 获取平台信息
   *
   * @returns
   * @memberof JSBridge
   */
  getPlateform() {
    const ua = navigator.userAgent.toLocaleLowerCase();
    if (ua.indexOf("android") !== -1) {
      return "android";
    } else if (ua.indexOf("iphone") !== -1 || ua.indexOf("ipad") !== -1) {
      return "ios";
    }
  }

  /**
   * 定义从APP返回到H5信息格式
   *
   * result.action      定义的action方法
   * result.callbackId  postMessage中传入的callbackId
   * result.message     app处理后给h5的消息内容，格式为：result.message = {code: *,  message: *, data: *, timestamp: *}
   * result.messageType messageType 消息类型， 1=回调类型(默认) 2=消息推送类型
   * @param {*} value
   */
  initReceiveMessage() {
    window.THJSBridge = {
      receiveMessage: (value) => {
        try {
          const result =
            typeof value === "string"
              ? JSON.parse(value.replace(/\n/g, "\\n").replace(/\r/g, "\\r"))
              : value;
          const { callbackId, message, action, messageType = 1 } = result;
          if (!(message && messageType)) {
            const msg = isDev
              ? `receiveMessage: 缺少 message 或 messageType. ${JSON.stringify(
                  value
                )}`
              : "网络有点问题哟~";
            alert(msg);
            console.warn(
              `receiveMessage: 缺少 message 或 messageType. ${JSON.stringify(
                value
              )}`
            );
          }

          if (messageType === 1 || messageType === "1") {
            if (!callbackId) {
              const msg = isDev
                ? `receiveMessage: 缺少 callbackId . ${JSON.stringify(result)}`
                : "网络有点问题哟~";
              alert(msg);
              console.warn(
                `receiveMessage: 缺少 callbackId . ${JSON.stringify(result)}`
              );
            }
            // APP 被动接收：回调返回值
            this.callCallBack(callbackId, message);
          } else if (messageType === 2 || messageType === "2") {
            if (!action) {
              const msg = isDev
                ? `receiveMessage: 缺少 action`
                : "网络有点问题哟~";
              alert(msg);
              console.warn(`receiveMessage: 缺少 action`);
            }
            // APP 主动推送（类似：服务端主动推送到客户端）
            this.messageHub.broadcastMessage(action, message);
          }
        } catch (e) {
          console.error("receiveMessage error: ", e, value);
        }
      },
    };
  }

  /**
   * 调用回调方法, 参数均APP处理后返回
   *
   * @param {*} callbackId
   * @param {*} message
   * @memberof JSBridge
   */
  callCallBack(callbackId, message) {
    const callback = this.callbacksMap.get(callbackId);

    // 获取对应的随机码并执行返回异步执行结果
    if (typeof callback === "function") {
      callback(message);
    }
    this.callbacksMap.delete(callbackId);
  }

  /**
   * 底层调用app方法
   *
   * @param {*} action
   * @param {*} params
   * @param {*} callback
   * @memberof JSBridge
   */
  basePostMessage(action, params, callback) {
    // 使用唯一随机码保存resolve，便于异步处理
    const callbackId = uuid();

    this.callbacksMap.set(callbackId, callback);

    const message = {
      action,
      params,
      callbackId,
    };
    console.warn(message);
    // 执行在APP定义的函数并携带参数
    this.jsBridge.postMessage(JSON.stringify(message));
  }

  /**
   * 提供给h5调用app 方法
   *
   * @param {*} action
   * @param {*} params
   * @returns
   * @memberof JSBridge
   */
  postMessage(action, params) {
    return new Promise((resolve, reject) => {
      try {
        this.basePostMessage(action, params, resolve);
      } catch (e) {
        reject(e);
      }
    })
      .then((result) => {
        console.warn("postMessage: ", action, params, result);
        return result;
      })
      .catch((e) => {
        console.warn("postMessage err: ", e, action, params);
      });
  }
}

const jssdk = new JSBridge();

export default jssdk;
