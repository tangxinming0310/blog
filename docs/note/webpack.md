---
title: Webpack
sidebarDepth: 2
---

## 快速上手

准备一个简单的小项目

```
-- src
	- heading.js
	- index.js
-  index.html
```

在 heading.js 中导出了一个创建标签的函数

```js
export default () => {
  const element = document.createElement('h2')

  element.textContent = 'hello world'
  element.addEventListener('click', () => {
    alert('hello webpack')
  })

  return element
}
```

然后在 index.js 中去引用

```js
import createHeading from './heading.js'

const heading = createHeading()

document.body.appendChild(heading)
```

最后在 index.html 中载入 index.js

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Webpack</title>
</head>
<body>
  <script type="module" src="src/index.js"></script>
</body>
</html>
```

初始化 package.json 文件

```bash
yarn init -y
```

安装 webpack 需要的核心模块和 cli 模块

```bash
yarn add webpack webpack-cli --dev
```

可以通过 `yarn webpack --version` 查看 webpack 的版本，当前版本是

```
4.43.0
```

有了 webpack 后就可以帮助我们去打包 src 下面的 js 代码了

执行

```bash
yarn webpck
```

webpack 会自动的从 src 下面的 index.js 开始打包

完成后在项目的根目录下就会多出一个 dist 目录，里面有一个 main.js 文件，我们的文件都会被打包到 这个 main.js 中

我们也可以将 webpack 的打包命令定义到 package.json 的 script 脚本中

```json
{
  "dependencies": {
    "global": "^4.4.0",
    "serve": "^11.3.2"
  },
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "webpack": "^4.43.0",
    "webpack-cli": "^3.3.12"
  }
}

```

## Webpack 配置文件

webpack 4 以后的版本支持零配置的方式打包，会按照约定将 `src/index.js`作为打包入口，打包结果会放在`dist/main.js`中

### 入口配置

但是很多时候我们需要去定义这个入口文件的路径，我们就可以去配置

在项目的根目录中创建一个`webpack.config.js`的文件，这个文件是运行 node 环境下的，也就是说我们可以按照 CommonJS 的规范去编写我们的代码，可以通过导出对象的属性来完成相应的配置选项

```js
module.exports = {
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.js'
}
```

将入口文件修改为 src 下的 main.js 

然后我们重新去运行打包命令，仍然是可以正常工作的

### 输出配置

我们也可以通过配置 `output` 这个属性去配置输出

`output` 要求是一个对象，可以通过 `filename` 配置输出文件的名称

```js
module.exports = {
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.js',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js' // 输出文件的名称
  }
}
```

通过 `path` 去指定输出路径，输出路径只能是绝对路径，因为是运行在 node 环境下，所以我们可以使用 node 中的 `path` 模块来拼接输出路径

```js
const path = require('path')

module.exports = {
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.js',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'output') // 指定输出路径，必须是绝对路径
  }
}
```

然后运行打包命令，就可以看到在 output 目下生成了打包后的 bundle.js 文件

## Webpack 工作模式

webpack 4新增了一个工作模式的用法，这个用法大大简化了 webpack 的复杂程度

我们使用上面的代码执行打包命令，然后控制台中会输出一个警告

<img class="custom" :src="$withBase('/img/webpackwarn.png')" alt="queue">

意思是说我们没有去设置一个 `mode` 的属性，webpack 会在默认模式（production）下工作，这个模式下会自动启动一些优化插件，比如说自动压缩

可以通过 cli 命令去指定打包模式，通过 --mode ，有三种取值 `production`，`development`,`none`

```bash
yarn webpack --mode development
```

+ `production`模式会自动启用一些优化，比如说代码压缩

+ `development`会优化打包速度，会添加一些调试过程中需要的辅助在代码中

+ `none`模式下 webpack 会运行最原始的打包，不会做任何额外的处理

也可以通过在 webpack 的配置文件中去指定工作模式，就是添加一个 mode 的属性

```js
const path = require('path')

module.exports = {
  // 指定工作模式，production development none
  mode: 'development',
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.js',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'dist') // 指定输出路径，必须是绝对路径
  }
}
```

## Webpack 打包结果运行原理

为了更好的理解，先将工作模式设置为 none

```js
mode: 'none'
```

这样 webpack 就会以最原始的方式去打包，不会做任何额外的操作

执行一下打包

```bash
yarn webpack
```

完成后我们打开生成的 bundle.js 文件

先将代码进行最大化折叠，可以看到它是一个立即执行函数

<img class="custom" :src="$withBase('/img/bundle1.png')" alt="queue">

这个函数是 webpack 的工作入口，接收一个 modules 的参数

调用时传入了一个数组，数组中的每一个元素都是一个参数列表相同的函数

<img class="custom" :src="$withBase('/img/bundle2.png')" alt="queue">

这里的函数对应的就是源代码中的模块，也就是说我们的每个模块最终都被包裹到这样的一个函数中，从而实现模块的私有作用域

下面再看 webpack 的工作入口函数

这个函数并不复杂，最开始定义了一个对象用于缓存加载过的模块

```js
var installedModules = {};
```

接下来定义了一个 require 函数 顾名思义，这个函数就是用来加载模块的

```js
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
```

在后面呢就是在 require 函数上挂载了一些其他的数据和工具函数

<img class="custom" :src="$withBase('/img/bundlerequire.png')" alt="queue">

在最后呢，调用了 require 这个函数并传入一个 0 开始去加载我们的模块

```js
return __webpack_require__(__webpack_require__.s = 0);
```

这个地方的模块 id 实际上就是模块数组中的元素下标，也就是这里才开始去加载源代码中的入口模块

我们可以在浏览器中去调试一下

<img class="custom" :src="$withBase('/img/bundle3.png')" alt="queue">

可以在入口出打上断点，进行单步调试

通过调试后我们可以知道 webpack 打包过后的代码并不会太过于复杂，只是把所有模块的代码放在同一个文件中，并且提供了一些基础代码，使得我们的模块与模块之间相互的依赖关系可以保持原有的状态

## Webpack 资源模块加载

我们尝试通过 webpack 来打包 css 文件，先创建一个 main.css 文件，然后去编写一些简单的样式

```css
body {
  margin: 0 auto;
  padding: 0 20px;
  min-width: 800px;
  background: #f4f8fb;
}
```

然后将入口的文件路径指向这个 css 文件

```js
const path = require('path')

module.exports = {
  // 指定工作模式，production development none
  mode: 'none',
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.css',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'dist') // 指定输出路径，必须是绝对路径
  }
}
```

这个时候我们如果去运行打包命令是不行，因为 webpack 内部默认只会处理 js 文件，也就是说会把打包过程中遇到的所有文件都当做是 js 文件，所以它是没有解析 css 文件的功能的,为了使得它具有处理其他文件的功能，我们就需要去安装对应的文件资源加载器（loader）

所以我们需要去配置处理 css 文件的加载器`css-loader`

```bash
yarn add css-loader --dev
```

然后在配置文件中进行配置,也就是在 `module` 属性中添加一个 `rules`数组，这个数组就是我们针对其他资源模块的规则的配置

```js
const path = require('path')

module.exports = {
  // 指定工作模式，production development none
  mode: 'none',
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.css',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'dist') // 指定输出路径，必须是绝对路径
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: 'css-loader'
      }
    ]
  }
}
```

每个规则对象都需要设置两个属性，一个是 `test`属性，它是一个正则表达式，用来匹配打包过程中遇到的文件，还有一个是 `use`属性，用来匹配我们在遇见对应的文件时需要使用的`loader`

然后我们就可以执行打包命令了,它就可以正常工作了

但是我们在页面中样式并没有匹配上，原因是因为 css-loader 的作用就是将 css 文件转化为一个 js 模块

在打包后的 bundle.js 中可以看到

<img class="custom" :src="$withBase('/img/cssloader.png')" alt="queue">

具体实现就是样式 push 到了一个数组中，但是并没有使用到这个数组，所以样式不会生效

这个时候就需要 style-loader 了

```bash
yarn add style-loader --dev
```

然后在规则中去配置

```js
module: {
    rules: [
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]
        }
    ]
}
```

如果我们对同一个类型的文件配置了多个 loader ，执行顺序是从后往前执行的，所以需要将 css-loader 放在后面

然后执行打包，打包后的bundle中就会多出来两个模块

<img class="custom" :src="$withBase('/img/styleloader.png')" alt="queue">

其中第一个模块使用了最后一个模块，中间的两个模块还是通过 css-loader 工作后的结果

最后一个模块的 insertStyleElement 函数中通过 style 标签的形式将样式代码挂载到了页面中

<img class="custom" :src="$withBase('/img/styleloader2.png')" alt="queue">

然后我们在页面中就可以看到样式正常工作了

**总结：Loader 是 Webpack 的核心特性，借助于 Loader 就可以加载任何类型的资源**

## Webpack 导入资源模块

上面只是做了一个尝试，正确的做法是以js文件作为打包入口，然后去引入css文件，css-loader仍然可以正常工作

将入口文件修改为main.js文件，然后在main.js文件中去导入main.css文件

```js
entry: './src/main.js',
```

```js
import './main.css'
```

然后打包,结果仍然是符合预期的

在添加一个heading.css文件,编写一些样式

```css
.heading {
  padding: 20px;
  background: #343a40;
  color: #fff;
}
```

然后在 heading.js 文件中去引入

```js
import './heading.css'

export default () => {
  const element = document.createElement('h2')

  element.textContent = 'hello world'
  // 给元素添加样式
  element.classList.add('heading')
  element.addEventListener('click', () => {
    alert('hello webpack')
  })

  return element
}
```

重新打包，结果也是没问题的

**Webpack 建议根据代码的需要动态导入资源，因为需要资源的不是应用，而是代码**

代码想要正常工作就必须要加载对应的资源

## Webpack 文件资源加载器

对于项目中使用到的图片字体等资源，我们就需要使用到 file-loader 了

准备一个图片，然后放在src目录下

安装 file-loader

```bash
yarn add file-loader --dev
```

然后在配置文件中配置 file-loader

```js
const path = require('path')

module.exports = {
  // 指定工作模式，production development none
  mode: 'none',
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.js',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'dist') // 指定输出路径，必须是绝对路径
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
        // 配置文件资源加载器
      {
        test: /\.png$/,
        use: 'file-loader'
      }
    ]
  }
}
```

执行打包,然后在 dist目录下就会多出一个图片文件，在生成的 bundle.js 文件的最后一个模块中就是我们的图片资源信息

<img class="custom" :src="$withBase('/img/imgloader.png')" alt="queue">

现在我们由于是测试情况，打开页面可以看到访问的图片路径是根目录下的图片，但是我们的图片不在根目录下，在dist目录下

<img class="custom" :src="$withBase('/img/imgerr.png')" alt="queue">

这个时候我们在配置一个publicPath就可以正常访问到图片了

```js
 output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'dist'), // 指定输出路径，必须是绝对路径
    publicPath: 'dist/'
  },
```

然后重新打包就可以正常访问到图片了

注意 dist后面的 `/`不能省略，打包后我们在bundle.js文件中可以看到

<img class="custom" :src="$withBase('/img/publicPath.png')" alt="queue">

是通过__webpack_require__.p 这个变量和图片名称拼接起来的，这个变量也就是我们配置的publicPath

## Webpack URL 加载器

除了 file-loader这种拷贝形式的加载器以外，还有一种通过 Data URLs来表示文件的加载器， Data URLs是一种特殊的文件协议，可以用来直接表示文件，通过url内容直接表示文件内容，url里面的文本就已经包含了文本内容

例如

```html
data:text/html;charset=UTF-8,<h1>html content</h1>
```

浏览器就可以解析出来这是一个html类型的文件，编码时utf-8，内容是一段包含h1标签的html代码

如果是图片或者字体这类无法通过文本去表示的二进制类型文件，可以通过将文件的内容进行 base64 编码，将编码结果去表示文件内容

webpack 打包静态资源模块时，同样可以使用这种方式去实现，通过 Data URLs就可以以代码的形式去表示任何类型的文件

需要安装url-loader

```bash
yarn add url-loader --dev
```

然后去配置文件中进行配置

```js
module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.png$/,
        use: 'url-loader'
      }
    ]
  }
```

这个时候Webpack打包时遇见png文件就会以Data URLs的形式去打包了

执行打包后，dist目录下不会生成png文件了，我们打开bundle.js文件，找到最后一个模块，此时他导出就不是一个路径，而是一个完整的Data URLs

<img class="custom" :src="$withBase('/img/urllaoder.png')" alt="queue">

这种方式适合项目中体积小的资源，因为如果体积较大的话就会造成打包结果非常大，从而影响运行速度

推荐使用方式

+ 小文件使用 Data URLs，减少请求次数
+ 大文件淡出提取存放，使用file-loader，提高加载速度

我们可以在url-loader中通过配置来实现这种方式

```js
module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024 // 10 KB
          }
        }
      }
    ]
  }
```

这样的话 url-loader 只会处理 10KB 以下的文件，对于超过 10KB 的文件还是会交给 file-loader 去处理

然后重新打包，dist 目录下就会多出来一张图片，原因是我们准备的图片大小超过了 10KB

**需要注意的是这种方式仍然需要安装 file-loader ,因为 url-loader 对于超过限制的文件仍然会去调用 file-laoder ，如果没有 file-loader，就会发生错误**

## Webpack 常用加载器分类

+ 编译转换类

  > 这种类型的 loader 会将文件转换为 js 代码

+ 文件操作类

  > 将文件拷贝到输出目录，将输出目录中的文件导出

+ 代码检查类

  > 针对于代码检查，不会修改生产环境的代码，提高代码质量

## Webpack 处理 ES2015

如果需要处理ES6 的代码，需要通过 babel-loader

安装

```bash
yarn add babel-loader @babel/core @babel/preset-env --dev
```

然后在规则中新增一条规则

```js
{
    test: /\.js$/,
        use: {
            loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
        }
}
```

然后执行打包命令，在打包完成的bundle.js 文件中就可以看到我们的 ES6 代码都被转换了

## Webpack 加载资源的方式

Webpack 兼容多种模块化标准

+ 遵循 ES Module 标准的 import 声明

+ 遵循 CommonJS 标准的 require 函数

> 如果想通过 require 函数载入 ES Module 的默认导出，需要通过 require('./heading.js').default 这种形式来载入

+ 遵循 AMD 标准的 define 函数和 require 函数

+ Loader加载的非 JavaScript 也会触发资源加载

+ 样式代码中的 @import 指令和 url 函数

+ HTML 代码中图片标签的 src 属性

推荐不要在项目中混合使用这些标准，混合使用会大大降低项目的可维护性



### 样式代码中的 @import 指令和 url 函数

现在样式文件中导入资源模块

在 main.js 中载入 css 文件

```js
import './main.css'
```

然后在 css 文件中设置一个背景图片

```css
body {
  margin: 0 auto;
  padding: 0 20px;
  min-width: 800px;
  background-image: url(bundle3.png);
  background-size: cover;
}
```

我们执行打包命令，在打包的过程中， webpack 遇见css 文件就会使用 css-loader去处理，在处理 css 文件的时候又遇到了png文件，这个时候就会使用 url-loader 去处理图片

我们在编写一个 reset.css 文件

```css
* {
  margin: 0;
  padding: 0;
}
```

然后在 main.css 中载入

```css
@import url(reset.css);

body {
  margin: 0 auto;
  padding: 0 20px;
  min-width: 800px;
  background-image: url(bundle3.png);
  background-size: cover;
}
```

然后我们执行打包命令，我们可以通过在浏览器中查看打包后的结果，可以看到reset.css也被打包了，并且正常工作了

### HTML 代码中图片标签的 src 属性

新建一个 footer.html 文件，通过 img 标签去引入一张图片

```html
<footer>
  <img src="./bundle3.png" width="256">
</footer>
```

然后在 main.js 中去载入这个 HTML 文件

```js
import footerHtml from  './footer.html'

document.write(footerHtml)
```

接下来我们还需要为 HTML 文件配置对应的 Loader，不然 webpack 是不认识 HTML 文件的
安装

```bash
yarn add html-loader --dev
```

然后在 webpack.config.js 配置文件的rules规则中添加对应的规则

```js
{
    test: /\.html$/,
        use: {
            loader: 'html-loader'
        }
}
```

运行打包命令，打包完成后，可以看到footer.html中的图片也可以正常显示，说明 HTML 文件中 img 的 src属性也可以触发资源模块的加载

### HTML 中其它需要加载资源的标签配置

在 HTML中 ， 有时候a 标签的 href 属性也需要触发资源文件的加载

将 footer.html 修改一下

```html
<footer>
  <a href="./bundle3.png">down png</a>
</footer>
```

然后打包，我们去点击 a 标签的时候却发现找不到对应的资源，原因是因为 HTML 只会默认处理 img 的 src 属性，如果其他标签的属性也需要触发资源的加载，可以通过配置的方式来实现

```js
{
    test: /\.html$/,
        use: {
            loader: 'html-loader',
                options: {
                    attributes: {
                        list: [
                            {
                                tag: 'img',
                                attribute: 'src',
                                type: 'src'
                            },
                            {
                                tag: 'a',
                                attribute: 'href',
                                type: 'src'
                            }
                        ]
                    }
                }
        }
}
```

通过给 html-loader 增加一个options选项，按照上面代码中的配置就可以来实现

然后我们重新打包，就可以看到 a 标签中的资源文件可以被找到了

## Webpack 核心工作原理

在项目中一般都会散落着各种各样的资源文件，Webpack会根据我们的配置找到其中的一个文件作为打包入口

<img class="custom" :src="$withBase('/img/webpackwork.png')" alt="queue">

一般情况下这个入口文件都会是一个js文件

<img class="custom" :src="$withBase('/img/webpackwork2.png')" alt="queue">

然后它会顺着入口文件中的代码，根据代码中出现的import或者是 require之类的语句，解析推断出该文件所以依赖的资源模块，然后分别去解析每个资源模块对应的依赖，最后就形成了整个项目中所有用到的文件的一个依赖关系的依赖树

<img class="custom" :src="$withBase('/img/webpackwork3.png')" alt="queue">

有了这个依赖树之后， Webpack 会遍历这个依赖树，找到每个节点对应的资源文件，最后根据配置文件中的rules属性，去找到该模块所对应的加载器，交给对应的加载器去加载对应的模块

<img class="custom" :src="$withBase('/img/webpackwork4.png')" alt="queue">

最后会将加载到的结果放入打包结果中，从而实现整个项目的打包，整个过程中， Loader 机制起到了很重要的作用,因为没有 Loader 的话，它就没有办法去实现各种各样的资源文件的加载

**Loader 机制是 Webpack 的核心**

## 开发一个 Loader

我们来开发一个markdown文件的加载器markdown-loader

markdown文件一般都是转换成HTML之后在被呈现在页面上的

在项目的根目录下创建一个 markdown-loader.js的文件

每个Webpack Loader都需要去导出一个函数

输入是加载到的资源文件的内容，输出就是处理后的结果

```js
const marked = require('marked')

module.exports = source => {
  const html = marked(source)
  return `module.exports = ${JSON.stringify(html)}`
}
```

然后在Webpack的配置文件中去配置我们自己写的loader

规则中的use属性也可以是一个相对路径

```js
{
    test: /\.md$/,
    use: './markdown-loader.js'
},
```

webpack 加载器的工作过程类似于一个工作管道，可以使用一个loader，也可以去使用多个loader

<img class="custom" :src="$withBase('/img/webpackloader.png')" alt="queue">

loader管道最后必须返回的是JavaScript代码

也可以返回html字符串然后交给下一个 loader 去处理

```js
const marked = require('marked')

module.exports = source => {
  const html = marked(source)
  // 第一种方式 返回 JavaScript代码
  // return `module.exports = ${JSON.stringify(html)}`

  // 第二种 返回 html 字符串交给下一个 loader 处理
  return html
}
```

然后在配置文件中

```js
{
   test: /\.md$/,
   use: [
     'html-loader',
     './markdown-loader.js'
   ]
}
```

这样的打包结果也是符合预期的

Loader 的工作就是负责资源文件从输入到输出的转换, 对于同一个资源可以使用多个 loader 处理

## 插件机制

### 介绍

插件机制是 Webpack 中另外一种核心特性，该机制增强了 Webpack 自动化能力，

Loader 专注于实现资源模块的加载， Plugin 解决其他自动化工作,比如Plugin在打包前可以自动清除打包目录，拷贝静态文件至输出目录，压缩输出代码等等，可以说有了 plugin  的 webpack 实现了前端工程化中绝大多数部分

### clean-webpck-plugin

自动清除输出目录的插件

安装

```bash
yarn add clean-webpack-plugin --dev
```

在配置文件中去载入这个插件

```js
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
```

然后需要配置一个 plugins 的属性

```js
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  // 指定工作模式，production development none
  mode: 'none',
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.js',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'dist'), // 指定输出路径，必须是绝对路径
    publicPath: 'dist/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024 // 10 KB
          }
        }
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            attributes: {
              list: [
                {
                  tag: 'img',
                  attribute: 'src',
                  type: 'src'
                },
                {
                  tag: 'a',
                  attribute: 'href',
                  type: 'src'
                }
              ]
            }
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
}
```

### html-webpack-plugin

自动生成使用 bundle.js 的HTML

#### 基本使用

安装

```bash
yarn add html-webpack-plugin --dev
```

配置文件中的配置

```js
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // 指定工作模式，production development none
  mode: 'none',
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.js',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'dist') // 指定输出路径，必须是绝对路径
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          'html-loader',
          './markdown-loader.js'
        ]
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024 // 10 KB
          }
        }
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
          options: {
            attributes: {
              list: [
                {
                  tag: 'img',
                  attribute: 'src',
                  type: 'src'
                },
                {
                  tag: 'a',
                  attribute: 'href',
                  type: 'src'
                }
              ]
            }
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin()
  ]
}
```

#### 指定配置选项

```js
plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        title: 'Webpack Plugin',
        meta: {
            viewport: 'width=device-width'
        }
    })
]
```

#### 根据模板生成html

对于需要大量定制的html文件，我们可以通过模板的形式来生成

先准备一个template.html模板

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Webpack</title>
</head>
<body>
  <div class="container">
    <h1><%= htmlWebpackPlugin.options.title %> </h1>
  </div>
</body>
</html>
```

对于动态的内容可以通过`htmlWebpackPlugin.options`拿到

有了模板文件后，在配置文件中去指定我们的模板

```js
plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        title: 'Webpack Plugin',
        meta: {
            viewport: 'width=device-width'
        },
        template: './src/template.html'
    })
]
```

然后我们执行打包命令就可以看到生成的 html 页面就是根据我们的模板所生成的了

**注意：html-webpack-plugin和html-loader会有冲突，不能同时使用**

那我们如果同时输出多个页面文件呢？

其实也非常简单配置多个HtmlWebpackPlugin就可以了

```js
plugins: [
    // 用于生成index.html
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin',
      meta: {
        viewport: 'width=device-width'
      },
      template: './src/index.html'
    }),
    // 用于生成 about.html
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin',
      filename: 'about.html'
    })
  ]
```

### copy-webpack-plugin

对于项目中的icon等类似的文件是不需要参与打包，可以直接复制到dist目录下

借助于copy-webpack-plugin

安装

```bash
yarn add copy-webpack-plugin --dev
```

配置：

```js
new CopyWebpackPlugin({
    patterns: [
        { from: 'public', to: '.' }
    ]
})
```

## 开发一个插件

相比于loader， Plugin 拥有更宽的能力范围，Plugin 通过钩子机制实现

Plugin 必须是一个函数或者是一个包含 apply 方法的对象

我们来写一个 清除 webpack 打包生成的的文件中的注释

那么这个 Plugin 的执行时机是：要清除 bundle.js 文件中的注释，只有当文件内容确定之后才能去清除

我们可以通过[官方文档](https://www.webpackjs.com/api/compiler-hooks/#emit)查看到一个叫做 emit  的钩子,他是在生成资源到 output 目录之前执行

<img class="custom" :src="$withBase('/img/webpackemit.png')" alt="queue">

```js
// 作用： 清除 webpack 打包生成的的文件中的注释
// 执行时机：要清除 bundle.js 文件中的注释，只有当文件内容确定之后才能去清除
class MyPlugin {
  // compiler 包含了此时构建的所有信息, 通过该对象注册钩子函数
  apply(compiler) {
    compiler.hooks.emit.tap('MyPlugin', compilation => {
      // compilation => 可以理解为此次打包的上下文
      for (const name in compilation.assets) {
        console.log(name)
      }
    })
  }
}
```

现在配置文件中进行配置

```js
plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin',
      meta: {
        viewport: 'width=device-width'
      },
      template: './src/index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '.' }
      ]
    }),
    new MyPlugin()
  ]
```



我们可以打印看一下

```
615273cc5d97e9bb8bf4dedf8c249a60.png
bundle.js
b.png
index.html
```

打印出来我们输出的文件名称

然后继续编写我们的插件

```js
// 作用： 清除 webpack 打包生成的的文件中的注释
// 执行时机：要清除 bundle.js 文件中的注释，只有当文件内容确定之后才能去清除
class MyPlugin {
  // compiler 包含了此时构建的所有信息, 通过该对象注册钩子函数
  apply(compiler) {
    compiler.hooks.emit.tap('MyPlugin', compilation => {
      // compilation => 可以理解为此次打包的上下文
      for (const name in compilation.assets) {
        // compilation.assets[name].source() => 获取文件内容需要通过 source 方法
        if (name.endsWith('.js')) {
          const content = compilation.assets[name].source()
          // 替换注释
          const withoutComments = content.replace(/\/\*\*+\*\//g, '')
          // 将结果重新赋值
          compilation.assets[name] = {
            // 返回文件内容
            source: () => withoutComments,
            // 返回文件大小
            size: () => withoutComments.length
          }
        }
      }
    })
  }
}
```

编写完成后，再次运行打包，就会发现生成的 bundle.js 每一行开头的注释都被移除掉了

这就是 webpack Plugin 的工作过程，

通过这个过程我们了解了 Plugin就是通过在生命周期的钩子中挂载函数实现扩展

## Webpack 自动编译

webpack cli 提供了 watch 的工作模式，在这种模式下，webpack 会监听文件变化，自动重新打包

只需要子启动是添加一个 --watch 的参数

```bash
yarn webpack --watch
```

## 自动刷新浏览器(Webpack Dev Server)

Webpack Dev Server 用户提供开发的 HTTP Server,集成了自动编译和自动刷新浏览器等功能

安装

```bash
yarn add webpack-dev-server --dev
```

运行

```bash
yarn webpack-dev-server
```

Webpack Dev Server 为了执行效率，并不会将打包结果输出到dist目录，他会将打包结果存放在内存中，这样就可以减少很多不必要的磁盘读写操作，从而大大提高构建效率

还可以传递一个`--open`的参数让其自动打开浏览器

```bash
yarn webpack-dev-server --open
```

## Webpack Dev Server 静态资源访问

Dev Server 默认只会 serve 打包输出文件，只要是Webpack 输出的文件，都可以被正常访问，如果需要其他静态资源文件也需要被 serve 访问

可以在配置文件中增加一个 devServer 的配置

```
devServer: {
	// 额外资源文件路径
	contentBase: './public'
},
```

## 配置代理

```
 devServer: {
    // 额外资源文件路径
    contentBase: './public',
    proxy: {
      '/api': {
        target: 'http://api.github.com',
        pathRewrite: {
          '^/api': ''
        },
        // 不能使用 localhost:8080 作为请求的主机名
        // true 表示会以代理地址作为主机名
        changeOrigin: true
      }
    }
  }
```

## Source Map

### 介绍

通过构建编译的操作可以将开发阶段的源代码转换成可以在生产环境中运行的代码，那么就会带来一个问题，实际运行的代码与源代码会有很大的差异，如果我们需要去调试我们的应用，或者是运行应用的过程中出现了错误，那么我们将无从下手，source map就是解决这类问题的最好办法

source map 用来映射转换后的代码与源代码之前的关系

source map 解决了源代码与运行代码不一致所产生的问题

### Webpack 配置Source Map

Webpack 配置 Source Map 也非常简单，在配置文件中添加一个 devtool 的属性

```js
module.exports = {
    //... 其它配置
    devtool: 'source-map'
}
```

然后执行打包命令，打包完成后就可以在 dist 目录下看到 一个以 map为后缀的文件，这个就是我们的source map 文件

### Source Map 类型

Webpack 支持12种不同的 source map 类型，每种方式的效率和效果各不相同,一般效果最好的生成速度最慢，生成速度最快的一般也没什么好的效果

source map 类型对比

<img class="custom" :src="$withBase('/img/sourcemapc.png')" alt="queue">

**eval 模式下的 Source Map**

将devtool修改为eval模式

```js
module.exports = {
    //... 其它配置
    devtool: 'eval'
}
```

这种模式下不会生成source map 文件，他的构建速度也是最快的，效果也是非常简单的，只能定位源代码的文件名称，不知道具体的行列信息

总结： 

+ eval - 是否使用 eval 执行模块代码
+ cheap - Source Map 是否包含行信息
+ module - 是否能够得到 Loader 处理之前的源代码

source map 类型中添加了 module的名称时会对应到源代码，只有cheap 时就会对应到编译转换后的结果

最佳实践：

开发模式： cheap-module-eval-source-map

生产模式：选择none,也就是不产生source map 文件，Source Map 会暴露源代码，存在一定风险

调试是开发阶段的事情，如果一定要开启，建议选择 nosources-source-map ，它可以提供行列信息并且不会暴露源代码

## Webpack 自动刷新问题

如果我们编写页面的过程中，然后在页面中填入了一些信息，我们对代码修改后，webpack dev server就会自动编译并刷新浏览器，这样就会造成一个问题，就是我们编填写的信息会丢失，又需要重新去填写

## Webpack HMR(模块热替换)

我们可以实时的去替换应用中的某个模块，并且应用的运行状态不受影响

热替换只将修改的模块替换

HMR 是Webpack中最强大的功能之一，极大的提高了开发效率

HMR 已经集成在了 webpack-dev-server中，不需要单独安装

使用的方式可以通过在运行 webpack-dev-server命令时增加一个`--hot`的参数

```bash
yarn webpack-dev-server --hot
```

也可以通过在配置文件中添加相应的配置来完成

首先需要在devServer中添加一个

```j
hot: true
```

然后需要导入一个webpack内置的插件

```
const webpack = require('webpack')
// 在plugins中添加
new webpack.HotModuleReplacementPlugin()
```

这样我们就开启了 webpack 的 HMR 功能，但是现在修改样式文件是可以实现热更新了，修改js文件的话它还是会自动刷新页面，这是为什么呢？

原因：

Webpack中的HMR需要手动处理模块热替换逻辑

样式文件可以直接使用热更新是因为 style-loader已经处理了热更新，所以我们不需要在单独处理

样式模块只需要将修改了的样式替换就可以，但是JavaScript 并没有任何规律，可能导出的是一个对象，也可能是一个字符串，还有可能导出的是函数，我们导出成员的使用也是各不相同的，所以webpack面对这些毫无规律的js模块，它就不知道如何处理更新后的模块，也就没法实现一个通用的处理js代码热替换模块

### HMR API

HRM 的 API 中为 module提供了一个`hot`属性,它是一个对象，提供了一个`accept`方法，用于注册当某个模块更新后的处理函数

第一个参数是模块的路径，第二个参数是处理函数

```js
module.hot.accept('./editor', () => {
    // 处理模块更新的逻辑
})
```

HMR 注意事项

1. 处理 HMR 的代码报错会导致自动刷新

   > 自动刷新后会丢失掉错误信息，我们就不容易找到错误的地方，推荐使用hotOnly的方式，这样它就不会自动刷新页面

2. 没启用 HMR 的情况下，使用了 HMR  的 API 会报错

   > 我们应该先判断module.hot是否存在，然后在处理我们的逻辑

## Webpack 生产环境优化

生产环境更注重运行效率，开发环境注意开发效率，我们应该为不同的工作环境创建不同的配置

有两种方式来实现

1. 配置文件根据环境不同导出不同配置
2. 一个环境对应一个配置文件

第一种方式

```js
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = (env, argv) => {
  const config = {
    // 打包入口，如果是相对路劲，前面的 ./ 不能省略
    entry: './src/main.js',
    // 配置输出，要求是一个对象
    output: {
      filename: 'bundle.js', // 输出文件的名称
      path: path.join(__dirname, 'dist') // 指定输出路径，必须是绝对路径
    },
    devtool: 'source-map',
    devServer: {
      hot: true,
      // 额外资源文件路径
      contentBase: './public',
      proxy: {
        '/api': {
          target: 'http://api.github.com',
          pathRewrite: {
            '^/api': ''
          },
          // 不能使用 localhost:8080 作为请求的主机名
          // true 表示会以代理地址作为主机名
          changeOrigin: true
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.md$/,
          use: [
            'html-loader',
            './markdown-loader.js'
          ]
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.png$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 10 * 1024 // 10 KB
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Webpack Plugin',
        meta: {
          viewport: 'width=device-width'
        },
        template: './src/index.html'
      }),
      new webpack.HotModuleReplacementPlugin()
    ]
  }
  if (env === 'production') {
    config.mode = 'production'
    config.devtool = false
    config.plugins = [
      ...config.plugins,
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public', to: '.' }
        ]
      })
    ]
  }
  return config
}
```

第二种方式

一般来说会有三个配置文件，webpack.common.js，webpack.dev.js，webpack.prod.js

然后通过webpack-merge来合并配置

```bash
yarn add webpack-merge --dev
```

common.js文件

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  // 打包入口，如果是相对路劲，前面的 ./ 不能省略
  entry: './src/main.js',
  // 配置输出，要求是一个对象
  output: {
    filename: 'bundle.js', // 输出文件的名称
    path: path.join(__dirname, 'dist') // 指定输出路径，必须是绝对路径
  },
  devtool: 'source-map',
  devServer: {
    hot: true,
    // 额外资源文件路径
    contentBase: './public',
    proxy: {
      '/api': {
        target: 'http://api.github.com',
        pathRewrite: {
          '^/api': ''
        },
        // 不能使用 localhost:8080 作为请求的主机名
        // true 表示会以代理地址作为主机名
        changeOrigin: true
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          'html-loader',
          './markdown-loader.js'
        ]
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10 * 1024 // 10 KB
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack Plugin',
      meta: {
        viewport: 'width=device-width'
      },
      template: './src/index.html'
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}
```

prod.js

```js
const common = require('./webpack.common')
const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '.' }
      ]
    })
  ]
})
```

dev类似

## DefinePlugin

为代码注入全局成员 process.env.NODE_ENV

使用方式：

```js
const webpack = require('webpack')
```

然后在plugins中去添加

```js
plugins: [
   new webpack.DefinePlugin({
     // API_BASE_URL: '"https://api.exp.com"'
     API_BASE_URL: JSON.stringify('https://api.exp.com')
   })
]
```

DefinePlugin它要求的值是一个符合JS规范的代码片段

这样API_BASE_URL这个变量就被注入到全局了，我们可以在代码中去使用它

## Tree Shaking

自动检测代码中未引用的代码并移除，该功能会在生产模式下自动开启

Tree Shaking不是 Wepack 中某个配置选项，是一组功能搭配使用后的优化效果

在不是生产模式下，我们可以通过一定的配置来实现

```js
optimization: {
    usedExports: true, // 只导出被使用了的成员
    // 合并模块 => 尽可能将所有模块合并输出到一个函数中
    // 这样既提高了运行效率，又减少了代码体积 又被叫做 Scope Hoisting
   	concatenateModules: true,
    minimize: true // 开启代码压缩
}
```

由 Webpack 打包的代码必须使用 ESM

## sideEffects （副作用）

这里的副作用是指：模块执行除了导出成员之外所作的事情

sideEffects 一般用于 npm 包标记是否有副作用，product 模式下自动开启

需要在两个地方进行设置

一个是在webpack.config.js文件中

```js
optimization: {
    sideEffects: true
}
```

这里表示开启这个功能

一个package.json中

```json
"sideEffects": false
```

这里表示当前代码没有副作用

**使用sideEffects的前提是确保代码真的没有副作用**

也可以对某一些文件进行标记，代表这些文件有副作用，那么在打包的时候它们就不会被移除了

```js
"sideEffects": [
    "./src/extend.js",
    "*.css"
]
```

## Webpack 代码分割

所有代码最终都会被打包到一起，那么就会造成 bundle 体积过大,我们的应用并不是每个模块在启动时候都是必要的，合适的方案就是 分包，按需加载

Webpack 实现模块化打包的方式主要有两种

+ 多入口打包
+ 动态导入

### 多入口打包

多入口打包一般适用于多页面程序，一个页面对应一个打包入口

使用起来也非常简单，将配置文件中的entry属性定义成一个对象

```js
entry: {
    index: './src/index.js',
    album: './src/album.js'
}
```

键是打包后的文件名称，值是文件对应的路径

配置成多入口，那么输出的文件名也需要修改，因为会有多个输出文件

```js
output: {
    filename: '[name].bundle.js'
}
```

可以使用`[name]`这种占位符的方式，那么打包完成后，name就是entry中配置的文件名

打包完成后还是会有一个问题，就是在每个index.html文件中会引入所有的打包后的js

<img class="custom" :src="$withBase('/img/drk.png')" alt="queue">

我们想要的是对应的 html 文件只引入对应的 js 文件，所以接下来继续修改

在项目中使用了 HtmlWebpackPlugin 插件，这个插件会自动注入所有的 bundle.js 文件，如果只想注入对应的 bundle.js 文件，那么可以添加一个`chunks`属性

```js
new HtmlWebpackPlugin({
    title: 'Multi Entry',
    filename: 'index.html',
    template: './src/index.html',
    chunks: ['index']
}),
 new HtmlWebpackPlugin({
    title: 'Multi Entry',
    filename: 'album.html',
    template: './src/index.html',
    chunks: ['album']
}),
```

配置完成后，在执行打包，那么打包结果就是正常的了，对应的Html文件只载入了对应的bundle.js文件

### 多入口提取公共模块

在打包过程中我们需要将代码中的公共模块提取出来，配置也比较简单

在`optimization`中增加一个`splitChunks`

```js
optimization: {
    splitChunks: 'all' // all 代表会将所有的公共模块都提取到单独的文件中
}
```

打包完成后就会多出一个common的js文件，里面就是公共的模块

### Webpack 动态导入

按需加载，需要用到某个模块时，再加载这个模块，动态导入的模块会被自动分包

使用方式也非常简单

动态导入可以使用 import 这个函数来实现,它返回一个 promise

```js
import('./src/post.js').then(({default: posts}) => {
    // do something
})
```

然后我们在运行打包，打包完成后就会在 dist 目录下产生一些数字开头的js文件，例如`1.js`，这个js文件就是Webpack分包的结果

整个过程无需配置任何东西，只需要按照 ESM 中的动态导入方式载入文件，webpack 会自动处理按需加载和分包

### Webpack 魔法注释

默认通过 动态导入 打包产生的 bundle.js 文件名只是一个序号，如果我们需要给这些文件命名的话，可以使用webpack的魔法注释来实现

具体使用方式就是在调用import函数时去添加一个行内注释，这个注释有一个特定的格式

```
/* webpackChunkName: '<name>' */
```

这样我们就可以给bundle起名字了,如果设置的chunkName相同，那么他们的内容会被打包到一起

```js
import(/* webpackChunkName: 'post' */'./src/post.js').then(({default: posts}) => {
    // do something
})
```

## MiniCssExtractPlugin 提取CSS 到单个文件

这个插件是一个可以将 css 代码从打包结果中提取出来的插件，通过它我们可以实现 css 的按需加载

安装

```bash
yarn add mini-css-extract-plugin  --dev
```

在配置文件中载入插件

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
```

在 plugins 中添加配置

```js
new MiniCssExtractPlugin()
```

他在工作过程中就会自动提取 css 到单独文件中



我们的css代码是通过`css-loader` 和`style-loader` 来处理

而`style-loader `的作用就是将样式通过`style`标签的形式注入到标签中

有了这个插件后，样式文件就会存在单独文件中，通过`link`的方式去引入，不再需要`style-loader`,

我们将处理css文件的loader配置进行修改，将`style-loader`替换成`MiniCssExtractPlugin`提供的loader

```js
{
    test: /\.css$/,
        use: [
            // 'style-loader',
            MiniCssExtractPlugin.loader,
            'css-loader'
        ]
}
```

使用方式推荐：**当CSS 文件超过150KB的时候，考虑使用这个插件将CSS代码提取到单个文件中**

## OptimizeCssAssetsWebpackPlugin

压缩输出的CSS文件

安装

```bash
yarn add optimize-css-assets-webpack-plugin --dev
```

导入

```bash
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
```

配置

```
optimization: {
    // ...其它配置
    minimizer: [
    	new OptimizeCssAssetsWebpackPlugin()
    ]
}
```

官方推荐将这类压缩的插件配置在 `optimization`属性的`minimizer`数组中

这里会存在一个问题，就是原本可以正常压缩的js代码不会被压缩了，

这个是因为如果我们使用`minimizer`这个配置，webpack就会认为我们要去使用自定义的压缩器插件，他内置的压缩插件就会被覆盖掉，所以我们还需要手动的将其添加回来

webpack使用的 js 压缩插件是`terser-webpack-plugin`

安装

```
yarn add terser-webpack-plugin --dev
```

导入

```js
const TerserWebpackPlugin = require('terser-webpack-plugin')
```

配置

```
optimization: {
    // ...其它配置
    minimizer: [
    	new TerserWebpackPlugin(),
    	new OptimizeCssAssetsWebpackPlugin()
    ]
}
```

## Webpack 输出文件名 Hash

生产环境下，文件名使用 Hash

Webpack的 `filenam`属性都支持名称占位符`[name]`的方式，有三种形式的 Hash,作用也各不相同

最普通的hash

```js
filename: '[name]-[hash].bundle.js'
```

这个 Hash 是项目级别的，只要项目中有任何一个地方发生改动，这一次打包过程中的 Hash值都会发生变化

chunkhash 目录级别   同一目录下的 hash 都是相同的

```
filename: '[name]-[chunkhash].bundle.js'
```

同一目录下的文件发生变化后，该目录下的Hash才会发生变化

注意：**模块热替换 和 [chunkhash] 是冲突的**，**要确保*HotModuleReplacementPlugin*(）函数没在生产环境下执行**

contenthash 文件级别 只要是不同的文件就有不同的 Hash 值

```
filename: '[name]-[contenthash].bundle.js'
```

指定 hash 长度，可以通过下面的方式来指定 hash 的长度

```
filename: '[name]-[chunkhash:8].bundle.js'
```

如果是为了控制缓存，推荐选择8位长度