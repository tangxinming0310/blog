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
        array[p1 + 1] = array[p2]
        p1++
      }
      p2++
    }
    return array.splice(0, p1 + 1)
  }
  let testArray = [1, 1, 2, 2, 3, 4]
	console.log(unique(testArray)) // [1, 2, 3, 4]
  ```


更多方法可以查看 [JavaScript数组去重的12种方法](https://segmentfault.com/a/1190000016418021)

