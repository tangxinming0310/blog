---
title: JSONP原理及实现
---
## 基本原理
主要是利用了`script`标签的`src`没有跨域限制来实现的  

## 执行过程
  + 前端定义一个解析函数（如：`jsonpCallback = function(res) {}`）
  + 通过`params`形式包装`script`标签的请求参数，并且申明执行函数(如：`cb=jsonpCallback`)
  + 后端获取到前端声明的执行函数（`jsonpCallback`），以带上参数且调用执行函数的放式传递给前端
  + 前端在`script`标签返回资源的时候就会去执行`jsonpCallback`并通过回调函数的放式拿到数据了

## 优缺点
优点：
  + 兼容性好，在一些古老的浏览器中都可以运行

缺点：
  + 只能发送`GET`请求

## 案列分析
在`index.html`文件中有如下代码：

```js
<script>
  window.jsonpCallback = function (res) {
    console.log(res)
  }
</script>
<script src="http://127.0.0.1:8888/api/jsonp?id=1&cb=jsonpCallback" type="text/javascript"></script>
```

在本地使用`node`搭建一个小型的测试服务器  

并且定义一个接口`/api/jsonp`来返回数据  

打开`index.html`文件时就会去加载`script`标签，并执行了这次请求

准备：
    1. 新建一个`server`文件夹
    2. 在此目录下`npm init -y`，初始化`package.json`文件
    3. 安装`koa`，`node`轻型框架
    4. 新建文件夹`src`，并且新建`index.html`和`server.js`
```js
mkdir server && cd server
npm init -y
npm install -S koa
mkdir src && cd src
touch index.html
touch server.js
```

搭建小型服务器，代码如下：
```js
const Koa  = require('koa')
const app = new Koa()
const datas = [{id: 1, name: 'aria'}, {id: 2, name: 'serio'}]

app.use(ctx => {
  if (ctx.path === '/api/jsonp') {
    const {cb, id} = ctx.query
    const name = datas.find(item => item.id == id)['name']
    ctx.body = `${cb}(${JSON.stringify({name})})`
    return
  }
})

const port = 8888

app.listen(port, () => {
  console.log('SERVER is runing at port:' + port)
})
```

然后保存，在`src`文件夹下面执行：
```js
node server.js
```  

服务启动后，我们可以看到控制台中会打印出`SERVER is runing at port: 8888`

然后我们来写`index.html`文件中的内容
```html
<script>
  window.jsonpCallback = function (res) {
    console.log(res)
  }
</script>
<script src="http://127.0.0.1:8888/api/jsonp?id=1&cb=jsonpCallback" type="text/javascript"></script>
```
这俩个`script`的意思是： 
  + 第一个，创建了一个`jsonpCallback`函数，但是没有被调用
  + 第二个，加载`src`中的资源，并等待请求的内容返回

整个过程就是：

  1. 当执行到第二个`script`的时候，由于请求了我们的`8888`端口，并且把`id`和`cb`这两个参数放到`URL`里。那么后台就可以拿到`URL`里的这两个参数。

    也就是在后端代码中的`const { id, cb } = ctx.query`这里获取到了。

  2. 后端在拿到这两个参数之后，可能就会根据`id`来进行一些查询，这里只是模拟的查询，用了一个简单的`find`来进行一个查找。查找到`id`为1的那项并且取`name`。

  3. 第二个参数`cb`，拿到的就是`"jsonpCallback"`了，这里也就是告诉后端，前端那里是会有一个叫做`jsonpCallback`的函数来接收后端想要返回的数据，而后端你只需要在返回体中写入`jsonpCallback()`就可以了。

  4. 前端在得到了后端返回的内容`jsonpCallback({"name":"aria"})`，发现里面是一段执行函数的语句，因此就会去执行第一个`script`中的`jsonpCallback`方法了，并且又是带了参数的，所以此时浏览器控制台会打印出`{ name: 'aria' }`

## 封装一个JSONP方法
### 简单版
定义一个`JSONP`方法，接收四个参数
  + url
  + params
  + callbackKey 回调函数名称
  + callback 拿到数据后执行的回调函数

```js
function JSONP({
  url,
  params = {},
  callbackKey = 'cb',
  callback
}) {
  // 定义本地callback的名称
  const callbackName = 'jsonpCallback'
  // 将这个名称加入到params中
  params[callbackKey] = callbackName
  // 将这个callback加入到window对象中，这样就可以执行这个回调了
  window[callbackName] = callback

  // 获取参数字符串'id=1&&cb=jsonpCallback'
  const paramString = Object.keys(params).map(key => {
    return `${key}=${params[key]}`
  }).join('&')

  // 创建script标签
  const script = document.createElement('script')
  script.setAttribute('src', `${url}?${paramString}`)
  document.body.appendChild(script)
}
// test
JSONP({
  url: 'http://localhost:8888/api/jsonp',
  params: { id: 1 },
  callbackKey: 'cb',
  callback(res) {
    console.log(res)
  }
})
```  

这样已经简单实现了`JSONP`，但是存在一个问题，就是当我们同时多次调用`JSONP`
```js
JSONP({
  url: 'http://localhost:8888/api/jsonp',
  params: { id: 1 },
  callbackKey: 'cb',
  callback(res) {
    console.log(res) // 1
  }
})
JSONP({
  url: 'http://localhost:8888/api/jsonp',
  params: { id: 2 },
  callbackKey: 'cb',
  callback(res) {
    console.log(res) // 2
  }
})
```

这里调用了两次`JSONP`，只是传递的参数不同。但是并不会按我们预期的在`1`和`2`中分别打印，而是都会在`2`中打印出结果。这是因为后面一个`callback`把`JSONP`里封装的第一个`callback`给覆盖了，它们都是共用的同一个`callbackName`，也就是`jsonpCallback`

### 进阶版
我们对这个方法进行一个改造:
  + 使得`callbackName`唯一
  + 不把回调挂在在`window`中，这样有可能会污染全局变量，放在`JSONP`的属性中，(`JSONP.xxx`)

```js
function JSONP({
  url,
  params = {},
  callbackKey = 'cb',
  callback
}){
  // 定义本地唯一callbackId,没有则初始化为1
  JSONP.callbackId = JSONP.callbackId || 1
  let callbackId = JSONP.callbackId
  // 把要执行的回调加入到JSONP对象中
  JSONP.callbacks = JSONP.callbacks || []
  JSONP.callbacks[callbackId] = callback
  // 将名称加入到参数中
  params[callbackKey] = `JSONP.callbacks[${callbackId}]`

  // 获取参数字符串`id=1&cb=JSONP.callbacks[1]`
  const paramString = Object.keys(params).map(key => {
    return `${key}=${params[key]}`
  }).join('&')
  // 创建script标签
  const script = document.createElement('script')
  script.setAttribute('src', `${url}?${paramString}`)
  document.body.appendChild(script)
  // id自增
  JSONP.callbackId++
}
// test
  JSONP({
    url: 'http://localhost:8080/api/jsonp',
    params: { id: 1 },
    callbackKey: 'cb',
    callback (res) {
        console.log(res)
    }
  })
  JSONP({
    url: 'http://localhost:8080/api/jsonp',
    params: { id: 2 },
    callbackKey: 'cb',
    callback (res) {
        console.log(res)
    }
  })
```

现在调用了俩次JSONP，但是会分别执行`JSONP.callbacks[1]`和`JSONP.callbacks[2]`
