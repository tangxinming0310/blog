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

### 4.3 题目三
`.race`方法，`race`是什么意思呢？竞赛，赛跑的意思，所以，使用`.race`，他会取最先执行完成的那个结果，其他的异步任务不会停止，但是结果会被抛弃
看下面这个题：
```js
function runAsync (x) {
  return new Promise(r => setTimeout(() => r(x, console.log(x)), 1000))
}
Promise.race([runAsync(1), runAsync(2), runAsync(3)])
  .then(res => console.log('result: ', res))
  .catch(err => console.log(err))
```
会输出什么呢？好吧，结果是：
```js
1
result: 1
2
3
```
### 4.4 题目四
在看下一个
```js
function runAsync(x) {
  return new Promise(r =>
    setTimeout(() => r(x, console.log(x)), 1000)
  );
}
function runReject(x) {
  return new Promise((res, rej) =>
    setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x)
  );
}
Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
  .then(res => console.log("result: ", res))
  .catch(err => console.log(err));
```
当遇见异常的时候，也是一样的，这里`runReject(0)`最先执行完成，所以进入了`catch`中
```js
0
Error: 0
1
2
3
```
最后，总结一下`all`和`race`
  + `all`接受一组异步任务作为参数，然后并行执行任务，当所以结果都返回后执行回调
  + `race`也是接收一组参数作为异步任务，并行执行，但是只会取第一个完成的任务的结果，其它任务不会被打断，但是结果会被抛弃
  + `promise.all`结果数组的顺序和接收数组的顺序一致
  + `all`和`race`传入的数组中如果有会抛出异常的异步任务，那么只有最先抛出的错误会被捕获，并且是被`then`的第二个参数或者后面的`catch`捕获；但并不会影响数组中其它的异步任务的执行。
## 5.关于async和await
既然说了`promise`，肯定也要说一下`async`和`await`，在很多时候async和Promise的解法差不多，又有些不一样。
### 5.1 题目一
```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
async1();
console.log('start')
```
结果是什么呢？
```js
async1 start
async2
start
async1 end
```

过程分析：
  + 先创建了俩个函数，然后执行`async1`函数，进入函数体，打印`async1 start`
  + 遇见`await async2()`，`await`会阻塞后面代码的运行，所以先执行`async2`里面的内容，打印出`async2`
  + 跳出函数体，继续走，输出`start`
  + 在一轮宏任务执行完毕后，在执行刚刚`await`后面的内容，输出`aync1 end`
这里我们可以这样理解，紧跟着`await`后面的语句和`new Promise`一样，下一行及以后的语句，相当于`promise.then`里面的内容，让我们转换一下代码
```js
async function async1() {
  console.log("async1 start");
  // await async2();
  // console.log("async1 end");
  new Promise(resolve => {
    console.log("async2");
    resolve()
  }).then(() => {
    console.log("async1 end");
  })
}
async function async2() {
  console.log("async2");
}
async1();
console.log('start')
```
代码执行结果是一致的
我们在对这个代码做一个小小的改动
```js
async function async1() {
  console.log("async1 start");
  new Promise(resolve => {
    console.log("promise");
    resolve()
  })
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
async1();
console.log('start')
```
结果就有点小小的不一样了
```js
async1 start
promise
async1 end
start
```
我们可以看到，`new Promise`并不会阻塞代码的执行
### 5.2 题目二
`async`结合`setTimeout`
```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  setTimeout(() => {
    console.log('timer')
  }, 0)
  console.log("async2");
}
async1();
console.log("start")
```
结果会是怎样的呢？
```js
async1 start
async2
start
async1 end
timer
```
`setTimeout`是最后执行的，因为它会被放在下一次宏任务执行
### 5.3 题目三
多加几个`setTimeout`呢
```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log('timer1')
  }, 0)
}
async function async2() {
  setTimeout(() => {
    console.log('timer2')
  }, 0)
  console.log("async2");
}
async1();
setTimeout(() => {
  console.log('timer3')
}, 0)
console.log("start")
```
执行结果又会是什么呢？应该很快就可以做出来，答案是：
```js
async1 start
async2
start
async1 end
timer2
timer3
timer1
```
这个题目有很多个定时器，但是定时器谁先执行，只需要关注谁先被调用的以及延迟时间是多少，这道题中延迟时间都是0，所以只要关注谁先被调用的
### 5.4 题目四
正常情况下，`async`中的`await`命令是一个`Promise`对象，返回该对象的结果。

但如果不是`Promise`对象的话，就会直接返回对应的值，相当于`Promise.resolve()`
```js
async function fn () {
  // return await 1234
  // 等同于
  return 123
}
fn().then(res => console.log(res))
```
结果：
```js
123
```
### 5.5 题目五
```js
async function async1 () {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => console.log(res))
console.log('srcipt end')
```
这道题目有个小坑，结果是什么呢？
```js
srcipt start
async1 start
promise1
srcipt end
```
因为`new Promise`中没有`resolve`，也没有`reject`，所以`await`就等不到它要的结果，他就一直处于等待状态，所以后面的代码都不会执行，`then`里面的也不会执行
### 5.6 题目六
给上面的代码加一个`resolve`
```js
async function async1 () {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
    resolve('success')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => console.log(res))
console.log('srcipt end')
```
现在`promise`状态被改变了，有返回值了，所以结果是
```js
srcipt start
async1 start
promise1
srcipt end
async1 success
async1 end
```
### 5.7 题目七
```js
async function async1 () {
  console.log('async1 start');
  await new Promise(resolve => {
    console.log('promise1')
    resolve('promise resolve')
  })
  console.log('async1 success');
  return 'async1 end'
}
console.log('srcipt start')
async1().then(res => {
  console.log(res)
})
new Promise(resolve => {
  console.log('promise2')
  setTimeout(() => {
    console.log('timer')
  })
})
```
这道题也不难，但是有个注意点，就是`new Promise`里面的`resolve`和`async1.then`是没有关系的
所以结果是
```js
srcipt start
async1 start
promise1
promise2
async1 success
async1 end
timer
```
### 5.8 题目八
下面这道题，应该很快就可以给出答案，不信你看
```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");

setTimeout(function() {
  console.log("setTimeout");
}, 0);

async1();

new Promise(function(resolve) {
  console.log("promise1");
  resolve();
}).then(function() {
  console.log("promise2");
});
console.log('script end')
```
结果是
```js
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```
### 5.9 题目九
在来看一道
```js
async function testSometing() {
  console.log("执行testSometing");
  return "testSometing";
}

async function testAsync() {
  console.log("执行testAsync");
  return Promise.resolve("hello async");
}

async function test() {
  console.log("test start...");
  const v1 = await testSometing();
  console.log(v1);
  const v2 = await testAsync();
  console.log(v2);
  console.log(v1, v2);
}

test();

var promise = new Promise(resolve => {
  console.log("promise start...");
  resolve("promise");
});
promise.then(val => console.log(val));

console.log("test end...");
```
结果
```js
test start...
执行testSometing
promise start...
test end...
testSometing
执行testAsync
promise
hello async
testSometing hello async
```
## 6.async处理异常
### 6.1 题目一
在`async`中，如果`await`后面是一个异常，又是怎样的情况呢?
```js
async function async1 () {
  await async2();
  console.log('async1');
  return 'async1 success'
}
async function async2 () {
  return new Promise((resolve, reject) => {
    console.log('async2')
    reject('error')
  })
}
async1().then(res => console.log(res))
```
这道题目里面，`await`等待的是一个`reject`
**如果在async函数中抛出了错误，则终止错误结果，不会继续向下执行。**
所以答案是
```js
async2
Uncaught (in promise) error
```
当然，`throw new Error`也是一样的
```js
async function async1 () {
  console.log('async1');
  throw new Error('error!!!')
  return 'async1 success'
}
async1().then(res => console.log(res))
```
结果：
```js
async1
Uncaught (in promise) Error: error!!!
```
### 6.2 题目二
对于上面题目中的错误，我们可以使用`try catch`来捕获
```js
async function async1 () {
  try {
    await Promise.reject('error!!!')
  } catch(e) {
    console.log(e)
  }
  console.log('async1');
  return Promise.resolve('async1 success')
}
async1().then(res => console.log(res))
console.log('script start')
```
结果
```js
script start
error!!!
async1
async1 success
```
## 7.综合联系题
我们把上面的知识点都串起来看一看
### 7.1 题目一
```js
const first = () => (new Promise((resolve, reject) => {
    console.log(3);
    let p = new Promise((resolve, reject) => {
        console.log(7);
        setTimeout(() => {
            console.log(5);
            resolve(6);
            console.log(p)
        }, 0)
        resolve(1);
    });
    resolve(2);
    p.then((arg) => {
        console.log(arg);
    });
}));
first().then((arg) => {
    console.log(arg);
});
console.log(4);
```
过程分析：
  + 第一段代码定义的是一个函数，所以我们得看看它是在哪执行的，发现它在`4`之前，所以可以来看看`first`函数里面的内容了。
  + 函数`first`返回的是一个`new Promise()`，因此先执行里面的同步代码`3`
  + 接着又遇到了一个`new Promise()`，直接执行里面的同步代码`7`
  + 执行完`7`之后，在`p`中，遇到了一个定时器，先将它放到下一个宏任务队列里不管它，接着向下走
  + 碰到了`resolve(1)`，这里就把`p`的状态改为了`resolved`，且返回值为`1`，不过这里也先不执行
  + 跳出`p`，碰到了`resolve(2)`，这里的`resolve(2)`，表示的是把`first`函数返回的那个`Promise`的状态改了，也先不管它。
  + 然后碰到了`p.then`，将它加入本次循环的微任务列表，等待执行
  + 跳出`first`函数，遇到了`first().then()`，将它加入本次循环的微任务列表(`p.then`的后面执行)
  + 然后执行同步代码`4`
  + 本轮的同步代码全部执行完毕，查找微任务列表，发现`p.then`和`first().then()`，依次执行，打印出`1`和`2`
  + 本轮任务执行完毕了，发现还有一个定时器没有跑完，接着执行这个定时器里的内容，执行同步代码`5`
  + 然后又遇到了一个`resolve(6)`，它是放在`p`里的，但是`p`的状态在之前已经发生过改变了，因此这里就不会再改变，也就是说`v`相当于没任何用处，因此打印  出来的`p`为`Promise{<resolved>: 1}`

结果
```js
3
7
4
1
2
5
Promise{<resolved>: 1}
```
### 7.2 题目二
```js
const async1 = async () => {
  console.log('async1');
  setTimeout(() => {
    console.log('timer1')
  }, 2000)
  await new Promise(resolve => {
    console.log('promise1')
  })
  console.log('async1 end')
  return 'async1 success'
} 
console.log('script start');
async1().then(res => console.log(res));
console.log('script end');
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .catch(4)
  .then(res => console.log(res))
setTimeout(() => {
  console.log('timer2')
}, 1000)
```
有几个注意点哦
  + `await`后面`promise`没有改变状态的话会一直等待，后面的代码都不会被执行
  + `then`的期望参数是一个函数，不是的话会发生值穿透
  + 注意`setTimeout`的延时时间
答案
```js
script start
async1
promise1
script end
1
timer2
timer1
```
### 7.3题目三
```js
const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('resolve3');
    console.log('timer1')
  }, 0)
  resolve('resovle1');
  resolve('resolve2');
}).then(res => {
  console.log(res)
  setTimeout(() => {
    console.log(p1)
  }, 1000)
}).finally(res => {
  console.log('finally', res)
})
```
知识点：
  + `promise`的状态只能改变一次
  + `finally`不管`promise`的状态是`resolve`还是`reject`都会执行，且回调函数无法获得`promise`结果
  + 最后打印的`p1`的值为什么会是`undefined`，因为`finally`会默认返回上一个`promise`的返回值，它的上一个是`then`，而`then`并没有返回值，所以是`undefined`，如果在定时器下面加一个`return 1`,那么`p1`的值就是`1`
答案：
```js
resovle1
finally undefined
timer1
Promise{<resolved>: undefined}
```
## 8.最后看几道面试题
### 8.1 使用promise实现每间隔1秒输出1，2，3
这道题最简单的实现放式是配合`reduce`不停的在后面追加`then`
```js
const arr = [1, 2, 3]
arr.reduce((p, num) => {
  return p.then(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(num))
      }, 1000)
    })
  })
}, Promise.resolve())
```
转换一下，变成下面这个样子
```js
Promise.resolve()
  .then(resolve => {
     return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(1))
      }, 1000)
    })
  })
  .then(resolve => {
     return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(2))
      }, 1000)
    })
  })
  .then(resolve => {
     return new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(3))
      }, 1000)
    })
  })
```
每一个`then`都依赖于上一个`then`中的`new Promise`何时`resolve`了才会被执行，比如第二个`then`，它要等到`resolve(console.log(1))`执行了之后才会被执行  
那么`resolve(console.log(1))`什么时候执行呢？就是在第一个定时器(也就是一秒后)触发的时候才执行。这样就保证了后面接着的`.then()`要等前一个定时器执行完才能执行，也就是隔一秒输出

如果修改一下，变成下面这个样子
```js
const arr = [1, 2, 3]
arr.reduce((p, num) => {
  return p.then(new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(num))
      }, 1000)
    }))
}, Promise.resolve())
```
它就会在一秒钟之后顺序打印`123`
转换一下就变成这样
```js
Promise.resolve()
  .then(new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(1))
      }, 1000)
    }))
  .then(new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(2))
      }, 1000)
    }))
  .then(new Promise(resolve => {
      setTimeout(() => {
        resolve(console.log(3))
      }, 1000)
    }))
```
`then`里面传递的不是一个函数，那么就会发生值穿透的情况，发生值穿透，但是里面的代码还要执行吗？
换个例子来看一下：
```js
const p = Promise.resolve(1).then(console.log('我不关心结果'))
console.log(p)
p.then((res) => console.log(res))
```
很明显这里也发生了透传，但是`我不关心结果`也还是被打印出来了，并且由于透传，`p.then()`里获取到的`res`就是`1`，因此会打印出：
```js
'我不关心结果'
Promise{
[[PromiseStatus]]: "resolved"
[[PromiseValue]]: 1
}
1
```
第二行打印的`Promise{<pending>}`，展开之后就是上面的样子
通过这个我们知道，发生值穿透后，里面的代码还是会执行

所以
```js
.then(new Promise(r => {
    setTimeout(() => {
      r(console.log(1))
    }, 1000)
  }))
```
这里就相当于是执行一个同步代码，然后向宏任务队列中不断的加一个`1s`的延时器，由于是值穿透，所以它有没有返回已经不重要了，直接接着执行下一个`then`,同理，也是值穿透，同样执行，直到完全执行完毕  
这个时候我们的宏任务队列中有三个延时器，并且延时时间都是`1s`
所以时间到了之后就会顺序打印出`123`,因为中间的时间差非常小，所以可以忽略不记，看起来就是同时打印的一样
### 8.2 使用Promise实现红绿灯交替重复亮
红灯3秒亮一次，黄灯2秒亮一次，绿灯1秒亮一次；如何让三个灯不断交替重复亮灯？（用`Promise`实现）三个亮灯函数已经存在：
```js
function red() {
    console.log('red');
}
function green() {
    console.log('green');
}
function yellow() {
    console.log('yellow');
}
```

答案：
```js
function red() {
    console.log('red');
}
function green() {
    console.log('green');
}
function yellow() {
    console.log('yellow');
}
const light = (fn, time) => {
  return new Promise(r => {
    setTimeout(() => {
      fn()
      r()
    }, 1000 * time)
  })
}
const handler = () => {
  Promise.resolve()
    .then(() => {
      return light(red, 3)
    })
    .then(() => {
      return light(yellow, 2)
    })
    .then(() => {
      return light(green, 1)
    })
    .then(() => {
      return handler()
    })
}
handler()
```
### 8.3 实现mergePromise函数
实现mergePromise函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组data中
```js
const time = (timer) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, timer)
  })
}
const ajax1 = () => time(2000).then(() => {
  console.log(1);
  return 1
})
const ajax2 = () => time(1000).then(() => {
  console.log(2);
  return 2
})
const ajax3 = () => time(1000).then(() => {
  console.log(3);
  return 3
})

function mergePromise () {
  // 在这里写代码
}

mergePromise([ajax1, ajax2, ajax3]).then(data => {
  console.log("done");
  console.log(data); // data 为 [1, 2, 3]
});

// 要求分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]

```
答案：
```js
function mergePromise (tasks) {
  const data = []
  const p = Promise.resolve()
  tasks.forEach(task => {
    // 第一次的then为了用来调用ajax
  	// 第二次的then是为了获取ajax的结果
    p = p.then(task).then(res => {
      data.push(res)
      return data
    })
  })
  // 最后得到的promise它的值就是data
  return p
}
```
### 8.4 封装一个异步加载图片的方法
```js
// 在onload方法里面resolve就可以
function loadImg(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = function() {
      console.log('图片加载完成')
      resolve(img)
    }
    image.onerror = function() {
      reject(new Error('img load fail at' + ulr))
    }
    img.src = url
  })
}
```
### 8.6 限制异步操作的并发个数并尽可能快的完成全部

有8个图片资源的`url`，已经存储在数组`urls`中。
`urls`类似于`['https://image1.png', 'https://image2.png', ....]`
而且已经有一个函数`function loadImg`，输入一个`url`链接，返回一个`Promise`，该`Promise`在图片下载完成的时候`resolve`，下载失败则`reject`。
但有一个要求，任何时刻同时下载的**链接数量不可以超过`3`个**。
请写一段代码实现这个需求，要求**尽可能快速**地将所有图片下载完成。
```js
var urls = [
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting1.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting2.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting3.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting4.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting5.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn6.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn7.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn8.png",
];
function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      console.log("一张图片加载完成");
      resolve(img);
    };
    img.onerror = function() {
    	reject(new Error('Could not load image at' + url));
    };
    img.src = url;
  });
```
题目的意思是需要先并发请求3张图片，当一张图片加载完成后，又会继续发起一张图片的请求，让并发数保持在3个，直到需要加载的图片都全部发起请求。
用`Promise`来实现就是，先并发请求3个图片资源，这样可以得到3个`Promise`，组成一个数组`promises`，然后不断调用`Promise.race`来返回最快改变状态的`Promise`，然后从数组`promises`中删掉这个`Promise`对象，再加入一个新的`Promise`，直到全部的`url`被取完，最后再使用`Promise.all`来处理一遍数组`promises`中没有改变状态的`Promise`
```js
function limitLoad(ulrs, handler, limit) {
  let sequeue = [...urls]  // 复制urls
   // 这一步是为了初始化 promises 这个"容器"
  let promises = sequeue.splice(0, 3).map((url, index) => {
    return handler(url).then(() => {
       // 返回下标是为了知道数组中是哪一项最先完成
      return index
    })
  })
  // 利用数组的 reduce 方法来以队列的形式执行
  return promises.reduce((p, url, currentIndex) => {
    return p.then(() => {
      // 返回最快改变状态的 Promise
      return Promise.race(promises)
    })
    .then(fastIndex => {
      promises[fastIndex] = handler(sequeue[currentIndex]).then(() => {
        return fastIndex
      })
    })
    .catch(error => {
      console.error(error)
    })
  }, Promise.resolve())
  .then(() => {
    return Promise.all(promises)
  })
}
limitLoad(urls, loadImg, 3)
  .then(res => {
    console.log("图片全部加载完毕")
    console.log(res)
  })
  .catch(err => {
    console.error(err)
  })
```
