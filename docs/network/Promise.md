---
title: Promise
---                                                                      
## 概念
`Promise`是异步编程的一种解决方案，它是一个对象，可以获取异步操作的消息，它是EventLoop中的一个微任务`microtask`,
有三种状态：
  + `pengding（等待状态）` 
  + `fulfilled（成功状态）` 
  + `rejected（失败状态）`  
  
`Promise`解决了传统的回调地狱问题，有几个特点：                                        
  + 状态一旦改变，就不会再次发生变化
  + `then`和`catch`都会返回一个新的`Promise`,所以允许我们链式调用
  + `catch`不论链接在哪里，均可以捕获上层未捕获的错误
  + 在`Promise`中，返回任意一个非`Promise`的值都会被包装成一个`Promise`对象，比如说`return 7`会被包装成`return Promise.resolve(7)`
  + `then`和`catch` 可以调用多次
  + `then`和`catch`中`return`一个`error`并不会抛出错误，所以不会被`catch`捕获
  + `then`和`catch`返回值不能是`Promise`本身，会造成死循环
  + `then`和`catch`的参数期望是函数，如果传入不是一个函数，那么将发生值穿透
  + `then`可以接受俩个参数，一个是成功的回调，一个是失败的回调
  + `finally`也是返回一个`Promise`，在`Promise`结束的时候，无论结果是成功还是失败都会执行里面的回调函数，回调函数不接收任何参数，也就是说你在`finally`函数中是没法知道`Promise`最终的状态是`resolved`还是`rejected`
  
### Promise.all和Promise.race
+ `Promise.all`接收一组异步任务，然后并行执行异步任务，只有当所有异步任务都结束后才执行回调，`Promise.all().then()`结果中数组的顺序和异步任务的顺序一致
+ `Promise.race`接收一组异步任务，也是并行执行异步任务，但是它只取异步任务中的第一个完成的结果，其它的异步任务并不会被终止，但是任务结果会被抛弃
+ `all`和`race`接收的异步任务组中，如果有抛出异常的任务，那么最先抛出的错误会被捕获，并且是`then`的第二个参数或者`catch`捕获，并不会影响其他异步任务的执行

## 用法
`Promise`是一个构造函数，有`all、reject、resolve、then、catch`等方法  

```js
let p = new Promise((resolve, reject) => {
  // 模拟异步任务
  setTimeout(() => {
    console.log('执行完成')
    resolve('success')
  }, 2000)
})
```  
`Promise`构造函数接收一个函数作为参数，该函数有两个参数：
  + `resolve`：异步任务执行成功后的回调
  + `reject`：异步任务失败后的回调
### then链式操作
看起来`Promise`只是简化了层层回调的写法，实质上，`Promise`的关键是“状态”，用维护状态、传递状态的方式来使得回调函数能够及时调用，它比传递`callback`函数要简单、灵活的多。所以使用`Promise`的场景是这样的：  
```js
p.then(res => {
  console.log(res)
})
.then(res => {
  console.log(res)
})
.then(res => {
  console.log(res)
})
```  
### reject用法
将`Promise`的状态设置为`rejected`，我们在`then`中或者在`catch`中捕捉到，然后执行失败的回调。  
```js
 let p = new Promise((resolve, reject) => {
    //做一些异步操作
    setTimeout(() => {
      const num = Math.ceil(Math.random() * 10) // 生成1-10的随机数
      if(num > 6 ){
          resolve(num)
      }
      else{
          reject('error number')
      }
    }, 1000)
  })
  // 可以在 then 中进行捕获
  p.then(num => {
      console.log('resolved', num)
    }, err => {
      console.log('rejected', err)
    }
  )
  // 也可以在 catch 中进行捕获
  p.then(num => {
      console.log('resolved', num)
    }
  )
  .catch(err => {
    console.log('rejected', err)
  })
  // 只能捕获一次, 下面这个例子就只会打印出被then捕获的错误reject1
  p.then(num => {
      console.log('resolved', num)
    }, err => {
      console.log('rejected1', err)
    }
  )
  .catch(err => {
    console.log('rejected2', err)
  })
```

### catch
在上面的例子中已经使用过`catch`了，在刚刚的例子中，他和`then`的第二个参数左右一样，用来执行reject的回调,但是他还有一个作用，就是在执行`resolve`的回调，也就是`then`的第一个参数时，如果抛出异常了，那么它也会捕获到这个异常。  
举个例子：  
```js
p.then(res => {
  console.log(res)
  console.log(forCatch) // 这里forCatch未定义
})
.catch(err => {
  console.log('捕获到错误：', err)
})
// 浏览器中的输出如下：
// 9
// center.html:80 捕获到错误： ReferenceError: forCatch is not defined
//     at center.html:77
```  
## 实现一个自己的Promise
首先，我们需要创建一个`Promise`类，然后构造器中传入一个执行器`executor`，`executor`有俩个参数`resolve`和`reject`
### 实现成功和失败的方法  

```js
const PENDING = 'pending' // 等待状态
const RESOLVED = 'fulfilled' // 成功状态
const REJECTED = 'rejected' // 失败状态
class MyPromise {
  constructor(executor){
    this.status = PENDING // 初始状态为等待状态
    this.sucValue = undefined // 成功返回的值
    this.errValue = undefined // 失败返回的值
    this.onResolvedCallbacks = [] // 成功的回调函数
    this.onRejectedCallbacks = [] // 失败的回调函数
    // 将状态变成成功状态并执行成功的回调函数
    const resolve = data => {
      if (this.status === PENDING) {
        this.status = RESOLVED
        this.sucValue = data
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    // 将状态变成失败状态并执行失败的回调函数
    const reject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.errValue = reason
        this.onRejectedCallbakcs.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch(e) {
      reject(e)
    }
  }
}
```  
### `then`方法的实现  
```js
then(onFulFilled, onRejected) {
  if (this.status === RESOLVED) {
    onFulFilled(this.sucValue)
  }
  if (this.status === REJECTED) {
    onRejected(this.errValue)
  }
  if (this.status === PENDING) {
    this.onResolvedCallbacks.push(() => {
      onFulFilled(this.sucValue)
    })
    this.onRejectedCallbacks.push(() => {
      onRejected(this.errValue)
    })
  }
}
```  
### 链式调用成功时
链式调用成功会返回值，有多种情况，根据举的例子，大致列出可能会发生的结果。因此将链式调用返回的值单独写一个方法。方法中传入四个参数，分别是`p2,x,resolve,reject`,`p2`指的是上一次返回的`promise`，`x`表示运行`promise`返回的结果，`resolve`和`reject`是`p2`的方法  
```js
function resolvePromise(p2, x, resolve, reject) {
  // ...
}
```  
+ 返回结果不可以是自己，因为返回结果是自己的话，永远也不会成功或者失败，所以，当返回结果是自己时，应该抛出异常

```js
function resolvePromise(p2, x, resolve, reject) {
  if (p2 === x) return reject(new TypeError('循环引用'))
}
```
+ 返回结果可能是一个`Promise`

```js
function resolvePromise(p2, x, resolve, reject) {
  if (p2 === x) return reject(new TypeError('循环引用'))
  // 判断是否是 promise 有三个条件
  // 1. 是对象且不为 null
  // 2. 是函数
  // 3. 满足1、2其中一个并且有 then 这个属性，then 是函数
  if ((x !== null && typeof x === 'object') || (typeof x === 'function')) {
    // 确保 promise 状态只改变一次
    let called
    try {
      let then = x.then
      if (typeof then === 'function') { // 是 promise
        // 调用 then 方法时绑定 this，否则可能会导致this指向变更; 第二个参数成功回调
        then.call(x, y => {
          if (called) return
          called = true
          // y 仍然可以是 promise
          resolvePromise(p2, y, resolve, reject)
        }, r => {
          if (called) return
          called = true
          reject(r)
        })
      } else {
        resolve(x)
      }
    } catch(e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    // 普通值
    resolve(x)
  }
}
```  
+ 返回结果可能为一个普通值，则直接 `resolve(x)`
+ Promise一次只能调用成功或者失败  
  
下面是源码
```js
function isPromise(value) {
  if((typeof value === 'object' && value !== null) || typeof value === 'function') {
    return typeof value.then === 'function'
  }
  return false;
}

module.exports = isPromise;
```
```js
function resolvePromise(promise, x, resolve, reject) {
  if(x === promise) {
    return reject(new TypeError(`Chaining cycle detected for promise #<Promise>`));
  }
  /**
   * 判断是否是promise有三个条件
   * 1.是对象，且不是null
   * 2.是函数
   * 3.满足1，2其中一个的基础上，有then属性，且是个函数
   */
  if((typeof x === 'object' && x !== null) || typeof x === 'function') {
    // 确保即使x是他人自定义的promise对象时，状态改变也只执行一次
    let called; 
    try { // 如果then属性通过getter定义
      let then = x.then;
      if (typeof then === 'function') {// 是promise
        // then方法调用时绑定this,否则可能会导致this指向变更; 第二个参数成功回调
        then.call(x, y => {
          if(called) return;
          called = true;
          // y仍然可能是promise
          resolvePromise(promise, y, resolve, reject);
        }, r => {//失败回调
          if(called) return;
          called = true;
          reject(r);
        })
      } else {
        resolve(x);
      }
    } catch (e) {
      if(called) return;
      called = true;
      reject(e);
    }
  } else { // 普通值
    resolve(x);
  }
}
module.exports = resolvePromise;
```
```js
/**
 * 1. Promise实例化时有个执行器函数，会立即执行
 * 2. 执行器有两个方法，第一个是resolve, 第二个是reject
 * 3. promise实例有三种状态，pending, fulfilled, rejected
 *    默认是pending, 调用resolve后变为fulfilled; 调用reject后变为rejected
 * 4. 状态不可逆, 只能pending->fulfilled, 或者pending -> rejected
 * 5. 每个promise实例都有个then方法，then方法有两个参数，
 *    第一个是成功回调onFulfilled，第二个是失败回调onRejected
 * 6. 执行器的resolve函数会触发成功回调onFulfilled，
 *    执行器的reject函数或者throw触发失败回调onRejected
 * 7. then方法返回的是一个promise对象。
 * 8. 每个promise对象都有catch方法。
 * 9. Promise类（构造函数）有静态方法Promise.resolve(value)/Promise.reject(value)
 * 10. Promise类（构造函数）有静态方法Promise.all([...])返回一个promise实例
 *     解决异步任务并发的问题，返回结果数组按照异步任务的顺序返回
 */
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
const resolvePromise = require('./resolvePromise');
const isPromise = require('./isPromise');

class Promise {
  constructor(executor) {
    this.value;
    this.reason;
    this.status = PENDING;
    this.onResolvedCallbacks=[]; // then成功回调队列
    this.onRejectedCallbacks=[]; // then失败回调队列
    let resolve = (value) => {
      // resolve的值如果是promise, 则一直取值直到非promise为止
      if (value instanceof Promise) {
        value.then(resolve, reject);
      } else if(this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        if (this.onResolvedCallbacks.length > 0) {
          this.onResolvedCallbacks.forEach(fn => fn());           
        }   
      }
    }
    let reject = (reason) => {
      if(this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;    
        this.onRejectedCallbacks.forEach(fn => fn())    
      }
    }
    try{
      executor(resolve, reject);      
    } catch(err) {
      reject(err)
    }
  }
  
  then(onFulfilled, onRejected) {// 两个回调函数,都是可选参数
    // 当参数不是回调函数或者省略时,赋予默认回调函数,将值向后传递
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
    onRejected = typeof onRejected === 'function' ? onRejected : e => {throw e};
    // 返回promise可以实现链式调用
    const promise = new Promise((resolve, reject) => {
      if(this.status === FULFILLED) {
        //微任务，等到new实例完成之后，获取返回的promise;否则promise未定义
        process.nextTick(() => { 
          try {
            let x = onFulfilled(this.value);
            // x有可能是promise对象，则需要继续处理，直至返回的是普通数据（非异常和promise）     
            resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }          
        })
      }
      if(this.status === REJECTED) {
        process.nextTick(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise, x, resolve, reject);        
          } catch (e) {
            reject(e)
          }          
        })
      }
      if(this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          process.nextTick(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise, x, resolve, reject);
            } catch (e) {
              reject(e);
            }             
          }) 
        })
        this.onRejectedCallbacks.push(() => {
          process.nextTick(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise, x, resolve, reject);
            } catch(e) {
              reject(e);
            }               
          })
        })
      }      
    })
    return promise;
  }
  catch(errCallback) {
    return this.then(null, errCallback);
  }
  finally(callback) {
    return this.then((value) => {
      return Promise.resolve(callback()).then(() => value)
    }, (err) => {
      return Promise.resolve(callback()).then(() => {throw err})
    })
  }
}
Promise.resolve = (value) => {
  if(isPromise(value)) {
    return value;
  }
  return new Promise((res,rej) => {
    res(value);
  })
}
Promise.reject = (reason) => {
  if(isPromise(reason)) {
    return reason;
  }
  return new Promise((resolve,reject) => {
    reject(reason);
  })
}
Promise.all = ( promises) => { // 处理并发；promises的数组中可以不是promise
  return new Promise((resolve,reject) => {
    let arr = [];// 存储promise的结果
    let index = 0; //确保每个promise项都执行过
    let processData = (i, data) => {
      arr[i] = data;
      if (++index === promises.length) {
        resolve(arr);
      }
    }
    for(let i=0; i<promises.length; i++) {
      let current = promises[i];
      if(isPromise(current)) {
        current.then((data) => {
          processData(i, data);
        }, reject); //只要有一个reject状态就变rejected
      } else {
        processData(i, current);
      }
    }
  })
}
Promise.race = (promises) => {
  return new Promise((resolve, reject) => {
    for(let i=0; i< promises.length; i++) {
      let current = promises[i];
      if(isPromise(current)) {
        current.then(resolve, reject)
      } else {
        resolve(current);
      }
    }
  })
}
// 测试Promise是否符合规范
Promise.deferred = function() {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  })
  return dfd;
}
module.exports = Promise;
```