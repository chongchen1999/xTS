# TypeScript 类型全览

TypeScript 的类型系统核心：**类型 = 值的集合 + 可对其执行的操作**。

---

## any

逃生舱类型，绕过所有类型检查。尽量避免使用。

```ts
let a: any = 666
let b: any = ['danger']
let c = a + b               // any - no error, no safety
```

> 开启 `tsconfig.json` 中的 `noImplicitAny`（或 `strict`）来禁止隐式 any。

---

## unknown

比 `any` 安全的"未知类型"——必须先缩窄类型才能使用。

```ts
let a: unknown = 30
let b = a === 123            // boolean
// let c = a + 10            // Error: Object is of type 'unknown'

if (typeof a === 'number') {
  let d = a + 10             // number - safe after type guard
}
```

---

## boolean

只有 `true` 和 `false` 两个值。`const` 声明会推断为 literal type。

```ts
let a = true                 // boolean
const b = true               // literal type: true
let c: boolean = true        // boolean
let d: true = true           // literal type: true
let e: true = false          // Error: Type 'false' is not assignable to type 'true'
```

---

## number

所有数字的集合（整数、浮点数、`Infinity`、`NaN` 等）。

```ts
let a = 1234                 // number
const b = 5678               // literal type: 5678
let c: number = 100          // number
let d: 26.218 = 10           // Error: Type '10' is not assignable to type '26.218'
let million = 1_000_000      // numeric separator for readability
```

---

## bigint

处理超过 `2^53` 的大整数。

```ts
let a = 1234n                // bigint
const b = 5678n              // literal type: 5678n
let c = a + b                // bigint
let d: bigint = 100n         // bigint
let e: bigint = 100          // Error: Type '100' is not assignable to type 'bigint'
```

---

## string

所有字符串的集合。

```ts
let a = 'hello'              // string
const b = '!'                // literal type: '!'
let c: string = 'zoom'       // string
let d: 'john' = 'zoe'        // Error: Type '"zoe"' is not assignable to type '"john"'
```

---

## symbol

用作对象键的唯一标识符。`const` 声明推断为 `unique symbol`。

```ts
let a = Symbol('a')                    // symbol
const b = Symbol('b')                  // typeof b (unique symbol)
const c: unique symbol = Symbol('c')   // typeof c (unique symbol)

let d: unique symbol = Symbol('d')     // Error: must be 'const'
let e = b === b                        // boolean
```

---

## Object 类型（结构化类型）

TypeScript 使用**结构化类型**（structural typing）——只关心对象的形状，不关心名字。

```ts
// object type is too broad - avoid
let a: object = { b: 'x' }
// a.b  // Error: Property 'b' does not exist on type 'object'

// object literal syntax - recommended
let b: { name: string; age: number } = {
  name: 'James',
  age: 55
}
```

### 可选属性与 readonly

```ts
let config: {
  host: string
  port?: number                // optional
  readonly name: string        // immutable after init
} = {
  host: 'localhost',
  name: 'app'
}

config.name = 'new'            // Error: Cannot assign to 'name'
```

### Index Signatures

`[key: T]: U` 语法允许对象拥有动态键。`T` 必须是 `string` 或 `number`。

```ts
let seats: {
  [seatNumber: string]: string
} = {
  '34D': 'Boris',
  '34E': 'Bill'
}

let a: {
  b: number
  [key: number]: boolean       // numeric index signature
}
a = { b: 1, 10: true, 20: false }
```

### Structural Typing 示例

只要结构匹配就能赋值，不要求类型名相同。

```ts
class Person {
  constructor(
    public firstName: string,
    public lastName: string
  ) {}
}

let c: { firstName: string; lastName: string }
c = new Person('matt', 'smith')  // OK - same shape
```

---

## Type Aliases（类型别名）

用 `type` 关键字给类型起别名，提升可读性和复用性。别名是 block-scoped 且不可重复声明。

```ts
type Age = number
type Person = {
  name: string
  age: Age
}

let driver: Person = { name: 'James May', age: 55 }

type Color = 'red'
type Color = 'blue'            // Error: Duplicate identifier 'Color'
```

---

## Union Types（联合类型）

`A | B` 表示值可以是 A 或 B（或两者都满足）。

```ts
type Cat = { name: string; purrs: boolean }
type Dog = { name: string; barks: boolean; wags: boolean }
type CatOrDogOrBoth = Cat | Dog

// Can be Cat
let a: CatOrDogOrBoth = { name: 'Bonkers', purrs: true }
// Can be Dog
a = { name: 'Domino', barks: true, wags: true }
// Can be both
a = { name: 'Donkers', purrs: true, barks: true, wags: true }

function parse(input: string | number): string {
  if (typeof input === 'string') {
    return input.toUpperCase()   // narrowed to string
  }
  return String(input * 2)       // narrowed to number
}
```

---

## Intersection Types（交叉类型）

`A & B` 表示值必须同时满足 A 和 B 的所有属性。

```ts
type Cat = { name: string; purrs: boolean }
type Dog = { name: string; barks: boolean; wags: boolean }

type CatAndDog = Cat & Dog
// Must have ALL properties from both types

let pet: CatAndDog = {
  name: 'Donkers',
  purrs: true,
  barks: true,
  wags: true
}
```

---

## Arrays

数组类型有两种等价写法：`T[]` 和 `Array<T>`。尽量保持数组元素类型一致。

```ts
let a = [1, 2, 3]            // number[]
let b = ['a', 'b']           // string[]
let c = [1, 'a']             // (string | number)[]
let d: number[] = []         // number[]

d.push(1)                    // OK
d.push('x')                  // Error: not assignable to 'number'

// empty array starts as any[], type narrows as elements are added
function buildArray() {
  let a = []                 // any[]
  a.push(1)                  // number[]
  a.push('x')                // (string | number)[]
  return a                   // final type: (string | number)[]
}
```

### readonly 数组

```ts
let arr: readonly number[] = [1, 2, 3]
let arr2 = arr.concat(4)     // OK - returns new array
// arr.push(4)               // Error: 'push' does not exist on readonly
// arr[0] = 10               // Error: only permits reading
```

---

## Tuples（元组）

固定长度、每个位置类型已知的数组。必须显式声明类型。

```ts
let a: [string, string, number] = ['malcolm', 'gladwell', 1963]

// optional element
let b: [number, number?][] = [
  [3.75],
  [8.25, 7.70]
]

// rest elements - minimum length
let friends: [string, ...string[]] = ['Sara', 'Tali', 'Chloe']

// heterogeneous list
let list: [number, boolean, ...string[]] = [1, false, 'a', 'b', 'c']

// readonly tuple
let pair: readonly [number, string] = [1, 'hello']
```

---

## null, undefined, void, never

四种表示"无"的类型，各有不同语义。

```ts
// null: absence of value
function findUser(id: number): string | null {
  return id === 1 ? 'Alice' : null
}

// undefined: not yet assigned
function returnUndefined() {
  return undefined
}

// void: function with no return statement
function sideEffect(): void {
  console.log('done')
}

// never: function that never returns
function fail(msg: string): never {
  throw new Error(msg)
}

function infinite(): never {
  while (true) {}
}
```

| 类型        | 含义                       |
|------------|---------------------------|
| `null`     | 值不存在                    |
| `undefined`| 变量尚未赋值                |
| `void`     | 函数没有显式 return 语句     |
| `never`    | 函数永远不会返回（bottom type）|

> 务必开启 `strictNullChecks`（包含在 `strict` 中）。

---

## Enums（枚举）

将一组命名常量映射为值。推荐使用 **string enum** + `const enum` 以获得最佳安全性。

```ts
// numeric enum - auto-increments from 0
enum Language {
  English = 0,
  Spanish = 1,
  Russian = 2
}

let lang = Language.Russian    // Language

// string enum - safer, prevents arbitrary numeric assignment
const enum Color {
  Red = 'Red',
  Blue = 'Blue',
  Green = 'Green'
}

let c = Color.Red              // inlined as 'Red' at compile time
// Color[0]                    // Error: const enum disallows reverse lookup
```

> ⚠️ 数字 enum 存在安全隐患（任意数字可赋值），尽量使用 string enum 或用 union type 替代。

```ts
// prefer union types over enums in most cases
type Direction = 'Up' | 'Down' | 'Left' | 'Right'
```

---

## 类型与子类型速查表

| 类型      | 子类型 (Subtype)  |
|----------|------------------|
| boolean  | Boolean literal  |
| number   | Number literal   |
| bigint   | BigInt literal   |
| string   | String literal   |
| symbol   | unique symbol    |
| object   | Object literal   |
| Array    | Tuple            |
| enum     | const enum       |

---

## 练习题

### 练习 1：类型推断

写出以下每个变量被 TypeScript 推断出的类型：

```ts
let a = 1042
let b = 'apples and oranges'
const c = 'pineapples'
let d = [true, true, false]
let e = { type: 'ficus' }
let f = [1, false]
const g = [3]
let h = null
```

### 练习 2：修复类型错误

以下代码有 4 处类型错误，找出并修复：

```ts
let age: number = '25'
let items: string[] = [1, 2, 3]
let pair: [string, number] = [1, 'hello']
let status: 'active' | 'inactive' = 'pending'
```

### 练习 3：结构化类型

定义一个 `type Product`，包含：
- `name` (string)
- `price` (number)
- `tags` (可选的 string 数组)
- `readonly id` (number)

然后创建一个符合该类型的对象。

### 练习 4：Union 与类型缩窄

写一个函数 `formatValue`，接受 `string | number | boolean` 参数：
- `string` → 返回大写
- `number` → 返回保留两位小数的字符串
- `boolean` → 返回 `"yes"` 或 `"no"`

```ts
function formatValue(val: string | number | boolean): string {
  // implement here
}
```

### 练习 5：Enum 实战

用 `const enum` 定义一个 `HttpMethod`（GET、POST、PUT、DELETE），然后写一个函数 `sendRequest(method: HttpMethod, url: string): string`，返回格式为 `"[METHOD] url"`。
