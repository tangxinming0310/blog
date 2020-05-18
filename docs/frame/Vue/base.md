---
title: Vue
---

## Vue的优缺点

Vue有两个特点，**组件化**和**响应式**

+ **响应式**：通过MVVM思想实现了数据的双向绑定，同过虚拟DOM让我们可以用数据操作DOM，而不必去操作真实的DOM，提升了性能，让我们有更多时间去思考开发业务逻辑。
+ **组件化**：把一个单页应用的各个模块拆分成一个个组件，把公共的部分抽离成可复用的组件，带来的好处就是提升了开发效率，增强了项目的可维护性。
  
不足：
  + 不利于SEO
  + vue2.x版本对ts的支持不太友好

## Vue中hash模式和history模式的区别
  + 最明显的区别就是`hash`模式的`URL`中会有`#`,`history`没有 
  + `Vue`的底层实现也不同，`hash`模式是依靠`onhashChange`事件（监听`location.href`的改变），而`history`模式是依靠`H5 history`中新增的两个方法，`pushState()`和`replaceState()`
    - `pushState`可以改变`URL`而不会发送请求
    - `replaceState`可以读取历史栈，也可以对浏览器记录进行修改
  + 当需要通过`URL`向后端发送请求时，比如用户手动输入`URL`后回车，获取刷新浏览器，`history`模式就需要服务端的支持，因为`history`模式下，前端的`URL`必须和实际向服务端发送请求的`URL`一致，比如说有一个带有路径`path`的`URL`(`www.xxxx.com/blog/id`)，后端没有对这个路径做处理的话就会返回`404`错误，所以需要后端增加一个覆盖所有情况的候选资源，一般会配合前端给出的一个`404`页面。
hash:
```javascript
  // location.hash获取到的是包括#号的，如"#blog"
  // 所以可以截取一下
  window.onhashChange = function(event) {
    let hash = location.href.slice(1)
  }
```

## 虚拟DOM
虚拟`DOM`是用`javascript`去描述一个`DOM`节点。是对真实`DOM`的一层抽象。  
因为在浏览器中操作`DOM`是十分消耗性能的，所以我们尽可能的将差异用`javascript`描述出来，然后一次性将差异更新到`DOM`中，性能就有了一定的保证  

还有一个原因是为了更好的跨平台，`node.js`中就没有`DOM`，想实现`SSR`，一种放式就是借助虚拟`DOM`
`Vue2.x`中的虚拟`DOM`主要是借鉴了`snabbdom.js`，`Vue3`中借鉴`inferno.js`算法进行优化