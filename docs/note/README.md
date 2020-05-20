---
title: 日常随记
---

## a标签点击后，hover失效
```html
a:hover{
  color: green;
  text-decoration: none;
}
a:visited{ /* visited在hover后面，这样的话hover事件就失效了 */
  color: red;
  text-decoration: none;
}
```
将俩个事件的位置调换一下就可以了

+ `a:link`：未访问时的样子
+ `a:visited`: 访问后的样子
+ `a:hover`: 鼠标放上去的样子
+ `a:active`: 鼠标按下时的样子

## 响应式的好处
对某些数据的修改就能自动更新视图，让开发者不用再去操作DOM，有更多的时间去思考业务逻辑

## null 和 undefined 的区别

  + `null` 表示一个无的对象，就是说此处不应该有值，`undefined`表示未定义
  + 在转换为数字时结果不同，`Number(null)`为`0`,而`Number(undefined)`为`NaN`  
  + 
使用场景来说：
  + `null`：
    - 作为函数的参数，表示该函数的参数不是对象
    - 作为对象原型链的终点
  + `undefined`：
    - 申明一个变量，但是没有赋值，就等于`undefined`
    - 调用函数时，应该提供的参数未提供，参数就等于`undefined`
    - 对象没有赋值属性，该属性的值为`undefined`
    - 函数没写返回值时，默认返回`undefined`


## null是对象吗？
`null`不是对象  

原因：虽然`typeof null`会输出`object`，但是这个其实是`js`的一个`bug`，在`JS`的最初版本中使用的是`32`位系统，为了性能考虑使用低位存储变量的类型信息，`000` 开头代表是对象然而 `null` 表示为全零，所以将它错误的判断为 `object` 

## 数组去重的方法
最简单：
利用ES6中的set进行去重
  1. `[...new Set(array)]`
  2. `Array.from(new Set(array))`
  3. `for`循环嵌套，利用`splice`去重
  ```javascript
  function unique(array) {
    if (!Array.isArray(array)) return
    for (let i = 0; i < array.length; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (array[i] === array[j]) {
          array.splice(j, 1)
          j--
        }
      }
    }
    return array
  }
  let testArray = [1, 1, 2, 2, 3, 4]
	console.log(unique(testArray)) // [1, 2, 3, 4]
  ```
  4. 利用双指针
  ```javascript
  function unique(array) {
    if (!Array.isArray(array)) return
    let p1 = 0, p2 = 1
    while(p2 < array.length) {
      if (array[p1] !== array[p2]) {
        array[++p1] = array[p2]
      }
      p2++
    }
    return array.splice(0, p1 + 1)
  }
  let testArray = [1, 1, 2, 2, 3, 4]
	console.log(unique(testArray)) // [1, 2, 3, 4]
  ```


更多方法可以查看 [JavaScript数组去重的12种方法](https://segmentfault.com/a/1190000016418021)

## addEventListener的第三个参数
第三个参数为`true`代表着捕获，`false`时代表冒泡，默认是`false`
可以使用`stopPropagation`阻止目标元素的事件冒泡到父级元素
```js
function stopBubble(e) { 
//如果提供了事件对象，则这是一个非IE浏览器 
if ( e && e.stopPropagation ) 
    //因此它支持W3C的stopPropagation()方法 
    e.stopPropagation(); 
else 
    //否则，我们需要使用IE的方式来取消事件冒泡 
    window.event.cancelBubble = true; 
}
```

## 冒泡和捕获的具体过程
冒泡：当给某个元素绑定了事件之后，如果父级元素也有同名事件（比如说`click`），那么这个事件会依次在它的父级元素中被触发
捕获：从上层向下层传递，与冒泡相反
举个例子：
```html
<!-- 会依次执行 button li ul -->
<ul onclick="alert('ul')">
  <li onclick="alert('li')">
    <button onclick="alert('button')">点击</button>
  </li>
</ul>
<script>
  window.addEventListener('click', function (e) {
    alert('window')
  })
  document.addEventListener('click', function (e) {
    alert('document')
  })
</script>
```
冒泡结果：`button`>`li`>`ul`>`document`>`window`  
捕获结果：`window`>`document`>`ul`>`li`>`button`

**注意**：并不是所有的事件都有冒泡事件，以下事件就没有
  + `onblur`
  + `onfocus`
  + `onmouseenter`
  + `onmouseleave`

## js 原型链
`javascipt`对象通过`__proto__`指向父对象，直到指向`Object`对象为止，这样就形成了一个原型链
<img class="custom" :src="$withBase('/原型链.png')" alt="原型链">  
  + 对象的 hasOwnProperty() 来检查对象自身中是否含有该属性
  + 使用 in 检查对象中是否含有某个属性时，如果对象中没有但是原型链中有，也会返回 true
## 手写一个new
```js
function myNew(fn, ...args) {
  let instance = Object.create(fn.prototype)
  let result = fn.call(instance, ...args)
  return typeof result === 'object' ? result : instance
}
```
new一个函数，都会发生什么？
  1. 创建一个新对象
  2. 将构造函数的作用域赋给新对象
  3. 执行构造函数中的代码
  4. 返回新对象
  
## typeof和instanceof的区别
`typeof`表示对某个对象类型的检测，基本数据类型除了`null`，都可以显示为正确的类型，引用类型除了函数是`function`，其他都是`object`  
`instanceof`是检测**某个构造函数的原型对象在不在某个对象的原型链上**

## 关于instanceof
```js
function instanceof(left, right) {
  let proto = Object.getPrototypeOf(left) // 返回指定对象的原型
  while(true){
    if (proto === null) return false
    if (proto === right.prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
}
```

## 一句话描述this
指向最后调用的那个对象，函数运行时期内部生成的一个内部对象，只能在函数内部使用

## this是在什么时候确定的？
函数调用的时候，指向最后调用的那个对象

## apply/call/bind的异同
相同点：都可以修改`this`指向，第一个参数都是`this`要指向的对象
不同点：
  + `bind`是返回对应的函数，以便稍后调用，`apply`和`call`都是立即调用
  + 第二个参数的不同,`call`是接收若干个参数列表，而`apply`接收的是一个包含多个参数的数组或者类数组


## webpack中的loader和plugin有什么区别
`loader`只是一个转换器，只专注于转换文件这个领域，从而完成压缩、打包、编译，仅仅只是为了打包，运行在打包之前  

`plugin`是一个扩展器，丰富了`webpack`本身，并扩展了一些其他的功能，它不局限于打包，资源的加载，还有其他的功能，所以是在整个编译周期都起作用  

`Loader` 在 `module.rules` 中配置，作为模块的解析规则，类型为数组。每一项都是一个 `Object`，内部包含了 `test`(类型文件)、`loader`、`options` (参数)等属性。
`Plugin` 在 `plugins` 中单独配置，类型为数组，每一项是一个 `Plugin` 的实例，参数都通过构造函数传入。

常见的`loader`
  + `file-loader`：把文件输出到一个文件夹中，在代码中通过相对 `URL` 去引用输出的文件 (处理图片和字体)
  + `url-loader`：与 `file-loader` 类似，区别是用户可以设置一个阈值，大于阈值会交给 `file-loader` 处理，小于阈值时返回文件 `base64` 形式编码 (处理图片和字体)
  + `image-loader`：加载并且压缩图片文件
  + `babel-loader`：把 `ES6` 转换成 `ES5`
  + `sass-loader`：将`SCSS/SASS`代码转换成`CSS`
  + `vue-loader`：加载 `Vue.js` 单文件组件
  + `css-loader`：加载 `CSS`，支持模块化、压缩、文件导入等特性
  + `style-loader`：把 `CSS` 代码注入到 `JavaScript` 中，通过 `DOM` 操作去加载 `CSS`
  + `postcss-loader`：扩展 `CSS` 语法，使用下一代 `CSS`，可以配合 `autoprefixer` 插件自动补齐 `CSS3` 前缀
常见`plugin`  
  + `html-webpack-plugin`：简化 `HTML` 文件创建 (依赖于 `html-loader`)
  + `ignore-plugin`：忽略部分文件
  + `web-webpack-plugin`：可方便地为单页应用输出 `HTML`，比 `html-webpack-plugin` 好用
  + `uglifyjs-webpack-plugin`：不支持 `ES6` 压缩 (`Webpack4` 以前)
  + `terser-webpack-plugin`: 支持压缩 `ES6 (Webpack4)`
  + `clean-webpack-plugin`: 目录清理

## Webpack构建流程
  + 初始化：启动构建，读取与合并配置参数，加载 `Plugin`，实例化 `Compiler`
  + 编译：从 `Entry` 出发，针对每个 `Module` 串行调用对应的 `Loader` 去翻译文件的内容，再找到该 `Module` 依赖的 `Module`，递归地进行编译处理
  + 输出：将编译后的 `Module` 组合成 `Chunk`，将 `Chunk` 转换成文件，输出到文件系统中


## 使用webpack开发时，可以提高效率的插件有
  + `webpack-merge`：提取公共配置，减少重复配置代码
  + `size-plugin`：监控资源体积变化，尽早发现问题
  + `HotModuleReplacementPlugin`：模块热替换
  + `speed-measure-webpack-plugin`：简称 `SMP`，分析出 `Webpack` 打包过程中 `Loader` 和 `Plugin` 的耗时，有助于找到构建过程中的性能瓶颈。

## source map是什么？生产环境怎么用？
`source map` 是将编译、打包、压缩后的代码映射回源代码的过程。打包压缩后的代码不具备良好的可读性，想要调试源码就需要 `soucre map`
`map`文件只要不打开开发者工具，浏览器是不会加载的
线上`sourcemap`一般通过 `nginx` 设置将 `.map` 文件只对白名单开放(公司内网)

## HTTP和TCP的不同
HTTP是定义数据，在两台计算机传递信息时，它规定了每段数据应该以什么样的格式传输才能被另外一台计算机解析  
TCP要规定的是数据要怎样传输才能稳定高效的传递于计算机之间

## 事件的防抖和节流

### 节流
节流的核心思想：如果在定时器的时间范围内再次触发，则不予理睬，等当前定时器完成，才能启动下一个定时器任务

code:
```js
function throttle(fn, delay){
  let flag = true
  return function (...args) {
    let that = this
    if (!flag) return
    flag = false
    setTimeout(() => {
      fn.apply(that, ...args)
      flag = true
    }, delay)
  }
}
```

### 防抖
思想：每次事件触发都删除原来的定时器，建立新的定时器。

code:
```js
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    let that = this
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(that, args)
    }, delay)
  }
}
```

## 图片懒加载
### 方案一：clientHeight、srollTop和offsetTop
首先图片有一个占位资源
```html
<img src="default.png" data-src="http://www.xxx.com/target.png">
```  
监听 `scroll` 来判断图片是否到达了视口

```js
let imgs = document.getElementsByTagName('img')
let num = imgs.length
let count = 0 // 计数器，从第一张图片开始

lazyLoad() // 首次加载图片

// 监听scroll
window.addEventListener('scroll', lazyLoad)

function lazyLoad(){
  let viewHeight = document.documentElement.clientHeight // 视口的高度
  let scrollHeight = document.documentElement.scrollTop || document.body.srollTop // 滚动条卷去的高度
  for (let i = count; i< num; i++) {
    // 当元素出现在视口中
    if (imgs[i].offsetTop < viewHeight + scrollHeight) {
      if (imgs[i].getAttribute("src") !== 'default.png') continue
      imgs[i].src = img[i].getAttribute('data-src')
      count++
    }
  }
}
```

`scroll`事件最好坐一下节流

```js
window.addEventListener('scroll', throttle(lazyLoad, 200))
```

### 方案二：getBoundingClientRect
DOM元素的API，`getBoundingClientRect`方法返回元素的大小及其相对于视口的位置
所以，我们把上面的`lazyLoad`方法修改一下
```js
function lazyLoad() {
  for (let i = count; i < num; i++) {
    // 元素已经出现在视口中
    if (imgs[i].getBoundingClientRect().top < document.documentElement.clientHeight) {
      if (imgs[i].getAttribute('src') !== 'default.png') continue
      imgs[i].src = imgs[i].getAttribute('data-src')
      count++
    }
  }
}
```