---
title: 手写一个简单的自己的Vue
sidebarDepth: 2
---
## 数据响应式核心原理-Vue2

Vue2 的响应式原理是基于 Object.defineProperty 来实现，官网中有对响应式原理做介绍[响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)中也有对 Object.defineProperty 做详细的描述

下面我们来看下 Object.defineProperty 的基本使用

```js
let data = {
    msg: 'hello'
}
let vm = {}
// 数据劫持，当访问或者设置 vm 中的成员的时候，做一些干预操作
Object.defineProperty(vm, 'msg', {
    // 可枚举（可遍历）
    enumerable: true,
    // 可配置（可以使用 delete 删除，可以通过 defineProperty 重新定义）
    configurable: true,
    // 当获取值的时候执行
    get () {
        console.log('get: ', data.msg)
        return data.msg
    },
    // 当设置值的时候执行
    set (newValue) {
        console.log('set: ', newValue)
        if (data.msg === newValue) {
            return
        }
        data.msg = newValue
        // 数据更新，更改 DOM 的值
        document.querySelector('#app').textContent = newValue
    }
})
// 测试
vm.msg = 'hello world'
console.log(vm.msg)
```

## 数据响应式核心原理-Vue3

Vue3 中使用的 Proxy 

直接监听对象，而不是属性

Proxy 是 ES6 中新增的，IE 不支持，性能由浏览器优化

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

下面看一下 Proxy 的基本使用

```js
let data = {
    msg: 'hello',
    count: 0
}
let vm = new Proxy(data, {
    // 当访问 vm 的成员会执行
    get (target, key) {
        console.log('get, key: ', key, target[key])
        return target[key]
    },
    // 当设置 vm 的成员会执行
    set (target, key, newValue) {
        console.log('set, key: ', key, newValue)
        if (target[key] === newValue) {
            return
        }
        target[key] = newValue
        document.querySelector('#app').textContent = target[key]
    }
})
vm.msg = 'hello wolrd'
console.log(vm.msg)
```



## 发布订阅模式

发布订阅模式由三部分组成

+ 订阅者
+ 发布者
+ 信号中心

我们假定，存在一个“信号中心”，某个任务执行完成，就向信号中心“发布”（publish）一个信号，其他任务可以向信号中心“订阅”这个信号，从而知道什么时候自己可以开始执行。这个就是**“发布/订阅模式”**（publish-subscribe pattern）

下面我们就来是实现一个简单的发布订阅者模式

```js
class EventEmitter {
    constructor () {
        // 订阅者
        this.subs = []
    }
    // 订阅通知
    $on (eventType, handler) {
        this.subs[eventType] = this.subs[eventType] || []
        this.subs[eventType].push(handler)
    }
    // 发布通知
    $emit (eventType){
        if (this.subs[eventType]) {
            this.subs[eventType].forEach(handler => {
                handler()
            })
        }
    }
}
// 测试
let em = new EventEmitter()
em.$on('click', () => {
    console.log('click1')
})
em.$on('click', () => {
    console.log('click2')
})
em.$emit('click')
```



## 观察者模式

观察者模式与发布订阅模式不同的是没有信号中心，直接由发布者通知订阅者

观察者（订阅者）

+ update(): 当事件发生时，具体要做的事情

目标（发布者）

+ subs数组： 存储所有的观察者对象
+ addSub()：添加观察者
+ notify()：当事件发生时，调用所有观察者的 update() 方法

```js
// 目标（发布者）
// Dependency
class Dep {
    constructor (){
        // 存储所有的观察者
        this.subs = []
    }
    // 添加观测者
    addSub (sub) {
        // 如果 sub 中有 update 方法，就认为他是一个观察者
        if (sub && sub.update) {
            this.subs.push(sub)
        }
    }
    // 通知所有的观察者
    notify () {
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}
// 观察者
class Watcher {
    update () {
        console.log('log')
    }
}
// 测试
let dep = new Dep()
let watcher = new Watcher()

dep.addSub(watcher)
dep.notify()
```



总结：

+ **观察者模式**是由具体目标调度，比如当事件触发， Dep 就会去调用观察者的方法，所以观者模式的订阅者与发布者之间是存在依赖的
+ **发布/订阅模式**由统一调度中心调用，因此发布者和订阅者不需要知道对方的存在

<img class="custom" :src="$withBase('/img/depandwatcher.png')" alt="queue">

## 模拟Vue响应式原理-分析

<img class="custom" :src="$withBase('/img/vuebase1.png')" alt="queue">

Vue

+ 把 data 中的成员注入到 Vue 实例，并且把 data 中的成员转成 getter/setter

Observer

+ 能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知 Dep

Compiler

+ 解析每个元素中的指令，插值表达式并替换成相应的数据

Dep

+ 发布者,添加观察者，当数据发生变化时，通知所有的观察者

Watcher 

+ 观察者，update 更新视图

## Vue 的基本实现

Vue 具有以下功能

+ 负责接收初始化的参数（选项）
+ 负责把data 中的属性注入到 Vue 实例，转换成 getter/setter
+ 负责调用 observer 监听 data 中所有属性的变化
+ 负责调用 compiler 解析指令/插值表达式

所以它的类图应该是

<img class="custom" :src="$withBase('/img/vueclass.png')" alt="queue">

在实现之前，我们准备了一个模板，里面包含了vue的一些最基本的功能

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini Vue</title>
</head>
<body>
  <div id="app">
    <h1>插值表达式</h1>
    <h3>{{ msg }}</h3>
    <h3>{{ count }}</h3>
    <h1>v-text</h1>
    <div v-text="msg"></div>
    <h1>v-model</h1>
    <input type="text" v-model="msg">
    <input type="text" v-model="count">
  </div>
</body>
</html>
```

下面我们就来编写 vue 这个类

```js
class Vue {
  constructor (options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把 data 中的成员转换成 getter 和 setter 注入到 vue 实例中
    this._proxyData(this.$data)
    // 3. 调用 observer 对象，监听数据变化
    // 4. 调用 compiler 对象，解析指令和插值表达式
  }

  _proxyData(data) {
    // 遍历 data 中的所有属性this
    Object.keys(data).forEach(key => {
      // 把 data 中的属性注入到 vue 实例中
      // _proxyData 方法是在 Vue 的构造函数中通过 this 去调用的，所有这里的 this 就是 Vue 实例
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return data[key]
        },
        set (newValue) {
          if (data[key] === newValue) {
            return
          }
          data[key] = newValue
        }
      })

    })
  }
}
```

构造函数中第三和第四需要依赖 observer 和 compiler ，我们先不写，之后再去补充

接下来就去测试以下

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini Vue</title>
</head>
<body>
  <div id="app">
    <h1>插值表达式</h1>
    <h3>{{ msg }}</h3>
    <h3>{{ count }}</h3>
    <h1>v-text</h1>
    <div v-text="msg"></div>
    <h1>v-model</h1>
    <input type="text" v-model="msg">
    <input type="text" v-model="count">
  </div>
  <!-- 引入vue -->
  <script src="./js/vue.js"></script>
  <script>
    // 创建 vue
    let vm = new Vue({
      el: '#app',
      data: {
        msg: 'Hello Vue',
        count: 10
      }
    })
  </script>
</body>
</html>
```

打开浏览器，打开开发人员面板，输入 vm 可以查看它的属性是否符合我们的预期

<img class="custom" :src="$withBase('/img/vueclstest.png')" alt="queue">

可以看到 data 中的属性都被转换成了对应的 getter 和 setter，$el 是一个 DOM 对象，$options 中存储的是我们传入的选项配置，都是符合我们预期的

## Observer

接下来就来实现 Observer 这个类的编写，先看下它具有哪些功能

+ 负责把 data 中的数据转换成响应式数据
+ data 中的某个属性也是对象，把该属性转换成响应式数据
+ 数据变化发送通知

根据功能，我们可以画出对应的类图

<img class="custom" :src="$withBase('/img/observercls.png')" alt="queue">

```js
class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk (data) {
    // 判断 data 是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 遍历 data 中的所有属性并转换成 getter 和 setter
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive (obj, key, val) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get () {
        return val
      },
      set (newValue) {
        if (val === newValue) {
          return
        }
        val = newValue
        // 发送通知
      }
    })
  }
}
```

然后在 Vue 的构造函数中去完成第三步操作

```js
// 3. 调用 observer 对象，监听数据变化
new Observer(this.$data)
```

在 模板文件中去引入observer.js

```html
<!-- 引入observer -->
<script src="./js/observer.js"></script>
```

然后打开浏览器，查看， observer 的主要功能就是将 data 中的属性转换成 getter 和 setter

<img class="custom" :src="$withBase('/img/observerclstest.png')" alt="queue">

可以看到 data 中的属性已经被转换成 getter 和 setter 了

可能会有一些疑问，为什么defineReactive需要传递第三个参数 ，而不是直接使用 obj[key],为了解释这个问题，我们需要触发它的 getter ，所以我们在模板最后去打印以下

```js
console.log(vm.msg)
```

当我们去调用 vm.msg 的时候，首先会触发 `vue` 中的 `get`方法

<img class="custom" :src="$withBase('/img/val1.png')" alt="queue">

vue 中的 get 又调用了 data[key]，这里的data就是 this.$data,因为我们调用这个方法的时候传递的是 this.$data

<img class="custom" :src="$withBase('/img/val2.png')" alt="queue">

当我们访问 data[key] 的时候，又会触发 observer 中的getter

<img class="custom" :src="$withBase('/img/val3.png')" alt="queue">

现在我们打开浏览器可以看到控制台正常打印 Hello Vue

如果我们将 这里的 val 修改位 obj[key]，又会是什么样的效果呢

尝试一下

<img class="custom" :src="$withBase('/img/val4.png')" alt="queue">

然后打开浏览器

<img class="custom" :src="$withBase('/img/val5.png')" alt="queue">

可以看到，浏览器报错了，堆栈溢出，错误位置就是oberser中的get 方法

<img class="custom" :src="$withBase('/img/val6.png')" alt="queue">

这里 return 了 obj[key]，这里的 obj 就是 我们的 data 对象

当我们使用 obj[key] 的时候，就会触发 data 的get，这样就会形成一个死循环，造成堆栈溢出，这个就是为什么要使用 val 的原因

### 处理 data 中属性是对象

当data 中定义的属性是一个对象的时候，我们现在只是把这个属性转换成了 getter 和 setter, 它是一个对象，它里面的属性并没有转换成 getter和setter 其实处理也非常简单，就是再 defineReactive 的开头去调用一次 walk 方法，因为 walk 方法内部做了判断，如果是字符串的话就什么也不处理，如果是对象的话，就会把对象内部的属性转换成 getter 和 setter

```js
defineReactive(obj, key, val) {
    // 如果 val 是对象，将对象内部的属性也转换成 getter 和 setter
    this.walk(val)
    // ...
}
```

### 重新给data中的属性赋值成对象

如果 data 中定义了一个基本类型的数据，然后我们重新给这个 属性赋值成一个对象，这个时候该对象里面的属性也不是响应式的，我们需要处理这种情况

当重新赋值的时候，会触发 defineReactive 的 set 方法，我们判断新的值是不是对象就好了，调用一次 walk 方法就好了

<img class="custom" :src="$withBase('/img/val9.png')" alt="queue">

不过有一个需要注意的地方就是，set 是一个函数，函数会开辟一个新的作用域，它里面的 this 指向不是 observer，所以需要再外部将this存储起来，然后使用that 来调用 walk

## Compiler

记下来我们就来编写 compiler 这个类，先看以下它的功能

+ 负责模板编译
+ 负责页面的首次渲染
+ 当数据变化后重新渲染视图

类图

<img class="custom" :src="$withBase('/img/compilercls.png')" alt="queue">

这里与 vue 不同的是，我们没有使用 虚拟 dom，直接操作的dom

我们先来编写 compiler 的基本骨架

```js
class Compiler {
  constructor(vm) {
    this.vm = vm
    this.el = vm.$el
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile(el) {
    
  }
  // 编译元素节点，处理指令
  compileElement (node) {

  }
  // 编译文本节点 处理插值表达式
  compileText(node) {
    
  }
  // 判断是不是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  // 判断节点是不是文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }
  // 判断节点是不是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }
}
```

然后在 vue 的类的构造函数中去使用

```js
// 4. 调用 compiler 对象，解析指令和插值表达式
new Compiler(this)
```

因为compiler需要 vue 实例，所以这里将 vue的实例传递过去，在构造函数中，this就是指向vue的实例

### compile

下面来实现 compile 方法

```js
// 编译模板，处理文本节点和元素节点
compile(el) {
      // 获取 el 内的所有的子节点
      let childNodes = el.childNodes
      // childNodes 是一个 伪数组 利用 Array.from 转换成数组
      Array.from(childNodes).forEach(node => {
          // 处理文本节点
          if (this.isTextNode(node)) {
              this.compileText(node)
          } else if (this.isElementNode(node)) {
              // 处理元素节点
              this.compileElement(node)
          }
          // 判断 node 节点是否有子节点，如果有子节点，要递归调用 compile
          if (node.childNodes && node.childNodes.length) {
              this.compile(node)
          }
      })
  }
```

### compileText

```js
// 编译文本节点 处理插值表达式
 compileText(node) {
      let reg = /\{\{(.+?)\}\}/
      // 获取文本节点的内容
      let value = node.textContent
      if (reg.test(value)) {
          // 获取花括号中的内容
          let key = RegExp.$1.trim()
          // 将插值表达式替换成data中定义的对应的属性
          node.textContent = value.replace(reg, this.vm[key])
      }
  }
```

写完 compileText 我们可以先测试以下，我们在模板文件中引入 

```html
<!-- 引入compiler -->
<script src="./js/compiler.js"></script>
<!-- 引入observer -->
<script src="./js/observer.js"></script>
<!-- 引入vue -->
<script src="./js/vue.js"></script>
```

然后打开浏览器

<img class="custom" :src="$withBase('/img/compilertexttest.png')" alt="queue">

可以看到插值表达式都被替换了

### compileElement

我们这里就实现了v-text 和 v-model两个指令

获取属性可以通过 `node.attributes`来获取

```js
// 编译元素节点，处理指令
compileElement (node) {
    // 编译所有的属性节点
    Array.from(node.attributes).forEach(attr => {
        // 判断是否是指令
        let attrName = attr.name
        if (this.isDirective(attrName)) {
            // v-text -> text
            attrName = attrName.substr(2)
            // 属性的值
            let key = attr.value
            this.update(node, key, attrName)
        }
    })
}

update(node, key, attrName) {
    let updateFn = this[`${attrName}Updater`]
    updateFn && updateFn(node, this.vm[key])
}

// 处理 v-text 指令
textUpdater (node, value) {
    node.textContent = value
}
// 处理 v-model 指令
modelUpdater (node, value) {
    node.value = value
}
```

写完后我们来测试，打开浏览器，我们可以看到 v-text 和 v-model 都被渲染出来了

<img class="custom" :src="$withBase('/img/compileeleres.png')" alt="queue">

## Dep

下面我们来模拟实现 vue 中的响应式机制

<img class="custom" :src="$withBase('/img/im1.png')" alt="queue">

Dep 的功能

+ 收集依赖，添加观察者（watcher）
+ 通知所有观察者

类图：

<img class="custom" :src="$withBase('/img/dep.png')" alt="queue">

```js
class Dep {
  constructor() {
    this.subs = []
  }
  // 添加观察者
  addSub(sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }
  // 通知观察者
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
```

在 observer 这个类中去使用

<img class="custom" :src="$withBase('/img/depuse.png')" alt="queue">

## Watcher

下面来实现 watcher 类，也就是观察者

Watcher 与 Dep 关系

<img class="custom" :src="$withBase('/img/wat.png')" alt="queue">

功能

+ 当数据变化触发依赖， dep 通知所有的 Watcher 实例更新视图
+ 自身实例化的时候往 dep 对象中添加自己

类图

<img class="custom" :src="$withBase('/img/watchercls.png')" alt="queue">

watcher 需要在 发生变化的时候更新视图，但是不同的对象更新视图的方式是不同的，所有需要一个 cd也就是 callback,这个回调函数就应该告诉我们应该如何去更新视图

更新视图还需要一个 key 也就是对应的属性，有了这个属性和 vue 实例，就可以拿到对应的值，在 update 触发的时候可以获取到该属性最新的值，有了旧值和新值，我们可以比较新旧值是否一致，新旧值一致，则不更新视图，否则更新视图

```js
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    // data 中的属性名称
    this.key = key
    // 回调函数，更新视图
    this.cb = cb
    // 将自己赋值给 Dep 的 target
    Dep.target = this
    // 调用 this.vm[this.key] 的时候就会触发了 observer中 defineReactive 的 get ,触发了 get ，这个时候 Dep.target 上就是 当前的 watcher
    // Dep 就会调用 addSub 将它添加到 观察者数组 subs 中
    this.oldValue = this.vm[this.key]
    // 释放 Dep.target , 避免重复添加
    Dep.target = null
  }
  // 当数据发生变化时更新视图
  update() {
    // 当调用 update 的时候，数据已经发生了变化，这个时候通过 vm 和 key 拿到的就是最新的值
    let newValue = this.vm[this.key]
    if (newValue === this.oldValue) {
      return
    }
    // 更新视图
    this.cb(newValue)
  }
}
```

### 创建 watcher 对象

我们需要在依赖数据改变视图的位置去创建 watcher 对象，因此，需要在 compiler中的`textUpdater`,`modelUpdater`和`compileText`中去创建watcher对象

```js
 // 编译元素节点，处理指令
compileElement (node) {
    // 编译所有的属性节点
    Array.from(node.attributes).forEach(attr => {
        // 判断是否是指令
        let attrName = attr.name
        if (this.isDirective(attrName)) {
            // v-text -> text
            attrName = attrName.substr(2)
            // 属性的值
            let key = attr.value
            this.update(node, key, attrName)
        }
    })
}

update(node, key, attrName) {
    let updateFn = this[`${attrName}Updater`]
    updateFn && updateFn.call(this, node, this.vm[key], key)
}

// 处理 v-text 指令
textUpdater (node, value, key) {
    node.textContent = value
    // 创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
    })
}
// 处理 v-model 指令
modelUpdater (node, value, key) {
    node.value = value
    // 创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, newValue => {
        node.value = newValue
    })
}

// 编译文本节点 处理插值表达式
compileText(node) {
    let reg = /\{\{(.+?)\}\}/
    // 获取文本节点的内容
    let value = node.textContent
    if (reg.test(value)) {
        // 获取花括号中的内容
        let key = RegExp.$1.trim()
        // 将插值表达式替换成data中定义的对应的属性
        node.textContent = value.replace(reg, this.vm[key])
        // 创建 watcher 对象，当数据改变更新视图
        new Watcher(this.vm, key, newValue => {
            node.textContent = newValue
        })
    }
}
```

需要注意的是，在创建 Watcher 对象的时候，需要传递 vue的实例，在 compiler 中 vue 的实例在compiler中的vm上，但是调用 updater方法的时候，没有通过 this去调用，所有 updater 方法内部的this不是指向compiler ,我们需要使用 updater.call(this)将 updater方法内部的this指向修改为指向 compiler

## v-model 双向绑定

双向绑定包含两点

+ 数据发生变化更新视图
+ 视图发生变化更新数据

我们现在可以数据改变更新视图，但是视图改变不能更新数据，接下来我们就去实现这个功能

当文本框发生变化的时候会触发相应的事件，这里我们使用input事件，将值重新赋给vm中的属性就可以了

```js
// 处理 v-model 指令
  modelUpdater (node, value, key) {
    node.value = value
    // 创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, newValue => {
      node.value = newValue
    })
    // 双向绑定
    node.addEventListener('input', () => {
      // 将值重新赋给data
      this.vm[key] = node.value
    })
  }
```

这样我们的v-model的功能就实现了

整体流程：

<img class="custom" :src="$withBase('/img/allflow.png')" alt="queue">

## 完整版代码

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mini Vue</title>
</head>
<body>
  <div id="app">
    <h1>插值表达式</h1>
    <h3>{{ msg }}</h3>
    <h3>{{ count }}</h3>
    <h1>v-text</h1>
    <div v-text="msg"></div>
    <h1>v-model</h1>
    <input type="text" v-model="msg">
    <input type="text" v-model="count">
  </div>
  <script src="./js/dep.js"></script>
  <script src="./js/watcher.js"></script>
  <!-- 引入compiler -->
  <script src="./js/compiler.js"></script>
  <!-- 引入observer -->
  <script src="./js/observer.js"></script>
  <!-- 引入vue -->
  <script src="./js/vue.js"></script>
  <script>
    // 创建 vue
    let vm = new Vue({
      el: '#app',
      data: {
        msg: 'Hello Vue',
        count: 10,
        person: {
          name: 'zs'
        }
      }
    })
  </script>
</body>
</html>
```



### Vue.js

```js
class Vue {
  constructor (options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把 data 中的成员转换成 getter 和 setter 注入到 vue 实例中
    this._proxyData(this.$data)
    // 3. 调用 observer 对象，监听数据变化
    new Observer(this.$data)
    // 4. 调用 compiler 对象，解析指令和插值表达式
    new Compiler(this)
  }

  _proxyData(data) {
    // 遍历 data 中的所有属性this
    Object.keys(data).forEach(key => {
      // 把 data 中的属性注入到 vue 实例中
      // _proxyData 方法是在 Vue 的构造函数中通过 this 去调用的，所有这里的 this 就是 Vue 实例
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return data[key]
        },
        set (newValue) {
          if (data[key] === newValue) {
            return
          }
          data[key] = newValue
        }
      })

    })
  }
}
```

### Observer.js

```js
class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk (data) {
    // 判断 data 是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 遍历 data 中的所有属性并转换成 getter 和 setter
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive(obj, key, val) {
    let that = this
    // 负责收集依赖，并发送通知
    let dep = new Dep()
    // 如果 val 是对象，将对象内部的属性也转换成 getter 和 setter
    this.walk(val)
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set (newValue) {
        if (val === newValue) {
          return
        }
        val = newValue
        that.walk(newValue)
        // 发送通知
        dep.notify()
      }
    })
  }
}
```

### Compiler.js

```js
class Compiler {
  constructor(vm) {
    this.vm = vm
    this.el = vm.$el
    this.compile(this.el)
  }
  // 编译模板，处理文本节点和元素节点
  compile(el) {
    // 获取 el 内的所有的子节点
    let childNodes = el.childNodes
    // childNodes 是一个 伪数组 利用 Array.from 转换成数组
    Array.from(childNodes).forEach(node => {
      // 处理文本节点
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }
      // 判断 node 节点是否有子节点，如果有子节点，要递归调用 compile
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 编译元素节点，处理指令
  compileElement (node) {
    // 编译所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        // v-text -> text
        attrName = attrName.substr(2)
        // 属性的值
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }

  update(node, key, attrName) {
    let updateFn = this[`${attrName}Updater`]
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }

  // 处理 v-text 指令
  textUpdater (node, value, key) {
    node.textContent = value
    // 创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, newValue => {
      node.textContent = newValue
    })
  }
  // 处理 v-model 指令
  modelUpdater (node, value, key) {
    node.value = value
    // 创建 watcher 对象，当数据改变更新视图
    new Watcher(this.vm, key, newValue => {
      node.value = newValue
    })
    // 双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }

  // 编译文本节点 处理插值表达式
  compileText(node) {
    let reg = /\{\{(.+?)\}\}/
    // 获取文本节点的内容
    let value = node.textContent
    if (reg.test(value)) {
    // 获取花括号中的内容
      let key = RegExp.$1.trim()
      // 将插值表达式替换成data中定义的对应的属性
      node.textContent = value.replace(reg, this.vm[key])
      // 创建 watcher 对象，当数据改变更新视图
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }
  }
  // 判断是不是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  // 判断节点是不是文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }
  // 判断节点是不是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }
}
```

### Dep.js

```js
class Dep {
  constructor() {
    this.subs = []
  }
  // 添加观察者
  addSub(sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }
  // 通知观察者
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}
```

### Watcher.js

```js
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    // data 中的属性名称
    this.key = key
    // 回调函数，更新视图
    this.cb = cb
    // 将自己赋值给 Dep 的 target
    Dep.target = this
    // 调用 this.vm[this.key] 的时候就会触发了 observer中 defineReactive 的 get ,触发了 get ，这个时候 Dep.target 上就是 当前的 watcher
    // Dep 就会调用 addSub 将它添加到 观察者数组 subs 中
    this.oldValue = this.vm[this.key]
    // 释放 Dep.target , 避免重复添加
    Dep.target = null
  }
  // 当数据发生变化时更新视图
  update() {
    // 当调用 update 的时候，数据已经发生了变化，这个时候通过 vm 和 key 拿到的就是最新的值
    let newValue = this.vm[this.key]
    if (newValue === this.oldValue) {
      return
    }
    // 更新视图
    this.cb(newValue)
  }
}
```

