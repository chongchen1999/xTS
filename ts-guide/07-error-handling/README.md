# TypeScript 错误处理

四种错误处理模式，各有适用场景。

---

## 1. 返回 null

最轻量的类型安全方式——成功返回值，失败返回 `null`，但无法表达失败原因。

```ts
function parse(birthday: string): Date | null {
  let date = new Date(birthday)
  if (!isValid(date)) {
    return null
  }
  return date
}

function isValid(date: Date) {
  return Object.prototype.toString.call(date) === '[object Date]'
    && !Number.isNaN(date.getTime())
}

// Must check null before use
let date = parse(ask())
if (date) {
  console.info('Date is', date.toISOString())
} else {
  console.error('Error parsing date for some reason')
}
```

**优点**: 简单，类型系统强制检查
**缺点**: 无错误详情，嵌套时需逐层检查 null

---

## 2. 抛出异常 (Throwing Exceptions)

提供详细错误信息，支持自定义 Error 子类。但 TypeScript 不在函数签名中编码异常类型，调用者可能忘记 catch。

```ts
// Custom error types
class InvalidDateFormatError extends RangeError {}
class DateIsInTheFutureError extends RangeError {}

function parse(birthday: string): Date {
  let date = new Date(birthday)
  if (!isValid(date)) {
    throw new InvalidDateFormatError('Enter a date in the form YYYY/MM/DD')
  }
  if (date.getTime() > Date.now()) {
    throw new DateIsInTheFutureError('Are you a timelord?')
  }
  return date
}

try {
  let date = parse(ask())
  console.info('Date is', date.toISOString())
} catch (e) {
  if (e instanceof InvalidDateFormatError) {
    console.error(e.message)
  } else if (e instanceof DateIsInTheFutureError) {
    console.info(e.message)
  } else {
    throw e // Rethrow unknown errors
  }
}
```

可用 `@throws` 文档标注提示调用者，但不具备强制性：

```ts
/**
 * @throws {InvalidDateFormatError} The user entered their birthday incorrectly.
 * @throws {DateIsInTheFutureError} The user entered a birthday in the future.
 */
function parse(birthday: string): Date { ... }
```

**优点**: 错误信息丰富，`try/catch` 可批量包裹多个操作
**缺点**: 类型系统不强制处理，调用者容易遗漏

---

## 3. 返回异常 (Returning Exceptions)

用 union type 将错误编码到函数签名，类型系统强制调用者处理所有情况。

```ts
function parse(
  birthday: string
): Date | InvalidDateFormatError | DateIsInTheFutureError {
  let date = new Date(birthday)
  if (!isValid(date)) {
    return new InvalidDateFormatError('Enter a date in the form YYYY/MM/DD')
  }
  if (date.getTime() > Date.now()) {
    return new DateIsInTheFutureError('Are you a timelord?')
  }
  return date
}

// Forced to handle all three cases
let result = parse(ask())
if (result instanceof InvalidDateFormatError) {
  console.error(result.message)
} else if (result instanceof DateIsInTheFutureError) {
  console.info(result.message)
} else {
  console.info('Date is', result.toISOString())
}
```

链式调用时错误类型会不断累积：

```ts
function x(): T | Error1 { ... }

function y(): U | Error1 | Error2 {
  let a = x()
  if (a instanceof Error) {
    return a
  }
  // Process a
}

function z(): U | Error1 | Error2 | Error3 {
  let a = y()
  if (a instanceof Error) {
    return a
  }
  // Process a
}
```

**优点**: 类型安全，强制处理所有错误分支
**缺点**: 链式操作时 union type 快速膨胀

---

## 4. Option 类型

用容器包装值，通过 `flatMap` 链式操作，`getOrElse` 取值或返回默认值。`Some<T>` 表示成功，`None` 表示失败。

### 基本结构

```ts
interface Option<T> {
  flatMap<U>(f: (value: T) => None): None
  flatMap<U>(f: (value: T) => Option<U>): Option<U>
  getOrElse(value: T): T
}

class Some<T> implements Option<T> {
  constructor(private value: T) {}
  // Overloaded signatures for precise return types
  flatMap<U>(f: (value: T) => None): None
  flatMap<U>(f: (value: T) => Some<U>): Some<U>
  flatMap<U>(f: (value: T) => Option<U>): Option<U> {
    return f(this.value)
  }
  getOrElse(): T {
    return this.value
  }
}

class None implements Option<never> {
  flatMap<U>(): None {
    return this // Always short-circuits
  }
  getOrElse<U>(value: U): U {
    return value
  }
}
```

### flatMap 结果表

`flatMap` 遇到 `None` 时自动短路，不再执行后续操作。

| | To Some\<U\> | To None |
|---|---|---|
| **From Some\<T\>** | Some\<U\> | None |
| **From None** | None | None |

### 工厂函数

```ts
// Overloaded: null/undefined → None, otherwise → Some<T>
function Option<T>(value: null | undefined): None
function Option<T>(value: T): Some<T>
function Option<T>(value: T): Option<T> {
  if (value == null) {
    return new None
  }
  return new Some(value)
}
```

### 链式调用示例

```ts
let result = Option(6)          // Some<number>
  .flatMap(n => Option(n * 3))  // Some<number>
  .flatMap(n => new None)       // None
  .getOrElse(7)                 // 7

// Birthday prompt: chain ask → parse → format
ask()                                              // Option<string>
  .flatMap(parse)                                  // Option<Date>
  .flatMap(date => new Some(date.toISOString()))   // Option<string>
  .flatMap(date => new Some('Date is ' + date))    // Option<string>
  .getOrElse('Error parsing date for some reason') // string
```

**优点**: 链式组合优雅，类型安全
**缺点**: 不提供失败原因，与非 Option 代码需额外包装

---

## 四种方式对比

| 方式 | 错误详情 | 强制处理 | 链式组合 |
|---|:---:|:---:|:---:|
| 返回 null | - | Yes | 差 |
| 抛出异常 | Yes | - | 好 (try/catch) |
| 返回异常 | Yes | Yes | 差 (union 膨胀) |
| Option | - | Yes | 优秀 (flatMap) |

选择依据：
- 只需表示失败 → null 或 Option
- 需要失败原因 → 抛出或返回异常
- 需要强制处理 → 返回异常
- 需要链式组合 → Option

---

## 练习

### 练习 1: 返回 null —— 安全除法

实现对非数字输入和除以零返回 `null` 的安全除法。

```ts
function safeDiv(a: string, b: string): number | null {
  // Parse inputs, handle NaN and division by zero
}

// Expected:
safeDiv('10', '2')   // 5
safeDiv('10', '0')   // null
safeDiv('abc', '2')  // null
```

### 练习 2: 自定义异常 —— 文件读取

设计自定义 Error 子类，用 `try/catch` + `instanceof` 分别处理。

```ts
class FileNotFoundError extends Error {}
class PermissionDeniedError extends Error {}

function readFile(path: string): string {
  // Throw specific errors based on conditions
}

// Handle each error type with instanceof
```

### 练习 3: 返回异常 —— API 错误处理

为以下 API 每个方法添加返回异常模式。实现：获取登录用户 → 获取好友列表 → 获取好友名字的完整链路，处理所有错误分支。

```ts
type UserID = number

class API {
  getLoggedInUserID(): UserID | NotFoundError
  getFriendIDs(userID: UserID): UserID[] | NetworkError
  getUserName(userID: UserID): string | NotFoundError
}

// Chain all three calls, handle every error branch
```

### 练习 4: 实现 Option 版本的 API

用 Option 类型重写练习 3 的 API，用 `flatMap` 链式获取当前用户所有好友的名字。

```ts
class API {
  getLoggedInUserID(): Option<UserID>
  getFriendIDs(userID: UserID): Option<UserID[]>
  getUserName(userID: UserID): Option<string>
}

let api = new API()
api.getLoggedInUserID()
  .flatMap(id => api.getFriendIDs(id))
  .flatMap(ids => /* get each friend's name */)
  .getOrElse([])
```

### 练习 5: 对比三种实现

用返回 null、抛出异常、Option 三种方式实现同一个 `parseInt` 函数，对比调用端代码差异。

```ts
function parseIntV1(input: string): number | null { ... }
function parseIntV2(input: string): number { ... }        // throws
function parseIntV3(input: string): Option<number> { ... }
```
