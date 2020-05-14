---
title: EventLoop
---

## 前置知识（栈、队列的基本概念）

### 栈（Stack）
**栈**是一种先进后出的数据结构，先入栈的被压入栈低，最后入栈的数据在栈顶，出栈的时候从栈顶开始弹出数据（弹栈）

### 队列（Queue）
**队列**是一种先进先出的数据结构，队列从一端入队，从另一端出队
<img class="custom" :src="$withBase('/queue.png')" alt="queue">

## 同步任务与异步任务
  js是单线程的，也就是说所有的任务都需要排队，前一个任务执行完毕，才会执行后一个任务，如果前一个任务耗时很长，那么后一个任务就需要一直等待，所以js的任务分为了`同步任务`和`异步任务`。
  + 同步任务：调用立即得到结果的任务，同步任务是在主线程上排队执行的任务，只有前一个任务执行完毕，才会执行后一个任务。
  + 异步任务：调用无法立即得到结果的任务，异步任务不进入主线程，而是进入`任务队列（task queue）`，只有当`任务队列`通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。 
  JS引擎遇见异步任务（网络请求，setTimeout延时等），会交给某个线程单独去维护异步任务，等待某个时机（网络请求成功，延时结束等），然后由事件触发将异步任务的回调加入到`异步队列`,`异步队列`中的回调函数等待被执行。  

  <img class="custom" :src="$withBase('/loop.png')" alt="loop">  

举个例子： 

```javascript
console.log('script start')

setTimeout(() => {
  console.log('timer 1 over')
}, 1000)

setTimeout(() => {
  console.log('timer 2 over')
}, 0)

console.log('script end')

// script start
// script end
// timer 2 over
// timer 1 over
```
`timer 2 over`0毫秒后添加到任务队列队尾，`timer 1 over`1秒添加到任务队列队尾，等待主线程任务执行完，从队头依次执行任务队列中的任务  

## 宏任务与微任务
在`js`中，任务被分为两种，一种是宏任务`MacroTask`，一种是微任务`MicroTask`  
  + 宏任务包括：`script`、`setTimeout`、`setInterval`、`setImmediate`、`I/O`、`UI rendering`
  + 微任务包括：`MutationObserver`、`Promise.then()或catch()`、`Node独有的process.nextTick`、`Promise为基础开发的技术，如fetch`  


举个例子：
```javascript
console.log('script start')

setTimeout(function() {
    console.log('timer over')
}, 0)

Promise.resolve().then(function() {
    console.log('promise1')
}).then(function() {
    console.log('promise2')
})

console.log('script end')

// script start
// script end
// promise1
// promise2
// timer over
```  

在挂起任务时，JS 引擎会将所有任务按照类别分到这两个队列中，首先在 宏任务 的队列中取出第一个任务，执行完毕后取出 微任务 队列中的所有任务顺序执行；之后再取 宏任务，周而复始，直至两个队列的任务都取完  

<img class="custom" :src="$withBase('/eventloop.png')" alt="eventloop">  

## EventLoop执行顺序
总的来说，`eventloop`执行过程如下：
  1. 一开始一整个脚本作为一个宏任务执行
  2. 执行过程中同步代码直接执行，异步任务进入任务队列，其中宏任务进入宏任务队列，微任务进入微任务队列
  3. 当前宏任务执行完出队，检查微任务队列列表，有则依次执行完毕
  4. 执行浏览器的UI渲染工作
  5. 检查是否有`Web Worker`任务，有则执行
  6. 执行完本轮的宏任务，回到2，依次循环，直到宏任务和微任务队列都为空