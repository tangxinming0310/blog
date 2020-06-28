---
title: TypeScript
sidebarDepth: 2
---


[TypeScript](https://www.tslang.cn/)

TtypeScript是JavaScript的超集，它有一套强大的类型系统，在JavaScript中，有一些错是需要在运行时期才能发现的，比如

- 访问对象没有的属性
- 调用函数没有传递对应的参数
- ...

而有了TypeScript的类型系统，这些错误就可以在编写代码的期间就被检测出来

## TypeScript中的数据类型

TypeScript通过类型注解的形式来为变量指定类型

为一个变量指定类型的语法是使用"**变量: 类型**"的形式，如下：

```typescript
let num: number = 123
```



### 数值类型

```typescript
let num: number;
num = 123;
num = "123"; // error 不能将类型"123"分配给类型"number"
```

### 布尔类型

```typescript
let bool: boolean = false;
bool = true;
bool = 123; // error 不能将类型"123"分配给类型"boolean"
```

### 字符串类型

字符串类型中你可以使用单引号或者双引号包裹内容，还可以使用 ES6 语法——模板字符串，拼接变量和字符串更为方便。

```typescript
let str: string = "Lison";
str = "Li";
const first = "Lison";
const last = "Li";
str = `${first} ${last}`;
console.log(str) // 打印结果为:Lison Li
```

另外还有个和字符串相关的类型：***字符串字面量类型***。即把一个字符串字面量作为一种类型，比如上面的字符串"Lison"，当你把一个变量指定为这个字符串类型的时候，就不能再赋值为其他字符串值了，如：

```typescript
let str: 'Lison'
str = 'haha' // error 不能将类型“"haha"”分配给类型“"Lison"”
```

### 数组

在 TypeScript 中有两种定义数组的方式：

```typescript
let list1: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3];
```

这两种写法中的`number`指定的是数组元素的类型，也可以在这里将数组的元素指定为任意类型。

### null 和 undefined

在 TypeScript 中，这两者都有各自的类型即 `undefined` 和 `null`，也就是说它们既是实际的值，也是类型

```typescript
let u: undefined = undefined;
let n: null = null; 
```

### object

`object` 在 JS 中是引用类型，它和 JS 中的其他基本类型不一样，像 `number`、`string`、`boolean`、`undefined`、`null` 这些都是基本类型，这些类型的变量存的是他们的值，而 `object` 类型的变量存的是引用，看个简单的例子：

```typescript
let strInit = "abc";
let strClone = strInit;
strClone = "efg";
console.log(strInit); // 'abc'

let objInit = { a: "aa" };
let objClone = objInit;
console.log(objClone) // {a:"aa"}
objInit.a = "bb";
console.log(objClone); // { a: 'bb' }
```

修改 objInit 时，objClone 也被修改了，是因为 objClone 保存的是 objInit 的引用，实际上 objInit 和 objClone 指向同一个对象。

对象类型的定义:

```typescript
let obj: object
obj = { name: 'Lison' }
obj = 123 // error 不能将类型“123”分配给类型“object”
```

这里有一点要注意了，我们可能会想到给 obj 指定类型为 object 对象类型，然后给它赋值一个对象，后面通过属性访问操作符访问这个对象的某个属性，实际操作一下就会发现会报错：

```typescript
let obj: object
obj = { name: 'Lison' }
console.log(obj.name) // error 类型“object”上不存在属性“name”
```

当我们希望一个值必须是对象而不是数值等类型时，比如我们定义一个函数，参数必须是对象，这个时候就用到object类型了：

```typescript
function getKeys (obj: object) {
    return Object.keys(obj) // 会以列表的形式返回obj中的值
}
getKeys({ a: 'a' }) // ['a']
getKeys(123) // error 类型“123”的参数不能赋给类型“object”的参数
```

### Symbol

```typescript
let sym: symbol = Symbol()
```

### 元组

元组可以看做是数组的拓展，它表示已知元素数量和类型的数组。确切地说，是已知数组中每一个位置上的元素的类型，来看例子：

```typescript
let tuple: [string, number, boolean];
tuple = ["a", 2, false];
tuple = [2, "a", false]; // error 不能将类型“number”分配给类型“string”。 不能将类型“string”分配给类型“number”。
tuple = ["a", 2]; // error Property '2' is missing in type '[string, number]' but required in type '[string, number, boolean]'
```

可以看到，上面我们定义了一个元组 tuple，它包含三个元素，且每个元素的类型是固定的。当我们为 tuple 赋值时：**各个位置上的元素类型都要对应，元素个数也要一致。**

### 枚举

TypeScript 在 ES 原有类型基础上加入枚举类型，使我们在 TypeScript 中也可以给一组数值赋予名字，这样对开发者来说较为友好。比如我们要定义一组角色，每一个角色用一个数字代表，就可以使用枚举类型来定义：

```typescript
enum Roles {
  SUPER_ADMIN,
  ADMIN,
  USER
}
```

上面定义的枚举类型 Roles 里面有三个值，TypeScript 会为它们每个值分配编号，默认从 0 开始，依次排列，所以它们对应的值是：

```typescript
enum Roles {
  SUPER_ADMIN = 0,
  ADMIN = 1,
  USER = 2
}
```

使用起来非常简单

```typescript
const superAdmin = Roles.SUPER_ADMIN;
console.log(superAdmin); // 0
```

也可以修改这个数值，比如想让这个编码从 1 开始而不是 0，可以如下定义：

```typescript
enum Roles {
  SUPER_ADMIN = 1,
  ADMIN,
  USER
}

```

也可以为每个值都赋予不同的、不按顺序排列的值：

```typescript
enum Roles {
  SUPER_ADMIN = 1,
  ADMIN = 3,
  USER = 7
}

```

### Any

有时，我们在编写代码的时候，并不能清楚地知道一个值到底是什么类型，这时就需要用到 any 类型，即任意类型。

```typescript
let value: any;
value = 123;
value = "abc";
value = false;

```

还可以在定义数组类型时使用 any 来指定数组中的元素类型为任意类型：

```js
const array: any[] = [1, "a", true];

```

**注意: 不要滥用 any，如果任何值都指定为 any 类型，那么 TypeScript 将失去它的意义，就会成为AnyScript。**

### void

void 和 any 相反，any 是表示任意类型，而 void 是表示没有任意类型，就是什么类型都不是，这在我们定义函数，函数没有返回值时会用到：

```typescript
const consoleText = (text: string): void => {
  console.log(text);
};

```

**void 类型的变量只能赋值为 undefined 和 null**，**其他类型不能赋值给 void 类型的变量**。

### never

never 类型指那些永不存在的值的类型，它是那些总会抛出异常或根本不会有返回值的函数表达式的返回值类型，当变量被永不为真的类型保护所约束时，该变量也是 never 类型。

```typescript
const errorFunc = (message: string): never => {
  throw new Error(message);
};

```

这个 errorFunc 函数总是会抛出异常，所以它的返回值类型是 never，用来表明它的返回值是永不存在的。

### unknown

`unknown`类型表示未知的类型，这样看来它貌似和`any`很像，但是还是有区别的，也就是所谓的“`unknown`相对于`any`是安全的”。怎么理解呢？我们知道当一个值我们不能确定它的类型的时候，可以指定它是`any`类型；但是当指定了`any`类型之后，这个值基本上是“废”了，你可以随意对它进行属性方法的访问，不管有的还是没有的，可以把它当做任意类型的值来使用，而当你指定值为`unknown`类型的时候，如果没有通过基于控制流的类型断言来缩小范围的话，是不能对它进行任何操作的，总之，`unknown`类型的值不是可以随便操作的。

### 其它类型

#### 交叉类型

交叉类型就是取多个类型的并集，使用 `&` 符号定义，被&符链接的多个类型构成一个交叉类型，表示这个类型同时具备这几个连接起来的类型的特点

```typescript
const merge = <T, U>(arg1: T, arg2: U): T & U => {
  let res = <T & U>{}; // 这里指定返回值的类型兼备T和U两个类型变量代表的类型的特点
  res = Object.assign(arg1, arg2); 
  return res;
};
const info1 = {
  name: "lison"
};
const info2 = {
  age: 18
};
const lisonInfo = merge(info1, info2);

console.log(lisonInfo.address); // error 类型“{ name: string; } & { age: number; }”上不存在属性“address”

```

#### 联合类型

联合类型实际是几个类型的结合，但是和交叉类型不同，联合类型是要求只要符合联合类型中任意一种类型即可，它使用 `|` 符号定义。当我们的程序具有多样性，元素类型不唯一时，即使用联合类型。

```typescript
const getLength = (content: string | number): number => {
  if (typeof content === "string") return content.length;
  else return content.toString().length;
};
console.log(getLength("abc")); // 3
console.log(getLength(123)); // 3

```

## 类型断言

虽然 TypeScript 很强大，但有时它还是不如我们了解一个值的类型，这时候我们更希望 TypeScript 不要帮我们进行类型检查，而是交给我们自己来，所以就用到了类型断言。类型断言有点像是一种类型转换，它把某个值强行指定为特定类型

```typescript
const getLength = (target: string | number): number => {
  if (target.length) { // error 报错信息看下方
    return target.length; // error 报错信息看下方
  } else {
    return target.toString().length;
  }
};
// 类型“string | number”上不存在属性“length”。
//  类型“number”上不存在属性“length”。

```

这个函数能够接收一个参数，并返回它的长度，我们可以传入字符串、数组或数值等类型的值。如果有 length 属性，说明参数是数组或字符串类型，如果是数值类型是没有 length 属性的，所以需要把数值类型转为字符串然后再获取 length 值。这个时候就需要类型断言，将`tagrget`的类型断言成`string`类型。它有两种写法，一种是`<type>value`，一种是`value as type`

```typescript
const getStrLength = (target: string | number): number => {
  if ((<string>target).length) { // 这种形式在JSX代码中不可以使用，而且也是TSLint不建议的写法
    return (target as string).length; // 这种形式是没有任何问题的写法，所以建议大家始终使用这种形式
  } else {
    return target.toString().length;
  }
};

```

## 接口interface

TypeScript的核心原则之一是对值所具有的*结构*进行类型检查。 它有时被称做“鸭式辨型法”或“结构性子类型化”。 在TypeScript里，接口的作用就是为这些类型命名和为你的代码或第三方代码定义契约。

### 基本使用

下面通过一个简单示例来观察接口是如何工作的：

```typescript
function printLabel(labelledObj: { label: string }) {
  console.log(labelledObj.label);
}

let myObj = { size: 10, label: "Size 10 Object" };
printLabel(myObj);

```

类型检查器会查看`printLabel`的调用。 `printLabel`有一个参数，并要求这个对象参数有一个名为`label`类型为`string`的属性。 需要注意的是，我们传入的对象参数实际上会包含很多属性，但是编译器只会检查那些必需的属性是否存在，并且其类型是否匹配。 然而，有些时候TypeScript却并不会这么宽松，我们下面会稍做讲解。

下面我们重写上面的例子，这次使用接口来描述：必须包含一个`label`属性且类型为`string`：

```typescript
interface LabelledValue {
  label: string;
}

function printLabel(labelledObj: LabelledValue) {
  console.log(labelledObj.label);
}

let myObj = {size: 10, label: "Size 10 Object"};
printLabel(myObj);

```

`LabelledValue`接口就好比一个名字，用来描述上面例子里的要求。 它代表了有一个 `label`属性且类型为`string`的对象。 需要注意的是，我们在这里并不能像在其它语言里一样，说传给 `printLabel`的对象实现了这个接口。我们只会去关注值的外形。 只要传入的对象满足上面提到的必要条件，那么它就是被允许的。

还有一点值得提的是，类型检查器不会去检查属性的顺序，只要相应的属性存在并且类型也是对的就可以。

### 可选属性

当我们定义一些结构的时候，一些结构对于某些字段的要求是可选的，有这个字段就做处理，没有就忽略，所以针对这种情况，typescript为我们提供了可选属性。

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): {color: string; area: number} {
  let newSquare = {color: "white", area: 100};
  if (config.color) {
    newSquare.color = config.color;
  }
  if (config.width) {
    newSquare.area = config.width * config.width;
  }
  return newSquare;
}

let mySquare = createSquare({color: "black"});

```

带有可选属性的接口与普通的接口定义差不多，只是在可选属性名字定义的后面加一个`?`符号。

可选属性的好处之一是可以对可能存在的属性进行预定义，好处之二是可以捕获引用了不存在的属性时的错误。 比如，我们故意将 `createSquare`里的`color`属性名拼错，就会得到一个错误提示：

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  let newSquare = {color: "white", area: 100};
  if (config.clor) {
    // 属性“clor”在类型“SquareConfig”上不存在。你是否指的是“color”?
    newSquare.color = config.clor;
  }
  if (config.width) {
    newSquare.area = config.width * config.width;
  }
  return newSquare;
}

let mySquare = createSquare({color: "black"});

```

### 只读属性

一些对象属性只能在对象刚刚创建的时候修改其值。 你可以在属性名前用 `readonly`来指定只读属性:

```typescript
interface Point {
    readonly x: number;
    readonly y: number;
}

```

可以通过赋值一个对象字面量来构造一个`Point`。 赋值后， `x`和`y`再也不能被改变了。

```typescript
let p1: Point = { x: 10, y: 20 };
p1.x = 5; // 无法分配到 "x" ，因为它是只读属性

```

TypeScript具有`ReadonlyArray<T>`类型，它与`Array<T>`相似，只是把所有可变方法去掉了，因此可以确保数组创建后再也不能被修改：

```typescript
let a: number[] = [1, 2, 3, 4];
let ro: ReadonlyArray<number> = a;
ro[0] = 12; // 类型“readonly number[]”中的索引签名仅允许读取
ro.push(5); // 类型“readonly number[]”上不存在属性“push”。
ro.length = 100; // 无法分配到 "length" ，因为它是只读属性。
a = ro; // 类型 "readonly number[]" 为 "readonly"，不能分配给可变类型 "number[]"。

```

[更多接口使用](https://www.tslang.cn/docs/handbook/interfaces.html)

## 为函数和参数定义类型

### 为函数定义类型

我们可以给函数定义类型，这个定义包括对参数和返回值的类型定义

```typescript
function add(arg1: number, arg2: number): number {
  return x + y;
}
// 或者
const add = (arg1: number, arg2: number): number => {
  return x + y;
};

```

我们使用function和箭头函数两种形式定义了add函数，以展示如何定义函数类型。这里参数 arg1 和 arg2 都是数值类型，最后通过相加得到的结果也是数值类型。

如果在这里省略参数的类型，TypeScript 会默认这个参数是 any 类型；如果省略返回值的类型，如果函数无返回值，那么 TypeScript 会默认函数返回值是 void 类型；如果函数有返回值，那么 TypeScript 会根据我们定义的逻辑推断出返回类型。

### 完整的函数类型

一个函数的定义包括函数名、参数、逻辑和返回值。我们为一个函数定义类型时，完整的定义应该包括参数类型和返回值类型。如何定义一个完整的函数类型?

```typescript
let add: (x: number, y: number) => number;
add = (arg1: number, arg2: number): number => arg1 + arg2;
add = (arg1: string, arg2: string): string => arg1 + arg2;
// 不能将类型“(arg1: string, arg2: string) => string”分配给类型“(x: number, y: number) => number”。
//  参数“arg1”和“x” 的类型不兼容。
//   不能将类型“number”分配给类型“string”。

```

我们首先定义了一个变量 add，给它指定了函数类型，也就是`(x: number, y: number) => number`，这个函数类型包含参数和返回值的类型。然后我们给 add 赋了一个实际的函数，这个函数参数类型和返回类型都和函数类型中定义的一致，所以可以赋值。后面我们又给它赋了一个新函数，而这个函数的参数类型和返回值类型都是 string 类型，这时就会报错。

### 使用接口定义函数类型

可以使用接口对函数定义类型：

```js
interface Add {
  (x: number, y: number): number;
}
let add: Add = (arg1: string, arg2: string): string => arg1 + arg2; // 不能将类型“(arg1: string, arg2: string) => string”分配给类型“Add”

```

通过接口的形式定义函数类型，这个接口`Add`定义了这个结构是一个函数，两个参数类型都是`number`类型，返回值也是`number`类型。然后我们指定变量add类型为`Add`时，再要给add赋值，就必须是一个函数，且参数类型和返回值类型都要满足接口`Add`，显然例子中这个函数并不满足条件，所以报错了。

### 使用类型别名

我们可以使用类型别名来定义函数类型

```typescript
type Add = (x: number, y: number) => number;
let add: Add = (arg1: string, arg2: string): string => arg1 + arg2; // 不能将类型“(arg1: string, arg2: string) => string”分配给类型“Add”

```

使用`type`关键字可以为原始值、联合类型、元组以及任何我们定义的类型起一个别名。上面定义了 Add 这个别名后，`Add`就成为了一个和`(x: number, y: number) => number`一致的类型定义。例子中定义了`Add`类型，指定add类型为Add，但是给add赋的值并不满足`Add`类型要求，所以报错了。

### 可选参数

TypeScript 会帮我们在编写代码的时候就检查出调用函数时参数中存在的一些错误

```typescript
type Add = (x: number, y: number) => number;
let add: Add = (arg1: string, arg2: string): string => arg1 + arg2;

add(1, 2); // right
add(1, 2, 3); // error 应有 2 个参数，但获得 3 个
add(1); // error 应有 2 个参数，但获得 1 个

```

但有时候，我们的函数有些参数不是必须的，是可选的。在学习接口的时候我们学习过，可选参数只需在参数名后跟随一个`?`即可。这个和接口形式的定义有一点区别，那就是参数位置的要求：

> 接口形式定义的函数类型必选参数和可选参数的位置前后是无所谓的，但是函数类型定义的可选参数必须放在必选参数后面，这和在 JS 中定义函数是一致的。

```typescript
type Add = (x?: number, y: number) => number; // 必选参数不能位于可选参数后。

```

## 泛型

当我们要表示一个值可以为任意类型的时候，则指定它的类型为any，比如下面这个例子：

```typescript
const getArray = (value: any, times: number = 5): any[] => {
  let ret: any[] = []
  for (let i = 0; i < times; i++) {
    ret[i] = value
  }
  return ret
}

```

这个函数接受两个参数。第一个参数为任意类型的值，第二个参数为数值类型的值，默认为 5。函数的功能是返回一个以 times 为元素个数，每个元素都是 value 的数组。这个函数我们从逻辑上可以知道，传入的 value 是什么类型，那么返回的数组的每个元素也应该是什么类型。

接下来我们实际用一下这个函数：

```typescript
getArray([1], 2).forEach(item => {
  console.log(item.length);
});
getArray(2, 3).forEach(item => {
  console.log(item.length);
});
```

我们调用了两次这个方法，使用 forEach 方法遍历得到的数组，在传入 forEach 的函数中获取当前遍历到的数组元素的 length 属性。第一次调用这个方法是没问题的，因为我们第一次传入的值为数组，得到的会是一个二维数组`[ [1], [1] ]`。每次遍历的元素为`[1]`，它也是数组，所以打印它的 length 属性是可以的。而我们第二次传入的是一个数字 2，生成的数组是`[2, 2, 2]`，访问 2 的 length 属性是没有的，所以应该报错，但是这里却不会报错，因为我们在定义`getArray`函数的时候，指定了返回值是`any`类型的元素组成的数组，所以这里遍历其返回值中每一个元素的时候，类型都是any，所以不管做任何操作都是可以的，因此，上面例子中第二次调用`getArray`的返回值每个元素应该是数值类型，遍历这个数组时我们获取数值类型的length属性也没报错，因为这里item的类型是any。

要解决上面这个场景的问题，就需要使用泛型了。泛型（Generics）是指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。

我们既要允许传入任意类型的值，又要正确指定返回值类型，就要使用泛型。我们先来看怎么改写：

```typescript
const getArray = <T>(value: T, times: number = 5): T[] => {
  return new Array(times).fill(value);
};
```

我们在定义函数之前，使用`<>`符号定义了一个泛型变量 T，这个 T 在这次函数定义中就代表某一种类型，它可以是基础类型，也可以是联合类型等高级类型。定义了泛型变量之后，你在函数中任何需要指定类型的地方使用 T 都代表这一种类型。比如当我们传入 value 的类型为数值类型，那么返回的数组类型`T[]`就表示`number[]`。现在我们再来调用一下这个 getArray 函数：

```typescript
getArray<number[]>([1, 2], 3).forEach(item => {
  console.log(item.length);
});
getArray<number>(2, 3).forEach(item => {
  console.log(item.length); // 类型“number”上不存在属性“length”
});
```

[更多泛型使用](https://www.tslang.cn/docs/handbook/generics.html)

