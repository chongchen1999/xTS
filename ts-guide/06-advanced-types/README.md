# 第六章：高级类型

## Subtypes 与 Supertypes

如果 B 是 A 的 subtype，则可以在任何需要 A 的地方安全地使用 B。反之，supertype 是相反的关系。

```ts
// Array <: Object, Tuple <: Array, never <: everything
// Bird <: Animal (if Bird extends Animal)

class Animal {}
class Bird extends Animal {
  chirp() {}
}
class Crow extends Bird {
  caw() {}
}

// Crow <: Bird <: Animal
function feedAnimal(a: Animal) {}
feedAnimal(new Bird()) // OK - subtype is assignable
feedAnimal(new Crow()) // OK
```

## Variance (型变)

四种型变：Invariance（不变）、Covariance（协变）、Contravariance（逆变）、Bivariance（双变）。

### 对象属性是协变的

```ts
type ExistingUser = { id: number; name: string }
type NewUser = { name: string }

// { id: number, name: string } <: { name: string }
// Object property types are covariant
function deleteUser(user: { id?: number; name: string }) {
  delete user.id
}

let existingUser: ExistingUser = { id: 123456, name: "Ima User" }
deleteUser(existingUser) // OK - property subtype is assignable
```

### 函数参数是逆变的，返回值是协变的

```ts
class Animal {}
class Bird extends Animal {
  chirp() {}
}
class Crow extends Bird {
  caw() {}
}

function clone(f: (b: Bird) => Bird): void {
  let parent = new Bird()
  let baby = f(parent)
  baby.chirp()
}

// Return type: covariant (Crow <: Bird, OK)
const birdToCrow = (b: Bird): Crow => new Crow()
clone(birdToCrow) // OK

// Parameter type: contravariant (Animal >: Bird, OK)
const animalToBird = (a: Animal): Bird => new Bird()
clone(animalToBird) // OK

// Parameter type: Crow <: Bird, NOT >: Bird -> Error
const crowToBird = (c: Crow): Bird => new Bird()
// clone(crowToBird) // Error!
```

## Assignability (可赋值性)

非 enum 类型：A 可赋值给 B 当 `A <: B` 或 `A` 是 `any`。Enum 类型有额外规则：数字 enum 允许任意 number 赋值。

```ts
let a: number = 1        // 1 <: number, OK
let b: string = "hello"  // string <: string, OK
// let c: number = "x"   // Error: string is not <: number

// any is the escape hatch
let d: any = "hello"
let e: number = d        // OK - any is assignable to anything
```

## Type Widening (类型拓宽)

`let`/`var` 声明会将字面量类型拓宽为基础类型；`const` 声明保持字面量类型。

```ts
let a = "x"           // string (widened)
const b = "x"         // "x" (literal type preserved)

let c = { x: 3 }      // { x: number }
const d = { x: 3 }    // { x: number } - object properties still widen

// null/undefined widen to any
let e = null           // any
```

### const 断言

`as const` 阻止拓宽，并递归地将所有成员标记为 `readonly`。

```ts
let a = { x: 3 } as const       // { readonly x: 3 }
let b = [1, { x: 2 }] as const  // readonly [1, { readonly x: 2 }]

// Useful for fixed config objects
const config = {
  endpoint: "https://api.example.com",
  retries: 3,
} as const
// typeof config = { readonly endpoint: "https://api.example.com"; readonly retries: 3 }
```

### Excess Property Checking (多余属性检查)

当把一个新鲜（fresh）对象字面量赋给目标类型时，TypeScript 会检查多余属性。赋值给变量后或使用 `as` 断言后，freshness 消失。

```ts
type Options = {
  baseURL: string
  cacheSize?: number
  tier?: "prod" | "dev"
}

// Fresh object literal -> excess property check
// new API({ baseURL: "...", tierr: "prod" }) // Error: 'tierr' not in Options

// Assigned to variable -> no excess property check
let opts = { baseURL: "https://api.mysite.com", badTier: "prod" }
// new API(opts) // OK - freshness lost
```

## Refinement (类型细化)

TypeScript 利用控制流（`if`、`typeof`、`instanceof`、`in`）自动细化类型。

```ts
type Unit = "cm" | "px" | "%"

function parseWidth(width: number | string | null | undefined) {
  if (width == null) return null         // refined to number | string
  if (typeof width === "number") {
    return { unit: "px" as Unit, value: width }  // refined to number
  }
  return { unit: "px" as Unit, value: parseFloat(width) } // refined to string
}
```

### Discriminated Unions (可辨识联合)

用字面量类型的 tag 字段区分联合成员，实现完整的类型细化。

```ts
type UserTextEvent = {
  type: "TextEvent"
  value: string
  target: HTMLInputElement
}
type UserMouseEvent = {
  type: "MouseEvent"
  value: [number, number]
  target: HTMLElement
}
type UserEvent = UserTextEvent | UserMouseEvent

function handle(event: UserEvent) {
  if (event.type === "TextEvent") {
    event.value   // string
    event.target  // HTMLInputElement
    return
  }
  event.value     // [number, number]
  event.target    // HTMLElement
}
```

## Totality (穷尽性检查)

TypeScript 确保你覆盖了所有分支。未覆盖的 case 会触发编译错误。

```ts
type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri"
type Day = Weekday | "Sat" | "Sun"

function getNextDay(w: Weekday): Day {
  switch (w) {
    case "Mon": return "Tue"
    case "Tue": return "Wed"
    case "Wed": return "Thu"
    case "Thu": return "Fri"
    case "Fri": return "Sat"
    // Missing case -> Error: not all code paths return a value
  }
}

// never trick for exhaustiveness check
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x)
}
```

## Advanced Object Types (高级对象类型)

### Keying-in Operator (索引访问类型)

用 `T[K]` 语法从类型中提取嵌套属性的类型。

```ts
type APIResponse = {
  user: {
    userId: string
    friendList: {
      count: number
      friends: { firstName: string; lastName: string }[]
    }
  }
}

type FriendList = APIResponse["user"]["friendList"]      // { count: number; friends: ... }
type Friend = FriendList["friends"][number]               // { firstName: string; lastName: string }
```

### keyof Operator

获取对象类型所有键的联合类型。

```ts
type ResponseKeys = keyof APIResponse                    // "user"
type UserKeys = keyof APIResponse["user"]                // "userId" | "friendList"

// Typesafe getter
function get<O extends object, K extends keyof O>(o: O, k: K): O[K] {
  return o[k]
}

let response = {} as APIResponse
get(response, "user") // OK
// get(response, "bad") // Error
```

### Record Type

用 `Record<Keys, Values>` 定义键值约束的对象，保证所有键都被覆盖。

```ts
type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri"
type Day = Weekday | "Sat" | "Sun"

// All Weekdays must be present
let nextDay: Record<Weekday, Day> = {
  Mon: "Tue",
  Tue: "Wed",
  Wed: "Thu",
  Thu: "Fri",
  Fri: "Sat",
}
```

### Mapped Types (映射类型)

使用 `[K in UnionType]` 语法遍历键生成新类型。支持 `?`、`readonly` 修饰符及 `-` 移除修饰符。

```ts
type Account = {
  id: number
  isEmployee: boolean
  notes: string[]
}

// Make all fields optional
type OptionalAccount = { [K in keyof Account]?: Account[K] }

// Make all fields readonly
type ReadonlyAccount = { readonly [K in keyof Account]: Account[K] }

// Remove readonly
type Mutable<T> = { -readonly [K in keyof T]: T[K] }

// Built-in: Partial<T>, Required<T>, Readonly<T>, Pick<T, K>
type PartialAccount = Partial<Account>
type IdOnly = Pick<Account, "id">
```

### Companion Object Pattern (伴生对象模式)

同名的 type 和 value 可以共存，实现类型与工具方法的统一导入。

```ts
type Currency = {
  unit: "EUR" | "GBP" | "JPY" | "USD"
  value: number
}

let Currency = {
  DEFAULT: "USD" as const,
  from(value: number, unit = Currency.DEFAULT): Currency {
    return { unit, value }
  },
}

// Consumer imports both type and value at once
// import { Currency } from './Currency'
let price: Currency = Currency.from(100, "EUR")
```

## Advanced Function Types (高级函数类型)

### Tuple Inference (元组推断)

利用 rest 参数让 TypeScript 推断出元组类型，避免手动 type assertion。

```ts
function tuple<T extends unknown[]>(...ts: T): T {
  return ts
}

let a = tuple(1, true)      // [number, boolean]
let b = tuple("a", 1, true) // [string, number, boolean]
```

### User-Defined Type Guards (自定义类型守卫)

使用 `param is Type` 返回类型让类型细化跨函数传递。

```ts
function isString(a: unknown): a is string {
  return typeof a === "string"
}

function parseInput(input: string | number) {
  if (isString(input)) {
    input.toUpperCase() // OK - input refined to string
  }
}

// Works with complex types too
type Fish = { swim(): void }
type Bird = { fly(): void }

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}
```

## Conditional Types (条件类型)

`T extends U ? A : B` 语法在类型层面做条件判断。

```ts
type IsString<T> = T extends string ? true : false

type A = IsString<string>   // true
type B = IsString<number>   // false
```

### Distributive Conditionals (分布式条件类型)

当 T 是联合类型时，条件类型会自动分布到联合的每个成员上。

```ts
type ToArray<T> = T extends unknown ? T[] : T[]
type A = ToArray<number | string>  // number[] | string[]

// Exclude: keep types in T that are not in U
type Without<T, U> = T extends U ? never : T
type B = Without<boolean | number | string, boolean> // number | string
```

### infer Keyword

在条件类型中使用 `infer` 声明待推断的类型变量。

```ts
// Extract array element type
type ElementType<T> = T extends (infer U)[] ? U : T
type A = ElementType<number[]>  // number

// Extract function's second argument type
type SecondArg<F> = F extends (a: any, b: infer B) => any ? B : never
type B = SecondArg<(a: string, b: number) => void>  // number

// Extract return type
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never
type C = MyReturnType<() => string>  // string
```

### Built-in Conditional Types (内置条件类型)

```ts
type A = number | string

// Exclude<T, U> - remove U from T
type B = Exclude<A, string>           // number

// Extract<T, U> - keep only U from T
type C = Extract<A, string>           // string

// NonNullable<T> - remove null and undefined
type D = NonNullable<string | null>   // string

// ReturnType<F> - extract return type
type E = ReturnType<() => boolean>    // boolean

// InstanceType<C> - extract instance type
type F = InstanceType<typeof Map>     // Map<any, any>
```

## Escape Hatches (逃生通道)

尽量少用，使用时说明你比编译器掌握更多信息。

### Type Assertions (类型断言)

```ts
function getUserInput(): string | number { return "hello" }
let input = getUserInput()

// as syntax (preferred)
let str = input as string

// Double assertion for unrelated types (dangerous!)
let n = input as unknown as boolean
```

### Nonnull Assertions (非空断言)

用 `!` 后缀告诉编译器值不是 `null`/`undefined`。

```ts
type Dialog = { id?: string }

function closeDialog(dialog: Dialog) {
  if (!dialog.id) return

  // ! asserts dialog.id is defined
  let el = document.getElementById(dialog.id!)!
  el.parentNode!.removeChild(el)
}
```

### Definite Assignment Assertions (确定赋值断言)

用 `!` 告诉 TypeScript 变量在使用前一定已被赋值。

```ts
let userId!: string  // ! = "trust me, it will be assigned"

function fetchUser() {
  userId = "user_123"
}

fetchUser()
userId.toUpperCase() // OK
```

## Simulating Nominal Types (模拟名义类型)

TypeScript 是结构化类型系统，通过 type branding 可以模拟名义类型，防止混用语义不同但结构相同的类型。

```ts
// Brand each ID type with unique symbol
type CompanyID = string & { readonly brand: unique symbol }
type UserID = string & { readonly brand: unique symbol }

// Constructors use type assertion
function CompanyID(id: string) { return id as CompanyID }
function UserID(id: string) { return id as UserID }

function queryForUser(id: UserID) { /* ... */ }

let oderId = CompanyID("8a6076cf")
let userId = UserID("d21b1dbf")

queryForUser(userId)    // OK
// queryForUser(oderId) // Error: CompanyID not assignable to UserID
```

## Safely Extending the Prototype (安全扩展原型)

通过 interface 合并声明新方法，再在 prototype 上实现。Module mode 下需包裹在 `declare global` 中。

```ts
// Declare the type (interface merging)
interface Array<T> {
  zip<U>(list: U[]): [T, U][]
}

// Implement
Array.prototype.zip = function <T, U>(this: T[], list: U[]): [T, U][] {
  return this.map((v, k) => [v, list[k]] as [T, U])
}

// Usage
// import './zip'
const result = [1, 2, 3].zip(["a", "b", "c"])
// [[1,"a"], [2,"b"], [3,"c"]]
```

---

## Practice Exercises

### Exercise 1: Assignability

判断以下类型对中，第一个类型能否赋值给第二个类型？为什么？

```ts
// a. 1 -> number            ?
// b. number -> 1            ?
// c. string -> number | string  ?
// d. { a: true } -> { a: boolean }  ?
// e. (a: number) => string -> (a: number | string) => string  ?
```

### Exercise 2: Mapped Type

实现一个 `Mutable<T>` 类型，将所有 `readonly` 属性变为可写：

```ts
type Mutable<T> = /* your implementation */

// Test:
type Locked = { readonly name: string; readonly age: number }
type Unlocked = Mutable<Locked> // { name: string; age: number }
```

### Exercise 3: Conditional Type - Exclusive

实现 `Exclusive<T, U>`，计算只存在于 T 或 U 中、但不同时存在于两者中的类型：

```ts
type Exclusive<T, U> = /* your implementation */

// Test:
type R = Exclusive<1 | 2 | 3, 2 | 3 | 4> // should be 1 | 4
```

### Exercise 4: Type Guard

为以下联合类型实现一个 user-defined type guard：

```ts
type Circle = { kind: "circle"; radius: number }
type Square = { kind: "square"; side: number }
type Shape = Circle | Square

function isCircle(shape: Shape): /* return type? */ {
  // your implementation
}

// Should work:
function getArea(shape: Shape) {
  if (isCircle(shape)) {
    return Math.PI * shape.radius ** 2
  }
  return shape.side ** 2
}
```

### Exercise 5: infer

使用 `infer` 实现以下工具类型：

```ts
// Extract the resolved type from a Promise
type UnwrapPromise<T> = /* your implementation */

// Test:
type A = UnwrapPromise<Promise<string>>          // string
type B = UnwrapPromise<Promise<Promise<number>>> // Promise<number>
type C = UnwrapPromise<number>                   // number

// Bonus: implement deep unwrap
type DeepUnwrapPromise<T> = /* your implementation */
type D = DeepUnwrapPromise<Promise<Promise<number>>> // number
```
