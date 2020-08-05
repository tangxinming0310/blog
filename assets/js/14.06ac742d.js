(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{351:function(t,e,a){"use strict";a.r(e);var s=a(21),_=Object(s.a)({},(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h2",{attrs:{id:"_1-关于浏览器缓存"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-关于浏览器缓存"}},[t._v("#")]),t._v(" 1.关于浏览器缓存")]),t._v(" "),a("p",[t._v("缓存是性能优化中非常重要的一个环节。浏览器中缓存分为：")]),t._v(" "),a("ul",[a("li",[t._v("强缓存")]),t._v(" "),a("li",[t._v("协商缓存")])]),t._v(" "),a("h3",{attrs:{id:"_1-1-强缓存"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-强缓存"}},[t._v("#")]),t._v(" 1.1 强缓存")]),t._v(" "),a("p",[t._v("浏览器中的缓存分为两种情况，一种是需要发送"),a("code",[t._v("http")]),t._v("请求，一种是不需要发送\n首先检查强缓存，这个阶段不需要发送请求"),a("br"),t._v("\n但是要怎么检查呢？通过字段来检查，"),a("code",[t._v("http/1.0")]),t._v("和"),a("code",[t._v("http/1.1")]),t._v(",检查的字段是不太一样的，在"),a("code",[t._v("http/1.0")]),t._v("时期，检查的是"),a("code",[t._v("Expires")]),t._v("，"),a("code",[t._v("http/1.1")]),t._v("中检查的是"),a("code",[t._v("Cache-Control")])]),t._v(" "),a("h4",{attrs:{id:"expires"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#expires"}},[t._v("#")]),t._v(" Expires")]),t._v(" "),a("p",[a("code",[t._v("expires")]),t._v("表示过期时间，存在于服务器返回的响应头中，告诉浏览器在这个时间过期之前可以直接从缓存中获取数据，不需要发送请求，比如：")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("Expires"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" Wed"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("22")]),t._v(" Oct "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2018")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("08")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("41")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("00")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("GMT")]),t._v("\n")])])]),a("p",[t._v("表示资源在"),a("code",[t._v("2019年11月22号8点41分")]),t._v("过期，过期了就得向服务端发请求")]),t._v(" "),a("p",[t._v("这其中存在一个问题，就是客户端的时间和服务端的时间可能存在差异，那么这个时间就是不准确的，所以在"),a("code",[t._v("http/1.1")]),t._v("中，这种方式就被抛弃了")]),t._v(" "),a("h4",{attrs:{id:"cache-control"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#cache-control"}},[t._v("#")]),t._v(" Cache-Control")]),t._v(" "),a("p",[a("code",[t._v("http/1.1")]),t._v("中采用这个"),a("code",[t._v("Cache-Control")]),t._v("这个字段，也是存在于服务器返回的响应头中，不过它并没有具体的过期时间，而是采用的过期时长来控制缓存有效时间，对应字段是"),a("code",[t._v("max-age")]),t._v(",例如：")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("Cache"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("Control"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v("max"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("age"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("3600")]),t._v("\n")])])]),a("p",[t._v("这个意思代表着在3600秒，也就是一个小时内可以直接使用缓存中的数据而不用发送请求"),a("br"),t._v("\n它还有其他的属性")]),t._v(" "),a("ul",[a("li",[a("code",[t._v("public")]),t._v("：客户端和服务端都可以缓存。一个请求可能会经过很多个代理服务器，才会到达目标服务器，这种情况下，中间的代理服务器也可以缓存")]),t._v(" "),a("li",[a("code",[t._v("private")]),t._v(": 只有浏览器可以缓存，中间的代理服务器不能缓存")]),t._v(" "),a("li",[a("code",[t._v("no-cache")]),t._v("：跳过当前缓存，发送"),a("code",[t._v("http")]),t._v("请求，直接进入协商缓存阶段")]),t._v(" "),a("li",[a("code",[t._v("no-store")]),t._v("：不进行任何的缓存")]),t._v(" "),a("li",[a("code",[t._v("s-maxage")]),t._v("：同"),a("code",[t._v("max-age")]),t._v("作用一样，只在代理服务器中生效，它的优先级会高于"),a("code",[t._v("max-age")]),t._v("，如果存在"),a("code",[t._v("s-maxage")]),t._v("，则会覆盖掉"),a("code",[t._v("max-age")]),t._v("和"),a("code",[t._v("Expires")])])]),t._v(" "),a("p",[t._v("当"),a("code",[t._v("Expires")]),t._v("和"),a("code",[t._v("Cache-Control")]),t._v("同时存在的时候，会优先考虑"),a("code",[t._v("Cache-Control")]),a("br"),t._v("\n当资源缓存超时了，也就是"),a("code",[t._v("强缓存")]),t._v("失效了，接下来就会进入到"),a("strong",[t._v("协商缓存")])]),t._v(" "),a("h3",{attrs:{id:"_1-2-协商缓存"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-协商缓存"}},[t._v("#")]),t._v(" 1.2 协商缓存")]),t._v(" "),a("p",[t._v("强缓存失效后，浏览器在请求头中携带相应的"),a("code",[t._v("tag")]),t._v("来向服务器发送请求，由服务器根据这个"),a("code",[t._v("tag")]),t._v("来决定是否使用缓存，这个就是"),a("strong",[t._v("协商缓存")]),a("br"),t._v("\n缓存的"),a("code",[t._v("tag")]),t._v("分为两种，一种是"),a("code",[t._v("Last-Modified")]),t._v("和"),a("code",[t._v("Etag")])]),t._v(" "),a("h4",{attrs:{id:"last-modified"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#last-modified"}},[t._v("#")]),t._v(" Last-Modified")]),t._v(" "),a("p",[t._v("即最后修改时间。在浏览器第一次给服务器发送请求后，服务器会在响应头中加上这个字段"),a("br"),t._v("\n浏览器接收到后，如果再次请求，会带上"),a("code",[t._v("If-Modified-Since")]),t._v("字段，值也就是服务器传来的最后修改时间"),a("br"),t._v("\n服务器拿到请求头中的"),a("code",[t._v("If-Modified-Since")]),t._v("字段后，会和服务器中"),a("code",[t._v("该资源的最后修改时间")]),t._v("作对比：")]),t._v(" "),a("ul",[a("li",[t._v("如果请求头中的时间小于最后修改时间，说明更新了，返回新的资源，跟常规的"),a("code",[t._v("HTTP")]),t._v("一样")]),t._v(" "),a("li",[t._v("否则返回"),a("code",[t._v("304")]),t._v("，告诉浏览器直接使用缓存")])]),t._v(" "),a("h4",{attrs:{id:"etag"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#etag"}},[t._v("#")]),t._v(" ETag")]),t._v(" "),a("p",[a("code",[t._v("ETag")]),t._v("是服务器根据当前文件的内容，给文件生成的唯一标识，只要文件改动，这个值就会发生变化，服务器通过"),a("code",[t._v("响应头")]),t._v("把这个值传递个浏览器"),a("br"),t._v("\n浏览器拿到这个"),a("code",[t._v("ETag")]),t._v("的值之后，会在下次请求中带上"),a("code",[t._v("If-None-Match")]),t._v("字段，值就是接收的"),a("code",[t._v("ETag")]),t._v("的值，发给服务器"),a("br"),t._v("\n服务器接收到"),a("code",[t._v("If-None-Match")]),t._v("字段，和服务器上资源的"),a("code",[t._v("ETag")]),t._v("进行比较，")]),t._v(" "),a("ul",[a("li",[t._v("如果不一样，说明资源更新了，返回新的资源")]),t._v(" "),a("li",[t._v("否则返回304，告诉浏览器直接使用缓存")])]),t._v(" "),a("h4",{attrs:{id:"last-modified和etag比较"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#last-modified和etag比较"}},[t._v("#")]),t._v(" Last-Modified和ETag比较")]),t._v(" "),a("ol",[a("li",[t._v("精准度上，"),a("code",[t._v("ETag")]),t._v("优于"),a("code",[t._v("Last-Modified")]),t._v("，优于 ETag 是按照内容给资源上标识，因此能准确感知资源的变化。而 Last-Modified 就不一样了，它在一些特殊的情况并不能准确感知资源变化，主要有两种情况:\n"),a("ul",[a("li",[t._v("编辑了资源文件，但是内容并没有修改，会造成缓存失效")]),t._v(" "),a("li",[a("code",[t._v("Last-Modified")]),t._v("能够感知的时间是秒，如果在"),a("code",[t._v("1s")]),t._v("内改变了很多次，这个时候它就不能体现出具体的修改")])])]),t._v(" "),a("li",[t._v("性能上，"),a("code",[t._v("Last-Modified")]),t._v("优于"),a("code",[t._v("ETag")]),t._v("，因为"),a("code",[t._v("Last-Modified")]),t._v("只是记录一个时间，而"),a("code",[t._v("ETag")]),t._v("需要根据文件内容生成哈希值\n如果两种方式都支持的话，服务器会优先考虑"),a("code",[t._v("ETag")])])]),t._v(" "),a("h2",{attrs:{id:"_2-浏览器本地存储"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-浏览器本地存储"}},[t._v("#")]),t._v(" 2.浏览器本地存储")]),t._v(" "),a("p",[t._v("浏览器本地存储主要有：")]),t._v(" "),a("ul",[a("li",[a("code",[t._v("Cookie")])]),t._v(" "),a("li",[a("code",[t._v("WebStorage")]),t._v(" "),a("ul",[a("li",[a("code",[t._v("sessionStorage")])]),t._v(" "),a("li",[a("code",[t._v("localStorage")])])])]),t._v(" "),a("li",[a("code",[t._v("IndexedDB")])])]),t._v(" "),a("h3",{attrs:{id:"cookie"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#cookie"}},[t._v("#")]),t._v(" Cookie")]),t._v(" "),a("p",[a("code",[t._v("Cookie")]),t._v("是在浏览器里面存储一个很小的文本文件，内部以键值对的方式存储，向同一域名下发送请求，都会携带相同的"),a("code",[t._v("Cookie")]),t._v("，服务器拿到"),a("code",[t._v("Cookie")]),t._v("进行解析，便可以拿到客户端的状态，它就是用来做"),a("strong",[t._v("状态存储")]),t._v("的，但是它有一些缺陷")]),t._v(" "),a("ul",[a("li",[t._v("容量缺陷，只能存储"),a("code",[t._v("4kb")]),t._v("大小的信息")]),t._v(" "),a("li",[t._v("性能缺陷，同域名下的所有请求都会自动带上完整的"),a("code",[t._v("Cookie")]),t._v("信息，即使这个请求不需要，如果请求数量很多很多的话，就会造成一定的性能浪费")]),t._v(" "),a("li",[t._v("安全缺陷，"),a("code",[t._v("Cookie")]),t._v("在浏览器和服务器之间的的传输形式是纯文本的，容易被非法用户截获，然后篡改，然后在"),a("code",[t._v("Cookie")]),t._v("有效期内在发送给服务器，这样是非常危险的，还有在"),a("code",[t._v("HttpOnly")]),t._v("为"),a("code",[t._v("false")]),t._v("的情况下，"),a("code",[t._v("Cookie")]),t._v("中的信息是可以通过"),a("code",[t._v("JS")]),t._v("脚本进行读取的。")])]),t._v(" "),a("h3",{attrs:{id:"localstorage"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#localstorage"}},[t._v("#")]),t._v(" localStorage")]),t._v(" "),a("p",[a("code",[t._v("localStorage")]),t._v("和"),a("code",[t._v("Cookie")]),t._v("类似，针对同一域名，在同一域名下，存储相同的一段"),a("code",[t._v("localStorage")])]),t._v(" "),a("p",[t._v("不过它相对于"),a("code",[t._v("Cookie")]),t._v("来说，有一定的区别")]),t._v(" "),a("ul",[a("li",[t._v("容量上，"),a("code",[t._v("localStorage")]),t._v("的存储容量上限为"),a("code",[t._v("5M")])]),t._v(" "),a("li",[t._v("时间上，对于同一域名，如果不手动删除，理论上是一直存在的，也就是说是"),a("strong",[t._v("持久存储")]),t._v("的")]),t._v(" "),a("li",[t._v("因为不需要和服务端进行通信，所以没有了"),a("code",[t._v("Cookie")]),t._v("带来的"),a("strong",[t._v("安全问题")]),t._v("和"),a("strong",[t._v("性能问题")])]),t._v(" "),a("li",[t._v("操作非常方便，它本身带有"),a("code",[t._v("setItem")]),t._v("和"),a("code",[t._v("getItem")]),t._v("等方法，我们只需要调用这些方法对其进行操作")])]),t._v(" "),a("p",[t._v("举个例子：")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" people "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'星光'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" age"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("18")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\nlocalStorage"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("setItem")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'people'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("JSON")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("stringify")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("people"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),a("p",[t._v("接下在同域名下获取和移除也是非常简单的")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 获取")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" peopleStr "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" localStorage"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getItem")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'people'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" peopleFromLocal "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("JSON")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("parse")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("peopleStr"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v('// {name: "星光", age: 18}')]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 移除")]),t._v("\nlocalStorage"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("removeItem")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'people'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" peopleInfo "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" localStorage"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getItem")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'people'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// null")]),t._v("\n")])])]),a("p",[t._v("可以看到，它只能存储字符串，通过"),a("code",[t._v("JSON.stringify()")]),t._v("方法把对象转出字符串，通过"),a("code",[t._v("JSON.parse()")]),t._v("解析成对象")]),t._v(" "),a("h3",{attrs:{id:"sessionstorage"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#sessionstorage"}},[t._v("#")]),t._v(" sessionStorage")]),t._v(" "),a("p",[a("code",[t._v("sessionStorage")]),t._v("和"),a("code",[t._v("localStorage")]),t._v("基本一样，")]),t._v(" "),a("ul",[a("li",[t._v("容量上限为"),a("code",[t._v("5M")])]),t._v(" "),a("li",[t._v("只存在于客户端，不与服务端进行通信")]),t._v(" "),a("li",[t._v("操作方式与"),a("code",[t._v("localStorage")]),t._v("一致")])]),t._v(" "),a("p",[t._v("但是"),a("code",[t._v("sessionStorage")]),t._v("和"),a("code",[t._v("localStorage")]),t._v("有个本质的区别，就是"),a("code",[t._v("sessionStorage")]),t._v("是会话级别的存储，不是持久性存储，当会话结束，也就是页面被关闭之后，存储在"),a("code",[t._v("sessionStorage")]),t._v("中的信息就不在了")]),t._v(" "),a("h3",{attrs:{id:"indexeddb"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#indexeddb"}},[t._v("#")]),t._v(" IndexedDB")]),t._v(" "),a("p",[a("code",[t._v("IndexedDB")]),t._v("是运行在浏览器端的"),a("code",[t._v("非关系型数据库")]),t._v("，存储容量理论上是没有上限的"),a("br"),t._v("\n有一些需要注意的点")]),t._v(" "),a("ul",[a("li",[t._v("采用"),a("code",[t._v("键值对")]),t._v("进行存储")]),t._v(" "),a("li",[t._v("受浏览器同源策略")]),t._v(" "),a("li",[t._v("异步操作，数据库的读写属于I/O，浏览器中对异步I/O提供了支持, 异步设计是为了防止大量数据的读写，拖慢网页的表现。")])]),t._v(" "),a("p",[t._v("总结一下：")]),t._v(" "),a("ul",[a("li",[a("code",[t._v("Cookie")]),t._v("并不适合存储")]),t._v(" "),a("li",[a("code",[t._v("localStorage")]),t._v("和"),a("code",[t._v("sessionStorage")]),t._v("不会与服务端通信")]),t._v(" "),a("li",[a("code",[t._v("IndexedDB")]),t._v("是运行在浏览器端的数据库，为大型数据的存储提供了接口")])])])}),[],!1,null,null,null);e.default=_.exports}}]);