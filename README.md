# H5InApp

## IOS WebView

- Safari 浏览器使用的浏览器控件和 UIwebView 组件并非同一个，两者性能上有很大的差距。
- 幸运的是，苹果发布 iOS8 的时候，新增了一个 WKWebView 组件，如果你的 APP 只考虑支持 iOS8 及以上版本使用 WKWebView，否则 UIWebView

## Android WebView

- Chrome 内核，兼容性强

RN WebView

- Chrome 内核，兼容性强

# 原理

- window 层使用观察者模式与 APP 通信， APP 需要在 window 层定义 `postMessage、receiveMessage` 用于 H5 发送内容 APP , H5 接收 APP 异步返回值，
  使用随机码为键保存 Promise 的 reslove，在 APP 操作完成获取随机码并执行 reslove 实现异步处理

# 使用

- 可以 H5 -> APP 被动推送

- 也可以 APP -> H5 主动推送

```
import jssdk from '@/src/helpers/app-jssdk/index'

<!-- Promise对象 -->
jssdk.scanQrcode({ params })

```
