---
title: Virtual DOM
sidebarDepth: 2
---

## 什么是虚拟 DOM

虚拟 DOM 的概念非常简单，就是用普通的 javascript 对象描述 DOM

为什么要使用虚拟 DOM ？ 因为一个 DOM 的成员有很多很多，创建一个成员的开销是非常大的

而虚拟 DOM 是用 javascript 代码去描述一个 DOM对象，例如

```js
{
    sel: 'div',
    data: {},
    children: undefined,
    text: 'Hello Virtual DOM',
    elm: undefined,
    key: undefined
}
```

可以看到，创建虚拟DOM的开销是非常小的，创建虚拟 DOM 的成本比创建真实 DOM 的开销要小很多

还有很多其他的原因

+ 手动操作 DOM 比较麻烦，还需要考虑浏览器兼容性问题，虽然有 jQuery 等库简化 DOM 操作，但是随着项目的复杂， DOM 操作复杂度也变得很高
+ 为了简化 DOM 的复杂操作出现了各种 MVVM 框架，MVVM 框架解决了视图和状态同步问题
+ 为了简化视图的操作我们可以使用模板引擎，但是模板引擎没有解决跟踪状态变化的问题，于是 Virtual DOM 出现了
+ Virtual DOM 的好处是当状态改变时，不需要立即更新DOM，只需要创建一个虚拟树来描述 DOM， Virtual DOM 内部将弄清楚如何有效（diff）的更新 DOM
+ GitHub 上 Virtual DOM 的描述
  + 虚拟DOM 可以维护程序的状态跟踪上一次的状态
  + 通过比较前后两次状态的差异更新真实 DOM

## 虚拟 DOM 的作用

+ 维护视图和状态的关系
+ 复杂视图情况下提升渲染性能
+ 除了渲染 DOM 以外，还可以实现 SSR（Nuxt.js/Next.js），原生应用（Weex/React Native），小程序（mpvue/uni-app）等

Virtual DOM 库

+ snabbdom
  + Vue 2.x 内部使用的 Virtual DOM 就是改造的 snabbdom
  + 大约 200 行代码
  + 通过模块可扩展
  + 源码使用 TypeScript 开发最快的 Virtual DOM之一
+ virtual-dom

## Snabbdom

### 创建项目

打包工具为了方便使用了 parcel

创建项目并安装 parcel

```
# 创建项目目录
mkdir snabbdom-demo
# 进入项目目录
cd snabbdom-demo
# 创建 package.json
yarn init -y
# 安装 parcel
yarn add parcel-bundler
```

配置 package.json 中的 scripts

```
"scripts": {
	"dev": "parcel index.html --open",
	"build": "parcel build index.html"
}
```

创建目录结构

```
|	index.html
|	package.json
|   src
	-- basicusage.js
```

## 导入 Snabbdom

### Snabbdom 文档

+ 看文档的意义

  + 学习任何一个库都要先看文档
  + 通过文档了解库的作用
  + 看文档中提供的示例自己快速实现一个 demo
  + 通过文档查看 API 的使用

  文档地址

  + [snabbdom](https://github.com/snabbdom/snabbdom)

### 安装 snabbdom

```bash
yarn add snabbdom
```

导入

```js
import { h } from 'snabbdom/build/package/h'
import { init } from 'snabbdom/build/package/init'
import { thunk } from 'snabbdom/build/package/thunk'
```

+ init 是一个高阶函数，返回 patch
+ h() 返回虚拟节点  VNode
+ thunk 是一种优化策略，可以在处理不可变数据时使用

基本使用

```js
// 参数 数组， 模块
// 返回 patch , 作用是对比两个 VNdoe 的差异更新到真实 DOM
let patch = init([])
// 第一个参数：标签+选择器
// 第二个参数：如果是字符串的话就是标签中的内容
let vnode = h('div#container', 'Hello World')

let app = document.querySelector('#app')
// 第一个参数可以是 DOM 元素，内部会把 DOM 元素转换成 vnode
// 第二个参数 vnode
// 返回值 vnode
let oldVnode = patch(app, vnode)
```

执行 `yarn dev`打开浏览器，可以看到页面中输出了 Hello World

再看下一个案例

div 中有标签元素

```js
let patch = init([])
let vnode = h('div#container', [
  h('h1', 'hello h1'),
  h('p', 'hello p')
])
let app = document.querySelector('#app')
patch(app, vnode)
```

运行 `yarn dev`就可以在页面上看见 `hello h1`和 `hello p`输出了

下面我们来修改页面内容，我们使用 setTimeout 来模拟服务器返回的情况

```js
let patch = init([])
let vnode = h('div#container', [
  h('h1', 'hello h1'),
  h('p', 'hello p')
])
let app = document.querySelector('#app')

let oldVnode = patch(app, vnode)

setTimeout(() => {
  vnode = h('div#container', [
    h('h1', 'hello snabbdom'),
    h('p', 'hello p')
  ])
  patch(oldVnode, vnode)
}, 2000)
```

可以看到2秒后，页面中h1的内容变成了 hello snabbdom

清空指定元素的内容，我们可以通过创建注释节点来实现这个功能

```js
let patch = init([])
let vnode = h('div#container', [
  h('h1', 'hello h1'),
  h('p', 'hello p')
])
let app = document.querySelector('#app')

let oldVnode = patch(app, vnode)

setTimeout(() => {
  vnode = h('div#container', [
    h('h1', 'hello snabbdom'),
    h('p', 'hello p')
  ])
  patch(oldVnode, vnode)

  // 清空页面元素
  patch(oldVnode, h('!'))
}, 2000)
```

## 模块

snabbdom 的核心库并不能处理元素的属性/样式/事件等，如果需要处理的话，可以使用模块

### 常用模块

  + attributes
    + 设置 DOM 元素的属性，使用 setAttribute()
    + 处理布尔值类型的属性
  + props
    + 和 attributes 模块相似，设置DOM元素的属性 element[attr] = value
    + 不处理布尔值类型的属性
  + class
    + 切换类样式
    + 注意：给元素设置样式是通过 sel 选择器
  + dataset
    + 设置 data-* 的自定义属性
  + eventlisteners
    + 注册和移除事件
  + style
    + 设置行内样式，支持动画
    + delayed/remove/destroy

### 模块使用步骤

+ 导入需要的模块
+ init() 中注册模块
+ 使用 h() 函数常见 VNode 的时候，可以把第二个参数设置为对象，其它参数往后移

基本使用方式

```js
import { init } from 'snabbdom/build/package/init'
import { h } from 'snabbdom/build/package/h'
// 1. 导入模块
import { styleModule } from 'snabbdom/build/package/modules/style'
import { eventListenersModule } from 'snabbdom/build/package/modules/eventlisteners'
// 2. 注册模块
let patch = init([
  styleModule,
  eventListenersModule
])
// 3. 使用模块 使用 h() 函数的第二个参数传入模块所需要的数据（对象）
let vnode = h('div', {
  style: {
    backgroundColor: 'red'
  },
  on: {
    click: eventHandler
  }
}, [
  h('h1', 'hello'),
  h('p', 'this is p tag')
])

function eventHandler() {
  console.log('click me...')
}

let app = document.querySelector('#app')

patch(app, vnode)
```

## Snabbdom 源码解析

### 如何学习源码

+ 先宏观了解
+ 带着 目标看源码
+ 看源码的过程要不求甚解
+ 调试
+ 参考资料

Snabbdom 的核心

+ 使用 h() 函数创建 JavaScript 对象 (VNode)描述真实DOM
+ init() 设置模块，创建 patch()
+ patch() 比较新旧两个 VNode
+ 把变化的内容更新到真实 DOM 树上

[Snabbdom源码地址](https://github.com/snabbdom/snabbdom)

### h 函数

#### h() 函数介绍

用来创建 VNode

+ 函数重载
  + 概念
    + 参数个数或类型不同的函数
    + JavaScript 中没有重载的概念
    + TypeScipt 中有重载，不过重载的实现还是通过代码跳转参数

h 函数的重载：

```typescript
// 函数的重载
export function h (sel: string): VNode
export function h (sel: string, data: VNodeData | null): VNode
export function h (sel: string, children: VNodeChildren): VNode
export function h (sel: string, data: VNodeData | null, children: VNodeChildren): VNode
// 最后的实现
export function h (sel: any, b?: any, c?: any): VNode {
    // ...
}
```

接下来我们来看 h 函数的实现

```typescript
export function h (sel: any, b?: any, c?: any): VNode {
  var data: VNodeData = {}
  var children: any
  var text: any
  var i: number
  // 处理参数，实现函数的重载
  if (c !== undefined) {
    // 处理三个参数的情况
    // sel、data、children/text
    if (b !== null) {
      data = b
    }
    // 如果是 c 是数组，说明是子元素，存在 children 里
    if (is.array(c)) {
      children = c
      // 如果 c 是字符串或者数字 说明它是标签中的文本
    } else if (is.primitive(c)) {
      text = c
      // 如果 c 是 vnode 那么将 c 转换成数组在赋值给 children
    } else if (c && c.sel) {
      children = [c]
    }
    // 处理两个参数的情况
  } else if (b !== undefined && b !== null) {
    // 如果 b 是数组
    if (is.array(b)) {
      children = b
      // 如果 b 是字符串或者数字
    } else if (is.primitive(b)) {
      text = b
      // 如果 b 是 vnode
    } else if (b && b.sel) {
      children = [b]
    } else { data = b }
  }
  if (children !== undefined) {
    // 处理 children 中的原始值 (string|number)
    for (i = 0; i < children.length; ++i) {
      // 如果 child 是 string/number 创建文本节点
      if (is.primitive(children[i])) children[i] = vnode(undefined, undefined, undefined, children[i], undefined)
    }
  }
  // 如果选择器传的是 svg，添加 命名空间
  if (
    sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
    (sel.length === 3 || sel[3] === '.' || sel[3] === '#')
  ) {
    addNS(data, children, sel)
  }
  // 返回 vnode
  return vnode(sel, data, children, text, undefined)
};
```

### VNode

先看一下 vnode 的接口申明

```typescript
export interface VNode {
  // 选择器
  sel: string | undefined
  // 节点数据： 属性/样式/事件等
  data: VNodeData | undefined
  // 子节点：和 text 互斥
  children: Array<VNode | string> | undefined
  // 记录 vnode 对应的真实 DOM
  elm: Node | undefined
  // 节点中的内容，和 children 只能互斥
  text: string | undefined
  // 优化用
  key: Key | undefined
}
```

接下来我们看一下实现

```typescript
export function vnode (sel: string | undefined,
  data: any | undefined,
  children: Array<VNode | string> | undefined,
  text: string | undefined,
  elm: Element | Text | undefined): VNode {
  const key = data === undefined ? undefined : data.key
  return { sel, data, children, text, elm, key }
}
```

它返回一个 vnode 对象

### VNode 渲染真实 DOM

+ patch(oldVnode, newVnode)
+ 打补丁，把新节点中变化的内容渲染到真实 DOM，最后返回新节点作为下一次处理的旧节点
+ 对比新旧 VNode 是否相同节点（节点的 key 和 sel 相同）
+ 如果不是相同节点，删除之前的内容，重新渲染
+ 如果是相同节点，再判断新的 VNode 是否有 text，如果有并且和 oldVnode 的 text 不同，直接更新文本内容
+ 如果新的 VNode 有 children，判断子节点是否有变化，判断子节点的过程中使用的是 diff 算法
+ diff 的过程只进行同层级比较

<img class="custom" :src="$withBase('/img/diff.png')" alt="queue">

### init

我们可以看一下 init 函数的大体结构

<img class="custom" :src="$withBase('/img/snabbdominit.png')" alt="queue">

可以看到它内部有很多的辅助函数，最后返回了一个 patch 函数

它接收两个参数

+ modules 模块
+ domApi

第二个参数是用来操作 DOM 的，如果我们不传这个参数，是怎么处理的呢？

在 init 函数的源码中我们可以看到

```typescript
 // 初始化转换虚拟节点的 api
 const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi
```

如果我们没有传，那么它会赋值一个 htmlDomApi，那这个 htmlDomApi 又是什么呢？

```typ
export const htmlDomApi: DOMAPI = {
  createElement,
  createElementNS,
  createTextNode,
  createComment,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
  getTextContent,
  isElement,
  isText,
  isComment,
}
```

它里面导出了很多成员，我们可以看其中一个的例子，比如说 createElement

```typescript
function createElement (tagName: any): HTMLElement {
  return document.createElement(tagName)
}
```

可以看到它就是调用了 `document.createElement`这个 api,就是一个DOM操作

也就是说默认情况下 第二个参数是一个 DOM 操作的对象,他会把虚拟DOM转换成真实的DOM

因为我们有可能会传递很多个模块，每个模块可能会在不同的钩子函数中处理一些逻辑，所有下面就是对这些钩子函数的处理

```typescript
// 把传入的所有模块的钩子函数，统一存储到 cbs 对象中
  // 最终构建的 cbs 对象的形式 cbs = { create: [fn1, fn2], update: [], ...}
for (i = 0; i < hooks.length; ++i) {
    // cbs.create = [] cbs.update = [] ...
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
        // modules 传入的模块数组
        // 获取模块中的 hook 函数
        // hook = modules[0][create] ....
        const hook = modules[j][hooks[i]]
        if (hook !== undefined) {
            // 把获取到的 hook 函数放入到 cbs 对应的钩子函数数组中
            (cbs[hooks[i]] as any[]).push(hook)
        }
    }
}
```

就是把每个模块的 钩子函数统一存储到 cbs 对应的钩子函数数组中，将来在合适的时机去触发

### patch 函数

在 init 函数的末尾返回了 patch 函数，它的核心作用是对比两个 vnode ，将他们差异渲染到真实 DOM 并返回 新的 vnode

```typescript
// 返回 patch 函数，把 vnode 渲染成真实 dom，并返回 vnode
  return function patch (oldVnode: VNode | Element, vnode: VNode): VNode {
    let i: number, elm: Node, parent: Node
    // 保存新插入节点的队列，为了触发钩子函数
    const insertedVnodeQueue: VNodeQueue = []
    // 执行模块中的 pre 钩子函数
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()
    // 如果 oldVnode 不是 vnode, 创建 VNode 并设置 elm
    if (!isVnode(oldVnode)) {
      // 把 DOM 元素转换成空的 VNode
      oldVnode = emptyNodeAt(oldVnode)
    }
    // 如果新旧节点是相同的节点 （key 和 sel 相同）
    if (sameVnode(oldVnode, vnode)) {
      // 查找节点的差异并更新 DOM
      patchVnode(oldVnode, vnode, insertedVnodeQueue)
    } else {
      // 如果新旧节点不同，vnode 创建对应的 DOM
      // 获取当前的 DOM 元素
      // ！的意思是保证这个值不为空，一定存在
      elm = oldVnode.elm!
      parent = api.parentNode(elm) as Node
      // 创建 vnode 对应的 DOM 元素，并触发 init/create 钩子函数
      createElm(vnode, insertedVnodeQueue)

      if (parent !== null) {
        // 如果父节点不为空，把 vnode 对应的 DOM 插入到文档中
        // 将 元素放在 elm 元素的后面
        api.insertBefore(parent, vnode.elm!, api.nextSibling(elm))
        // 移除老节点
        removeVnodes(parent, [oldVnode], 0, 0)
      }
    }
    // 执行用户设置的 insert 钩子函数
    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data!.hook!.insert!(insertedVnodeQueue[i])
    }
    // 执行模块的 post 钩子函数
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()
    // 返回 vnode
    return vnode
  }
```

其中 isVnode 判断是不是虚拟DOM，就是看元素上有没有 sel 属性

```typescript
function isVnode (vnode: any): vnode is VNode {
  return vnode.sel !== undefined
}
```

sameVode 判断两个虚拟DOM是否相同，通过判断两个 vnode 的  key 和 sel是否相同

```typescript
function sameVnode (vnode1: VNode, vnode2: VNode): boolean {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel
}
```

`api.parentNode`

```typescript
function parentNode (node: Node): Node | null {
  return node.parentNode
}
```

`api.nextSibling `

```typescript
function nextSibling (node: Node): Node | null {
  return node.nextSibling
}
```

nextSibling 属性可返回某个元素之后紧跟的节点（处于同一树层级中）

`api.insertBefore`

```typescript
function insertBefore (parentNode: Node, newNode: Node, referenceNode: Node | null): void {
  parentNode.insertBefore(newNode, referenceNode)
}
```

patchVnode 和 createElm 以及removeVnodes稍后再看

到这里 patch 的整体流程就走通了

### createElm

 createElm 的作用是把 vnode 转换成对应的 DOM 元素,但是不会渲染到页面上

我们可以将 createElm 的执行过程分为三部分，

1. 执行用户设置的 init 钩子函数
2. 把 vnode 转换成真实 DOM 对象（没有渲染到页面）
3. 返回新创建的 DOM

<img class="custom" :src="$withBase('/img/createELm.png')" alt="queue">

下面结合注释看 createElm 的源码

```typescript
function createElm (vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
    let i: any
    let data = vnode.data
    if (data !== undefined) {
      // 执行用户设置的 init 钩子函数
      const init = data.hook?.init
      if (isDef(init)) {
        init(vnode)
        // 这个 init 是用户传递的，在这个函数中有可能会修改 data 的值
        // 所有有必要再赋值一次
        data = vnode.data
      }
    }
    // 把 vnode 转换成真实 DOM 对象（没有渲染到页面）
    const children = vnode.children
    const sel = vnode.sel
    // 如果 sel 是感叹号，会创建注释节点
    if (sel === '!') {
      if (isUndef(vnode.text)) {
        vnode.text = ''
      }
      // 创建注释节点
      vnode.elm = api.createComment(vnode.text!)
      // 如果 sel 不等于 undefined 会创建对应的 DOM 元素
    } else if (sel !== undefined) {
      // Parse selector
      // 如果选择器不为空
      // 解析选择器
      // 解析 # 号和 . （id 选择器和类选择器）
      const hashIdx = sel.indexOf('#')
      const dotIdx = sel.indexOf('.', hashIdx)
      const hash = hashIdx > 0 ? hashIdx : sel.length
      const dot = dotIdx > 0 ? dotIdx : sel.length
      // 解析标签名
      const tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel
      const elm = vnode.elm = isDef(data) && isDef(i = data.ns)
        // 如果 data 有定义并且有命名空间会创建带有命名空间的标签 ，通常情况下是 svg
        ? api.createElementNS(i, tag)
        // 创建普通元素
        : api.createElement(tag)
      // 给 dom 元素设置 id选择器
      if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot))
      // 给 dom 元素设置 class 选择器
      if (dotIdx > 0) elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '))
      // 执行模块的 create 钩子函数
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)
      // 如果 vnode 中有子节点，创建子节点 对应的 DOM 元素并追加到 DOM　树　上
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          const ch = children[i]
          if (ch != null) {
            api.appendChild(elm, createElm(ch as VNode, insertedVnodeQueue))
          }
        }
      } else if (is.primitive(vnode.text)) {
        // 如果 vnode 的值是 string/number  创建文本节点并追加到 DOM　树
        api.appendChild(elm, api.createTextNode(vnode.text))
      }
      const hook = vnode.data!.hook
      if (isDef(hook)) {
        // 执行用户传入的钩子函数 create
        hook.create?.(emptyNode, vnode)
        if (hook.insert) {
          // 把 vnode 添加到队列中，为后续执行 insert 钩子做准备
          insertedVnodeQueue.push(vnode)
        }
      }
    } else {
      // 如果选择器为空，创建文本节点
      vnode.elm = api.createTextNode(vnode.text!)
    }
    // 返回新创建的 DOM
    return vnode.elm
  }
```

结合思维导图的分析

<img class="custom" :src="$withBase('/img/createElmX.png')" alt="queue">

### addVnodes和removeVnodes

removeVnodes接收四个参数，第一个是父节点，第二个是子节点，第三个和第四个是循环的变量

```typescript
function removeVnodes (parentElm: Node,
    vnodes: VNode[],
    startIdx: number,
    endIdx: number): void {
    for (; startIdx <= endIdx; ++startIdx) {
      let listeners: number
      let rm: () => void
      // 获取 vnode 中的元素，赋值到 ch 中
      const ch = vnodes[startIdx]
      if (ch != null) {
        // 如果 sel 有值
        if (isDef(ch.sel)) {
          // 执行 destroy 钩子函数（执行所有子节点的 destroy 钩子函数）
          invokeDestroyHook(ch)
          // remove 函数的个数
          listeners = cbs.remove.length + 1
          // 创建删除的回调函数
          rm = createRmCb(ch.elm!, listeners)
          for (let i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm)
          const removeHook = ch?.data?.hook?.remove
          // 执行用户设置的 remove 函数
          if (isDef(removeHook)) {
            removeHook(ch, rm)
          } else {
            // 如果用户没有传入 remove 钩子函数，直接调用删除元素的方法
            rm()
          }
        } else { // Text node
          // 如果是文本节点，直接删除节点
          api.removeChild(parentElm, ch.elm!)
        }
      }
    }
  }
```

`invokeDestroyHook`

```typescript
function invokeDestroyHook (vnode: VNode) {
    const data = vnode.data
    if (data !== undefined) {
      // 执行用户设置的 destroy 钩子函数
      data?.hook?.destroy?.(vnode)
      // 调用模块的 destroy 钩子函数
      for (let i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
      // 执行子节点中的 destroy 函数
      if (vnode.children !== undefined) {
        for (let j = 0; j < vnode.children.length; ++j) {
          const child = vnode.children[j]
          if (child != null && typeof child !== 'string') {
            invokeDestroyHook(child)
          }
        }
      }
    }
  }
```

`createRmCb`

```typescript
function createRmCb (childElm: Node, listeners: number) {
    // 返回删除元素的回调函数
    return function rmCb () {
      if (--listeners === 0) {
        const parent = api.parentNode(childElm) as Node
        api.removeChild(parent, childElm)
      }
    }
  }
```

addVnodes相对比较简单

```typescript
function addVnodes (
    parentElm: Node,
    before: Node | null,
    vnodes: VNode[],
    startIdx: number,
    endIdx: number,
    insertedVnodeQueue: VNodeQueue
  ) {
        // before 是参考节点，会将元素插入到 before 之前
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (ch != null) {
        api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before)
      }
    }
  }
```

### patchVnode

patchVnode 的作用是对比两个节点的差异并更新

<img class="custom" :src="$withBase('/img/patchVnode.png')" alt="queue">

源码注释：

```typescript

  function patchVnode (oldVnode: VNode, vnode: VNode, insertedVnodeQueue: VNodeQueue) {
    const hook = vnode.data?.hook
    // 首先执行用户设置的 prepatch 钩子函数
    hook?.prepatch?.(oldVnode, vnode)
    const elm = vnode.elm = oldVnode.elm!
    const oldCh = oldVnode.children as VNode[]
    const ch = vnode.children as VNode[]
    // 如果新老 vnode 相同
    if (oldVnode === vnode) return
    if (vnode.data !== undefined) {
      // 执行模块的 update 钩子函数
      for (let i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      // 执行用户设置的 update 钩子函数
      vnode.data.hook?.update?.(oldVnode, vnode)
    }
    // 如果 vnode.text 未定义
    if (isUndef(vnode.text)) {
      // 如果新老节点都有 children
      if (isDef(oldCh) && isDef(ch)) {
        // 两个节点的 children 不同，使用 diff 算法对比并更新差异
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue)
      } else if (isDef(ch)) {
        // 如果新节点有 children，老节点没有children
        // 如果老节点有 text,清空 DOM 元素的内容
        if (isDef(oldVnode.text)) api.setTextContent(elm, '')
        // 批量添加子节点
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // 如果老节点有 children，新节点没有 children
        // 批量移除子节点
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // 如果老节点有 text 清空 DOM 元素
        api.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 如果没有设置 vnode.text
      if (isDef(oldCh)) {
        // 如果老节点有 children ，移除
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      }
      // 设置 DOM 元素的 textContent 为 vnode.text
      api.setTextContent(elm, vnode.text!)
    }
    // 执行用户设置的 postpatch 钩子函数
    hook?.postpatch?.(oldVnode, vnode)
  }
```

### updateChidren 整体分析

updateChildren 功能

+ diff 算法的核心，对比新旧节点的 children，更新 DOM

执行过程：

+ 要对比两颗树的差异，我们可以取第一棵树的每一个节点依次和第二棵树的每一个节点比较，但是这样的时间复杂度为O(n^3)

+ 在DOM操作的时候我们很少很少会把一个父节点移动/更新到某一个子节点

+ 因此只需要找**同级别**的子节点依次比较，然后再找下一级别的节点比较，这样算法复杂度为 O(n)

  <img class="custom" :src="$withBase('/img/diff.png')" alt="queue">

+ 再进行同级别节点比较的时候，首先会对新老节点数组的开始和结尾节点设置标记索引，遍历的过程中移动索引

+ 在对开始和结束节点比较的时候，总共有四种情况

  + oldStartVnode / newStartVnode（旧开始节点/新开始节点比较）
  + oldEndVnode / newEndVnode (旧结束节点/新结束节点比较)
  + oldStartVnode / oldEndVnode (旧开始节点/新开始节点比较)
  + newStartVnode / newEndVnode (新开始节点/旧开始节点比较)

<img class="custom" :src="$withBase('/img/diff2.png')" alt="queue">

+ 开始节点和结束节点比较，这两种情况类似
  + oldStartVnode / newStartVnode（旧开始节点/新开始节点比较）
  + oldEndVnode / newEndVnode (旧结束节点/新结束节点比较)
+ 如果 oldStartVnode 和 newStartVnode 是 sameVnode （ key 和 sel 相同）
  + 调用 patchVnode() 对比和更新节点
  + 把旧开始和新开始索引往后移动 oldStartIdx++ / oldEndIdx++

<img class="custom" :src="$withBase('/img/diff3.png')" alt="queue">

+ oldStartVnode / newEndVnode （旧结束节点 / 新开始节点）相同

  + 调用 patchVnode 对比和更新节点
  + 把 oldEndVnode 对应的DOM 元素，移动到右边
  + 更新索引

  <img class="custom" :src="$withBase('/img/diff4.png')" alt="queue">

+ oldEndVnode / newStartVnode （旧结束节点 / 新开始节点）相同

  + 调用 patchVnode 对比和更新节点
  + 把 oldEndVnode 对应的DOM 元素，移动到左边
  + 更新索引

  <img class="custom" :src="$withBase('/img/diff5.png')" alt="queue">

+ 如果不是上面四种情况

  + 遍历新节点，使用 newStartNode 的 key 在老节点数组中找相同节点
  + 如果没有找到，说明 newStartNode 是新节点
    + 创建新节点对应的 DOM 元素，插入到DOM中
  + 如果找到了
    + 判断新节点和找到的老节点的 sel 选择器是否相同
    + 如果不相同，说明节点被修改了
      + 重新创建对应的DOM元素，插入到DOM树中
    + 如果相同，把 elmToMove 对应的DOM元素，移动到左边

  <img class="custom" :src="$withBase('/img/dff6.png')" alt="queue">

+ 循环结束

  + 当老节点的所有子节点先遍历完（oldStartIdx > oldEndIdx），循环结束
  + 新节点的所有子节点先遍历完（newStartIdx > newEndIdx），循环结束

+ 如果老节点的数组先遍历完（oldStartIdx > oldEndIdx），说明新节点有剩余，把剩余节点批量插入到右边

  <img class="custom" :src="$withBase('/img/diff7.png')" alt="queue">

+ 如果新节点的数组先遍历完（newStartIdx > newEndIdx），说明老节点有剩余，把剩余节点批量删除

  <img class="custom" :src="$withBase('/img/diff8.png')" alt="queue">

源码位置 `src/init.ts`

```typescript
function updateChildren (parentElm: Node,
    oldCh: VNode[],
    newCh: VNode[],
    insertedVnodeQueue: VNodeQueue) {
    let oldStartIdx = 0 // 老节点开始索引
    let newStartIdx = 0 // 新节点开始索引
    let oldEndIdx = oldCh.length - 1 // 老节点结束索引
    let oldStartVnode = oldCh[0] // 老开始节点
    let oldEndVnode = oldCh[oldEndIdx] // 老结束节点
    let newEndIdx = newCh.length - 1 // 新节点结束索引
    let newStartVnode = newCh[0] // 新开始节点
    let newEndVnode = newCh[newEndIdx] // 新结束节点
    let oldKeyToIdx: KeyToIndexMap | undefined
    let idxInOld: number
    let elmToMove: VNode
    let before: any

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 索引变化后，可能会把节点设置为空
      if (oldStartVnode == null) {
        // 节点为空，移动索引
        oldStartVnode = oldCh[++oldStartIdx] // Vnode might have been moved left
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx]
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx]
        // 比较开始和结束节点的四种情况
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // 1. 比较老开始节点和新的开始节点
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 2. 比较老结束节点和新的结束节点
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // 3. 比较老开始节点和新结束节点
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        api.insertBefore(parentElm, oldStartVnode.elm!, api.nextSibling(oldEndVnode.elm!))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // 比较老结束节点和新开始节点
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        api.insertBefore(parentElm, oldEndVnode.elm!, oldStartVnode.elm!)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 开始节点和结束节点都不相同
        // 使用 newStartVnode 的 key 在老节点数组中查找相同接单
        // 先设置记录 key 和 index 的对象
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        }
        // 遍历 newStartVnode,从老节点中找相同 key 的 oldVnode 的索引
        idxInOld = oldKeyToIdx[newStartVnode.key as string]
        // 如果是新的 vnode
        if (isUndef(idxInOld)) { // New element
          // 如果没有找到，newStartVnode 是新节点
          // 创建元素 插入 DOM 树
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm!)
        } else {
          // 如果找到相同 key 的老节点，记录到 elmToMove 遍历
          elmToMove = oldCh[idxInOld]
          if (elmToMove.sel !== newStartVnode.sel) {
            // 如果新旧节点的选择器不同
            // 创建新开始节点对应的 DOM 元素，插入到 DOM 中
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm!)
          } else {
            // 如果相同，patchVnode()
            // 把elmToMove 对应的  DOM 元素，移动到左边
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined as any
            api.insertBefore(parentElm, elmToMove.elm!, oldStartVnode.elm!)
          }
        }
        // 重新给 newStartVnode 赋值，指向下一个新节点
        newStartVnode = newCh[++newStartIdx]
      }
    }
    // 循环结束，老节点数组先遍历完成或者新节点数组先遍历完成
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      if (oldStartIdx > oldEndIdx) {
        // 如果老节点数组先遍历完成，说明有新的剩余节点
        before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm
        // 把剩余的新节点都插入到老节点右侧
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
      } else {
        // 入股新节点先遍历完成，说明老节点有剩余
        // 批量删除老节点
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
      }
    }
  }
```

