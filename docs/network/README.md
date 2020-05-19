---
title: 浏览器相关
sidebarDepth: 2
---
## 1.关于浏览器缓存
缓存是性能优化中非常重要的一个环节。浏览器中缓存分为：
  + 强缓存
  + 协商缓存

### 1.1 强缓存
浏览器中的缓存分为两种情况，一种是需要发送`http`请求，一种是不需要发送
首先检查强缓存，这个阶段不需要发送请求  
但是要怎么检查呢？通过字段来检查，`http/1.0`和`http/1.1`,检查的字段是不太一样的，在`http/1.0`时期，检查的是`Expires`，`http/1.1`中检查的是`Cache-Control`

#### Expires
`expires`表示过期时间，存在于服务器返回的响应头中，告诉浏览器在这个时间过期之前可以直接从缓存中获取数据，不需要发送请求，比如：
```js
Expires: Wed, 22 Oct 2018 08:41:00 GMT
```
表示资源在`2019年11月22号8点41分`过期，过期了就得向服务端发请求

这其中存在一个问题，就是客户端的时间和服务端的时间可能存在差异，那么这个时间就是不准确的，所以在`http/1.1`中，这种方式就被抛弃了

#### Cache-Control

`http/1.1`中采用这个`Cache-Control`这个字段，也是存在于服务器返回的响应头中，不过它并没有具体的过期时间，而是采用的过期时长来控制缓存有效时间，对应字段是`max-age`,例如：
```js
Cache-Control:max-age=3600
```
这个意思代表着在3600秒，也就是一个小时内可以直接使用缓存中的数据而不用发送请求  
它还有其他的属性  
  + `public`：客户端和服务端都可以缓存。一个请求可能会经过很多个代理服务器，才会到达目标服务器，这种情况下，中间的代理服务器也可以缓存
  + `private`: 只有浏览器可以缓存，中间的代理服务器不能缓存
  + `no-cache`：跳过当前缓存，发送`http`请求，直接进入协商缓存阶段
  + `no-store`：不进行任何的缓存
  + `s-maxage`：同`max-age`作用一样，只在代理服务器中生效，它的优先级会高于`max-age`，如果存在`s-maxage`，则会覆盖掉`max-age`和`Expires`

当`Expires`和`Cache-Control`同时存在的时候，会优先考虑`Cache-Control`  
当资源缓存超时了，也就是`强缓存`失效了，接下来就会进入到**协商缓存**
### 1.2 协商缓存
强缓存失效后，浏览器在请求头中携带相应的`tag`来向服务器发送请求，由服务器根据这个`tag`来决定是否使用缓存，这个就是**协商缓存**  
缓存的`tag`分为两种，一种是`Last-Modified`和`Etag`

#### Last-Modified
即最后修改时间。在浏览器第一次给服务器发送请求后，服务器会在响应头中加上这个字段  
浏览器接收到后，如果再次请求，会带上`If-Modified-Since`字段，值也就是服务器传来的最后修改时间  
服务器拿到请求头中的`If-Modified-Since`字段后，会和服务器中`该资源的最后修改时间`作对比：
  + 如果请求头中的时间小于最后修改时间，说明更新了，返回新的资源，跟常规的`HTTP`一样
  + 否则返回`304`，告诉浏览器直接使用缓存

#### ETag
`ETag`是服务器根据当前文件的内容，给文件生成的唯一标识，只要文件改动，这个值就会发生变化，服务器通过`响应头`把这个值传递个浏览器  
浏览器拿到这个`ETag`的值之后，会在下次请求中带上`If-None-Match`字段，值就是接收的`ETag`的值，发给服务器  
服务器接收到`If-None-Match`字段，和服务器上资源的`ETag`进行比较，
  + 如果不一样，说明资源更新了，返回新的资源
  + 否则返回304，告诉浏览器直接使用缓存

#### Last-Modified和ETag比较
  1. 精准度上，`ETag`优于`Last-Modified`，优于 ETag 是按照内容给资源上标识，因此能准确感知资源的变化。而 Last-Modified 就不一样了，它在一些特殊的情况并不能准确感知资源变化，主要有两种情况:
      + 编辑了资源文件，但是内容并没有修改，会造成缓存失效
      + `Last-Modified`能够感知的时间是秒，如果在`1s`内改变了很多次，这个时候它就不能体现出具体的修改
  2. 性能上，`Last-Modified`优于`ETag`，因为`Last-Modified`只是记录一个时间，而`ETag`需要根据文件内容生成哈希值
如果两种方式都支持的话，服务器会优先考虑`ETag`

## 2.浏览器本地存储
浏览器本地存储主要有：
  + `Cookie`
  + `WebStorage`
    + `sessionStorage`
    + `localStorage`
  + `IndexedDB`

### Cookie
`Cookie`是在浏览器里面存储一个很小的文本文件，内部以键值对的方式存储，向同一域名下发送请求，都会携带相同的`Cookie`，服务器拿到`Cookie`进行解析，便可以拿到客户端的状态，它就是用来做**状态存储**的，但是它有一些缺陷
  + 容量缺陷，只能存储`4kb`大小的信息
  + 性能缺陷，同域名下的所有请求都会自动带上完整的`Cookie`信息，即使这个请求不需要，如果请求数量很多很多的话，就会造成一定的性能浪费
  + 安全缺陷，`Cookie`在浏览器和服务器之间的的传输形式是纯文本的，容易被非法用户截获，然后篡改，然后在`Cookie`有效期内在发送给服务器，这样是非常危险的，还有在`HttpOnly`为`false`的情况下，`Cookie`中的信息是可以通过`JS`脚本进行读取的。

### localStorage
`localStorage`和`Cookie`类似，针对同一域名，在同一域名下，存储相同的一段`localStorage`  

不过它相对于`Cookie`来说，有一定的区别
  + 容量上，`localStorage`的存储容量上限为`5M`
  + 时间上，对于同一域名，如果不手动删除，理论上是一直存在的，也就是说是**持久存储**的
  + 因为不需要和服务端进行通信，所以没有了`Cookie`带来的**安全问题**和**性能问题**
  + 操作非常方便，它本身带有`setItem`和`getItem`等方法，我们只需要调用这些方法对其进行操作

举个例子：
```js
const people = {name: '星光', age: 18}
localStorage.setItem('people', JSON.stringify(people))
```
接下在同域名下获取和移除也是非常简单的
```js
// 获取
const peopleStr = localStorage.getItem('people')
const peopleFromLocal = JSON.parse(peopleStr) // {name: "星光", age: 18}
// 移除
localStorage.removeItem('people')
const peopleInfo = localStorage.getItem('people') // null
```
可以看到，它只能存储字符串，通过`JSON.stringify()`方法把对象转出字符串，通过`JSON.parse()`解析成对象

### sessionStorage
`sessionStorage`和`localStorage`基本一样，
  + 容量上限为`5M`
  + 只存在于客户端，不与服务端进行通信
  + 操作方式与`localStorage`一致

但是`sessionStorage`和`localStorage`有个本质的区别，就是`sessionStorage`是会话级别的存储，不是持久性存储，当会话结束，也就是页面被关闭之后，存储在`sessionStorage`中的信息就不在了

### IndexedDB
`IndexedDB`是运行在浏览器端的`非关系型数据库`，存储容量理论上是没有上限的  
有一些需要注意的点
  + 采用`键值对`进行存储
  + 受浏览器同源策略
  + 异步操作，数据库的读写属于I/O，浏览器中对异步I/O提供了支持, 异步设计是为了防止大量数据的读写，拖慢网页的表现。

总结一下：
  + `Cookie`并不适合存储
  + `localStorage`和`sessionStorage`不会与服务端通信
  + `IndexedDB`是运行在浏览器端的数据库，为大型数据的存储提供了接口