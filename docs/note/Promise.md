---
title: Promise源码实现诱导版
sidebarDepth: 2
---

## 简单Promise的实现

我们从`Promise`的使用过程中知道，

+ `Promise`就是一个普通的类，
+ 通过`new`关键字创建时可以传递一个函数,接收两个参数`resolve`和`rejecte`，前者是将状态更改为成功，后者是将状态更改为失败
+ `Promise`有三种状态，
  + 成功态`fulfilled`  
  + 失败态`rejected`
  + 等待态`pending`
+ `Promise`状态只会改变一次，一旦被改变就不会再次发生改变
+ `then`方法内部接收两个函数作为参数，一个是成功函数，一个是失败函数

按照这个逻辑我们可以来书写我们的代码

```js

const PENDING = 'pending' // 等待
const FULFILLED = 'fulfilled' // 成功
const REJECTED = 'rejected' // 失败

class MyPromise {
  constructor(executor) {
    // 执行创建 Promise 时传递的函数
    executor(this.resolve, this.reject)
  }
  // 初始状态为等待态
  status = PENDING
  // 定义成功之后的值
  successValue = undefined
  // 定义失败的原因
  failedReason = undefined
  // 成功时执行的函数
  resolve = value => {
    // 当状态不是 pending 时 说明状态已经被修改过了 因为状态只能修改一次 所以这个时候需要阻止代码执行
    if (this.status !== PENDING) return
    // 将状态修改为成功
    this.status = FULFILLED
    // 保存成功的值
    this.successValue = value
  }
  // 失败时执行的函数
  reject = reason => {
    // 当状态不是 pending 时 说明状态已经被修改过了 因为状态只能修改一次 所以这个时候需要阻止代码执行
    if (this.status !== PENDING) return
    // 将状态修改为失败
    this.status = REJECTED
    // 保存失败的原因
    this.failedReason = reason
  }
  // 定义 then 方法
  then(successCallback, failedCallback) {
    if (this.status === FULFILLED) {
      // 如果成功 调用成功的回调
      successCallback(this.successValue)
    } else if (this.status === REJECTED) {
      // 如果失败 调用失败的回调
      failedCallback(this.failedReason)
    }
  }
}
```

这样一个最简单的`Promise`就写好了，我们来进行测试一下

```js
const p1 = new MyPromise((resolve, reject) => {
    resolve('成功')
})
const p2 = new MyPromise((resolve, reject) => {
    reject('失败')
})
const p3 = new MyPromise((resolve, reject) => {
    resolve('成功')
    reject('失败')
})
p1.then(value => {
    console.log('p1', value)
}, reason => {
    console.log('p1', reason)
})
p2.then(value => {
    console.log('p2', value)
}, reason => {
    console.log('p2', reason)
})
p3.then(value => {
    console.log('p3', value)
}, reason => {
    console.log('p3', reason)
})
```

为什么要定义这么多呢？这样就可以一次性在控制台看到结果了，`主要是懒` [风中凌乱~]

<img class="custom" :src="$withBase('/img/simplePromise.png')" alt="queue">

可以看到，控制台的输出结果与我们的预期是一致的，这说明最简单版本的`Promise`就完成啦

## 给Promise添加异步逻辑

上面的简单版本的`Promise`不能执行异步逻辑，我们可以写个小案例测试一下

```js
const p = new MyPromise((resolve, reject) => {
    // 添加一个异步逻辑
    setTimeout(() => {
        resolve('成功')
    }, 2000)
})
p.then(value => {
    console.log(value)
}, reason => {
    console.log(reason)
})
```

控制台什么也不会输出，因为在执行`promise`中的`executor`的时候，发现异步代码`setTimeout`，但是主线程中的代码不会等待异步代码执行完之后再执行，所以它会继续执行，所以我们的`then`方法会马上执行，但是`then`方法中只判断了**成功**和**失败**的情况，没有对等待状态做处理，所以接下来我们就对**等待**状态做一些处理

```js

const PENDING = 'pending' // 等待
const FULFILLED = 'fulfilled' // 成功
const REJECTED = 'rejected' // 失败

class MyPromise {
  constructor(executor) {
    // 执行创建 Promise 时传递的函数
    executor(this.resolve, this.reject)
  }
  // 初始状态为等待态
  status = PENDING
  // 定义成功之后的值
  successValue = undefined
  // 定义失败的原因
  failedReason = undefined
  // 成功的回调
  successCallback = undefined
  // 失败的回调
  failedCallback = undefined

  // 成功时执行的函数
  resolve = value => {
    // 当状态不是 pending 时 说明状态已经被修改过了 因为状态只能修改一次 所以这个时候需要阻止代码执行
    if (this.status !== PENDING) return
    // 将状态修改为成功
    this.status = FULFILLED
    // 保存成功的值
    this.successValue = value
    // 判断成功回调是否存在，存在则执行
    this.successCallback && this.successCallback(value)
  }
  // 失败时执行的函数
  reject = reason => {
    // 当状态不是 pending 时 说明状态已经被修改过了 因为状态只能修改一次 所以这个时候需要阻止代码执行
    if (this.status !== PENDING) return
    // 将状态修改为失败
    this.status = REJECTED
    // 保存失败的原因
    this.failedReason = reason
    // 判断失败回调是否存在，存在则执行
    this.failedCallback && this.failedCallback(reason)
  }
  // 定义 then 方法
  then(successCallback, failedCallback) {
    if (this.status === FULFILLED) {
      // 如果成功 调用成功的回调
      successCallback(this.successValue)
    } else if (this.status === REJECTED) {
      // 如果失败 调用失败的回调
      failedCallback(this.failedReason)
    } else {
      // 保存成功回调和失败回调
      this.successCallback = successCallback
      this.failedCallback = failedCallback
    }
  }
}
```

这样的话我们在用上面的代码测试就能看到，2s后会在控制台打印出成功，说明异步逻辑处理这个功能也没有问题了

## then方法多次调用处理

上面的`Promise`可以处理异步逻辑，但是当我们添加多个`then`方法去处理异步逻辑的时候，会传递多个处理函数，这个时候我们来看下有什么问题

```js
const p = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('成功')
    }, 2000)
})
p.then(value => {
    console.log(1);
    console.log(value)
})
p.then(value => {
    console.log(2);
    console.log(value)
})
p.then(value => {
    console.log(3);
    console.log(value)
})
```

猜猜看会输出什么？

没错，浏览器只输出了一次

```js
3
成功
```

前面的函数处理逻辑被最后一次的给覆盖掉了，这显然是不符合我们的预期的，所以我们再次对其处理，让它进化一下，可以存储多个函数处理逻辑

```js
// ...省略部分逻辑
class MyPromise {
  // ...省略部分逻辑
  // 成功的回调
  successCallback = []
  // 失败的回调
  failedCallback = []

  // 成功时执行的函数
  resolve = value => {
    // ...省略部分逻辑
    // this.successCallback && this.successCallback(value)
    // 循环执行成功回调
    while(this.successCallback.length) this.successCallback.shift()(value)
  }
  // 失败时执行的函数
  reject = reason => {
    // ...省略部分逻辑
    // this.failedCallback && this.failedCallback(reason)
    // 循环执行失败回调
    while(this.failedCallback.length) this.failedCallback.shift()(reason)
  }
  // 定义 then 方法
  then(successCallback, failedCallback) {
    if (this.status === FULFILLED) {
      // 如果成功 调用成功的回调
      successCallback(this.successValue)
    } else if (this.status === REJECTED) {
      // 如果失败 调用失败的回调
      failedCallback(this.failedReason)
    } else {
      // 保存成功回调和失败回调
      this.successCallback.push(successCallback)
      this.failedCallback.push(failedCallback)
    }
  }
}
```

这个时候我们在次进行测试，就没有问题了，就会依次在控制台输出

```js
1
成功
2
成功
3
成功
```

## 实现then方法的链式调用

我们知道，`Promise`是支持链式调用的，但是我们自己的`Promise`还不可以，所以接下来我们主要做两件事

+ 实现`then`的链式调用
+ 将上一个`then`方法的返回值传递给下一个`then`方法

要实现链式调用，那么就需要返回一个`Promise`对象

首先，要返回`Promise`对象，就需要先定义一个`Promise`

```js
// 定义 then 方法
then(successCallback, failedCallback) {
    // 定义
    let promise2 = new MyPromise()
    if (this.status === FULFILLED) {
        // 如果成功 调用成功的回调
        successCallback(this.successValue)
    } else if (this.status === REJECTED) {
        // 如果失败 调用失败的回调
        failedCallback(this.failedReason)
    } else {
        // 保存成功回调和失败回调
        this.successCallback.push(successCallback)
        this.failedCallback.push(failedCallback)
    }
    // 返回
    return promise2
}
```

在定义`Promise`的时候需要传递一个执行器，这个执行器是立即执行的，我们原有的代码也是立即执行的，所以我们可以这样修改一下

```js
// 定义 then 方法
then(successCallback, failedCallback) {
    // 定义
    let promise2 = new MyPromise(() => {
        if (this.status === FULFILLED) {
            // 如果成功 调用成功的回调
            successCallback(this.successValue)
        } else if (this.status === REJECTED) {
            // 如果失败 调用失败的回调
            failedCallback(this.failedReason)
        } else {
            // 保存成功回调和失败回调
            this.successCallback.push(successCallback)
            this.failedCallback.push(failedCallback)
        }
    })
    // 返回
    return promise2
}
```

这样我们就可以实现链式调用，接下来我们就需要把上一个`then`方法的返回值传递给下一个`then`方法

我们需要拿到上一个`then`的返回值，也就是上一个成功回调的返回值

```js
let x = successCallback(this.successValue)
```

这样我们就拿到，怎样传递给下一个`then`，不要慌，我们来看，当前`then`方法返回的是一个`Promise`对象，而`Promise`对象在创建的时候可以接收两个参数，`resolve`和`reject`，哎，是不是有点意思

执行`resolve`方法传递的值就是下一个`then`方法需要的参数，所以接下来在修改一下我们的代码

```js
// 定义 then 方法
then(successCallback, failedCallback) {
    // 定义
    let promise2 = new MyPromise((resolve, reject) => {
        if (this.status === FULFILLED) {
            // 如果成功 调用成功的回调
            let x = successCallback(this.successValue)
            resolve(x)
        } else if (this.status === REJECTED) {
            // 如果失败 调用失败的回调
            failedCallback(this.failedReason)
        } else {
            // 保存成功回调和失败回调
            this.successCallback.push(successCallback)
            this.failedCallback.push(failedCallback)
        }
    })
    // 返回
    return promise2
}
```

这个时候我们只处理了`then`返回值是普通值的情况，没有处理返回值是`Promise`对象的情况，如果是`Promise`对象，我们需要判断是成功还是失败，如果是成功，则需要`resolve`，如果是失败，则需要`reject`，所以接下来还要继续进行优化我们的代码

定义一个检查类型的方法

```js
function resolvePromise(x, resolve, reject) {
    if (x instanceof MyPromise) {
        x.then(resolve, reject)
     } else {
         resolve(x)
     }
}
```

然后修改一下`then`方法

```js
// 如果成功 调用成功的回调
let x = successCallback(this.successValue)
// 判断 x 的值是普通值还是 promise 对象
// 普通值 直接 resolve
// 如果是 promise 对象 查看 promise 对象返回结果
// 成功调用 resolve 失败调用 reject
resolvePromise(x, resolve, reject)
```

测试一下下

```js
const p = new MyPromise((resolve, reject) => {
  resolve('成功')
  // reject('失败')
})
function other() {
  return new MyPromise((r) => {
    r('other')
  })
}
p.then(value => {
  console.log(value)
  return other()
}).then(value => {
  console.log(value)
})
```

在控制台打印出

```js
成功
other
```

符合我们的预期,(o゜▽゜)o☆[BINGO!]

## then返回promise对象自己问题处理

在`then`方法中，是可以返回`promise`对象的，但是有一个条件，那就是这个`promise`对象不能是它本身

```js
let p1 = p.then(value => {
  console.log(value)
  return p1 // 不能这样做
})
```

他会抛出一个错误

```js
Uncaught (in promise) TypeError: Chaining cycle detected for promise #<Promise>
```

我们应该怎么做呢？

只需要在判断`x`的类型的时候在判断一下`x`是不是和我们要返回的`promise`相等就可以了，如果相等，就`reject`一个错误就可以了

```js
function resolvePromise(promies2, x, resolve, reject) {
  // 判断是不是promise对象本身
  if (promies2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  // 判断 x 是否是属于 promise 对象
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else {
    resolve(x)
  }
}
```

然后在调用这里, 这里会有一个问题，这段代码是同步执行的，同步执行的时候，`promise2`并不存在，需要等 `executor` 执行完毕之后 `promise2` 才会被创建出来，所以我们需要这个判断修改为异步代码

```js
// 定义 then 方法
  then(successCallback, failedCallback) {
    let promies2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          // 如果成功 调用成功的回调
          let x = successCallback(this.successValue)
          // 判断 x 的值是普通值还是 promise 对象
          // 普通值 直接 resolve
          // 如果是 promise 对象 查看 promise 对象返回结果
          // 成功调用 resolve 失败调用 reject
          resolvePromise(promies2, x, resolve, reject)
        }, 0)
      } else if (this.status === REJECTED) {
        // 如果失败 调用失败的回调
        failedCallback(this.failedReason)
      } else {
        // 保存成功回调和失败回调
        this.successCallback.push(successCallback)
        this.failedCallback.push(failedCallback)
      }
    })
    return promies2
  }
}
```

测试一下

```js
const p = new MyPromise((resolve, reject) => {
  resolve('成功')
})
let p1 = p.then(value => {
  console.log(value)
  return p1
})
p1.then(value => {
  console.log(value)
}, reason => {
  console.log(reason)
  console.log(reason.message)
})
```

<img class="custom" :src="$withBase('/img/promiseCycle.png')" alt="queue">

可以看到控制台的输出是符合我们的预期的，我们可以通过`reason.message`获取错误信息

## Promise的错误捕获

我们现在还没有对`promise`做任何的错误捕获，现在我们就可以来加上相应的错误捕获了，让程序变得更加健壮

首先要加的地方就是构造函数里面的执行器`executor`

```js
constructor(executor) {
    try {
        // 执行创建 Promise 时传递的函数
        executor(this.resolve, this.reject)
    } catch (e) {
        this.reject(e)
    }
}
```

非常的简单，当执行器报错了之后，我们直接调用`reject`就可以了将状态修改为失败就可以了

然后测试一下

```js
const p = new MyPromise((resolve, reject) => {
  throw new Error('executor error')
  resolve('成功')
})
p.then(value => {
  console.log(value)
}, reason => {
    console.log(reason)
})
```

在控制台可以看到我们抛出的错误

<img class="custom" :src="$withBase('/img/executorError.png')" alt="queue">

然后就是`then`方法中也需要进行错误的捕获

```js
setTimeout(() => {
    try {
        // 如果成功 调用成功的回调
        let x = successCallback(this.successValue)
        // 判断 x 的值是普通值还是 promise 对象
        // 普通值 直接 resolve
        // 如果是 promise 对象 查看 promise 对象返回结果
        // 成功调用 resolve 失败调用 reject
        // 这里会有一个问题，这段代码是同步执行的，同步执行的时候，promise2并不存在，
        // 需要等 executor 执行完毕之后 promise2 才会被创建出来，所以我们需要这个判断修改为异步代码
        resolvePromise(promies2, x, resolve, reject)
    } catch (e) {
        reject(e)
    }
}, 0)
```

测试一下下

```js
const p = new MyPromise((resolve, reject) => {
  resolve('成功')
})
p.then(value => {
  throw new Error('我是一个错误信息哦')
  console.log(value)
}, reason => {
    console.log(reason)
}).then(value => {
	console.log(value)
}, reason => {
    console.log(reason)
})
```

控制台

<img class="custom" :src="$withBase('/img/thenError.png')" alt="queue">

我们现在已经对成功的情况做了处理，但是失败和等待的情况还没有做处理，处理方式和成功一致

```js
then(successCallback, failedCallback) {
    let promies2 = new MyPromise((resolve, reject) => {
        if (this.status === FULFILLED) {
            setTimeout(() => {
                try {
                    // 如果成功 调用成功的回调
                    let x = successCallback(this.successValue)
                    // 判断 x 的值是普通值还是 promise 对象
                    // 普通值 直接 resolve
                    // 如果是 promise 对象 查看 promise 对象返回结果
                    // 成功调用 resolve 失败调用 reject
                    // 这里会有一个问题，这段代码是同步执行的，同步执行的时候，promise2并不存在，
                    // 需要等 executor 执行完毕之后 promise2 才会被创建出来，所以我们需要这个判断修改为异步代码
                    resolvePromise(promies2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            }, 0)
        } else if (this.status === REJECTED) {
            setTimeout(() => {
                try {
                    // 如果失败 调用失败的回调
                    let x = failedCallback(this.failedReason)
                    // 判断 x 的值是普通值还是 promise 对象
                    // 普通值 直接 resolve
                    // 如果是 promise 对象 查看 promise 对象返回结果
                    // 成功调用 resolve 失败调用 reject
                    resolvePromise(promies2, x, resolve, reject)
                } catch (e) {
                    reject(e)
                }
            }, 0)
        } else {
            // 保存成功回调和失败回调
            this.successCallback.push(() => {
                setTimeout(() => {
                    try {
                        // 如果成功 调用成功的回调
                        let x = successCallback(this.successValue)
                        // 判断 x 的值是普通值还是 promise 对象
                        // 普通值 直接 resolve
                        // 如果是 promise 对象 查看 promise 对象返回结果
                        // 成功调用 resolve 失败调用 reject
                        resolvePromise(promies2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            })
            this.failedCallback.push(() => {
                setTimeout(() => {
                    try {
                        // 如果失败 调用失败的回调
                        let x = failedCallback(this.failedReason)
                        // 判断 x 的值是普通值还是 promise 对象
                        // 普通值 直接 resolve
                        // 如果是 promise 对象 查看 promise 对象返回结果
                        // 成功调用 resolve 失败调用 reject
                        resolvePromise(promies2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            })
        }
    })
    return promies2
}
```

需要注意的是，在等待的情况下，我们不再直接`push`回调函数了，因为这样我们没法对它做处理，所以我们对其用函数在包裹了一层，在函数里面处理回调

## 将then方法的参数变成可选的

如果`then`方法中不传递参数

```js
const p = new MyPromise((resolve, reject) => {
  resolve('success')
})
p
  .then()
  .then()
  .then(value => console.log(value))
```

我们可以看到在控制台中仍然可以打印出`success`

可以这么理解

```js
p
  .then(value => value)
  .then(value => value)
  .then(value => console.log(value))
```

这样的话，如果没有传递参数，就相当于补充了一个`value => value`这样的函数

在`then`方法的开头加两句句代码就可以实现了

```js
successCallback = successCallback ? successCallback : value => value
```

是不是很简单，哈哈

## Promise.resolve方法的实现

从`Promise`的使用中可以看出，`Promise.resolve`方法是个静态方法，可以传递普通值，也可以传递`Promise`对象，当传递的是个普通值的时候，它会把值包装成一个`Promise`对象返回，如果是`Promise`对象则直接返回

实现：

```js
static resolve(value) {
    // 如果是Promise对象直接返回
    if (value instanceof MyPromise) return value
    // 普通值包装成Promise对象返回
    return new MyPromise(resolve => resolve(value))
}
```

测试

```js
const p = new MyPromise((resolve, reject) => {
  resolve('成功')
})
MyPromise.resolve(100).then(console.log) // => 100
MyPromise.resolve(p).then(console.log) // => 成功
```

## Promise.reject方法的实现

从`Promise`的使用中可以看出，`Promise.reject`方法是个静态方法，可以传递普通值，也可以传递`Promise`对象，当传递的是个普通值的时候，它会把值包装成一个`Promise`对象返回，如果是`Promise`对象则直接返回

实现：

```js
static reject(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise((resolve, reject) => reject(value))
}
```

测试：

```js
const oP = new Promise((resolve, reject) => {
  // resolve('success')
  reject('failed')
})
MyPromise.reject('普通对象').catch(console.log)
MyPromise.reject(oP).catch(console.log)
```

结果：

<img class="custom" :src="$withBase('/img/reject.png')" alt="queue">

## Promise的catch方法的实现

如果我们的`then`方法中没有传递第二个回调，那么错误就会被`catch`方法捕获，应该如何去实心呢？其实也非常的简单，因为`then`方法的第二个回调是捕获错误的，所以我们直接在`catch`方法中调用`then`方法，第一个参数是成功回调，我们传递`undefined`就可以了

```js
catch (failedCallback) {
    return this.then(undefined, failedCallback)
}
```



## Promise.all 方法的实现

`Promise.all`有以下特点：

+ 接收一组异步任务，然后并行执行异步任务，只有当所有异步任务都结束后才执行回调，`Promise.all().then()`结果中数组的顺序和异步任务的顺序一致

+ 接收的异步任务组中，如果有抛出异常的任务，那么最先抛出的错误会被捕获，并且是`then`的第二个参数或者`catch`捕获，并不会影响其他异步任务的执行

+ 是一个静态方法，可以直接调用
+ 返回一个`Promise`可以直接链式调用

实现：

```js
static all(array) {
    // 定义结果数组
    let results = []
    // 判断array中所有任务是否执行完毕
    let index = 0
    return new Promise((resolve, reject) => {
        function addData(key, value) {
            results[key] = value
            index++
            // 当任务全部执行完毕之后才 resolve 
            if (index === array.length) {
                resolve(results)
            }
        }
        for (let i = 0; i < array.length; i++) {
            let current = array[i]
            // 如果是 promise 对象，判断是成功还是失败，失败则直接 reject
            if (current instanceof MyPromise) {
                current.then(value => addData(i, value), reject)
            } else {
                // 普通值直接添加进结果数组中
                addData(i, current)
            }
        }
    })
}
```

测试一下

```js
const p = new MyPromise((resolve, reject) => {
  resolve('p1')
})
const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('p2')
  }, 2000);
})
MyPromise.all(['a', 'b', p, p2, 'd']).then(console.log)
// => [ 'a', 'b', 'p1', 'p2', 'd' ]
```

这就完成啦

## Promise.race方法实现

`race`就是竞速，赛跑的意思，谁跑的快，就返回谁，它具有以下特点

+ 接收一组异步任务，也是并行执行异步任务，但是它只取异步任务中的第一个完成的结果，其它的异步任务并不会被终止，但是任务结果会被抛弃
+ 接收的异步任务组中，如果有抛出异常的任务，那么最先抛出的错误会被捕获，并且是`then`的第二个参数或者`catch`捕获，并不会影响其他异步任务的执行

- 是一个静态方法，可以直接调用
- 返回一个`Promise`可以直接链式调用

这个实现就比`all`方法要简单一些了

```js
static race(array) {
    return new MyPromise((resolve, reject) => {
        for (let i = 0; i < array.length; i++) {
            let current = array[i]
            if (current instanceof MyPromise) {
                // Promise 对象
                current.then(resolve, reject)
            } else {
                // 普通值
                resolve(current)
            }
        }
    })
}
```

测试一下:

```js
MyPromise.race(['a', 'b', p, p2, 'd']).then(console.log) // a
MyPromise.race([p, p2, 'd']).then(console.log) // d
MyPromise.race([p2]).then(console.log) // p2
```

也是ok的！

## Promise.finally方法实现

`finally`方法有几个特点

+ 不管是成功还是失败都会执行
+ 会返回一个`promise`对下那个，后面可以链式调用，值是上一次返回的值
+ 无法获取任务是成功还是失败的执行状态

实现：

```js
 finally(callback) {
     // 由于finally无法获取任务执行状态 但是then方法是可以知道的，
     // 所以我们调用then方法 在成功和失败的回调中都去执行finally的回调
     return this.then(value => {
         callback()
         return value
     }, reason => {
         callback()
         throw reason
     })
 }
```

测试一下：

```js
const p = new MyPromise((resolve, reject) => {
  resolve('p resove')
  // reject('p reject')
})
p.finally(() => {
  console.log('finally')
}).then(value => {
  console.log(value)
}, reason => {
  console.log(reason)
})
```

控制台会输出

```js
finally
p resolve
```

我们来进行另外一个测试

```js
const p = new MyPromise((resolve, reject) => {
  resolve('p resove')
})
const p2 = new MyPromise((resolve) => {
  setTimeout(() => {
    resolve('p2 resolve')
  }, 2000)
})
p.finally(() => {
  console.log('finally')
  return p2
}).then(value => {
  console.log(value)
}, reason => {
  console.log(reason)
})
```

我们在控制到看到，它并不会等待`p2`的异步执行结束就直接返回了，但是我们的预期是希望他等待的，所以我们需要修改我们的代码来实现这个功能

```js
finally(callback) {
    // 由于finally无法获取任务执行状态 但是then方法是可以知道的，
    // 所以我们调用then方法 在成功和失败的回调中都去执行finally的回调
    return this.then(value => {
        // 调用静态方法 resolve 把 callback 的返回值包装成一个 promise 对象
        return MyPromise.resolve(callback()).then(() => value)
    }, reason => {
        return MyPromise.resolve(callback()).then(() => {throw reason})
    })
}
```

我们可以看到，通过`MyPromise.resolve`这个静态方法将`callback`的返回值包装成一个`Promise`对象后，然后通过`then`方法将值返回之后，我们的预期就达到了，控制台会在等待`p2`执行完毕之后再打印结果

## 完整版代码

```js
const { add } = require("lodash")

const PENDING = 'pending' // 等待
const FULFILLED = 'fulfilled' // 成功
const REJECTED = 'rejected' // 失败

class MyPromise {
  constructor(executor) {
    try {
      // 执行创建 Promise 时传递的函数
      executor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }
  // 初始状态为等待态
  status = PENDING
  // 定义成功之后的值
  successValue = undefined
  // 定义失败的原因
  failedReason = undefined
  // 成功的回调
  successCallback = []
  // 失败的回调
  failedCallback = []

  // 成功时执行的函数
  resolve = value => {
    // 当状态不是 pending 时 说明状态已经被修改过了 因为状态只能修改一次 所以这个时候需要阻止代码执行
    if (this.status !== PENDING) return
    // 将状态修改为成功
    this.status = FULFILLED
    // 保存成功的值
    this.successValue = value
    // 判断成功回调是否存在，存在则执行
    // this.successCallback && this.successCallback(value)
    // 循环执行成功回调
    while(this.successCallback.length) this.successCallback.shift()()
  }
  // 失败时执行的函数
  reject = reason => {
    // 当状态不是 pending 时 说明状态已经被修改过了 因为状态只能修改一次 所以这个时候需要阻止代码执行
    if (this.status !== PENDING) return
    // 将状态修改为失败
    this.status = REJECTED
    // 保存失败的原因
    this.failedReason = reason
    // 判断失败回调是否存在，存在则执行
    // this.failedCallback && this.failedCallback(reason)
    // 循环执行失败回调
    while(this.failedCallback.length) this.failedCallback.shift()()
  }
  // 定义 then 方法
  then(successCallback, failedCallback) {
    successCallback = successCallback ? successCallback : value => value
    failedCallback = failedCallback ? failedCallback : reason => { throw reason }
    let promies2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            // 如果成功 调用成功的回调
            let x = successCallback(this.successValue)
            // 判断 x 的值是普通值还是 promise 对象
            // 普通值 直接 resolve
            // 如果是 promise 对象 查看 promise 对象返回结果
            // 成功调用 resolve 失败调用 reject
            // 这里会有一个问题，这段代码是同步执行的，同步执行的时候，promise2并不存在，
            // 需要等 executor 执行完毕之后 promise2 才会被创建出来，所以我们需要这个判断修改为异步代码
            resolvePromise(promies2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            // 如果失败 调用失败的回调
            let x = failedCallback(this.failedReason)
            // 判断 x 的值是普通值还是 promise 对象
            // 普通值 直接 resolve
            // 如果是 promise 对象 查看 promise 对象返回结果
            // 成功调用 resolve 失败调用 reject
            resolvePromise(promies2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else {
        // 保存成功回调和失败回调
        this.successCallback.push(() => {
          setTimeout(() => {
            try {
              // 如果成功 调用成功的回调
              let x = successCallback(this.successValue)
              // 判断 x 的值是普通值还是 promise 对象
              // 普通值 直接 resolve
              // 如果是 promise 对象 查看 promise 对象返回结果
              // 成功调用 resolve 失败调用 reject
              resolvePromise(promies2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.failedCallback.push(() => {
          setTimeout(() => {
            try {
              // 如果失败 调用失败的回调
              let x = failedCallback(this.failedReason)
              // 判断 x 的值是普通值还是 promise 对象
              // 普通值 直接 resolve
              // 如果是 promise 对象 查看 promise 对象返回结果
              // 成功调用 resolve 失败调用 reject
              resolvePromise(promies2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return promies2
  }
  // 捕获错误
  catch(failedCallback) {
    // 直接调用then方法，传递第二个回调
    return this.then(undefined, failedCallback)
  }
  finally(callback) {
    // 由于finally无法获取任务执行状态 但是then方法是可以知道的，
    // 所以我们调用then方法 在成功和失败的回调中都去执行finally的回调
    return this.then(value => {
      // 调用静态方法 resolve 把 callback 的返回值包装成一个 promise 对象
      return MyPromise.resolve(callback()).then(() => value)
    }, reason => {
      return MyPromise.resolve(callback()).then(() => {throw reason})
    })
  }
  static all(array) {
    // 定义结果数组
    let results = []
    // 判断array中所有任务是否执行完毕
    let index = 0
    return new Promise((resolve, reject) => {
      function addData(key, value) {
        results[key] = value
        index++
        // 当任务全部执行完毕之后才 resolve 
        if (index === array.length) {
          resolve(results)
        }
      }
      for (let i = 0; i < array.length; i++) {
        let current = array[i]
        // 如果是 promise 对象，判断是成功还是失败，失败则直接 reject
        if (current instanceof MyPromise) {
          current.then(value => addData(i, value), reject)
        } else {
          // 普通值直接添加进结果数组中
          addData(i, current)
        }
      }
    })
  }
  static race(array) {
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < array.length; i++) {
        let current = array[i]
        if (current instanceof MyPromise) {
          // Promise 对象
          current.then(resolve, reject)
        } else {
          // 普通值
          resolve(current)
        }
      }
    })
  }
  static resolve(value) {
    // 如果是Promise对象直接返回
    if (value instanceof MyPromise) return value
    // 普通值包装成Promise对象返回
    return new MyPromise(resolve => resolve(value))
  }
  static reject(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise((resolve, reject) => reject(value))
  }
}
function resolvePromise(promies2, x, resolve, reject) {
  // 判断是不是promise对象本身
  if (promies2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  // 判断 x 是否是属于 promise 对象
  if (x instanceof MyPromise) {
    x.then(resolve, reject)
  } else {
    resolve(x)
  }
}
```
