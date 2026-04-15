# 第十章：命名空间与模块

## JavaScript 模块简史

JavaScript 最初没有模块系统，所有变量都在全局命名空间中，容易产生命名冲突。

```js
// Early days: IIFE + global window
window.emailListModule = {
  renderList() {}
}
window.appModule = {
  renderApp() {
    window.emailListModule.renderList()
  }
}
```

随后出现了 CommonJS（NodeJS）和 AMD（RequireJS）标准，最终 ES2015 统一了模块语法。

```js
// CommonJS
var emailList = require('emailListModule')
module.exports.renderBase = function() {}

// ES2015 - the modern standard
import emailList from 'emailListModule'
export function renderBase() {}
```

## import 与 export

ES2015 模块是 TypeScript 推荐的模块方式，支持命名导出、默认导出和通配符导入。

```ts
// Named export
export function foo() {}
export function bar() {}

// Named import
import { foo, bar } from './a'

// Default export/import
export default function meow(loudness: number) {}
import meow from './c'

// Wildcard import
import * as a from './a'
a.foo()

// Re-export
export * from './a'
export { result } from './b'
```

## 类型与值同名导出

TypeScript 允许同名的类型和值共存，编译器根据使用位置自动推断。

```ts
// g.ts
export let X = 3
export type X = { y: string }

// h.ts
import { X } from './g'
let a = X + 1       // X refers to value
let b: X = { y: 'z' } // X refers to type
```

## Dynamic Imports（动态导入）

动态导入返回一个 Promise，用于按需加载模块以优化性能。需要 `{"module": "esnext"}`。

```ts
// Simple dynamic import
let locale = await import('locale_us-en')

// Type-safe dynamic import with typeof
import { locale } from './locales/locale-us'

async function main() {
  let userLocale = await getUserLocale()
  let path = `./locales/locale-${userLocale}`
  let localeUS: typeof locale = await import(path)
}
```

## CommonJS 与 AMD 互操作

导入 CommonJS 模块时，开启 `esModuleInterop` 可简化 default import 语法。

```ts
// Without esModuleInterop
import * as fs from 'fs'
fs.readFile('some/file.txt')

// With {"esModuleInterop": true}
import fs from 'fs'
fs.readFile('some/file.txt')
```

## Module Mode vs Script Mode

TypeScript 根据文件是否包含 `import`/`export` 来决定模式：有则为 module mode，无则为 script mode。

- **Module mode**：代码需要显式 import/export，推荐使用
- **Script mode**：顶层变量全局可见，用于快速原型或类型声明文件

## Namespaces（命名空间）

命名空间提供了另一种代码封装方式，但推荐优先使用 ES2015 模块。

```ts
// Define a namespace
namespace Network {
  export function get<T>(url: string): Promise<T> {
    // ...
  }
}

// Nested namespaces
namespace Network {
  export namespace HTTP {
    export function get<T>(url: string): Promise<T> { /* ... */ }
  }
  export namespace TCP {
    export function listenOn(port: number): Connection { /* ... */ }
  }
}

// Usage
Network.HTTP.get<Dog[]>('http://url.com/dogs')
```

## 命名空间合并

同名命名空间会自动递归合并，可以跨文件扩展。

```ts
// HTTP.ts
namespace Network {
  export namespace HTTP {
    export function get<T>(url: string): Promise<T> { /* ... */ }
  }
}

// UDP.ts
namespace Network {
  export namespace UDP {
    export function send(url: string, packets: Buffer): Promise<void> { /* ... */ }
  }
}

// Both available
Network.HTTP.get<Dog[]>('http://url.com/dogs')
Network.UDP.send('http://url.com/cats', new Buffer(123))
```

## 命名空间别名

使用 `import` 语句为深层命名空间创建短别名。

```ts
namespace A {
  export namespace B {
    export namespace C {
      export let d = 3
    }
  }
}

import d = A.B.C.d
let e = d * 3
```

## 命名空间编译输出

命名空间编译为 IIFE，不受 `tsconfig.json` 的 `module` 设置影响，始终生成全局变量。

```ts
// TypeScript
namespace Flowers {
  export function give(count: number) {
    return count + ' flowers'
  }
}

// Compiled JavaScript
let Flowers;
(function (Flowers) {
  function give(count) {
    return count + ' flowers'
  }
  Flowers.give = give
})(Flowers || (Flowers = {}))
```

## Declaration Merging（声明合并）

TypeScript 支持多种声明合并，允许同名的不同声明类型共存。

| 合并规则 | Value | Class | Enum | Function | Type Alias | Interface | Namespace |
|---------|-------|-------|------|----------|------------|-----------|-----------|
| Value   | No    | No    | No   | No       | Yes        | Yes       | No        |
| Class   | —     | No    | No   | No       | No         | Yes       | Yes       |
| Enum    | —     | —     | Yes  | No       | No         | No        | Yes       |
| Interface | —   | —     | —    | —        | —          | Yes       | Yes       |
| Namespace | —   | —     | —    | —        | —          | —         | Yes       |

常见用法：
- 值 + type alias = companion object 模式
- interface + namespace = companion object 的另一种实现
- enum + namespace = 给 enum 添加静态方法

## moduleResolution 配置

始终使用 `"node"` 模式。TypeScript 在 NodeJS 算法基础上额外查找 `types` 字段和 `.ts`/`.tsx`/`.d.ts` 扩展名。

---

## 练习

1. **Companion Object 用 namespace 实现**：用 `interface` 和 `namespace` 实现一个 companion object，包含一个 `Currency` 接口和同名命名空间，命名空间中提供 `fromString` 工厂方法。

2. **Enum + Namespace 合并**：创建一个 `Color` enum（Red, Green, Blue），然后用同名 namespace 给它添加一个 `toHex()` 静态方法。

3. **动态导入实践**：编写一个函数，根据传入的语言代码（`'en'` | `'zh'` | `'ja'`）动态导入对应的 locale 模块，确保类型安全。

4. **模块重导出**：创建一个 `index.ts` barrel file，从三个子模块中选择性地重导出部分接口，练习 `export *`、`export { name }` 和 `export default` 的不同用法。

5. **命名空间 vs 模块对比**：将同一段工具函数代码分别用 namespace 和 ES2015 module 实现，比较编译输出的差异，理解为什么推荐使用模块。
