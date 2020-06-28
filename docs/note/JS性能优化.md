---
title: JS性能优化
sidebarDepth: 2
---

任何一种可以提高运行效率，降低运行开销的行为都是性能优化

- 内存管理
- 垃圾回收与常见的GC算法
- V8引擎的垃圾回收
- Performance工具

## 内存管理

近年来，语言基本都带有自己的GC机制，让我们在开发过程中不太需要去关注内存的消耗，但是我们本身还是需要知道内存消耗与如何优化的，下面来看个例子

```js
function fn(){
    arrList = []
    arrList[100000] = 'lg is a coder'
}
fn()
```

在申请的的时候刻意用了一个非常大的下标，目的是在调用的时候可以尽可能大的申请内存空间，然后结合谷歌浏览器的性能监控工具我我们可以看到

<img class="custom" :src="$withBase('/img/memory1.png')" alt="queue">

其中的蓝色线条一直处于一个升高并保持没有回落的现象，这就是一个典型的内存泄露。

如果我们不够了解内存这方面的内容，我们就可能会写出这样的代码，这样的代码多了之后就会产生意料之外的bug。

- 内存：由可读写单元组成，表示一片可操作空间
- 管理：人为的去操作一片空间的申请、使用和释放
- 内存管理：开发者主动申请空间、使用空间、释放空间
- 管理流程：申请—使用—释放

下面通过一段简短的代码，演示一下js中内存中变量的生命周期

```js
// 申请
let obj = {}

// 使用
obj.name = 'tom'

// 释放
obj = null
```

## JavaScript中的垃圾回收

- JavaScript中内存管理是自动的
- 对象不再被引用时是垃圾
- 对象不能从根上访问到时是垃圾

什么是可达对象呢？

- 可以访问到的对象就是可达对象（引用、作用域链）

  可达的标准就是从根出发是否能够找到

- 

- JavaScript中的根可以理解为是全局变量对象（全局执行上下文）

下面可以通过简单的代码演示一下

```js
let obj = { name: 'xm' }

let ali = obj

obj = null
```

我们申请了一个空间，暂且叫做`xm`的内存空间，它被`obj`引用了，然后我们把这个引用赋值给了`ali`，之后我们把`obj`的引用置为`null`，那么`xm`这个内存空间是否还是可达的呢，答案当然是可达的，因为通过`ali`还是可以访问到这个内存空间的、

下面通过一个稍微复杂一点的例子再来说明一下

```js
function objGroup(obj1, obj2) {
  obj1.next = obj2
  obj2.prev = obj1
  return {
    o1: obj1,
    o2: obj2
  }
}

let obj = objGroup({name: 'obj1'}, {name: 'obj2'})

console.log(obj)
```

打印结果：

```js
{
  o1: { name: 'obj1', next: { name: 'obj2', prev: [Circular] } },
  o2: { name: 'obj2', prev: { name: 'obj1', next: [Circular] } }
}
```

我们通过图示的方式对其进行说明

<img class="custom" :src="$withBase('/img/kd.png')" alt="queue">

从根上可以访问到一个对象`obj`,它里面通过`o1`指向了`obj1`的内存空间，通过`o2`指向了`obj2`的内存空间，`obj1`通过`next`指向了`obj2`，`obj2`通过`prev`指向了`obj1`，这种情况下，我们代码里面所有的内存空间，是都可以从根上访问到的，虽然有的访问起来比较麻烦，但总归是可以访问到的，所以，所有的对象都是可达对象

如果我们把`obj`中的指向`obj1`的`o1`和`obj2`的`prev`给删除了

<img class="custom" :src="$withBase('/img/nkd.png')" alt="queue">

那么我们把所有能够找到`obj1`的都给删除了，那么JavaScript引擎就会认为它是一个垃圾，就会对其进行回收

## GC算法介绍

- GC就是垃圾回收机制的简写
- GC可以找到内存中的垃圾、并释放和回收空间

GC中的垃圾是什么？

- 程序中不再需要使用的对象

  ```js
  function func() {
      name = 'tom'
      return `${name} is a coder`
  }
  func()
  ```

  

- 程序中不能再访问到的对象

  ```js
  function func() {
      const name = 'tom'
      return `${name} is a coder`
  }
  func()
  ```

**常见GC算法**

- 引用计数
- 标记清除
- 标记整理
- 分代回收

### 引用计数算法

#### 基本原理

- 核心思想：设置引用数，判断当前引用数是否为0
- 引用计数器
- 引用关系改变时修改引用数字
- 引用数字为0时立即回收

通过简单的代码来说明一下

```js
const user1 = {age: 11}
const user2 = {age: 22}
const user3 = {age: 33}

const ageList = [user1.age, user2.age, user3.age]

function fn() {
    num1 = 1
    num2 = 2
}
fn()
```

这段代码中，`user1`,`user2`,`user3`, `ageList`在全局都能访问到，`fn`中，我们没有使用关键字进行声明，所以我们在调用后，`num1`,`num2`他们会被挂载到全局，所以这段代码中的所有变量的引用都不是0，因为可以通过全局访问到

稍微修改一下

```js
function fn() {
    const num1 = 1
    const num2 = 2
}
fn()

```

我们在`fn`中申明变量的时候加上了`const`，也就是说他们只能在当前作用域内进行访问，一旦调用结束后，他们就不能在被访问到了，所以他们的引用计数会变成0，这个时候GC就会把他们当做垃圾进行回收

#### 优缺点

优点：

- 发现垃圾时立即回收
- 最大限度减少程序暂停

缺点

- 无法回收循环引用的对象
- 资源开销大

时间开销大是因为它需要时刻去监控引用数

这里再对循环引用举个例子

```js
function fn() {
    const obj1 = {}
    const obj2 - {}
    
    obj1.next = obj2
    obj2.prev = obj1
    return ''
}
fn()
```

当代码执行完毕后，`obj1`和`obj2`他们的引用数应该是0，因为我们已经无法访问到他们了，但是，在函数内部我们可以发现`obj1`中有一个指向`obj2`的引用，`obj2`中有一个`obj1`的引用，他们的引用计数不为0，他们就不会被GC认为是垃圾，就不会被回收，这样就会造成内存空间的浪费。

### 标记清除算法

#### 基本原理

- 核心思想：分标记和清除两个阶段完成
- 遍历所有对象查找并标记活动对象
- 遍历所有对象清除没有标记的对象

通过简单的图示来进行说明

<img class="custom" :src="$withBase('/img/bj.png')" alt="queue">

- 首先会找到所有的可达对象进行标记
- 然后找到所有没有被标记的对象，进行清除
- 将所有打上标记的对象上的标记进行清除

这个就是一次简单的回收过程

这张图中，A,B,C,D,E都是可达对象，他们就会被打上标记，而

a1和b1只是一个局部作用域中的变量，是不可达的，所以他们在使用完成之后就会被释放回收

#### 优缺点

优点：

- 可以解决引用计数算法中的循环引用问题

  在上面引用计数的例子中

  ```js
  function fn() {
      const obj1 = {}
      const obj2 - {}
      
      obj1.next = obj2
      obj2.prev = obj1
      return ''
  }
  fn()
  ```

  在函数执行完毕之后，函数作用域内部的变量`obj1`,`obj2`就不能被访问到了，他们是不可达的对象，那么久不会被标记，那么在执行结束之后就会被清除

缺点：

- 空间碎片化(空间不能最大化的使用)

通过图示的方式来说明

<img class="custom" :src="$withBase('/img/bjqd.png')" alt="queue">

假设我们把中间被引用的称作`A`,左边的叫做`B`,右边的叫做`C`，

我们的空间由两个部分组成，存储空间元信息（地址、大小等）的头，存放数据的域

图中B对象有两个字的空间，C对象有一个字的空间，看起来我们一共释放了3个字的空间，但是他们中间被A对象给分割了，所以他们在被释放之后，任然是分散了，这样就存在**地址不连续**的问题

假设我们后面要申请一个空间大小为1.5个，左边的B多了0.5个，右边的C又少了0.5个，就造成了标记清除算法中最大的问题，**空间碎片化**

### 标记整理算法

#### 基本原理

- 标记整理算法可以说是标记清除算法的增强版
- 标记阶段的操作和标记清除一致
- 清除阶段会先执行整理，移动对象的位置

我们可以通过图示的方式来进行说明

<img class="custom" :src="$withBase('/img/bjzl.png')" alt="queue">

图中我们可以看到有活动的有非活动的对象分散在内存中，标记阶段先给活动对象打上标记，然后进行整理，就变成下面这个样子

<img class="custom" :src="$withBase('/img/bjzl2.png')" alt="queue">

会把所有活动对象进行整理，使得他们地址连续，然后对非活动的进行回收

<img class="custom" :src="$withBase('/img/bjzl3.png')" alt="queue">

相对于标记清除来说，好处是显而易见的，不会出现大批量的分散的内存空间，回收到的空间基本都是连续的，就不会造成空间碎片化的问题

## V8简介

- V8是一款主流的JavaScript执行引擎
- V8采用的即时编译（高效）
- V8内存设有上限(64位操作系统1.5G,32位800M)

V8本身是为浏览器制造的，现有的内存大小对于网页内容是足够使用了，还有一点就是他的内存机制也决定了这样是非常合理的，因为官方做过一个测试，当垃圾内存达到1.5G后，使用增量标记的算法进行垃圾回收只需要10ms，如果不是增量标记的算法进行回收，需要1s，所以是以1.5G作为一个界限

### V8垃圾回收策略

- 采用分代回收的思想
- 内存分为新生代、老生代
- 针对不同对象采用不同算法

<img class="custom" :src="$withBase('/img/v8.png')" alt="queue">

所以，V8中会使用更多的GC算法

- 分代回收
- 空间复制
- 标记清除
- 标记整理
- 标记增量

### V8中回收新生代对象

V8将内存分为了两个部分

<img class="custom" :src="$withBase('/img/v82.png')" alt="queue">

内部将内存为了左边的白色区域和右边的红色区域，左侧白色的部分是存储新生代对象，右侧是老生代对象

- V8内存空间一分为二
- 小空间用于存储新生代对象（64位32M，32位16M）
- 新生代指的是存活时间较短的对象

新生代对象回收实现

- 回收过程采用复制算法+标记整理
- 新生代内存区分为两个等大小空间
- 使用空间为From，空闲空间为To
- 活动对象存储于From空间
- 标记整理后将活动对象拷贝至To
- From与To交换空间完成释放

回收细节说明

- 拷贝过程中可能会出现晋升

- 晋升就是将新生代对象移动至老生代

- 一轮GC还存活的新生代需要晋升

- To空间的使用率超过了25%就会将这一次的活动对象移动至老生代

  > 为什么是25%，因为To空间会有From空间进行交换，如果To空间使用超过一定限制，当他与From空间进行交换之后，如果有新的活动对象进来，那么From空间所剩下的空间就显得不是那么足够了，所以会有这么一个限制

### V8中回收老生代对象

老生代对象说明

- 老生代对象存放在右侧老生代区域
- 64位操作系统1.4G，32位操作系统700M
- 老生代对象就是指存活时间较长的对象

老生代对象回收实现

- 主要采用标记清除、标记整理、增量标记算法

- 首先使用标记清除完成垃圾空间的回收

  > 标记清除算法虽然会存在空间碎片化的问题，但是底层还是使用了标记清除算法，因为提升的速度是相对明显的

- 采用标记整理进行空间优化

  > 当新生代对象移动至老生代，并且老生代的剩余空间又不足以来存放新生代移动过来的对象，就会使用标记整理算法把碎片空间进行整理回收，这样就会有更多的空间可以使用

- 采用增量标记进行效率优化

### 增量标记

<img class="custom" :src="$withBase('/img/zlbj.png')" alt="queue">

JavaScript中垃圾回收是会阻塞程序的执行的

增量标记就是将当前的垃圾回收操作分为多个小操作与程序执行组合使用来完成垃圾回收的操作，替代掉一次性将垃圾回收执行完的操作





### 新生代与老生代垃圾回收对比

- 新生代区域垃圾回收使用空间换时间

  > 新生代采用空间复制算法，也就是说会一直存在一个空闲的空间，由于本身空间很小，那么复制出来的空间就更小了，那么这一部分空间的浪费与带来的时间上的提升是微不足道的，所以说是空间换时间

- 老生代区域垃圾回收不适合复制算法

  > 因为老生代的空间是非常大的，采用复制算法，那么就有几百M的空间的浪费，还有就是老生代中存储的数据是相对较多的，如果采用复制算法，那么复制的时间消耗也是非常多的

  

## Performance工具

使用原因：

- GC的目的是为了实现内存空间的良性循环
- 良性循环的基石是合理使用
- 时刻关注才能确定是否合理
- Perfomance提供多种监控方式

Perfomance使用步骤

1. 打开浏览器输入目标网址
2. 进入开发人员工具面板，选择性能
3. 开启录制功能，访问具体页面
4. 执行用户行为，一段时间后停止录制
5. 分解界面中记录的内存信息

下面我们举一个简单的使用例子：

我们首先在浏览器中输入www.jd.com，然后打开开发人员面板，选择性能，然后开启录制，然后回车，随便在网页中点击几下，或者搜索一下，这里我们选择搜索这样的操作，然后停止，等待生成报告

<img class="custom" :src="$withBase('/img/pf.png')" alt="queue">

我们只关注内存消耗，也就是蓝色线条，把其他的对勾都去掉，我们可以得到内存的一个变化，我们可以看到内存有升有降， 说明内存的使用是没有问题的

## 内存问题的体现

假设我们的网络没有问题，出现以下问题就说明我们的内存使用出现了问题

- 页面出现延迟 加载或者经常性暂停

  > 频繁的垃圾回收

- 页面持续性出现糟糕的性能

  > 内存膨胀，就是当前页面为了达到最佳的使用效果，去申请的内存大小远远超过了我们当前设备所能提供的内存大小

- 页面的性能随时间延长越来越差

  > 内存泄露

## 内存监控

### 内存问题的标准

- 内存泄露：内存使用持续升高

- 内存膨胀

  > 为了鉴定是我们程序问题还是设备问题，我们应该多做测试，在深受用户喜爱的设备上进行测试，如果在很多设备上都出现这个问题，那就说明使我们的程序出现了内存问题

- 频繁的垃圾回收：通过内存变化图进行分析

### 内存监控的几种方式

- 浏览器任务管理器
- Timeline时序图记录
- 堆快照查找分离DOM
- 判断是否存在频繁的垃圾回收

### 任务管理器监控内存

通过一个简单的示例来说明，场景是通过点击事件创建一个长度非常长度数组，这样就会产生一个内存上的消耗

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>test</title>
</head>
<body>
  <button id="btn">add</button>
  <script>
    const oBtn = document.getElementById('btn')
    oBtn.onclick = function() {
      let arrList = new Array(1000000)
    }
  </script>
</body>
</html>

```

在浏览器中打开，打开后通过`shift`+`esc`健调出浏览器的任务管理器，正常来说是没有**JavaScript使用的内存**这一列的，我们可以点击其中一个任务右键勾选中**JavaScript使用的内存**就可以显示了

<img class="custom" :src="$withBase('/img/taskManage.png')" alt="queue">

任务管理器中有两个内存，第一个内存表示的是原生内存，也就是界面中DOM节点所占据的内存，如果说这个数值在不断的增大，就说明界面中在不断的创建新DOM

最后一列其实表示是JavaScript的堆内存，我们只需要关注小括号里面的值，它表示的是界面中所有**可达对象**正在使用的值，如果这个值一直增大就说明我们的内存是有问题的，但是具体是什么问题，我们是不知道的。

可以看到我们这里堆内存是稳定的，说明没有问题，当我们点击按钮的时候他就变大了

<img class="custom" :src="$withBase('/img/t2.png')" alt="queue">

所以任务管理器只能帮助我们知道有没有问题，但是要具体定位问题的时候，它就无能为力了

### Timeline记录内存

通过一个简单的示例来介绍

场景：

通过一个按钮，添加一个点击事件，点击时创建大量的DOM节点，然后配合数组的方式创建一个非常长的字符串来模拟内存的消耗

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>任务管理器监控内存</title>
</head>
<body>
  <button id="btn">add</button>
  <script>
    const arrList = []

    function test() {
      for (let i = 0; i < 100000; i++) {
        document.body.append(document.createElement('p'))
      }
      arrList.push(new Array(1000000)).join('X')
    }
    document.getElementById('btn').addEventListener('click', test)
  </script>
</body>
</html>

```



然后打开开发人员选项中的性能，点击录制，我们点击5次按钮，然后等待一小会儿，停止录制，生成报告

<img class="custom" :src="$withBase('/img/timeline.png')" alt="queue">

我们可以拖动时序图，然后去查看每一个节点的消耗情况

<img class="custom" :src="$withBase('/img/tl.png')" alt="queue">

然后去分析定位问题所在

### 堆快照查找分离DOM

#### 什么是分离DOM

- 界面元素存活在DOM树上

- 垃圾对象时的DOM节点

  > 当前DOM元素从DOM树上脱离且JS代码中没有引用此DOM

- 分离状态的DOM节点

  > 当前DOM元素从DOM树上脱离，但是JS代码中有引用此DOM

#### 示例

举个例子：

有一个button，点击时创建DOM节点，然后不呈现在页面上，被一个变量引用

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>堆快照监控内存</title>
</head>
<body>
  <button id="btn">add</button>
  <script>
    // 为了引用DOM
    var tmpEle

    function fn() {
      var ul = document.createElement('ul')
      for (let i = 0; i < 10; i++) {
        var li = document.createElement('li')
        ul.appendChild(li)
      }
      tmpEle = ul
    }
    document.getElementById('btn').addEventListener('click', fn)
  </script>
</body>
</html>

```

然后在浏览器中打开，打开开发人员面板，选择内存选项，然后有一个堆快照的选项，我们选中它，然后在没有点击按钮的时候获取一下快照，搜索detached（分离的），发现并没有东西

<img class="custom" :src="$withBase('/img/deta.png')" alt="queue">

然后我们在点击两次按钮，在获取一次快照，搜索detached，发现有内容

<img class="custom" :src="$withBase('/img/deta2.png')" alt="queue">

这个就是我们自己创建的DOM，但是没有呈现在界面上，这样就会造成了一个内存的浪费。

通过这样的一个方式，我们找到了页面中存在的分离了DOM，怎么去解决呢？其实很简单，我们只需要把引用DOM的变量进行释放就行了

```js
// 为了引用DOM
var tmpEle

function fn() {
    var ul = document.createElement('ul')
    for (let i = 0; i < 10; i++) {
        var li = document.createElement('li')
        ul.appendChild(li)
    }
    tmpEle = ul
    // 释放
    tmpEle = null
}
document.getElementById('btn').addEventListener('click', fn)

```

这个时候我们在拍一次快照，然后搜索detached就没有分离DOM的存在了、

<img class="custom" :src="$withBase('/img/deta3.png')" alt="queue">

### 判断是否存在频繁GC

- GC工作时应用程序是停止的
- 频繁且过长的GC会导致应用假死
- 用户使用中感知应用卡顿

确定频繁的垃圾回收

- Timeline中频繁的上升下降
- 任务管理器中数据频繁的增加减小