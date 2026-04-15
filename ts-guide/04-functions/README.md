# 第四章：函数 (Functions)

## 函数声明的五种方式

TypeScript 支持五种函数声明语法，除 Function 构造函数外均类型安全。

```ts
// Named function
function greet(name: string) {
  return 'hello ' + name
}

// Function expression
let greet2 = function(name: string) {
  return 'hello ' + name
}

// Arrow function expression
let greet3 = (name: string) => {
  return 'hello ' + name
}

// Shorthand arrow function expression
let greet4 = (name: string) => 'hello ' + name

// Function constructor (unsafe, avoid)
let greet5 = new Function('name', 'return "hello " + name')
```

## 可选参数与默认参数

用 `?` 标记可选参数（必须在必填参数之后）；默认参数可自动推断类型，无需 `?`。

```ts
function log(message: string, userId?: string) {
  let time = new Date().toLocaleTimeString()
  console.log(time, message, userId || 'Not signed in')
}

// Default parameter - type inferred from default value
function log2(message: string, userId = 'Not signed in') {
  let time = new Date().toISOString()
  console.log(time, message, userId)
}

type Context = {
  appId?: string
  userId?: string
}
function log3(message: string, context: Context = {}) {
  let time = new Date().toISOString()
  console.log(time, message, context.userId)
}
```

## Rest 参数

用 `...` 声明可变参数，类型安全地替代 `arguments`。

```ts
function sumVariadicSafe(...numbers: number[]): number {
  return numbers.reduce((total, n) => total + n, 0)
}
sumVariadicSafe(1, 2, 3) // 6

// Rest param must be last
interface Console {
  log(message?: any, ...optionalParams: any[]): void
}
```

## call / apply / bind

三种间接调用函数的方式，需开启 `strictBindCallApply` 确保类型安全。

```ts
function add(a: number, b: number): number {
  return a + b
}

add(10, 20)                  // 30
add.apply(null, [10, 20])   // 30 - spreads array as args
add.call(null, 10, 20)      // 30 - passes args in order
add.bind(null, 10, 20)()    // 30 - returns new function
```

## this 的类型声明

将 `this` 作为函数的第一个参数声明其类型，TypeScript 会在调用处强制检查。

```ts
function fancyDate(this: Date) {
  return `${this.getDate()}/${this.getMonth()}/${this.getFullYear()}`
}

fancyDate.call(new Date)  // OK
fancyDate()               // Error: 'this' context of type 'void'
                           // not assignable to type 'Date'
```

> 开启 `noImplicitThis` 强制要求显式标注 `this` 类型。

## Generator 函数

Generator 是惰性求值的值生成器，返回 `IterableIterator<T>` 类型。

```ts
function* createFibonacciGenerator() {
  let a = 0
  let b = 1
  while (true) {
    yield a;
    [a, b] = [b, a + b]
  }
}

let fib = createFibonacciGenerator() // IterableIterator<number>
fib.next() // {value: 0, done: false}
fib.next() // {value: 1, done: false}
fib.next() // {value: 1, done: false}

// Explicit return type annotation
function* createNumbers(): IterableIterator<number> {
  let n = 0
  while (1) {
    yield n++
  }
}
```

## Iterator（迭代器）

**Iterable**: 包含 `Symbol.iterator` 属性的对象。**Iterator**: 定义了 `next()` 方法的对象。

```ts
let numbers = {
  *[Symbol.iterator]() {
    for (let n = 1; n <= 10; n++) {
      yield n
    }
  }
}

for (let a of numbers) { /* 1, 2, 3, ... */ }
let allNumbers = [...numbers]              // number[]
let [one, two, ...rest] = numbers          // [number, number, number[]]
```

## 调用签名 (Call Signatures)

调用签名是函数类型的完整表达，只包含类型级代码，不包含默认值。

```ts
// Shorthand call signature
type Greet = (name: string) => string
type Log = (message: string, userId?: string) => void
type Sum = (...numbers: number[]) => number

// Implement a call signature
type Log2 = (message: string, userId?: string) => void
let log: Log2 = (message, userId = 'Not signed in') => {
  let time = new Date().toISOString()
  console.log(time, message, userId)
}
```

## 上下文类型推断 (Contextual Typing)

当函数类型已知时，TypeScript 可从上下文推断参数类型，无需显式标注。

```ts
function times(
  f: (index: number) => void,
  n: number
) {
  for (let i = 0; i < n; i++) {
    f(i)
  }
}

// n's type inferred as number from context
times(n => console.log(n), 4)

// Without inline declaration, inference fails
function f(n) {  // Error: 'n' implicitly has 'any' type
  console.log(n)
}
times(f, 4)
```

## 函数重载 (Overloaded Functions)

使用完整调用签名定义多个重载；实现签名需手动合并所有重载类型。

```ts
type Reserve = {
  (from: Date, to: Date, destination: string): Reservation
  (from: Date, destination: string): Reservation
}

// Implementation must manually combine overload types
let reserve: Reserve = (
  from: Date,
  toOrDestination: Date | string,
  destination?: string
) => {
  if (toOrDestination instanceof Date && destination !== undefined) {
    // Round trip
  } else if (typeof toOrDestination === 'string') {
    // One-way trip
  }
}

// Overload with literal types (e.g. createElement)
type CreateElement = {
  (tag: 'a'): HTMLAnchorElement
  (tag: 'canvas'): HTMLCanvasElement
  (tag: 'table'): HTMLTableElement
  (tag: string): HTMLElement       // Catchall
}

// Function declaration overload syntax
function createElement(tag: 'a'): HTMLAnchorElement
function createElement(tag: 'canvas'): HTMLCanvasElement
function createElement(tag: 'table'): HTMLTableElement
function createElement(tag: string): HTMLElement {
  // ...
}
```

## 多态与泛型 (Polymorphism / Generics)

泛型用 `<T>` 声明占位类型，TypeScript 在调用时推断具体类型，实现类型约束复用。

```ts
type Filter = {
  <T>(array: T[], f: (item: T) => boolean): T[]
}

let filter: Filter = (array, f) => {
  let result = []
  for (let i = 0; i < array.length; i++) {
    let item = array[i]
    if (f(item)) result.push(item)
  }
  return result
}

// T bound to number
filter([1, 2, 3], _ => _ > 2)
// T bound to {firstName: string}
filter(
  [{firstName: 'beth'}, {firstName: 'xin'}],
  _ => _.firstName.startsWith('b')
)

// Multiple generics: T for input, U for output
function map<T, U>(array: T[], f: (item: T) => U): U[] {
  let result = []
  for (let i = 0; i < array.length; i++) {
    result[i] = f(array[i])
  }
  return result
}
```

## 泛型绑定时机与声明位置

`<T>` 放在调用签名前 → 调用时绑定；放在类型别名后 → 使用类型时绑定。

```ts
// T bound at call time
type Filter1 = { <T>(array: T[], f: (item: T) => boolean): T[] }

// T bound when type is used - must provide T explicitly
type Filter2<T> = { (array: T[], f: (item: T) => boolean): T[] }
let numFilter: Filter2<number> = (array, f) => { /* ... */ }

// Shorthand equivalents
type Filter3 = <T>(array: T[], f: (item: T) => boolean) => T[]
type Filter4<T> = (array: T[], f: (item: T) => boolean) => T[]

// Named function
function filter<T>(array: T[], f: (item: T) => boolean): T[] { /* ... */ }
```

## 泛型类型推断

TypeScript 自动推断泛型类型；显式标注时必须全部标注或全部省略。

```ts
function map<T, U>(array: T[], f: (item: T) => U): U[] { /* ... */ }

// TypeScript infers T=string, U=boolean
map(['a', 'b', 'c'], _ => _ === 'a')

// Explicit annotation: all-or-nothing
map<string, boolean>(['a', 'b', 'c'], _ => _ === 'a')  // OK
map<string>(['a', 'b', 'c'], _ => _ === 'a')           // Error

// Sometimes explicit annotation is needed
let promise = new Promise<number>(resolve => resolve(45))
promise.then(result => result * 4)  // result is number
```

## 泛型类型别名

泛型可用于 type alias，在使用时必须显式绑定类型参数。

```ts
type MyEvent<T> = {
  target: T
  type: string
}

type ButtonEvent = MyEvent<HTMLButtonElement>

// Composing generic types
type TimedEvent<T> = {
  event: MyEvent<T>
  from: Date
  to: Date
}

// Generic inferred through function args
function triggerEvent<T>(event: MyEvent<T>): void { /* ... */ }
triggerEvent({
  target: document.querySelector('#myButton'),
  type: 'mouseover'
}) // T inferred as Element | null
```

## 有界多态 (Bounded Polymorphism)

用 `extends` 约束泛型的上界，保留子类型信息。

```ts
type TreeNode = { value: string }
type LeafNode = TreeNode & { isLeaf: true }
type InnerNode = TreeNode & { children: [TreeNode] | [TreeNode, TreeNode] }

// T extends TreeNode: preserves specific subtype
function mapNode<T extends TreeNode>(
  node: T,
  f: (value: string) => string
): T {
  return { ...node, value: f(node.value) }
}

let a: TreeNode = {value: 'a'}
let b: LeafNode = {value: 'b', isLeaf: true}
let c: InnerNode = {value: 'c', children: [b]}

let a1 = mapNode(a, _ => _.toUpperCase()) // TreeNode
let b1 = mapNode(b, _ => _.toUpperCase()) // LeafNode
let c1 = mapNode(c, _ => _.toUpperCase()) // InnerNode

// Multiple constraints with &
type HasSides = {numberOfSides: number}
type SidesHaveLength = {sideLength: number}

function logPerimeter<Shape extends HasSides & SidesHaveLength>(
  s: Shape
): Shape {
  console.log(s.numberOfSides * s.sideLength)
  return s
}

// Bounded polymorphism for variadic arity
function call<T extends unknown[], R>(
  f: (...args: T) => R,
  ...args: T
): R {
  return f(...args)
}
```

## 泛型默认值

泛型可设默认类型，带默认值的泛型必须在无默认值的泛型之后。

```ts
// Default + bound
type MyEvent<T extends HTMLElement = HTMLElement> = {
  target: T
  type: string
}

let myEvent: MyEvent = {         // T defaults to HTMLElement
  target: document.body,
  type: 'click'
}

let btnEvent: MyEvent<HTMLButtonElement> = {  // Explicit binding
  target: document.querySelector('button')!,
  type: 'click'
}

// Ordering: defaults must come after required generics
type MyEvent2<
  Type extends string,
  Target extends HTMLElement = HTMLElement,  // OK
> = {
  target: Target
  type: Type
}
```

## 类型驱动开发 (Type-Driven Development)

先设计类型签名，再填充实现。函数签名应能表达大部分行为意图。

```ts
// Step 1: sketch type signatures
function map<T, U>(array: T[], f: (item: T) => U): U[]

// Step 2: fill in implementation
function map<T, U>(array: T[], f: (item: T) => U): U[] {
  let result = []
  for (let i = 0; i < array.length; i++) {
    result[i] = f(array[i])
  }
  return result
}
```

---

## 练习题

### 练习 1：基础推断

TypeScript 会推断函数的哪些部分？参数类型、返回类型、还是两者？请验证。

```ts
function multiply(a: number, b: number) {
  return a * b
}
// What is the inferred return type?
```

### 练习 2：重载签名

为 `reserve` 添加第三个重载签名：仅传入 `destination`（立即出发），并更新实现。

```ts
type Reserve = {
  (from: Date, to: Date, destination: string): Reservation
  (from: Date, destination: string): Reservation
  // Add: single-arg overload for immediate departure
}
```

### 练习 3：泛型 `is` 断言库

实现一个类型安全的 `is` 函数，比较相同类型的值，不同类型传参应编译报错。

```ts
// Expected behavior:
is('string', 'otherstring')  // false
is(true, false)              // false
is(42, 42)                   // true
is(10, 'foo')                // Compile error!
```

### 练习 4：有界泛型

编写 `printProperty` 函数，接受一个至少有 `name: string` 属性的对象，打印其 `name` 并返回原对象（保留具体子类型）。

```ts
// Implement printProperty so these work:
let user = { name: 'Alice', age: 30 }
let result = printProperty(user) // type should be {name: string, age: number}
```

### 练习 5：改造 call

修改之前的 `call` 实现，使其仅适用于第二个参数为 `string` 的函数。其他函数调用应产生编译错误。

```ts
function call<T extends [unknown, string, ...unknown[]], R>(
  f: (...args: T) => R,
  ...args: T
): R {
  return f(...args)
}

// Test:
function fill(length: number, value: string): string[] {
  return Array.from({length}, () => value)
}
call(fill, 10, 'a')    // OK
// call(Math.max, 1, 2) // Should error
```
