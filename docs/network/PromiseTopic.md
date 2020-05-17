---
title: Promise由浅入深题目-加深理解
sidebarDepth: 2
---
## 1.基础题
### 1.1 题目一
```js
const promise1 = new Promise((resolve, reject) => {
  console.log('promise1')
})
console.log('1', promise1)
```  
执行过程分析：
  + 从上至下，首先遇见`new Promise`，执行构造函数中的代码，输出`promise1`
  + 然后同步执行，输出`1`, `promise`并没有进行`resolve`或者`reject`,所以是`pending`状态
  
结果：
```js
'promise1'
'1' Promise{<pending>}
```  
### 1.2 题目二
```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  resolve('success')
  console.log(2);
});
promise.then(() => {
  console.log(3);
});
console.log(4);
```  
执行过程分析：
  + 从上至下，首先遇见 `new Promise`，执行构造函数中的代码，输出`1`
  + 然后遇见`resolve('success')`，将`promise`的状态修改为`resolve`并且将值保存下来，继续执行同步代码，输出`2`
  + 跳出`promise`构造函数，遇见`then`这个微任务，将其加入微任务队列
  + 执行同步代码，输出`4`
  + 本轮宏任务执行完毕，然后检查微任务队列，发现`then`这个微任务并且状态是`resolve`，执行这个微任务
  
结果：
```js
1
2
4
3
```  
### 1.3 题目三
```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  console.log(2);
});
promise.then(() => {
  console.log(3);
});
console.log(4);
```  
执行过程分析：
  + 这个题目和题目二类似，但是没有`resolve`和`reject`
  + 所以`then`这个微任务不会被执行
  
执行结果：
```js
1
2
4
```  
### 1.4 题目四
```js
const promise1 = new Promise((resolve, reject) => {
  console.log('promise1')
  resolve('resolve1')
})
const promise2 = promise1.then(res => {
  console.log(res)
})
console.log('1', promise1);
console.log('2', promise2);
```  
执行过程分析：
  + 从上至下，遇见`new Promise`，执行其中的构造函数，输出`promise1`
  + 遇见`resolve('resolve1')`，将`promise`的状态修改为`resolve`并将值保存
  + 跳出`promise`，遇见`promise1.then`这个微任务，将其加入微任务队列，继续往下走
  + 输出`1`和`promise1`，且`promise1`的状态是`resolve`
  + 输出`2`和`promise2`，且`promise2`的状态是`pending`
  + 本轮宏任务执行完毕，检查微任务队列，发现了`promise1.then`微任务，执行它
  
执行结果：
```js
promise1
1 Promise{<resolved>: "resolve1"}
2 Promise{<pending>}
resolve1
```  
### 1.5 题目五
```js
const fn = () => (new Promise((resolve, reject) => {
  console.log(1);
  resolve('success')
}))
fn().then(res => {
  console.log(res)
})
console.log('start')
```  
先不看答案，想一下，会先打印`start`吗?

看仔细一下下哦， `fn`函数式直接返回了一个`new Promise`，`fn`函数是在`start`之前调用的，所以`new Promise`会在`start`之前执行

执行结果：
```js
1
start
success
```  
### 1.6 题目六
把`fn`放在`start`后面
```js
const fn = () =>
  new Promise((resolve, reject) => {
    console.log(1);
    resolve("success");
  });
console.log("start");
fn().then(res => {
  console.log(res);
});
```  
现在`start`就先打印出来了，因为`fn`是后执行的

**注意**：我们得注意`new Promise`是不是被包裹在函数当中，如果是的话，只有在函数调用的时候才会执行。

执行结果：
```js
start
1
success
```
## 2.当Promise遇见setTimeout
### 2.1 题目一
```js
console.log('start')
setTimeout(() => {
  console.log('time')
})
Promise.resolve().then(() => {
  console.log('resolve')
})
console.log('end')
```  
执行过程分析：
 + 刚开始，整个脚本作为一个宏任务执行，同步代码直接压栈执行，先打印`start`
 + 遇见`setTimeout`，作为下一个宏任务被放入宏任务队列
 + `Promise.then`作为微任务放入微任务队列
 + 输出`end`
 + 检查微任务队列，发现`Promise.then`且状态是`resolve`，所以执行，输出`resolve`
 + 本轮任务执行完毕，执行下一个宏任务，发现了`setTimeout`，执行，输出`time`

执行结果：  

```js
start
end
resolve
time
```  
### 2.2 题目二
```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);
  console.log(2);
});
promise.then((res) => {
  console.log(res);
});
console.log(4);
```  
执行过程分析：
  + 从上至下，先执行`new Promise`构造函数，输出`1`
  + 遇见`setTimeout`，作为下一个宏任务加入宏任务队列
  + 继续执行，输出`2`
  + 然后跳出`promise`，遇见`promise.then`，但是状态是`pending`状态，先不执行
  + 继续执行，输出`4`
  + 本轮任务执行完毕，执行下一个宏任务，输出`timerStart`
  + 将`promise`的状态修改为`resolve`,将值保存并推入微任务队列
  + 继续执行，输出`timerEnd`
  + 然后检查微任务队列，发现`promise.then`，执行，输出`success`
  
执行结果为：
```js
1
2
4
timerStart
timerEnd
success
```  
### 2.3 题目三
题目三有俩个题目，看起来都差不多，不过结果却不一样，可以先猜一下结果
#### 2.3.1
```js
setTimeout(() => {
  console.log('timer1');
  setTimeout(() => {
    console.log('timer3')
  }, 0)
}, 0)
setTimeout(() => {
  console.log('timer2')
}, 0)
console.log('start')
```  
#### 2.3.2
```js
setTimeout(() => {
  console.log('timer1');
  Promise.resolve().then(() => {
    console.log('promise')
  })
}, 0)
setTimeout(() => {
  console.log('timer2')
}, 0)
console.log('start')
```  
执行结果：
```js
start
timer1
timer2
timer3
```  
和  
```js
start
timer1
promise
timer2
```  
乍一看，只是把第一个题目中定时器换了  
一个是定时器`timer3`, 一个`Promise.then`  
但是他们的执行顺序是不一样的，`timer3`在`timer2`之后执行，而`Promise.then`在`timer2`之前执行  
因为`Promise.then`是微任务，会被加入到本轮任务的微任务列表，但是`timer3`是宏任务，是作为下一个宏任务加入宏任务列表  
### 2.3 题目三
```js
Promise.resolve().then(() => {
  console.log('promise1');
  const timer2 = setTimeout(() => {
    console.log('timer2')
  }, 0)
});
const timer1 = setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(() => {
    console.log('promise2')
  })
}, 0)
console.log('start');
```
这道题稍微复杂了一些，`promise.then`中包含了`setTimeout`，`setTimeout`中又包含了`promise.then`  
不过分解一下，还是很容易理解的  
执行过程分析：
  + 从上至下，首先遇见`promise.resolve().then`，因为是直接`resolve`的，所以加微任务,假如这个微任务记为**微1**
  + 然后遇见`setTimeout`，作为下一个宏任务加入宏任务列表，假如这个宏任务记为**宏1**
  + 同步输出`start`
  + 然后检查微任务列表，发现`promise.then`（**微1**），执行它，输出`promise1`
  + 然后又发现`setTimeout2`，作为下下个宏任务，加入宏任务列表，记为**宏2**
  + 然后本轮任务执行完毕，执行下一个宏任务（**宏1**），
  + 输出`timer1`
  + 然后又遇见`promise.resolve().then`，加入微任务列表，记为**微2**
  + **宏1**执行完毕，检查微任务队列，发现**微2**，执行，输出`promise2`
  + 然后执行下一轮宏任务，**宏2**执行，输出`timer2`

执行结果为：
```js
start
promise1
timer1
promise2
timer2
```  
### 2.4 题目四
```js
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
})
const promise2 = promise1.then(() => {
  throw new Error('error!!!')
})
console.log('promise1', promise1)
console.log('promise2', promise2)
setTimeout(() => {
  console.log('promise1', promise1)
  console.log('promise2', promise2)
}, 2000)
```  
执行过程分析：
  + 从上至下，先执行`new Promise`的构造函数，遇见`setTimeout`，作为下一个宏任务，加入宏任务队列
  + 然后遇见`promise1.then`,但是`promise`的状态是`pending`，暂不执行
  + `promise2`是一个状态为`pending`的`promise`
  + 输出`promise1`，打印的`promise1`的状态为`pending`
  + 输出`promise2`，打印的`promise2`的状态为`pending`
  + 遇见第二个`setTimeout`，作为下下个宏任务加入宏任务队列
  + 第一轮宏任务执行完毕，执行下一个宏任务，将`promise1`的状态修改为`resolved`，将值保存并加入微任务队列
  + 然后这一轮的宏任务也执行完毕，检查微任务队列，发现了`promise1.then`，执行，抛出一个`Error`,将`promise2`的状态修改为`rejected`
  + 然后继续执行下一个宏任务，就是第二个定时器
  + 输出`promise1`,打印`promise1`的状态为`resolved`
  + 输出`promise2`,打印`promise2`的状态为`rejected`  
  
执行结果为：
```js
promise1 Promise{<pending>}
promise2 Promise{<pending>}
Uncaught (in promise) Error: error!!!
promise1 Promise{<resolved>: "success"}
promise2 Promise{<rejected>: Error: error!!!}
```  
### 2.5 题目五
弄懂了题目四之后，这道题应该很快就可以答出来  
```js
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("success");
    console.log("timer1");
  }, 1000);
  console.log("promise1里的内容");
});
const promise2 = promise1.then(() => {
  throw new Error("error!!!");
});
console.log("promise1", promise1);
console.log("promise2", promise2);
setTimeout(() => {
  console.log("timer2");
  console.log("promise1", promise1);
  console.log("promise2", promise2);
}, 2000);
```  
执行结果：
```js
promise1里的内容
promise1 Promise{<pending>}
promise2 Promise{<pending>}
timer1
Uncaught (in promise) Error: error!!!
timer2
promise1 Promise{<resolved>: "success"}
promise2 Promise{<rejected>: Error: error!!!}
```  
## 3.Promise中的catch、then、finally
### 3.1 题目一
```js
const promise = new Promise((resolve, reject) => {
  resolve("success1");
  reject("error");
  resolve("success2");
});
promise
.then(res => {
    console.log("then: ", res);
  }).catch(err => {
    console.log("catch: ", err);
  })
```  
结果：
```js
then success1
```  
原因：`Promise`的状态只能改变一次，多余的改变并没有任何作用

### 3.2 题目二
```js
const promise = new Promise((resolve, reject) => {
  reject("error");
  resolve("success2");
});
promise
.then(res => {
    console.log("then1: ", res);
  }).then(res => {
    console.log("then2: ", res);
  }).catch(err => {
    console.log("catch: ", err);
  }).then(res => {
    console.log("then3: ", res);
  })
```  
结果：
```js
catch：error
then3：undefined
```  
`catch`会被打印出来，至于`then3`也会被打印出来是因为`catch`也会返回一个`promise`，但是`catch`中没有返回值，所以是`undefined`
### 3.3 题目三
```js
Promise.resolve(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    return 3;
  })
  .then(res => {
    console.log(res);
  });
```  
结果：
```js
1
2
```  
`Promise`可以链式调用，不过`promise`每次调用`.then`或者 `.catch` 都会返回一个新的 `promise`，从而实现了链式调用
上面的输出结果之所以依次打印出1和2，那是因为`resolve(1)`之后走的是第一个`then`方法，并没有走`catch`里，所以第二个`then`中的`res`得到的实际上是第一个`then`的返回值。
且`return 2`会被包装成`resolve(2)`
### 3.4 题目四
把上一题中的`resolve(1)`换成`reject(1)`
```js
Promise.reject(1)
  .then(res => {
    console.log(res);
    return 2;
  })
  .catch(err => {
    console.log(err)
    return 3;
  })
  .then(res => {
    console.log(res);
  });
```  
结果：
```js
1
3
```  
结果打印的当然是 `1` 和 `3`啦，因为`reject(1)`此时走的就是`catch`，且第二个`then`中的`res`得到的就是`catch`中的返回值
### 3.5 题目五
```js
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('timer')
    resolve('success')
  }, 1000)
})
const start = Date.now();
promise.then(res => {
  console.log(res, Date.now() - start)
})
promise.then(res => {
  console.log(res, Date.now() - start)
})
```  
执行结果：
```js
timer
success 1001
success 1002
```
`Promise` 的 `.then` 或者 `.catch` 可以被调用多次，但这里 `Promise` 构造函数只执行一次。或者说 `promise` 内部状态一经改变，并且有了一个值，那么后续每次调用 `.then` 或者 `.catch` 都会直接拿到该值
### 3.6 题目六
```js
Promise.resolve().then(() => {
  return new Error('error!!!')
}).then(res => {
  console.log("then: ", res)
}).catch(err => {
  console.log("catch: ", err)
})
```

在这里，刚开始可能会错误的认为`Error`会被`catch`捕获，但是其实不会的，因为返回任意一个非 `promise` 的值都会被包裹成 `promise` 对象，因此这里的`return new Error('error!!!')`也被包裹成了`return Promise.resolve(new Error('error!!!'))`,所以走的是`then`里面，输出
```js
then Error: error!!!
```
如果想抛出一个错误的话，可以用下面的写法   
```js
return Promise.reject(new Error('error!!!'))
// 或者
throw new Error('error!!!')
```
### 3.7 题目七
```js
const promise = Promise.resolve().then(() => {
  return promise;
})
promise.catch(console.err)
```
`then`和`catch`不能返回`promise`本身，否则会造成死循环
所以这里会报错
```js
Uncaught (in promise) TypeError: Chaining cycle detected for promise #<Promise>
```
### 3.8 题目八
```js
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log)
```
这道题看起来挺简单，但是不注意的话还是会被迷惑住，这道题的知识点就是`then`或者`catch`的期望参数是一个函数，如果不是的话就会发生值穿透的情况  
第一个`then`中是一个`number`类型，第二个是`then`中是`object`类型，所以值穿透，直接把`resolve(1)`的值传到最后一个`then`里面
执行结果：
```js
1
```
### 3.9 题目九
```js
Promise.reject('err!!!')
  .then((res) => {
    console.log('success', res)
  }, (err) => {
    console.log('error', err)
  }).catch(err => {
    console.log('catch', err)
  })
```
执行结果:
```js
error err!!!
```
它进入的是`then`的第二个参数，如果把第二参数去掉，就会进入`catch`中，接着看下面的案例：
```js
Promise.resolve()
  .then(function success (res) {
    throw new Error('error!!!')
  }, function fail1 (err) {
    console.log('fail1', err)
  }).catch(function fail2 (err) {
    console.log('fail2', err)
  })
```
`Promise`调用的是`resolve`，所以会进入`then`中，在`then`里面有，又抛出了一个错误，这个错误会被`catch`给捕捉到，而不是进入`fail1`中  
所以结果是：
```js
faile2 Error: error!!!
```
### 3.10 题目十
接着看下`finally`，它的特点是
  + `finally`不管`promise`的结果如何都会执行
  + `finally`的回调中不接收任何参数，所以我们在`finally`中是没法知道`promise`的状态是`resolve`还是`reject`的
  + 它默认返回上一次的`promise`值，但是如果是抛出的是一个异常，则返回异常的`promise`对象
  
看个例子：
```js
Promise.resolve('1')
  .then(res => {
    console.log(res)
  })
  .finally(() => {
    console.log('finally')
  })
Promise.resolve('2')
  .finally(() => {
    console.log('finally2')
  	return '我是finally2返回的值'
  })
  .then(res => {
    console.log('finally2后面的then函数', res)
  })
```
两个`finally`都会执行，所以执行结果为：
```js
1
finally2
finally
finally2后面的then函数 2
```
因为它默认返回上一次的`promise`值，所以打印`2`，而不是`我是finally2返回的值`，至于为什么`finally2`会在`finally`之前打印，看下面例子的解析
我们先看下`finally`中抛出一个异常会是怎样的
```js
Promise.resolve('1')
  .finally(() => {
    console.log('finally1')
    throw new Error('我是finally中抛出的异常')
  })
  .then(res => {
    console.log('finally后面的then函数', res)
  })
  .catch(err => {
    console.log('捕获错误', err)
  })
```
执行结果为:
```js
finally1
捕获错误 Error: 我是finally中抛出的异常
```
我们来看下一个稍微复杂一点的例子：
```js
function promise1 () {
  let p = new Promise((resolve) => {
    console.log('promise1');
    resolve('1')
  })
  return p;
}
function promise2 () {
  return new Promise((resolve, reject) => {
    reject('error')
  })
}
promise1()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('finally1'))

promise2()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .finally(() => console.log('finally2'))
```
执行过程分析：
  + 首先定义了两个函数`promise1`和`promise2`
  + 执行`promise1`函数，进入函数体中，执行`new Promise`的构造函数，打印`promise1`
  + 然后将`p`的状态修改为`resolve`，跳出`promise`，然后`promise1`函数已经执行完成，跳出函数
  + 遇见`promise1.then`并且状态是`resolve`，所以将其推入微任务队列（**微1**），由于`then`本身是一个微任务，他后面的链式调用需要等待这个微任务完成之后才会执行，所以先不管后面的调用
  + 然后执行`promise2`函数，进入函数体，执行`new Promise`构造函数
  + 将`promise2`的状态修改为`reject`
  + 跳出`promise2`函数，遇见了`promise2.catch`，将其加入微任务队列（**微2**）
  + 至此，宏任务已经执行完毕，检查微任务队列，发现`promise1.then`执行，打印`1`,然后遇见了`finally`，将其加入微任务队列（**微3**）
  + 继续执行**微2**，打印`error`，然后又遇见`finally`，将其加入微任务队列(**微4**)
  + 然后继续执行**微3**和**微4**
  
所以执行结果为：
```js
promise1
1
error
finally1
finally2
```
这道题可以理解为**链式调用**后面的任务需要等待前一个调用完才会执行
就像是这里的`finally`会等`promise1.then`执行完才会将`finally`加入微任务队列，其实如果这道题中你把`finally`换成是`then`也是同样的
```js
function promise1 () {
  let p = new Promise((resolve) => {
    console.log('promise1');
    resolve('1')
  })
  return p;
}
function promise2 () {
  return new Promise((resolve, reject) => {
    reject('error')
  })
}
promise1()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .then(() => console.log('finally1'))

promise2()
  .then(res => console.log(res))
  .catch(err => console.log(err))
  .then(() => console.log('finally2'))
```
## 4.Promise中的all和race
先来了解一下`Promise.all()`和`Promise.race()`的用法。
通俗来说，`.all()`的作用是接收一组异步任务，然后并行执行异步任务，并且在所有异步操作执行完后才执行回调。
`.race()`的作用也是接收一组异步任务，然后并行执行异步任务，只保留取第一个执行完成的异步操作的结果，其他的方法仍在执行，不过执行结果会被抛弃。
### 4.1 题目一
我们知道如果定义一个`Promise`，它的`executor`函数会立即执行，就像这样：
```js
const p = new Promise(r => console.log('run now'))
```
控制台就会立即打印出`run now`  
为了控制它什么时候被执行，我们一般把它包裹在一个函数中，当我们执行这个函数的时候，它才会被执行，例如这样：
```js
function run() {
  return new Promise(r => console.log('run now'))
}
run() // 调用的时候执行
```  
现在构建一个这样子的函数：
```js
function runAsync(x) {
  return new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
}
```
该函数传入一个值`x`，然后一秒后打印这个值`x`
我们使用`all`来执行
```js
Promise.all([runAsync(1), runAsync(2), runAsync(3)])
.then(res => {
  console.log(res)
})
```
会打印出什么呢？当你观察控制台的时候，会发现，一秒后同时打印出`1, 2, 3`还有一个数组`[1, 2, 3]`
所以，**有了all，你就可以并行执行多个异步操作，并且在一个回调中处理所有的返回数据。**这句话应该就不难理解了
`.all`后面的`.then`里的回调函数接收的就是所有异步操作的结果  
而且这个结果数组的顺序和传入的数组顺序一致
### 4.2 题目二
新增一个`runReject`函数，用来在`1000*x`秒后`reject`一个错误
同时`.catch`函数能够捕获到`.all`里最先的那个异常，并且只执行一次。
那么下面这道题应该输出什么呢?
```js
function runAsync (x) {
  return new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
}
function runReject (x) {
  return new Promise((res, rej) => setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x))
}
Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then(res => console.log(res))
  .catch(err => console.log(err))
```
执行结果：
```js
// 1秒后输出
1
3
// 2秒后输出
2
Error: 2
// 4秒后输出
4
```
没错，`catch`会捕获最先的那个异常，这里是`runReject(2)`的结果
一组异步任务中，有一个异常，都不会进入`then`的第一个参数中，注意，为什么不说是不进入`.then`中呢 🤔️？
因为`.then`方法的第二个参数也是可以捕获错误的：
```js
Promise.all([runAsync(1), runReject(4), runAsync(3), runReject(2)])
  .then(res => console.log(res), 
  err => console.log(err))
```