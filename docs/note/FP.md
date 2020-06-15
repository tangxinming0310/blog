## 函数式编程(Functional Programming, FP)

### 概念

简单来说，函数式编程就是利用纯函数实现细粒度函数，再通过函数组合，实现功能强大的函数
具体一点，就是把现实世界的事物与事物之间的联系抽象到程序世界（抽象运算过程），主要有以下几点：

- 程序的本质：根据输入通过某种运算获得相应的输出
- `x -> f(联系，映射) -> y, y=f(x)`
- 函数式编程中的函数指的不是程序中的函数**，而是数学中的**映射**关系，例如：`y=sin(x)`，`x`和`y`的关系
- **相同的输入始终会得到相同的输出**（纯函数）
- 函数式编程用来描述数据（函数）之间的映射

### 优点

- 函数式编程可以抛弃`this`
- 打包过程中可以更好的利用`tree shaking`过滤掉无用代码
- 方便测试以及并行处理
- `Vue3`以及`React`都趋向于函数式编程

先举个简单的例子：

```js
// 计算两个数的和
// 非函数式
let num1 = 2
let num2 = 3
let sum = num1 + num2
console.log(sum)

// 函数式
function add(n1, n2) {
    return n1 + n2
}
let sum = add(2, 3)
console.log(sum)
```

在举个实际开发中的例子：

有这样一种场景，有两个页面

![页面](./img/page.png)

页面`A`和页面`B`，两个页面布局形式差不多，然后每个页面分为两个部分，上面部分横着排，每个元素显示名称`name`和描述`desc`，下面部分竖着排，然后也显示名称`name`和描述`desc`，然后多显示一个关系`ship`，

我们可能会把上面部分每个元素抽取成一个组件，然后传递值，然后下面的部分的元素也抽取成组件，把要显示的字段传递进去

两个页面请求不同的接口，每个接口返回两个`list``

`A`页面的接口返回`familyList`和`pretectionList`  

`B`页面的接口返回`homeList`和`inviteList`
我们可能会这么去写

```js
// 在A页面中
let familyList = []
let pretectionList = []
function initListData() {
    requestFamilyList()
    .then(result => { 
      familyList = result.familyList.reduce((list, family) => {
        const item = {
          name: family.name,
          desc: family.desc
        }
        list.push(item)
        return list
      }, [])
      pretectionList = result.pretectionList.reduce((list, pretection) => {
        const item = {
          name: pretection.name,
          desc: pretection.desc,
          ship: pretection.ship
        }
        list.push(item)
        return list
      }, [])
    })
}
// 在B页面中
let homeList = []
let inviteList = []
function initListData() {
  requestHomeList()
    .then(result => {
      familyList = result.homeList.reduce((list, home) => {
        const item = {
          name: home.name,
          desc: family.desc
        }
        list.push(item)
        return list
      }, [])
      pretectionList = result.inviteList.reduce((list, invite) => {
        const item = {
          name: invite.name,
          desc: invite.desc,
          ship: invite.ship
        }
        list.push(item)
        return list
      }, [])
    })
}
```

这样一看是没什么问题，但是感觉写了很多重复性的内容，我们就可以对这段代码做一个小小的优化

先抽取处理`list`的函数

```js
function handleList(list, aimsArray) {
  const copyList = list.slice(0)
  return copyList.reduce((list, cur) => {
    const item = {}
    aimsArray.forEach(key => {
        item[key] = cur[key]
    })
    list.push(item)
    return list
  }, [])
}
```

在定义两个字段数组

```js
const aims = ['name', 'desc']
const aimsWithShip = [...aims, 'ship']
```

然后我们对代码修改一下:

```js
// 在A页面中
let familyList = []
let pretectionList = []
function initListData() {
    requestFamilyList()
    .then(result => { 
      familyList = handleList(result.familyList, aims)
      pretectionList = handleList(result.pretectionList, aimsWithShip)
    })
}
// 在B页面中
let homeList = []
let inviteList = []
function initListData() {
  requestHomeList()
    .then(result => {
      familyList = handleList(result.homeList, aims)
      pretectionList = handleList(result.inviteList, aimsWithShip)
    })
}
```

这样一看是不是清爽很多，而且如果以后在遇见类似的我们只需要使用`handleList`这个函数处理就可以了,当然这只是比较简单的处理，即使每个数组中取的字段都不一样，也可以用同样的方式进行处理



## 函数是一等公民

在`javascript`中，**函数是一个普通的对象**,所以它具有以下几个特点：

- 函数可以存储在变量中
- 函数可以作为参数
- 函数可以作为返回值

### 函数可以存储在变量中

```js
// 简单例子
const fn = function() {
    console.log('Hello First-class Function')
}
fn()

// 案例
const LoginController = {
    login(payload) { return Login.login(payload) },
    logout(payload) { return Login.logout(payload) }
}
// 优化
const LoginController = {
    login: Login.login,
    logout: Login.logout
}
```

### 函数可以作为参数

```js
const sortFunc = function(a, b) {
    return a - b
}
let array = [1, 4, 5, 2, 4, 3, 9, 8]
// 对数组进行排序
array.sort(sortFunc)
console.log(array) //  [1, 2, 3, 4, 4, 5, 8, 9]
```

### 函数可以作为返回值

常见的有很多，举个开发中的例子吧

```js
// 请求接口数据
function requestData(url) {
    return function(payload) {
        return request(url, payload)
    }
}
// 比如想要请求一个列表
const getList = requestData("/api/recordList")
// 调用的时候
getList({
    pageIndex: 1,
    pageSize: 10
}).then(result => {
    console.log(result)
})
```

## 高阶函数

在上面的例子中我们其实已经简单的使用了高阶函数，下面进行详细的介绍

高阶函数(Higer-order function)

- 可以把函数作为参数传递给另一个函数
- 可以把函数作为另一个函数的返回结果

### 可以把函数作为参数传递给另一个函数

我们知道`js`中数组的很多方法都是使用函数作为参数的，比如说`forEach`，`map`，`filter`等等，我们模拟其中的几个实现

#### forEach实现

```js
// forEach
function forEach(array, fn){
    for (let i = 0, len = array.length; i < len; i++) {
        fn(array[i])
    }
}
// test
let array = [1, 2, 4, 6]
forEach(array, function(item) {
    console.log(item)
})
// 1 2 4 6
```

#### filter实现

```js
function filter(array, fn) {
    let results = []
    for (let i = 0, len = array.length; i < len; i++) {
        if(fn(array[i])) {
            results.push(array[i])
        }
    }
    return results
}
// test
let array = [1, 2, 4, 6]
let ret = filter(array, function(item) {
    return item > 2
})
console.log(ret) // [4, 6]
```

### 可以把函数作为另一个函数的返回结果

先举个小例子

```js
function makeFn() {
    let msg = "Hello function"
    return function() {
        console.log(msg)
    }
}
// test
let fn = makeFn()
fn() // Hello function
```

在平常开发过程中，`once`函数大家应该不陌生，就是函数只会被执行一次，那么是怎么实现的呢？我们可以来模拟一下

```js
function once(fn) {
    let done = false
    return function(){
        if (!done) {
            done = true
            fn.apply(fn, arguments)
        }
    }
}
// test
let fn = once(function(num) {
    console.log(num)
})
fn(5)
fn(5)
fn(5) // 只会打印一次5
```

可以看到，只有当`once`函数内部的`done`变量为`false`的时候，`fn`函数才会被执行,并且`done`会被修改为`true`，那么后边不管调用多少次，`fn`都不会被执行了。



### 高级函数的意义

- 抽象可以帮我们屏蔽细节，只需要关注我们的目标
- 高阶函数用来抽象通用的问题

### 常用的高阶函数

- forEach
- map
- filter
- every
- some
- find/findIndex
- reduce
- sort
- ....

我们模拟其中的几个的实现

```js
// map
function map(array, fn) {
    let results = []
    for (let i = 0, len = array.length; i < len; i++) {
        results.push(fn(array[i]))
    }
    return results
}
// test
let array = [1, 2 ,3]
let ret = map(array, v => v * v)
console.log(ret) // [1, 4, 9]
// every
function every(array, fn) {
    let flag = true
    for (let i = 0, len = array.length; i < len; i++) {
        flag = fn(array[i])
        if (!flag) {
           	break
        }
    }
    return flag
}
// test
let array = [1, 2, 3]
let b = every(array, v => v % 2 === 0)
console.log(b) // false
let b2 = every(array, v => v >= 1)
console.log(b2) // true

// some
function some(array, fn) {
    let flag = false
    for (let i = 0, len = array.length; i < len; i++) {
        flag = fn(array[i])
        if (flag) {
           	break
        }
    }
    return flag
}
// test
let array = [1, 2, 3]
let b = some(array, v => v % 2 === 0)
console.log(b) // true
let b2 = some(array, v => v >= 4)
console.log(b2) // false

// reduce
// reduce函数有一点点不一样，因为它可以传递一个初始值，所以需要处理一下
function reduce(array, fn, initialValue) {
    // 判断是否有初始值
    let hasInitialValue = initialValue !== undefined
    // 如果没有初始值，把数组的第一个元素作为初始值
    let value = hasInitialValue ? initialValue : array[0]
    // 如果没有初始值，从1开始，有初始值，从0开始
    for (let i = hasInitialValue ? 0 : 1; i < array.length; i++) {
        const el = array[i]
        value = fn(value, el, i, array)
    }
    return value
}
// test
let array = [1, 2, 3, 4]
// 传递初始值
let r = reduce(array, (list, cur) => {
    list.push(cur * cur)
    return list
}, [])
console.log(r) // [1, 4, 9, 16]
// 不传递初始值
let maxNum = reduce(array, (pre, cur) => pre < cur ? cur : pre)
console.log(maxNum) // 4
```

## 闭包

### 概念

函数和其周围的状态（词法环境的引用捆绑在一起形成闭包）

- 可以在另外一个作用域中调用一个函数的内部函数并访问到该函数的作用域中的成员

```js
function makeFn() {
    let msg = "Hello function"
    return function () {
        console.log(msg)
    }
}
// 在makeFn执行完毕后，msg这个成员应该会被释放，但是由于闭包的存在，它并没有被释放，所以在fn执行的时候依然可以访问到msg这个成员
const fn = makeFn()
// 在和makeFn相同作用域中调用了makeFn内部的函数，makeFn内部的函数访问了makeFn中的变量成员msg
fn() // Hello function
```

看看上面提到的开发中接口请求这个列子

```js
// 请求接口数据
function requestData(url) {
    return function(payload) {
        return request(url, payload)
    }
}
// 执行完requestData这个函数的时候，url这个应该会被释放掉，但是内部的匿名函数又使用了url这个参数，形成了闭包，所以它并不会被释放
const getList = requestData("/api/recordList")
// 调用的时候我们就不需要再次传递url这个参数，因为它在上次执行的时候被保存在内存中并没有被释放掉，所以我们调用requestData中的函数的时候并不需要再次传递这个参数
getList({
    pageIndex: 1,
    pageSize: 10
}).then(result => {
    console.log(result)
})
```

- 闭包的本质：函数在执行的时候会放到一个执行栈上当函数执行完毕之后会从执行栈上移除，但是**堆上的作用域成员因为被外部引用不能释放**，因此内部函数依然可以访问外部函数的成员

### 案例

#### 求数字的幂次方

在开发过程中，有时候我们会去求一个数字的2次方或者3次方

我们可能会这么去写

```js
Math.pow(4, 2)
Math.pow(5, 2)
Math.pow(6, 3)
Math.pow(7, 3)
```

可以看到，那个幂次2和3如果有多次调用的话，其实是重复的

所以我们可以这样来改写一下

```js
// 生成幂次方的函数
function makePower(power) {
    return function(number) {
        return Math.pow(number, power)
    }
}
// 求2次方的函数
let power2 = makePower(2)
// 求3次方的函数
let power3 = makePower(3)
// 调用
power2(4)
power2(5)
power3(6)
power3(7)

```

可以看到，在调用的时候就不需要在传递是几次方了，直接使用生成的求几次方的函数就好了

在浏览器中打开开发中工具中的`Sources`，我们可以看到代码执行情况、作用域情况以及闭包情况

![codeRun](./img/run.jpg)

#### 求员工的工资

一个员工的工资应该由基本工资和绩效工资组成，不同的员工有不同的级别，每个级别的基本工资是不一样的，同一级别的基本工资是相同的，这种情况下，我们可以这样来写

```js
function makeSalary(base) {
    return function (performance) {
        return base + performance
    }
}
// 假设级别一的基本工资为12000，级别二的工资为15000
// 级别为一的员工工资计算
let level1 = makeSalary(12000)
let level2 = makeSalary(15000)
// 在调用的时候只需要传递绩效工资就可以了
console.log(level1(2000))
console.log(level2(2000))

```

#### 数据缓存

假设我们要求得某一个值，但是这个值的计算非常耗时，我们就可以通过闭包来提高这个性能，只需要第一记性计算，以后再次取值，直接从缓存中获取

```js
function executor(arim) {
    // 计算耗时1分钟
    return arim
}
function getValue (executor) {
    let cache = {}
    return function () {
        let key = JSON.stringify(arguments)
        cache[key] = cache[key] || executor.apply(executor, arguments)
        return cache[key]
    }
}

```

## 纯函数

### 概念

- 纯函数：**相同的输入永远会得到相同的输出**，而且没有任何可观察的副作用

  - 纯函数就类似数学中的函数（用来描述输入和输出之间的关系）, `y=sin(x)`

  - `lodash`是一个纯函数的功能库，提供了对数组，数字，对象，字符串，函数等操作的一些方法

  - 数组的`slice`是纯函数，`splice`是不纯的函数

    - `slice`返回数组中指定的部分，不改变原数组
    - `splice`对数组操作返回该数组，会改变原数组

    ```js
    let numberArray = [1, 2, 3, 4, 5]
    // slice
    numberArray.slice(0, 3) // => [1, 2, 3]
    numberArray.slice(0, 3) // => [1, 2, 3]
    numberArray.slice(0, 3) // => [1, 2, 3]
    
    
    // splice
    numberArray.splice(0, 3) // => [1, 2, 3]
    numberArray.splice(0, 3) // => [4, 5]
    numberArray.splice(0, 3) // => []
    
    ```

- 函数式编程不会保留计算中间的结果，所有变量是不可变的（无状态的）

- 我们可以把一个函数的执行结果交给另一个函数去处理

### lodash

[lodash官网](https://www.lodashjs.com/)

它是一个一致性、模块化、高性能的 JavaScript 实用工具库。

介绍几个常用的方法

`first`，`last`，`toUpper`，`reverse`，`each`，`includes`，·`find`，`findIndex`

```js
const _ = require('lodash')
const array = ['tom', 'jock', 'lucy', 'kuli']

console.log(_.first(array)) // => tom
console.log(_.last(array))  // => kuli
console.log(_.toUpper(_.first(array))) // => TOM
console.log(_.reverse(array)) // ['kuli', 'lucy', 'jock', 'tom']

```

可以看到`lodash`的使用非常简单，具体可以看`lodash`官网

### 优点

#### 可缓存

因为纯函数对相同的输入始终有相同的输出，所以可以把纯函数的结果缓存起来

```js
const _ = require('lodash')
function getArea (r) {
    return Math.PI * r * r
}
let getAreaWithMemory = _.memoize(getArea)
console.log(getAreaWithMemory(4))

```

我们可以来模拟一下`memoize`的实现

```js
function memoize (fn) {
    let cache = {}
    return function () {
        let key = JSON.stringify(arguments)
        cache[key] = cache[key] || fn.apply(fn, arguments)
        return cache[key]
    }
}
// test
let getAreaWithMemory = memoize(getArea)
console.log(getAreaWithMemory(4))

```

#### 可测试

因为纯函数对相同的输入始终有相同的输出，所以纯函数让测试更方便

#### 并行处理

- 在多线程环境下并行操作共享的内存数据很可能会出现意外情况
- 纯函数不需要访问共享的内存数据，所以在并行环境下可以任意运行纯函数（Web Worker）

## 副作用

### 概念

副作用让一个函数变的不纯，纯函数对相同的输入始终有相同的输出

，如果函数依赖于外部的状态就无法保证输出相同就会带来副作用

举个简单的例子

```js
// 不纯的
const authArray = ['manager', 'user']
function checkAuth (auth) {
    return authArray.includes(auth)
}
// 该函数依赖于外部的authArray,如果authArray变化后，那么这个函数对于相同的输入就无法保证会有相同的输出，所以是不纯的函数
// 改变成纯函数
function checkAuth (auth, authArray) {
    return authArray.includes(auth)
}

```



### 来源

- 配置文件
- 数据库
- 获取用户的输入
- ...

所有的外部交互都有可能代理副作用，副作用也使得方法通用性下降不适合扩展和可重用性同时副作用会给程序中带来安全隐患给程序带来不确定性，但是副作用不可能完全禁止尽可能控制他们在可控范围内发生。

## 柯里化

我们用上面例子中的`checkAuth`函数来做个小例子

```js
function checkAuth (auth, authArray) {
    return authArray.includes(auth)
}
// 调用
const authArray = ['manager', 'user']
console.log(checkAuth('user', authArray)) // true
console.log(checkAuth('manager', authArray)) // true

```

我们可以看到在调用的时候，`authArray`这个参数还是被重复的传递了，我们做一个小小的修改

```js
// 柯里化
function checkAuth (authArray) {
    return function (auth) {
        return authArray.includes(auth)
    }
}
// 也可以使用es6的箭头函数来书写
const checkAuth2 = authArray => (auth => authArray.includes(auth))

const authArray = ['manager', 'user']
const roleAuthArray = ['role', 'roleManager']
let checkNormalAuth = checkAuth(authArray)
let checkRoleAuth = checkAuth(roleAuthArray)
// 调用
console.log(checkNormalAuth('user')) // => true
console.log(checkNormalAuth('role')) // => false
console.log(checkRoleAuth('user'))   // => false
console.log(checkRoleAuth('role'))   // => true

```

这样每次只需要去调用固定的函数就好了，也不需要重复的传递参数

### 概念

把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数

### lodash中的柯里化函数curry

`lodash`中的柯里化函数是`curry`

- 功能：创建一个函数，该函数接受一个或多个`func`的参数，如果`func`所需要的参数都被提供则执行`func`并返回执行的结果，否则继续返回该函数并等待接收剩余的参数
- 参数：需要柯里化的函数
- 返回值：柯里化后的函数

```js
const _ = require('lodash')
// 需要柯里化的函数
function add (a, b, c) {
    return a + b + c
}
const getSum = _.curry(add)

// 使用
console.log(getSum(1, 2, 3)) // 6
// 只传递部分参数
console.log(getSum(1)(2, 3)) // 6
console.log(getSum(1, 2)(3)) // 6

```



#### 案例

我们如果需要判断一个字符串是否有空白字符，会这么去写`''.match(/\s+/g)`

判断字符串中是否有数字，`''.match(/\d+/g)`

我们先写一个纯函数

```js
function match (reg, str) {
    return str.match(reg)
}
// 将这个函数柯里化
const _ = require('lodash')
const match = _.curry(function (reg, str) {
    return str.match(reg)
})

// 判断是否有空白字符
const hasSpace = match(/\s+/g)
// 判断是否有数字
const hasNumber = match(/\d+/g)

// test
console.log(hasSpace("hello world")) // => [' ']
console.log(hasSpace("helloworld")) // => nunll
console.log(hasNumber("123qwe")) // => ['123']
console.log(hasNumber("qwe")) // => null

```

如果我们要对一个数组中的空白字符进行过滤，我们可以使用数组`filter`方法来实现，可以先将数组`filter`方法做一层封装

```js
const filter = _.curry(function (func, array) {
    return array.filter(func)
})
// 使用箭头函数来实现
const filter2 = _.curry((func, array) => array.filter(func))
// test
console.log(filter(hasSpace, ['John Connor', 'Jack_milo'])) // => ["John Connor"]
// 因为可以传递多个参数，也可以只传递部分参数，所以我们可以利用这个特性来生成具有特定功能的函数
const findSpace = filter(hasSpace)

console.log(findSpace(['John Connor', 'Jack_milo'])) // => ["John Connor"]

```

#### curry实现

```js
// 首先curry这个函数需要接收一个函数作为参数
function curry (fn) {
    return function () {
        
    }
}
// 两种调用方式
// 1.当调用curry返回的函数时，如果传递的参数与传入curry的函数的参数个数一致，那么会立即返回该函数执行结果
// 2.如果传递的参数是传入curry的函数的部分参数，那么会返回一个函数并等待其它参数
function curry (fn) {
    return function curriedFn(...args) {
        // 判断实参和形参的个数
        // 如果传递参数个数小于形参的个数，返回一个函数
        if (args.length < fn.length) {
			return function () {
                // 这个函数中的参数可以通过arguments来获取
                // 将多次传入的参数合并成一个数组，然后展开传递
                // arguments是一个类数组，需要使用Array.from来转换成一个数组
                return curriedFn(...args.concat(Array.from(arguments)))
            }
        }
        // 如果传递的参数个数大于等于形参个数，直接返回执行结果
        return fn.apply(fn, args)
    }
}

// test
function add (a, b, c) {
    return a + b + c
}
const getSum = curry(add)

// 使用
console.log(getSum(1, 2, 3)) // 6
// 只传递部分参数
console.log(getSum(1)(2, 3)) // 6
console.log(getSum(1, 2)(3)) // 6

```

### 总结

- 柯里化可以让我们给一个函数传递较少的参数得到一个已经记住了某些固定参数的新函数
- 这是一种对函数的缓存
- 让函数变的更灵活，让函数的粒度更小
- 可以把多元函数转换成一元函数，可以组合使用函数产生强大的功能

## 函数组合

纯函数和柯里化很容易写出洋葱代码`h(g(f(x)))`

举个例子：获取数组中最后一个元素再转换成大写字母

```js
_.toUpper(_.first(_.reverse(array)))

```

函数组合可以让我们把细粒度的函数重新组合生成一个新的函数

### 管道

下面这张图表示程序中使用函数处理数据的过程，给 fn 函数输入参数 a，返回结果 b。 a 数据通过一个管道得到了 b 数据。

![长管道](./img/grep.png)

当 fn 函数比较复杂的时候，我们可以把函数 fn 拆分成多个小函数，此时多了中间运算过程产生的 m和 n。
下面这张图中可以想象成把 fn 这个管道拆分成了3个管道 f1, f2, f3，数据 a 通过管道 f3 得到结果 m，m 再通过管道 f2 得到结果 n，n 通过管道 f1 得到最终结果 b

![小管道](./img/grep_mini.png)

```js
fn = compose(f1, f2, f3)
b = fn(a)

```

### 函数组合

如果一个函数需要经过多个函数处理才能得到最终值这个时候可以把中间过程的函数合并成一个函数

- 函数就是数据管道，函数组合就是把这些管道连接起来，让数据穿过多个管道形成最终结果

- **函数组合默认是从右到左执行**

  ```js
  // 举个简单的例子 求数组中的最后一个元素
  // 只是一个例子来说明
  // 定义一个组合函数
  function compose (f1, f2) {
   return function (val) {
       return f1(f2(val))
   }
  }
  function first (array) {
   return array[0]
  }
  function reverse (array) {
  return array.reverse()
  }
  // 从右到左运行
  let last = compose(first, reverse)
  console.log(last([1, 2, 3, 4])) // => 4
  
  
  ```

- 函数组合要满足**结合律**

  ```js
  // 结合律（associativity）
  let f = compose(f, g, h)
  let associative = compose(compose(f, g), h) == compose(f, compose(g, h))
  // true
  
  ```

所以代码也可以这样写

```js
const _ = require('lodash')
// const f = _.flowRight(_.toUpper, _.first, _.reverse)
// const f = _.flowRight(_.flowRight(_.toUpper, _.first), _.reverse)
const f = _.flowRight(_.toUpper, _.flowRight(_.first, _.reverse))
console.log(f(['one', 'two', 'three']))

```



### lodash中的组合函数

`lodash`中的组合函数

- `lodash`中组合函数`flow()`或者`flowRight()`，都可以组合多个函数
- `flow()`是从左到右运行
- `flowRight`是从右到左运行，使用的多一些

```js
// 举个简单的例子 求数组中的最后一个元素并且转换成大写
// 只是一个例子来说明
const _ = require('lodash')
const reverse = arr => arr.reverse()
const first = arr => arr[0]
const toUpper = s => s.toUpperCase()
const f = _.flowRight(toUpper, first, reverse)
console.log(f(['one', 'two', 'three'])) // => THREE

```

### lodash中flowRight实现

```js
function compose (...args) {
    return function (value) {
        // 因为是从右开始执行，所以需要将传入的多个函数先进行反转
        return args.reverse().reduce((res, fn) => {
            return fn(res)
        }, value)
    }
}
// 使用箭头函数来书写
const compose = (...args) => value => args.reverse().reduce((res, fn) => fn(res), value)

// test
const reverse = arr => arr.reverse()
const first = arr => arr[0]
const toUpper = s => s.toUpperCase()
const f = compose(toUpper, first, reverse)
console.log(f(['one', 'two', 'three'])) // => THREE

```

### 函数组合的调试

当函数组合了多个函数执行的时候，如果最后得到结果与我们的预期不一致，那么我们应该如何去查找是哪一个函数出了问题呢？

我们可以顶一个`log`函数，加入到函数组合中去，去查看打印结果

```js
const _ = require('lodash')
const trace = _.curry((tag, v) => {
    console.log(tag, v)
    return v
})
const split = _.curry((sep, str) => _.split(str, sep))
const join = _.curry((sep, array) => _.join(array, sep))
const map = _.curry((fn, array) => _.map(array, fn))
const f = _.flowRight(join('-'), trace('map 之后'), map(_.toLower), trace('split 之后'), split(' '))
console.log(f('NEVER SAY DIE'))
// 打印结果
// split 之后 ["NEVER", "SAY", "DIE"]
// map 之后 ["never", "say", "die"]
// never-say-die

```



### lodash中的fp模块

`lodash`是**数据优先，函数置后**的特点，而`fp`模块是**函数优先，数据置后**的特点，与之相反

我们可以利用这个特点对上面的代码进行改造

```js
const fp = require('lodash/fp')
const f = fp.flowRight(fp.join('-'), fp.map(_.toLower), fp.split(' '))
console.log(f('NEVER SAY DIE')) // => never-say-die

```

## Point Free

### 概念 

把数据处理的过程定义成与数据无关的合成运算，不需要用到代表数据的那个参数，只要把简单的运算步骤合成到一起，在使用这种模式之前我们需要定义一些辅助的基本运算函数。

- 不需要指明处理的数据
- **只需要合成运算过程**
- 需要定义一些辅助的基本运算函数

```js
const f = fp.flowRight(fp.join('-'), fp.map(_.toLower), fp.split(' '))

```

这段代码中没有指明需要处理的数据，只是把一些运算过程进行了合成，最后返回了一个函数



### 案例

#### 将字符串转换成小写并用_连接

```js
// Hello World => hello_world
// 非Point Free 模式下
function trans(str) {
    return str.toLowerCase().replace(/\s+/g, '_')
}
// Point Free模式
const fp = require('lodash/fp')

const f = fp.flowRight(fp.replace(/\s+/g, '_'), fp.toLower)

console.log(f('Hello World')) // hello_world

```



#### 把单词中的首字母提取并转换成大写

```js
const fp = require('lodash/fp')

const f = fp.flowRight(fp.join('. '), fp.map(fp.first), fp.map(fp.toUpper), fp.split(' '))

console.log(f('world wild web')) // => W. W. W

```

上面的代码中`fp.map`调用了两次，做了两次循环，那么可不可以只调用一次呢？当然是可以的，我们可以先将`fp.first`和`fp.toUpper`组合在一起，然后再调用`map`

```js
const f = fp.flowRight(fp.join('. '), fp.map(fp.flowRight(fp.first, fp.toUpper)), fp.split(' '))

```

## Functor（函子）

函数式编程中可以通过**函子**将副作用控制再可控的范围内，异常处理，异步操作等

### 概念

- 容器：包含值和值的变形关系（变形关系即函数）
- 函子：是一个特殊的容器，通过一个普通的对象来实现，该对象具有`map`方法，`map`方法可以运行一个函数对值进行处理（变形关系）

### Functor 函子

函子是一个普通对象，里面维护一个值，对外有一个`map`方法，`map`方法会返回一个新的函子

```js
// 基本函子
class Container {
  constructor(x) {
    this._value = x
  }
  map(fn) {
    return new Container(fn(this._value))
  }
}
// test
let r = new Container(5)
  .map(x => x + 1)
  .map(x => x * x)

console.log(r) // => Container { _value: 36 }

```

上面的代码中我们使用到了`new`，看起来很像面向对象，所以我们将它改造一下

```js
class Container {
  static of(val) {
    return new Container(val)
  }
  constructor(x) {
    this._value = x
  }
  map(fn) {
    return Container.of(fn(this._value))
  }
}
// test
let r = Container.of(5)
  .map(x => x + 1)
  .map(x => x * x)

console.log(r) // => Container { _value: 36 }

```

函子永远不会对外公布它的值，想要处理这个值，就只能通过`map`方法

### 总结

- 函数式编程的运算不直接操作值，而是由函子来完成
- 函子就是一个实现了`map`锲约的对象
- 我们可以把函子想象成一个盒子，这个盒子里封装了一个值
- 想要处理盒子中的值，需要给盒子的`map`方法传递一个处理值的函数（纯函数），由这个函数对值进行处理
- 最终`map`会返回一个包含新的值的函子

### MayBe函子

上面的函子存在一个问题，就是当我们给函子传递的值为`null`或者`undefined`的时候，程序就会报错

```js
let r = Container.of(null)
  .map(x => x.toUpperCase())

```

![错误信息](./img/error.png)

这种情况我们就可以使用`MayBe`函子来处理

- 我们在编程过程中可能会遇到很多错误，需要对这些错误做相应的处理
- `MayBe`函子的作用就是可以对外部的空值情况做处理（控制副作用在允许的范围）

`MayBe`函子的写法与上面的函子不同的是增加了一个判断值是不是`null`或者`undefined`方法，从而达到避免因为空值出现错误的情况

```js
class MayBe {
  static of(value) {
    return new MayBe(value)
  }
  constructor(value) {
    this._value = value
  }
  map(fn) {
    // 先判断值是否存在，如果不存在，创建一个值为null的函子，否则调用fn
    return this.isNothing() ? MayBe.of(null) : MayBe.of(fn(this._value))
  }
  isNothing() {
    return this._value === null || this._value === undefined
  }
}

```

来测试一下

```js
// test
let r = MayBe.of('hello world')
          .map(x => x.toUpperCase())
console.log(r)

let r2 = MayBe.of(null)
  .map(x => x.toUpperCase())
console.log(r2)

```

结果：

![maybe函子](./img/maybe.png)



可以看到当值为`null`的时候并不会报错，会返回一个值为`null` 的函子

### Either函子

`MayBe`函子虽然可以解决空值的问题，但是也存在一个问题，我们看下面的代码

```js
// 用上面的MayBe函子执行
let r = MayBe.of('hello world')
  .map(x => x.toUpperCase())
  .map(x => null)
  .map(x => x.split(' '))
console.log(r)

```

结果肯定是返回一个`null`值的`MayBe`函子，就与我们的预期不一致，那么我们调用了多次`map`方法，是在哪一次调用的时候出现了问题，我们是不知道的，所以我们就需要`Either`函子，它可以解决这个问题

`Either`函子的处理过程和`if-else`的处理过程类似

- `Either`两者中的任何一个，类似于`if...else...`的处理
- 异常会让函数变的不纯，`Either`函子可以做异常处理

因为`Either`函子是两个中选择一个，所以我们需要定义两个函子`Left`和`Right`

```js
class Left {
  static of(value) {
    return new Left(value)
  }
  constructor(value) {
    this._value = value
  }
  map(fn) {
    return this
  }
}

class Right {
  static of(value) {
    return new Right(value)
  }
  constructor(value) {
    this._value = value
  }
  map(fn) {
    return Right.of(fn(this._value))
  }
}

```

这里两个函子与上面的函子区别不大，只是`Left`这个函子返回的是`this`，它并没有去调用`fn`方法

先做个小小的测试

```js
// test
let r1 = Right.of(5).map( x => x + 2)
let r2 = Left.of(5).map(x => x + 2)
console.log(r1) // Right { _value: 7 }
console.log(r2) // Left { _value: 5 }

```

因为`Left`没有调用`fn`方法，所以值并不会发生改变

但是为什么要这么做呢？

我们来看下面一个小例子，把`JSON字符串`转换成`JSON`对象

```js
// 先定一个转换函数
function parseJSON(str) {
  // 因为在转换的过程中可能会出现错误，所以使用try-catch包裹起来
  try {
    // 正确情况下返回会执行fn的函子，Right函子
    return Right.of(JSON.parse(str))
  } catch (e) {
    // 错误情况下我们可以把错误信息记录下来，返回不会执行fn的函子，这个函子的值就是错误信息，Left函子
    return Left.of({ errorMsg: e.message})
  }
}

```

来测试一下

```js
let r1 = parseJSON('{name:zs}')
console.log(r1)

let r2 = parseJSON('{"name":"zs"}')
console.log(r2)

let r3 = parseJSON('{"name":"zs"}').map(x => x.name.toUpperCase()) 
console.log(r3)

```

结果：

![Either函子](./img/Either.png)

可以看到，程序不会报错，会返回一个带有错误信息的函子，正确情况下也是没问题的

### IO 函子

IO函子的特点

- IO函子的值始终是一个函数，将函数当做值来处理
- IO函子可以将不纯的动作存到`_value`中，延迟执行不纯的动作（惰性执行）,包装当前操作的纯函数
- 把不纯的动作交给调用者来处理

IO函子实现：

```js
const fp = require('lodash/fp')
class IO {
  static of(val) {
    return new IO(function () {
      return val
    })
  }
  constructor(fn) {
    this._value = fn
  }
  map(fn) {
    // 把当前的 value 值和传入的 fn 合并成一个新的函数
    return new IO(fp.flowRight(fn, this._value))
  }
}

```

接下来来调用一下他

```js
let r = IO.of(5).map(x => x + 2)
console.log(r) // IO { _value: [Function] }

```

没错，IO函子里面的`_value`是一个函数，它不会返回给我们值，`map` 方法传入的函数可能是纯的也可能是不纯的，IO函子将这个动作保存起来，不会去执行这个函数，这样就保证了自己的操作是个纯的，将这个可能是不纯的动作交给调用者，这样函数的副作用就在可控范围内了，我们如果需要取这个值的话需要在调用一下`_value`这个函数

```js
let r = IO.of(5).map(x => x + 2)
console.log(r._value()) // 7

```

### folktale(一个标准的函数式编程库)

`folktale`没有封装很多功能函数，它只提供了一些函数式处理的操作，`curry`，`compose`等，还有一些函子`Task`、`Either`、`MayBe`等

[folktale官网](https://folktale.origamitower.com/docs/v2.3.0/)

先来看一下基本使用

```js
const { compose, curry } = require('folktale/core/lambda')
const { first, toUpper} = require('lodash/fp')
// curry 2这个参数的意思是代表后面传入的函数有几个参数
let f = curry(2, (x, y) => x + y)
console.log(f(1, 2)) // => 3
console.log(f(1)(2)) // => 3
// compose
let f2 = compose(toUpper, first)
console.log(f2(['one', 'two'])) // ONE

```

### folktale库中提供的Task函子

[Task函子官网地址](https://folktale.origamitower.com/api/v2.3.0/en/folktale.concurrency.task.html)

我们来做这样一个操作，将`package.json`文件中的`version`字段取出来，首先我们需要读取文件

```js
const fs = require('fs')
const { task } = require('folktale/concurrency/task')
// task会返回一个Task函子
// 定义读取文件的方法,该方法返回一个Task函子
function readFile(filename) {
  return task(resolver => {
    fs.readFile(filename, 'utf-8', (err, data) => {
      if (err) resolver.reject(err)
      resolver.resolve(data)
    })
  })
}
// 调用
// 直接调用会返回一个Task函子，需要使用Task函子的run方法来执行读取文件这个操作
// 可以通过listen方法来获取信息
readFile('../package.json')
  .run()
  .listen({
    onRejected(e) {
      console.log(e)
    },
    onResolved(value) {
      console.log(value)
    }
  })

```

结果：

![task](./img/task.png)

在这里我们会获取到`package.json`文件中的所有内容，那么我们如果获取其中的`version`呢？

我们知道，所有的函子都有一个`map`方法，我们可以先将整个`package.json`文件按照空格切割成数组，然后去寻找`version`就行了

```js
// 引入 split find
const { split, find } = require('lodash/fp')

// 使用map方法做切割和查找
readFile('../package.json')
  .map(x => x.split('\n'))
  .map(find(x => x.includes('version')))
  .run()
  .listen({
    onRejected(e) {
      console.log(e)
    },
    onResolved(value) {
      console.log(value)
    }
  })
//  "version": "1.0.0",

```



### Pointed函子

这个函子其实我们一直在使用

- `Pointed`函子是实现了静态方法`of`的函子
- `of`方法是为了避免使用`new`来创建对象，更深层的含义是 `of` 方法用来把值放到上下文`Context`（把值放到容器中，使用 `map` 来处理值）

### Monad函子

在IO函子中存在一个问题，那就是函子嵌套的问题，举个例子，我们在`linux`有一个命令`cat`,它的作用是读取文件并打印出来，我们来模拟一下这个功能的实现

```js
const fs = require('fs')
const fp = require('lodash/fp')

class IO {
  static of(x) {
    return new IO(function () {
      return x
    })
  }
  constructor(fn) {
    this._value = fn
  }
  map(fn) {
    return new IO(fp.flowRight(fn, this._value))
  }
}

// 定义读取文件的函数
function readFile(filename) {
  return new IO(function () {
    return fs.readFileSync(filename, 'utf-8')
  })
}
// 定义打印的函数
function print(x) {
  return new IO(function () {
    console.log(x)
    return x
  })
}

// 定义cat
const cat = fp.flowRight(print, readFile)

```

来使用一下

```js
// IO(IO(x))
let r = cat('../package.json')
console.log(r) // IO { _value: [Function] }

```

这个返回结果`r`是什么呢？就是一个嵌套的函子

```js
let r = cat('../package.json')._value()
console.log(r) // IO { _value: [Function] }

```

调用他的`_value`，返回的还是一个函子

我们需要调用两次才能打印出文件的内容

```js
let r = cat('../package.json')._value()._value()
console.log(r)
// {
//   "name": "readme",
//     "version": "1.0.0",
//       "description": "folktale",
//         "main": "index.js",
//           "scripts": {
//     "test": "echo \"Error: no test specified\" && exit 1"
//   },
//   "keywords": [],
//     "author": "",
//       "license": "ISC",
//         "dependencies": {
//     "folktale": "^2.3.2",
//       "lodash": "^4.17.15"
//   }
// }

```

这种情况不是那么的方便，代码看起来也不够清爽，所有我们这个时候就可以使用`Monad`函子

先介绍一下`Monad`函子，它是一个可以变扁的`Pointed`函子，就类似于数组扁平化一样将嵌套的函子排平

- 一个函子如果同时具有`join`和`of`两个方法并遵守一些定律就是一个`Monad`函子

我们对上面的IO函子改造一下，让它变成一个`Monad`函子

```js
const fs = require('fs')
const fp = require('lodash/fp')

class IO {
  static of(x) {
    return new IO(function () {
      return x
    })
  }
  constructor(fn) {
    this._value = fn
  }
  map(fn) {
    return new IO(fp.flowRight(fn, this._value))
  }

  join() {
    return this._value()
  }

  flatMap(fn) {
    return this.map(fn).join()
  }
}
// 在调用的时候
let r = readFile('../package.json')
  .flatMap(print)
  .join()
console.log(r)

```

如果我们想把文件的内容转换成大写的，只需要加一个`map`就可以了

```js
let r = readFile('../package.json')
  .map(fp.toUpper)
  .flatMap(print)
  .join()
console.log(r)

```
