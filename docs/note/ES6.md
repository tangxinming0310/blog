---
title: ES 新特性
sidebarDepth: 2
---

## 块级作用域与let、const

ES6之前只有**全局作用域**和**函数作用域**，ES6新增了**块级作用域**

之前申明变量是通过`var`去声明，ES6之后可以通过`let`声明一个变量，使得该变量只在当前作用域有效

```js
if (true) {
	let foo = 'name'    
}
console.log(foo) // foo is not defined
```

`let`声明的变量不会被提升

```js
console.log(username)
let username = 'tom'
//Uncaught ReferenceError: username is not defined
```

`let`声明的变量可以被修改

```js
let username = 'tom'
username = 'nick'
```

除了`let`之外，还有一个关键字·`const`，它与`let`不同之处在于,`const`定义的变量不可被修改，这里的不可以被修改指的是内存地址不可以被修改，它的属性成员是可以修改的

```js
const username = 'tome'
username = 'nick'
// Uncaught TypeError: Assignment to constant variable.
const user = {}
user.name = 'jack'
user = {} // Uncaught TypeError: Assignment to constant variable.
```

`const`它声明了一个常量，那么我们在声明的时候就必须给它赋值

在工作中，推荐优先使用`const`，配合`let`，能不用`var`就不使用`var`，这样你在声明变量的时候就会明确这个变量会不会被修改，从而避免掉一些不必要的错误

## 数组的解构

```js
const arr = [100, 200, 300]
// 数组解构
const [foo, bar, baz] = arr
console.log(foo, bar, baz) // 100 200 300

const [foo, ...rest] = arr
console.log(rest) // [200, 300]
```

数组解构带来了一定的便捷性，比如数组中两个数字的交换就可以使用这个来完成

```js
const a = [1, 2, 3, 4, 5, 2, 1];
// 需要交换的两个数字的下标
let i = 2, j = 5;
// 之前我们可能需要这么写
let temp = a[i];
	a[i] = a[j];
	a[j] = temp;
// [1, 2, 2, 4, 5, 3, 1]
// 数组解构的方式
[a[i], a[j]] = [a[j], a[i]];
//  [1, 2, 2, 4, 5, 3, 1]
```

## 对象的解构

```js
const user = {
    name: 'tom',
    age: 18,
    gender: '男'
}
// 解构
const {name, age} = user
console.log(name, age) // tom 18
```

如果代码中存在相同的变量名，可以设置别名

```js
const user = {
    name: 'tom',
    age: 18,
    gender: '男'
}
const name = 'nick'
// 解构
const {name: username, age} = user
console.log(username, age) // tom 18
```

如果解构的对象中没有该属性，也可以给解构的属性设置默认值

```js
const user = {
    name: 'tom',
    age: 18,
    gender: '男'
}
// 解构
const {name: username, school = '北京大学'} = user
console.log(username, school) // tom 北京大学
```

## 模板字符串

模板字符串中允许我们可以换行

```js
const str = `hello

world`
```

可以在字符串中写入插值,也可以插入表达式

```js
const name = 'tom'
const str = `hello, ${name} ---- ${1+3}`
```

模板字符串中还可以添加一个标签

```js
const str = tag`hello world`
```

这个标签其实就是一个函数，这个函数接收一个数组参数，因为模板字符串中可能会嵌入表达式，所以数组中的内容就是按照表达式分割之后的内容

```js
const name = 'jack'
const gender = true
function tagFunc(strings) {
    console.log(strings) // ['hello,', ' is a ', '.']
}
const str = tagFunc`hello,${name} is a ${gender}.`
```

它也可以接收到所有插值表达式的值

```js
const name = 'jack'
const gender = true
function tagFunc(strings, name, genger) {
    console.log(name, genger) // jack true
}
const str = tagFunc`hello,${name} is a ${gender}.`
```

标签的作用就是对模板字符串的加工，比如上面的`gender`属性是性别，但是拿到的是一个`boolean`值，假设`true`代表男性，`false`代表女性，那么我们可以把这个值进行一次映射

```js
const name = 'jack'
const gender = true
function tagFunc(strings, name, genger) {
   const genderName = gender ? 'man' : 'women'
   return strings[0] + name + strings[1] + genderName + strings[2];
}
const str = tagFunc`hello,${name} is a ${gender}.`
console.log(str) // hello,jack is a man.
```

## 字符串的扩展方法

- includes

  ```js
  const str = 'hello world'
  str.includes('hello') // true
  str.includes('name') // false
  ```

  这个方法可以很方便的判断字符串中是否存在指定的内容

- startsWith

  ```js
  const str = 'hello world'
  str.startsWith('hello') // true
  str.startsWith('name') // false
  
  ```

- endsWith

  ```js
  const str = 'hello world'
  str.endsWith('world') // true
  str.endsWith('name') // false
  
  ```

## 参数默认值

之前我们如果要设置默认值，就需要在函数体中去做处理

```js
function foo(b) {
    b = b || true
    console.log(b) // true
}
foo()

```

如果使用短路运算符会存在一个问题，就是当我们传入的值为`false`的时候，也会使用默认值

正确的做法是

```js
function foo(b) {
    b = b === undefined ? true : b
    console.log(b) // true
}
foo()

```

ES6之后我们可以直接给参数设置默认值

```js
function foo(name = 'jack') {
    console.log(name) // jack
}
foo()

```

## 扩展运算符三个点（...)

- 剩余参数

  ```js
  // es5
  function foo() {
      // 获取传入的参数
      console.log(arguments)
  }
  foo(1, 2, 3, 4)
  // es6
  function foo1(...args) {
      console.log(args)
  }
  foo1(1, 2, 3, 4)
  
  ```

- 展开数组

  ```js
  const arr = ['foo', 'bar', 'zoo']
  console.log(...arr) // foo bar zoo
  // 合并两个数组
  const brr = ['hello', 'world']
  const crr = [...arr, ...brr]
  console.log(crr) // ["foo", "bar", "zoo", "hello", "world"]
  
  ```

- 展开对象

  ```js
  const user = {
      name: 'jack',
      age: 18
  }
  const info = {...user, gender: '男'}
  console.log(info) // {name: "jack", age: 18, gender: "男"}
  
  ```

## 箭头函数

```js
// es5
function add (a, b) {
    return a + b
}
// 箭头函数
const add = (a, b) => {
    return a + b
}
// 这种情况可以简化一下，这样会默认返回箭头后面的结果
const add = (a, b) => a + b

```

箭头函数还有一个特点，就是不会改变`this`指向

```js
// es5
const person = {
    name: 'tom',
    sayHi: function() {
        console.log(`hi, my name is ${this.name}`)
    }
}
person.sayHi() // hi, my name is tom
// es5
const name = 'jack'
const person = {
    name: 'tom',
    sayHi: () => {
        console.log(this.name)
    }
}
person.sayHi() // hi, my name is jack
// 这里箭头函数里面的this指向window,而不是person

```

## 对象字面量的增强

属性

```js
const bar = 'hello'
const obj = {
    foo: 123,
    bar: bar
}
// 之前我们需要写明键和值，现在如果键和值是一个名字的话可以简写
const obj = {
    foo: 123,
    bar
}
// 两种写法结果是一致的

```

方法

```js
const obj = {
    say: function() {
        console.log(111)
    }
}
// 现在可以直接写为
const obj = {
    say() {
        console.log(111)
    }
}
// 两种写法结果是一致的

```

动态属性的添加

```js
const name = 'name'
const obj = {}
obj[name] = 'jack'
// es6之后我们可以直接在属性中声明动态属性
const obj = {
    [name]: 'jack'
}

```

## Object.assign

`Object.assign`方法用于对象的合并，将源对象（source）的所有可枚举属性，复制到目标对象

```js
const target = { a: 1 };

const source1 = { b: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}

```

`Object.assign`方法的第一个参数是目标对象，后面的参数都是源对象。

注意，如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性。

```js
const target = { a: 1, b: 1 };

const source1 = { b: 2, c: 2 };
const source2 = { c: 3 };

Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}

```

如果只有一个参数，`Object.assign`会直接返回该参数。

```js
const obj = {a: 1};
Object.assign(obj) === obj // true

```

如果该参数不是对象，则会先转成对象，然后返回。

```js
typeof Object.assign(2) // "object"

```

由于`undefined`和`null`无法转成对象，所以如果它们作为参数，就会报错。

```js
Object.assign(undefined) // 报错
Object.assign(null) // 报错

```

`Object.assign`方法实行的是浅拷贝，而不是深拷贝。也就是说，如果源对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。

```js
const obj1 = {a: {b: 1}};
const obj2 = Object.assign({}, obj1);

obj1.a.b = 2;
obj2.a.b // 2

```

上面代码中，源对象`obj1`的`a`属性的值是一个对象，`Object.assign`拷贝得到的是这个对象的引用。这个对象的任何变化，都会反映到目标对象上面。

## Proxy

`proxy`在目标对象的外层搭建了一层拦截，外界对目标对象的某些操作，必须通过这层拦截，所以通过`proxy`可以很容易的监测到对象的读写操作

`new Proxy()`表示生成一个`Proxy`实例，`target`参数表示所要拦截的目标对象，`handler`参数也是一个对象，用来定制拦截行为

```js
var target = {
   name: 'poetries'
 };
 var logHandler = {
   get: function(target, key) {
     console.log(`${key} 被读取了`);
     return target[key];
   },
   set: function(target, key, value) {
     console.log(`${key} 被改变为 ${value}`);
     target[key] = value;
   }
 }
 var targetObj = new Proxy(target, logHandler);
 
 targetObj.name; // name 被读取了
 targetObj.name = 'hello'; // name 被改变为 others
 
 console.log(target.name); //  hello

```

 `Proxy` 的作用主要体现在三个方面

- 拦截和监视外部对对象的访问
- 降低函数或类的复杂度
- 在复杂操作前对操作进行校验或对所需资源进行管理

`proxy`除了`get`和`set`还有其他的内置方法

```js
// 在读取代理对象的原型时触发该操作，比如在执行 Object.getPrototypeOf(proxy) 时。
handler.getPrototypeOf()

// 在设置代理对象的原型时触发该操作，比如在执行 Object.setPrototypeOf(proxy, null) 时。
handler.setPrototypeOf()
 
// 在判断一个代理对象是否是可扩展时触发该操作，比如在执行 Object.isExtensible(proxy) 时。
handler.isExtensible()
 
// 在让一个代理对象不可扩展时触发该操作，比如在执行 Object.preventExtensions(proxy) 时。
handler.preventExtensions()

// 在获取代理对象某个属性的属性描述时触发该操作，比如在执行 Object.getOwnPropertyDescriptor(proxy, "foo") 时。
handler.getOwnPropertyDescriptor()
 
// 在定义代理对象某个属性时的属性描述时触发该操作，比如在执行 Object.defineProperty(proxy, "foo", {}) 时。
andler.defineProperty()
 
// 在判断代理对象是否拥有某个属性时触发该操作，比如在执行 "foo" in proxy 时。
handler.has()

// 在读取代理对象的某个属性时触发该操作，比如在执行 proxy.foo 时。
handler.get()
 
// 在给代理对象的某个属性赋值时触发该操作，比如在执行 proxy.foo = 1 时。
handler.set()

// 在删除代理对象的某个属性时触发该操作，比如在执行 delete proxy.foo 时。
handler.deleteProperty()

// 在获取代理对象的所有属性键时触发该操作，比如在执行 Object.getOwnPropertyNames(proxy) 时。
handler.ownKeys()

// 在调用一个目标对象为函数的代理对象时触发该操作，比如在执行 proxy() 时。
handler.apply()
 
// 在给一个目标对象为构造函数的代理对象构造实例时触发该操作，比如在执行new proxy() 时。
handler.construct()

```

## Reflect

`Reflect`是为**操作对象**提供的新API，它是一个静态类，不能通过`new`的方式去创建，只能调用它的静态方法

`Reflect`成员方法就是`Proxy`处理对象的默认实现

- **Reflect.get(target,property,receiver)**
  **查找并返回**`target`对象的`property`属性

```js
let obj={
    name: 'tom',
}
let result=Reflect.get(obj, 'name')
console.log(result) //tom 

let obj={
    //属性info使用了getter读取函数
    get info(){
        //this返回的是Reflect.get的user参数对象
        return this.name+ '--' +this.age
    }
}

let user={
    name: 'tom',
    age: 18,
}

let result=Reflect.get(obj,"info",user)
console.log(result) //tom--18

```

- **Reflect.set(target,propName,propValue,receiver)**
  设置`target`对象的`propName`属性为`propValue`

```js
let obj={
    name: 'tom'
}

let result=Reflect.set(obj, 'name', 'jack')
console.log(result) // true
console.log(obj.name) // jack

```

- **Reflect.has(obj,name)**

```js
const obj = {
    name: 'tom'
}
Reflect.has(obj, 'name') // true

```

- **Reflect.deleteProperty(obj, name)**

  删除对象上的某个属性

```js
Reflect.deleteProperty(obj, 'name');

```

[更多方法请查看MND](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

## Promise

[Promise解读](https://tangxinming0310.github.io/blog/network/Promise.html)

[手写Promise源码](https://tangxinming0310.github.io/blog/note/Promise.html)

## class

ES6中新增一种定义对象的关键字`class`, 它可以用来代替构造函数，达到创建“**一类实例**”的效果。

1. 类中在`constructor`中使用`this`定义的属性和方法会被定义到实例上
2. 类中在`class`中使用`=`来定义一个属性和方法，会被定义到实例上
3. 类中在`class`中直接定义一个方法，会被添加到`原型对象prototype`上

```js
class people {
    constructor () {
        this.name = 'tom'
        this.jump = function () {}
    }
    age = 18
	study = function() {
        console.log('study')
    }
	eat() {
        console.log('eat something')
    }
}

```

上面的代码中，定义在实例上的属性有`name`,`jump`,`age`,`study`，定义在原型上的是`eat`

## 静态方法

ES6之前实现静态方法是通过直接在函数上挂载方法来实现

```js
function Log() {
    
}
Log.getLogTime = function() {
    console.log('time')
}
Log.getLogTime() // time

```

ES6之后我们可以使用`static`关键字来实现

```js
class Log {
    static getLogTime() {
        console.log('time')
    }
}
Log.getLogTime() // time

```

## 类的继承

ES6之前我们实现继承一般是通过原型的方式来实现的

```js
function Parent () {
  this.name = 'Parent'
  this.age = 18
}
Parent.prototype.getName = function () {
  console.log(this.name)
}
function Child () {
  this.name = 'child'
}
Child.prototype = new Parent()
var child1 = new Child()
child1.getName()
console.log(child1)
// 'child'
// Child {name: "child"}

```

ES6之后可以使用`extends`关键字来实现

```js
class Parent{
    constructor(name) {
        this.name = name
        this.age = 18
    }
    getName = function () {
        console.log(this.name)
    }
}

class Child extends Parent {
  constructor(name, gender){
      super(name)
      this.gender = gender
  }
}
var child1 = new Child('jack', 'man')
child1.getName()
console.log(child1)
// jack
// Child {name: "jack", age: 18, gender: "man", getName: ƒ}

```

## Set

`set`是ES6中新增的一种数据类型，它可以被理解为一个集合，集合中不会存在相同的数据

```js
const s = new Set()
s.add(1).add(2)
console.log(s.size) // 2
console.log(s) // Set {1, 2}

```

遍历集合可以通过它自带的`forEach`来实现

```js
s.forEach(i =>console.log(i)) // 1 2

```

也可以通过`for...of`来实

```js
for(let v of s) {
    console.log(v)
}

```

还有一些其他的方法

```js
// 判断方法中是否存在某个元素
s.has(1) // true

// 删除某个元素
s.delete(1)

// 清空集合
s.clear()

```

对重复元素的数组去重

```js
const arr = [1, 2, 3, 4, 5, 1, 2 ,3]
const result = [...new Set(arr)]
console.log(result) // [1, 2, 3, 4, 5]

```

## Map

JavaScript 的对象（Object），本质上是键值对的集合（Hash 结构），但是传统上只能用字符串当作键。这给它的使用带来了很大的限制。

```js
const data = {};
const element = document.getElementById('myDiv');

data[element] = 'metadata';
data['[object HTMLDivElement]'] // "metadata"

```

上面代码原意是将一个 DOM 节点作为对象`data`的键，但是由于对象只接受字符串作为键名，所以`element`被自动转为字符串`[object HTMLDivElement]`。

为了解决这个问题，ES6 提供了` Map` 数据结构。它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。也就是说，Object 结构提供了“字符串—值”的对应，Map 结构提供了“值—值”的对应，是一种更完善的 Hash 结构实现。如果你需要“键值对”的数据结构，Map 比 Object 更合适。

- `Map`键名可以是任意类型

- `Map`键名为对象类型时，与内存地址绑定，如果内存地址不同，就视为两个键

  ```js
  var map = new Map();
  
  map.set(['a'], 555);
  map.get(['a']) // undefined
  
  var map = new Map();
  
  var k1 = ['a'];
  var k2 = ['a'];
  
  map
      .set(k1, 111)
      .set(k2, 222);
  
  map.get(k1) // 111
  map.get(k2) // 222
  
  ```

  

- `Map`键名为简单类型（数值，字符串，布尔值），只要两个值严格相等（===），就认为是一个键。

- `NaN`被视为同一个键，`0`和`-0`被视为同一个键

- 相同键多次赋值，后覆盖前

```js
const m = new Map();
const o = {p: 'Hello World'};

m.set(o, 'content')
m.get(o) // "content"

m.has(o) // true
m.delete(o) // true
m.has(o) // false

```

上面代码使用 Map 结构的`set`方法，将对象`o`当作`m`的一个键，然后又使用`get`方法读取这个键，接着使用`delete`方法删除了这个键。

上面的例子展示了如何向 Map 添加成员。作为构造函数，Map 也可以接受一个数组作为参数。该数组的成员是一个个表示键值对的数组。

```js
const map = new Map([
  ['name', '张三'],
  ['title', 'Author']
]);

map.size // 2
map.has('name') // true
map.get('name') // "张三"
map.has('title') // true
map.get('title') // "Author"

```

​	`Map`的方法

- `size`属性
  返回Map成员总数
- `set(key, value)`
  设置键值对，返回Map本身，所以可以链式
- `get(key)`
  读取`key`对应的值，找不到返回undefined
- `has(key)`
  返回布尔值，表示是否存在
- `delete(key)`
  删除某键，返回布尔值，表示是否成功删除
- `clear()`
  清空所有成员，无返回值。

遍历方法

- `keys()`
- `values()`
- `entries()`
- `forEach()`

## Symbol

ES6引入了一种新的原始数据类型`Symbol`(标志),表示独一无二的值,

它是js的第七种数据类型，前六种是: `undefined` ，`null` ，`Boolean`，`String`, `Number`，`Object`。

```js
let s  = Symbol();
typeof s
//'symbol'

```

`symbol`值通过`Symbol`函数生成，也就是说，对象的属性名现在可以有两种类型，一种是原来就有的字符串，另一种是新增的`symbol`类型，凡是属性名属于`symbol`类型，就都是独一无二的，可以保证不会与其他属性名产生冲突。

```js
let s1 = Symbol('foo');
let s2 = Symbol('bar');

s1 // Symbol(foo)
s2 // Symbol(bar)

s1.toString() // "Symbol(foo)"
s2.toString() // "Symbol(bar)"

```

`s1`和`s2`是两个` Symbol` 值。如果不加参数，它们在控制台的输出都是`Symbol()`，不利于区分。有了参数以后，就等于为它们加上了描述，输出的时候就能够分清，到底是哪一个值。

由于每一个 `Symbol `值都是不相等的，这意味着` Symbol `值可以作为标识符，用于对象的属性名，就能保证不会出现同名的属性。这对于一个对象由多个模块构成的情况非常有用，能防止某一个键被不小心改写或覆盖。

```js
let mySymbol = Symbol();

// 第一种写法
let a = {};
a[mySymbol] = 'Hello!';

// 第二种写法
let a = {
  [mySymbol]: 'Hello!'
};

// 第三种写法
let a = {};
Object.defineProperty(a, mySymbol, { value: 'Hello!' });

// 以上写法都得到同样结果
a[mySymbol] // "Hello!"


```

`symbol`作为属性名，该属性不会出现在`for ...in`,`for...of `循环中,也不会被`Object.keys()`， `Object.getOwnPrototypeNames()`，`JSON.stringify()`返回，但是它也不是私有属性，有一个

`Object.getOwnPropertySymbols`方法，可以获取指定对象的所有 `Symbol` 属性名

## for...of循环

`for...of`遍历数组

```js
const arr = [100, 200, 330]
for (let v of arr) {
    console.log(v)
}
// for...of可以使用break终止循环
for (let v of arr) {
    console.log(v)
    if (v===200) break;
}

```

`for...of`遍历`Set`

```js
const s = new Set(['foo', 'bar'])
for (let v of arr) {
    console.log(v)
}
// foo
// bar

```

`for...of`遍历`Map`

```js
const m = new Map()
map.set('foo', '123')
map.set('bar', '456')
for (let v of arr) {
    console.log(v)
}
// ['foo', '123']
// ['bar', '456']

```

因为`Map`键值对结构，所以每次的输出结果是一个包含键和值的数组，所以这里可以使用数组的解构方式直接拿到健值

```js
const m = new Map()
map.set('foo', '123')
map.set('bar', '456')
for (let [k, v] of arr) {
    console.log(k, v)
}
// foo 123
// bar 456

```



如果一个对象想要使用`for...of`方式进行遍历，那么就需要实现一个可迭代(Iterable)接口

数组、`Set`、`Map`都实现了这个接口，所以可以使用`for...of`来遍历

我们可以在浏览器的控制台进行查看

<img class="custom" :src="$withBase('/img/arr.png')" alt="queue">

<img class="custom" :src="$withBase('/img/set.png')" alt="queue">

<img class="custom" :src="$withBase('/img/map.png')" alt="queue">

ES6 规定，默认的 `Iterator` 接口部署在数据结构的` Symbol.iterator` 属性，或者说，一个数据结构只要具有`Symbol.iterator` 属性，就可以认为是"**可遍历的**"（`iterable`）,所以我们如果想要对象也能使用`for...of`进行遍历，我们就要去实现`Iterator`接口，它是一个具有 `next()` 方法的对象，每次调用 `next()`都会返回一个结果对象，该结果对象有两个属性，`value` 表示当前的值，`done `表示遍历是否结束。

```js
const obj = {
    store: [100, 200, 300],
    [Symbol.iterator]: function() {
        let index = 0
        const self = this
        return {
            next: function() {
                const result = {
                    value: self.store[index],
                    done: index >= self.store.length
                }
                index++
                return result
            }
        }
    }
}
for (let v of obj) {
    console.log(v)
}
// 100
// 200
// 300

```
