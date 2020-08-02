---
title: 手写一个自己的 VueRouter
sidebarDepth: 2
---

VueRouter 有两种模式，一种是 Hash 模式，一种是 History 模式，下面来看下两种模式的区别

## Hash 模式

+ 将 URL 中 # 后面的内容作为路径地址

  > 可以直接使用 location.url 来切换地址，如果只是改变了 # 后面的内容，浏览器不会向服务器请求这个地址，但是会把这个地址记录到浏览器的访问历史中

+ 监听hashchange 事件

  > hash 改变后通过 监听 hashchange 事件可以根据当前路由找到对应的组件并重新渲染

+ 根据当前路由找到对应的组件重新渲染

## History 模式

+ 通过 history.pushState() 方法改变地址栏

  > pushState 方法仅仅是改变地址栏，并把当前地址记录到浏览器的访问历史中，并不会真真跳转到指定的路径，浏览器不会向服务器发送请求

+ 监听 popState 事件

  > 通过监听 popState 事件，可以监听到浏览器地址操作的变化，在 popState 的操作函数中可以记录该变后的地址，注意：当调用 pushState 或者 replaceState 的时候不会触发该事件，当点击浏览器的前进和后退按钮的时候，或者调用 history 的 back 和 forward 方法时，事件才会被触发

+ 根据当前路由地址找到对应组件重新渲染

## 实现一个简单版本的VueRouter

### VueRouter 分析

先看一下 Vue Router 的使用

```js
//  router/index.js
// 注册插件
Vue.use(VueRouer)
// 创建路由对象
const router = new VueRouter({
    routes: [
    	{ name: 'home', path: '/', component: homeComponent}
	]
})
// main.js
// 创建 Vue 实例，注册 router 对象
new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
```

 Vue.use 可以传入一个函数或者对象，如果是函数，会直接执行该函数，如果是一个对象，会调用对象中的 install 方法

在 new VueRouter 的时候传入一个对象，说明它是一个对象或者是一个类，里面应该有一个 install 方法，构造函数接收一个路由规则对象

根据 VueRouter  的使用，我们画好了一个类图

<img class="custom" :src="$withBase('/img/vuerouter.png')" alt="queue">

options 的作用是记录构造函数中传入的对象

routerMap 是一个对象，用来记录路由和组件之间的对应关系

data 是一个对象，拥有一个 current 属性，用来记录当前路由地址，它是一个响应式的对象，因为路由地址发生变化后，对应的组件要自动更新，通过 Vue.observable 方法可以将该对象变成响应式的

install 用来实现 Vue  的插件机制

init 用来调用 initEvent() createRouterMap() 和 initComponents 方法

initEvent 是用来监听浏览器历史的变化

createRouterMap 用来初始化 routerMap

initComponents 用来创建 router-view 和 router-link 两个组件

### 实现VueRouter install 方法

接下来，我们来实现自己的 VueRouter，首先实现它的 install 方法

install 方法主要做了三件事情

1. 判断当前插件是否已经安装
2. 把 Vue 构造函数记录到全局
3. 把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上

```js
let _Vue = null

export default class VueRouter {
  static install (Vue) {
    // 1. 判断当前插件是否已经安装
    if (VueRouter.install.installed) {
      return
    }
    VueRouter.install.installed = true
    // 2. 把 Vue 构造函数记录到全局
    _Vue = Vue
    // 3. 把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上
    // 在 new Vue 的时候传入的 router 对象存在于 vue 的 $optoins 中，没有在 Vue 的实例上，所以需要注入到 Vue 的实例上
    // 要获取到 $options 中的 router 对象，需要在可以获取到 vue 实例的时候
    // 通过使用 混入 在混入的 beforeCreate 我们可以获取到 vue 实例
    _Vue.mixin({
      // 因为这个混入在所有的实例和组件中都会有且会执行
      // 这个钩子函数会被执行很多次，但是这个挂载只需要执行一次
      // 所以需要判断需要判断实例上是否有 router 对象，因为组件是则不会有 router 对象
      beforeCreate() {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
        }
      }
    })
  }
}
```

### 实现 VueRouter 构造函数

在构造函数中，需要初始化 `options`、`data`和`routeMap`

`routeMap`存储路径和组件的对应关系，键是路径，值是组件

 `data`是一个响应式的对象，因为它需要存储当前的路由地址，当路由地址发生变化的时候需要触发视图更新

```j
constructor (options) {
    this.options = options
    // 存储路径和组件的对应关系
    this.routeMap = {}
    // data 是一个响应式的对象，因为它需要存储当前的路由地址，当路由地址发生变化的时候需要触发视图更新
    this.data = _Vue.observable({
      current: '/'
    })
  }
```

### 实现 createRouteMap

createRouteMap 方式的作用是将传入 options 中的路由规则解析到 routeMap 对象中

```js
 createRouteMap() {
    // 遍历所有的路由规则，把路由规则解析成键值对的，存储到 routeMap 中
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }
```

### 实现 VueRouter initComponents

`initComponents` 方法的作用是创建 `router-link`和`router-view`

#### router-link

router-link 组件最后被渲染成一个超链接，它接收一个 to参数作为超链接的地址，内容在超链接之间

```vue
<router-link to="/">Home</router-link>
```

接下来就来实现创建一个 router-link 组件

```js
initComponents(Vue) {
    Vue.component('router-link', {
      props: {
        to: String
      },
      template: '<a :href="to"><slot></slot></a>'
    })
  }
```

然后去测试一下

我们需要调用 initComponents 和 createRouteMap 这两个方法

```js
init() {
    this.createRouteMap()
    this.initComponents(_Vue)
  }
```

这个 init 方法应该在 插件设置完成后调用

```js
_Vue.mixin({
    beforeCreate() {
        if (this.$options.router) {
            _Vue.prototype.$router = this.$options.router
            this.$options.router.init()
        }
    }
})
```

利用 vue cli 工具创建一个 vue 项目，

<img class="custom" :src="$withBase('/img/owenRouter.png')" alt="queue">

将 router 文件中原本引入的 vue-router 替换成我们自己写的 router

然后去运行项目

我们打开浏览器，页面上什么都没有输出，打开开发者面板

<img class="custom" :src="$withBase('/img/routererr.png')" alt="queue">

可以看到控制台输出了两个错误，先不看第二错误，以为我们没有创建 router-view组件

先看第一个错误，什么意思呢？

错误信息说您正在使用Vue的仅运行时版本，而模板编译器不可用。 可以将模板预编译为渲染函数，也可以使用包含编译器的内部版本

Vue 的构建版本

+ 运行时版：不支持 template 模板，需要打包的时候提前编译
+ 完整版：包含运行时和编译器，体积比运行时版大 10k 左右，程序运行的时候把模板转换成 render 函数

有两种方式来解决这个问题

##### 使用完整版本的 Vue

我们可以通过在根目录下创建 `vue.config.js`文件，然后配置

```js
module.exports = {
    runtimeCompiler: true
}
```

runtimeCompiler 代表是否使用包含运行时编译器的 Vue 构建版本，默认为 false，设置为 true 代表需要使用

然后重新运行项目，在浏览器中访问

<img class="custom" :src="$withBase('/img/wz.png')" alt="queue">

可以看到页面中的 router-link 已经被正常渲染出来了

##### 运行时版本 Vue render函数

运行时版本的 vue 不支持 template ，但是可以直接写 render 函数来渲染组件

```js
 Vue.component('router-link', {
     props: {
         to: String
     },
     // template: '<a :href="to"><slot></slot></a>'
     // 参数 h 是 用来创建虚拟 DOM，接收三个参数
     // 第一个参数是需要创建的标签名称
     // 第二参数是创建标签的一些属性
     // 第三个参数是生成的标签元素的子元素，是一个数组的形式
     render (h) {
         return h('a', {
             attrs: {
                 href: this.to
             }
         }, [this.$slots.default])
     }
 })
```

这个我们删除 vue.config.js 文件重新运行项目，可以看到 router-link 组件在页面中也被正常渲染了

#### router-view

router-view 组件相当于一个占位符，他会根据当前路由地址来渲染对应的组件

```js
const self = this
Vue.component('router-view', {
    render (h) {
        // 根据当前路由地址获取到对应的组件并交给 h 函数渲染
        const component = self.routeMap[self.data.current]
        return h(component)
    }
})
```

现在我们打开页面，可以看到组件被正常的渲染出来了

<img class="custom" :src="$withBase('/img/routerview.png')" alt="queue">

但是当我们点击 About的时候，浏览器刷新了，也就是说它向服务器发送了请求，但是我们不希望他往服务器发送请求，所以我们需要处理一下， 

router-link 渲染完成后是一个超链接，我们可以给这个超链接添加一个点击事件，让他不去跳转，我们自己去修改地址栏，通过 history.pushState 去修改地址栏，该方法会修改地址栏中的路径，且不会向服务短发送请求

然后我们还需要将当前地址记录一下，记录在 data.current 中,因为data 是一个响应式的，所以它会自动渲染对应的视图

修改一下 rotuer-link 组件的创建过程

```js
Vue.component('router-link', {
    props: {
        to: String
    },
    // template: '<a :href="to"><slot></slot></a>'
    // 参数 h 是 用来创建虚拟 DOM，接收三个参数
    // 第一个参数是需要创建的标签名称
    // 第二参数是创建标签的一些属性
    // 第三个参数是生成的标签元素的子元素，是一个数组的形式
    render (h) {
        return h('a', {
            attrs: {
                href: this.to
            },
            on: {
                click: this.clickHandler
            }
        }, [this.$slots.default])
    },
    methods: {
        /**
         * 需要做两件事
         * 1. 修改地址栏路径
         * 2. 加载地址栏路径对应的组件
         */
        clickHandler (e) {
            // pushState 接收三个参数，第一个是 data 是将来触发 popState 时传递给 popState 的参数，我们这里用不到，就传入一个空对象
            // 第二个是 title,
            // 第三个是 当前超链接要跳转的地址
            history.pushState({}, '', this.to)
            // 加载地址栏对应的组件
            // 加载这个组件的是 vue 的实例，我们在前面已经把 $router 挂载到了 vue 实例上，所以可以直接使用
            this.$router.data.current = this.to
            e.preventDefault()
        }
    }
})
```

然后重新启动项目，点击链接，都可以正常跳转并且正常渲染，而且不会向服务端发送请求

### initEvent

现在基本功能都实现了，但是还存在一个问题，那就是浏览器中的前进和后退，我们点击前进和后退的时候，地址栏会发生改变，但是组件不会重新渲染

接下来就来解决这个问题

我们可以调用 popState 方法，这个方法在历史发生改变的时候会被触发，当使用pushState 或者 replaceState 方法是不会触发的

```js
// 注册 popState 事件
initEvent () {
    window.addEventListener('popstate', () => {
        // 将当前路径记录在 data.current 中
        this.data.current = window.location.pathname
    })
}
// 然后在init 方法中调用
init () {
    // ...
    this.initEvent()
}
```

这个时候我们的功能就完成了

### 处理浏览器刷新问题

现在还存在一个问题，就是浏览器刷新的时候，渲染的组件和地址栏路径对应不上，这个时候只需要在初始化 components 的时候将浏览器地址赋给 data.current

```js
initComponents(Vue) {
    // 浏览器刷新的时候 将当前地址栏地址赋给 data.current 这样刷新页面也会渲染出来对应的组件
    this.data.current = window.location.pathname || '/'
    Vue.component('router-link', {
      props: {
        to: String
      },
      // template: '<a :href="to"><slot></slot></a>'
      // 参数 h 是 用来创建虚拟 DOM，接收三个参数
      // 第一个参数是需要创建的标签名称
      // 第二参数是创建标签的一些属性
      // 第三个参数是生成的标签元素的子元素，是一个数组的形式
      render (h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickHandler
          }
        }, [this.$slots.default])
      },
      methods: {
        /**
         * 需要做两件事
         * 1. 修改地址栏路径
         * 2. 加载地址栏路径对应的组件
         */
        clickHandler (e) {
          // pushState 接收三个参数，第一个是 data 是将来触发 popState 时传递给 popState 的参数，我们这里用不到，就传入一个空对象
          // 第二个是 title,
          // 第三个是 当前超链接要跳转的地址
          history.pushState({}, '', this.to)
          // 加载地址栏对应的组件
          // 加载这个组件的是 vue 的实例，我们在前面已经把 $router 挂载到了 vue 实例上，所以可以直接使用
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })
    const self = this
    Vue.component('router-view', {
      render (h) {
        // 根据当前路由地址获取到对应的组件并交给 h 函数渲染
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
  }
```



### 完整版代码（history）

```js
let _Vue = null

export default class VueRouter {
  static install (Vue) {
    // 1. 判断当前插件是否已经安装
    if (VueRouter.install.installed) {
      return
    }
    VueRouter.install.installed = true
    // 2. 把 Vue 构造函数记录到全局
    _Vue = Vue
    // 3. 把创建 Vue 实例时候传入的 router 对象注入到 Vue 实例上
    // 在 new Vue 的时候传入的 router 对象存在于 vue 的 $optoins 中，没有在 Vue 的实例上，所以需要注入到 Vue 的实例上
    // 要获取到 $options 中的 router 对象，需要在可以获取到 vue 实例的时候
    // 通过使用 混入 在混入的 beforeCreate 我们可以获取到 vue 实例
    _Vue.mixin({
      // 因为这个混入在所有的实例和组件中都会有且会执行
      // 这个钩子函数会被执行很多次，但是这个挂载只需要执行一次
      // 所以需要判断需要判断实例上是否有 router 对象，因为组件是则不会有 router 对象
      beforeCreate () {
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }

  constructor (options) {
    this.options = options
    // 存储路径和组件的对应关系
    this.routeMap = {}
    // data 是一个响应式的对象，因为它需要存储当前的路由地址，当路由地址发生变化的时候需要触发视图更新
    this.data = _Vue.observable({
      current: '/'
    })
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  createRouteMap () {
    // 遍历所有的路由规则，把路由规则解析成键值对的，存储到 routeMap 中
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }

  initComponents (Vue) {
    // 浏览器刷新的时候 将当前地址栏地址赋给 data.current 这样刷新页面也会渲染出来对应的组件
    this.data.current = window.location.pathname || '/'
    Vue.component('router-link', {
      props: {
        to: String
      },
      // template: '<a :href="to"><slot></slot></a>'
      // 参数 h 是 用来创建虚拟 DOM，接收三个参数
      // 第一个参数是需要创建的标签名称
      // 第二参数是创建标签的一些属性
      // 第三个参数是生成的标签元素的子元素，是一个数组的形式
      render (h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickHandler
          }
        }, [this.$slots.default])
      },
      methods: {
        /**
         * 需要做两件事
         * 1. 修改地址栏路径
         * 2. 加载地址栏路径对应的组件
         */
        clickHandler (e) {
          // pushState 接收三个参数，第一个是 data 是将来触发 popState 时传递给 popState 的参数，我们这里用不到，就传入一个空对象
          // 第二个是 title,
          // 第三个是 当前超链接要跳转的地址
          history.pushState({}, '', this.to)
          // 加载地址栏对应的组件
          // 加载这个组件的是 vue 的实例，我们在前面已经把 $router 挂载到了 vue 实例上，所以可以直接使用
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })
    const self = this
    Vue.component('router-view', {
      render (h) {
        // 根据当前路由地址获取到对应的组件并交给 h 函数渲染
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
  }

  // 注册 popState 事件
  initEvent () {
    window.addEventListener('popstate', () => {
      // 将当前路径记录在 data.current 中
      this.data.current = window.location.pathname
    })
  }
}

```

### 有hash模式和history模式的完整版代码

因为`hash`模式和 `history`实现起来非常类似，这里就只给出代码，相差不大，利用 `hashchange`就可以了

```js
const HASH = 'hash'
let _Vue = null

export default class VueRouter {
  static install (Vue) {
    if (VueRouter.install.installed && _Vue === Vue) {
      return
    }
    VueRouter.install.installed = true
    _Vue = Vue
    Vue.mixin({
      beforeCreate () {
        if (this.$options.router) {
          Vue.prototype.$router = this.$options.router
          this.$options.router.init()
        }
      }
    })
  }

  constructor (options) {
    this.options = options
    this.routeMap = {}
    this.mode = options.mode
    this.data = _Vue.observable({
      current: '/'
    })
  }

  init () {
    this.createRouteMap()
    this.initComponents(_Vue)
    this.initEvent()
  }

  initComponents (Vue) {
    this.refresh()
    const self = this
    Vue.component('router-link', {
      props: {
        to: String
      },
      render (h) {
        return h('a', {
          attrs: {
            href: this.to
          },
          on: {
            click: this.clickHandler
          }
        }, [this.$slots.default])
      },
      methods: {
        clickHandler (e) {
          self.mode === HASH
            ? self.hashChange(this.to)
            : self.historyChange(this.to)
          this.$router.data.current = this.to
          e.preventDefault()
        }
      }
    })
    Vue.component('router-view', {
      render (h) {
        const component = self.routeMap[self.data.current]
        return h(component)
      }
    })
  }

  createRouteMap () {
    this.options.routes.forEach(route => {
      this.routeMap[route.path] = route.component
    })
  }

  historyChange (path) {
    history.pushState({}, '', path)
  }

  hashChange (path) {
    window.location.hash = path
  }

  // 处理浏览器刷新问题
  refresh () {
    this.mode === HASH
      ? this.hashURLHandle()
      : this.data.current = window.location.pathname || '/'
  }

  hashURLHandle () {
    if (!window.location.hash) {
      window.location.hash = '/'
    }
    this.data.current = window.location.hash.slice(1) || '/'
  }

  // 事件初始化
  initEvent () {
    this.mode === HASH
      ? this.initHashEvent()
      : this.initHistoryEvent()
  }

  initHistoryEvent () {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }

  initHashEvent () {
    window.addEventListener('hashchange', () => {
      this.data.current = window.location.hash.slice(1)
    })
  }
}

```

