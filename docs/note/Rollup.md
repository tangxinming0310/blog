---
title: Rollup
sidebarDepth: 2
---

## 简介

Rollup 与Webpack 作用类似

Rollup 更为小巧，仅仅是一款 ESM 打包器，没有其他额外的功能

Rollup 中并不支持类型 HMR 这种高级特性

它的目的是提供一个充分利用 ESM 各项特性的高效打包器

## 基本使用

准备了一个简单的项目

<img class="custom" :src="$withBase('/img/rollupbase.png')" alt="queue">

```js
// index.js
// 导入模块成员
import { log } from './logger'
import messages from './messages'

// 使用模块成员
const msg = messages.hi

log(msg)

// logger.js
export const log = msg => {
  console.log('---------------- INFO ----------------')
  console.log(msg)
  console.log('--------------------------------------')
}

export const error = msg => {
  console.error('---------------- ERROR ----------------')
  console.error(msg)
  console.error('--------------------------------------')
}

// messages.js
export default {
  hi: 'Hey Guys, I am txm~'
}
```

然后我们先安装 rollup

```bash
yarn add rollup --dev
```

然后我们先来运行一下 rollup 

```bash
yarn rollup ./src/index.js
```

他报出一个错误，意思我们应该指定一个输出的格式，就是我们转换后的代码应该以什么样的格式去输出

<img class="custom" :src="$withBase('/img/rolluperror.png')" alt="queue">

可以通过 --format 的参数去指定

```bash
yarn rollup ./src/index.js --format iife
```

我们选择自调用函数的格式

然后我们的打包结果就会被打印到控制台中

<img class="custom" :src="$withBase('/img/iife.png')" alt="queue">

我们通过 --files 指定输出文件的路径，这样打包结果就会被输出到文件中

```bash
yarn rollup ./src/index.js --format iife --file dist/bundle.js
```

然后可以看到我们的打包结果

```js
(function () {
  'use strict';

  const log = msg => {
    console.log('---------------- INFO ----------------');
    console.log(msg);
    console.log('--------------------------------------');
  };

  var messages = {
    hi: 'Hey Guys, I am txm~'
  };

  // 导入模块成员

  // 使用模块成员
  const msg = messages.hi;

  log(msg);

}());

```

非常的简洁，几乎没有任何多余的代码，也默认开启了 tree-shaking功能，会自动去除没有无用代码

## Rollup 配置文件

我们在项目下新建一个 rollup.config.js 配置文件，通过 input 来指定需要编译的文件，ouput 指定输出的文件名和编译格式

```js
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js', // 输出的文件名
    format: 'iife' // 编译格式
  }
}
```

然后我们在命令行需要传递一个 `--config` 来告诉 rollup 采用配置文件，因为他默认是不采用配置文件的

```bash
yarn rollup --config
```

也可以指定配置文件的名称

```bash
yarn rollup --config rollup.config.js
```

## 插件的使用

Rollup 本身只是提供打包的功能，如果我们有一些其他的需求，比如说加载其他资源类型或者编译ES的新特性，它可以通过插件来实现，**插件是 Rollup 唯一扩展途径**

下面我们来尝试导入 json 文件，安装一个  `rollup-plugin-json`

```bash
yarn add rollup-plugin-json --dev
```

在 rollup.config.js 文件中导入

```js
import json from 'rollup-plugin-json'
```

在配置文件中添加一个 plugins配置，

```js
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js', // 输出的文件名
    format: 'iife' // 编译格式
  },
  plugins: [
    json()
  ]
}
```

我们尝试在 index.js 文件中导入 package.json 文件

```js
// index.js
// 导入模块成员
import { log } from './logger'
import messages from './messages'
import { name, version } from '../package.json'

// 使用模块成员
const msg = messages.hi

log(msg)
log(name)
log(version)
```

然后我们重新打包

```bash
yarn rollup --config
```

然后打开打包后的 bundle.js 文件

<img class="custom" :src="$withBase('/img/rollupjson.png')" alt="queue">

可以看到，我们使用的 `name`和`version`都被打包进来了，而其他没有用到的属性都被tree-shaking掉了

## Rollup 加载 NPM 模块

rollup 默认只能按照文件路径的方式去加载对应的文件，在 node_modules 中的第三方模块，它并不能像 webpack 一样去载入对应的模块，因此 rollup 官方给出了一个 `rollup-plugin-node-resolve`的插件，通过这个插件我们就可以在代码中直接使用模块名称去导入模块了

安装

```bash
yarn add rollup-plugin-node-resolve --dev
```

然后在 `rollup.config.js` 配置文件中将插件导入

```js
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js', // 输出的文件名
    format: 'iife' // 编译格式
  },
  plugins: [
    json(),
    resolve()
  ]
}
```

我们先安装一个 `lodash-es`的库，然后来尝试导入这个库

至于为什么不用`lodash`库，因为`rollup`默认只支持`ESModule` 模块，如果需要使用普通版本，还需要做额外处理

```bash
yarn add lodash-es
```

然后在 `index.js` 中去使用

```js
import _ from 'lodash-es'

log(_.camelCase('hello world'))
```

然后打包

```bash
yarn rollup --config
```

可以看到`lodash-es`中对应的功能也被打包进去了

## Rollup 加载 CommonJS 模块

Rollup 只支持 ESModule ，如果在代码中导入 CommonJS 模块是不被支持的,为了兼容使用 CommonJS 模块，rollup 官方给出了一个 `rollup-plugin-commonjs`插件

安装

```bash
yarn add rollup-plugin-commonjs --dev
```

然后在 `rollup.config.js` 配置文件中配置

```js
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js', // 输出的文件名
    format: 'iife' // 编译格式
  },
  plugins: [
    json(),
    resolve(),
    commonjs()
  ]
}
```

然后创建一个 CommonJS 书写的模块 `cjs.js`

```
module.exports = {
  foo: 'bar'
}
```

然后在`index.js`文件中去尝试载入这个模块

```js
// index.js
import cjs from './cjs'
// ...
log(cjs)
```

打包

```bash
yarn rollup --config
```

打包后的 bundle.js 文件中就会包括了 commjs 模块书写的代码

<img class="custom" :src="$withBase('/img/rollupcommjs.png')" alt="queue">


## Rollup 代码拆分

在 Rollup 最新版本中已经支持代码拆分了，我们可以使用动态导入（Dynamic Imports）的方式

，Rollup 内部会自动处理

在 index.js 中我们动态导入 `log`这个模块

`import`返回的是一个 `Promise` 对象,在`then`中我们就可以拿到模块导入的对象，因为导出的成员都会放在这个模块中，所以我们可以使用解构的方式来提取成员

```js
import('./logger').then(({ log }) => {
  log('code splitting~')
})
```

然后打包

```bash
yarn rollup --config
```

<img class="custom" :src="$withBase('/img/codesplitting.png')" alt="queue">

这个时候他会爆出一个错误,意思是我们使用代码拆分这种方式打包的话，输出格式`format`不能是`IIFE`这种格式，想要使用这种方式，我们只能使用 `AMD`或者`CMD`格式，我们这里使用`AMD`格式

使用`--format`参数覆盖掉配置文件中的配置

```bash
yarn rollup --config --format amd
```

<img class="custom" :src="$withBase('/img/rollupamderror.png')" alt="queue">

这个时候它又爆出了一个错误，说code splitting需要输出多个文件，就不能采用`file`这种配置方式，以为`file`是指定单个输出文件的文件名，要输出多个文件可以使用`dir`的参数

修改一下`rollup.config.js`配置文件

```js
export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'amd'
  }
}
```

然后重新打包

```bash
yarn rollup --config
```

这个时候dist下面就有一个入口bundle和一个动态导入的bundle

<img class="custom" :src="$withBase('/img/dyimport.png')" alt="queue">

## Rollup 多入口打包

Rollup 支持多入口打包，对于不同文件中的公共部分，也会自动提取到单个文件中作为独立的 bundle

先准备了 album.js 文件 和 fetch.js 文件

```js
// album.js
import fetchAPI from './fetch'
import { log } from './logger'

fetchAPI('/photos?albumId=1').then(data => {
  data.forEach(item => {
    log(item)
  })
})
// fetch.js
export default endpoint => {
  return fetch(`https://jsonplaceholder.typicode.com${endpoint}`)
    .then(response => response.json())
}
```

然后我们修改`rollup.config.js`配置文件

```js
export default {
  input: ['src/index.js', 'src/album.js'],
  output: {
    dir: 'dist',
    format: 'amd'
  }
}
```

修改为多入口非常简单，可以将`input`修改为数组的方式，里面就是入口文件的路径，也可以采用对象的方式

打包

```bash
yarn rollup --config
```

打包后，dist 目录下就会生成三个js文件，分别是打包结果和公共模块

## Rollup 与 Webpack 选用原则

rollup 的优势

+ 输出结果更加扁平
+ 自动移除未引用的代码（tree shaking）
+ 打包结果依然完全可读

缺点：

+ 加载非 ESM 的第三方模块比较复杂
+ 模块最终都被打包到一个函数中，无法实现 HMR
+ 浏览器环境中，代码拆分功能依赖 AMD 库

Webpack大而全，Rollup 小而美

如果我们正在开发应用程序，建议使用 Webpack

如果类库或者框架的开发，建议使用 Rollup

