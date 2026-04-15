# 第十一章：与 JavaScript 互操作

## Type Declarations（类型声明）

`.d.ts` 文件为 JavaScript 代码提供类型信息，只包含类型定义，不包含实现。

```ts
// Observable.ts (source)
export class Observable<T> implements Subscribable<T> {
  public _isScalar: boolean = false
  constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
    if (subscribe) { this._subscribe = subscribe }
  }
  static create<T>(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) {
    return new Observable<T>(subscribe)
  }
  subscribe(observer?: PartialObserver<T>): Subscription
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription
  subscribe(/* implementation */) { /* ... */ }
}

// Observable.d.ts (generated with tsc -d)
import { Subscriber } from './Subscriber'
import { Subscription } from './Subscription'
import { PartialObserver, Subscribable, TeardownLogic } from './types'
export declare class Observable<T> implements Subscribable<T> {
  _isScalar: boolean
  constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic)
  static create<T>(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic): Observable<T>
  subscribe(observer?: PartialObserver<T>): Subscription
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription
}
```

`.d.ts` 的核心规则：
- 使用 `declare` 关键字声明值的存在
- 只保留类型签名，去掉所有实现
- 顶层 type 和 interface 不需要 `declare`

## Ambient Variable Declarations（环境变量声明）

用于告诉 TypeScript 存在一个全局变量。

```ts
// polyfills.ts
declare let process: {
  env: {
    NODE_ENV: 'development' | 'production'
  }
}

process = {
  env: {
    NODE_ENV: 'production'
  }
}
```

## Ambient Type Declarations（环境类型声明）

在 script-mode 的 `.ts` 或 `.d.ts` 文件中声明的类型全局可用，无需 import。

```ts
// types.ts - globally available
type ToArray<T> = T extends unknown[] ? T : T[]
type UserID = string & { readonly brand: unique symbol }

// Any file can use without import
function toArray<T>(a: T): ToArray<T> { /* ... */ }
```

## Ambient Module Declarations（环境模块声明）

为第三方 JavaScript 模块快速声明类型。

```ts
// types.d.ts - full declaration
declare module 'module-name' {
  export type MyType = number
  export type MyDefaultType = { a: string }
  export let myExport: MyType
  let myDefaultExport: MyDefaultType
  export default myDefaultExport
}

// Quick stub: everything becomes any
declare module 'unsafe-module-name'

// Wildcard pattern matching
declare module '*.css' {
  let css: CSSRuleList
  export default css
}
declare module 'json!*' {
  let value: object
  export default value
}
```

```ts
// Usage
import ModuleName from 'module-name'  // typed
import b from './widget.css'          // CSSRuleList
import a from 'json!myFile'           // object
```

## 从 JavaScript 渐进迁移到 TypeScript

四步走策略，逐步提升类型安全性。

### Step 1: 添加 TSC

启用 `allowJs` 让 TSC 编译 JavaScript 文件，不做类型检查。

```json
{
  "compilerOptions": {
    "allowJs": true
  }
}
```

### Step 2a: 启用 JavaScript 类型检查（可选）

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noImplicitAny": false
  }
}
```

单文件控制：`// @ts-check` 开启检查，`// @ts-nocheck` 跳过检查。

### Step 2b: 添加 JSDoc 注解（可选）

不改文件扩展名的情况下为 JavaScript 函数添加类型信息。

```js
/**
 * @param word {string} An input string to convert
 * @returns {string} The string in PascalCase
 */
export function toPascalCase(word) {
  return word.replace(
    /\w+/g,
    ([a, ...b]) => a.toUpperCase() + b.join('').toLowerCase()
  )
}
// Type inferred: (word: string) => string
```

### Step 3: 重命名文件为 .ts

逐个将 `.js` 文件改为 `.ts`，修复类型错误。可以用 TODO 类型别名标记待处理的类型。

```ts
// globals.ts
type TODO_FROM_JS_TO_TS_MIGRATION = any

// MyMigratedUtil.ts
export function mergeWidgets(
  widget1: TODO_FROM_JS_TO_TS_MIGRATION,
  widget2: TODO_FROM_JS_TO_TS_MIGRATION
): number {
  // ...
}
```

### Step 4: 开启 strict 模式

迁移完成后关闭 JS 兼容选项，开启严格模式。

```json
{
  "compilerOptions": {
    "allowJs": false,
    "checkJs": false,
    "strict": true
  }
}
```

## 类型查找算法 (Type Lookup)

### 本地 JavaScript 文件

TypeScript 按以下顺序查找类型：

1. 查找同名的 `.d.ts` 文件（如 `old-file.js` → `old-file.d.ts`）
2. 若 `allowJs` + `checkJs` 开启，从 `.js` 文件推断类型（含 JSDoc）
3. 否则整个模块视为 `any`

```
my-app/
├── src/
│   ├── index.ts
│   └── legacy/
│       ├── old-file.js
│       └── old-file.d.ts   ← TypeScript uses this
```

### 第三方 NPM 包

1. 查找本地 ambient module declaration
2. 查看 package.json 的 `types` 或 `typings` 字段
3. 查找 `node_modules/@types/` 目录
4. 回退到本地查找算法

```
my-app/
├── node_modules/
│   ├── @types/
│   │   └── react/       ← step 3: @types declarations
│   └── react/
├── src/
│   ├── index.ts
│   └── types.d.ts       ← step 1: local declarations
```

## 使用第三方 JavaScript

三种场景及对应方案：

### 场景 1：自带类型声明

直接安装使用，无需额外操作。

```bash
npm install rxjs        # comes with .d.ts
npm install @angular/cli
```

### 场景 2：DefinitelyTyped 有类型声明

从 `@types` scope 安装社区维护的类型声明。

```bash
npm install lodash --save
npm install @types/lodash --save-dev
```

### 场景 3：没有现成的类型声明

从最快到最安全，四种策略：

```ts
// 1. @ts-ignore: quick and unsafe
// @ts-ignore
import Unsafe from 'untyped-module'  // any

// 2. Empty stub declaration
declare module 'nearby-ferret-alerter'  // everything is any

// 3. Full ambient module declaration
declare module 'nearby-ferret-alerter' {
  export default function alert(loudness: 'soft' | 'loud'): Promise<void>
  export function getFerretCount(): Promise<number>
}

// 4. Contribute declarations to DefinitelyTyped
```

## 汇总对比

| 方式 | tsconfig.json | 类型安全 |
|------|--------------|---------|
| 导入未类型化 JS | `{"allowJs": true}` | 低 |
| 导入并检查 JS | `{"allowJs": true, "checkJs": true}` | 中 |
| 导入带 JSDoc 的 JS | `{"allowJs": true, "checkJs": true, "strict": true}` | 高 |
| 导入带 .d.ts 的 JS | `{"allowJs": false, "strict": true}` | 高 |
| 导入 TypeScript | `{"allowJs": false, "strict": true}` | 高 |

---

## 练习

1. **编写 .d.ts 声明文件**：假设有一个 JavaScript 库 `string-utils.js` 导出了 `capitalize(str)`、`truncate(str, maxLen)` 和 `slugify(str)` 三个函数，为其编写完整的 `string-utils.d.ts` 类型声明文件。

2. **Ambient Module Declaration**：你的项目使用了一个没有类型的 NPM 包 `color-picker`，它默认导出一个 `ColorPicker` 类（构造函数接收 `options: { defaultColor: string }`），有 `getColor(): string` 和 `setColor(hex: string): void` 方法。在 `types.d.ts` 中为其编写环境模块声明。

3. **JSDoc 注解**：给以下 JavaScript 函数添加完整的 JSDoc 类型注解，使 TypeScript 能正确推断其类型：
   ```js
   export function debounce(fn, delay) {
     let timer
     return function(...args) {
       clearTimeout(timer)
       timer = setTimeout(() => fn.apply(this, args), delay)
     }
   }
   ```

4. **迁移模拟**：创建一个小型项目结构，包含一个 `.js` 文件和一个 `.ts` 文件，配置 tsconfig.json 使两者可以共存编译。然后将 `.js` 文件重命名为 `.ts` 并修复所有类型错误。

5. **Wildcard Module Declaration**：为项目中所有 `.svg` 文件导入和 `.graphql` 文件导入编写 wildcard 环境模块声明，使得 `import logo from './logo.svg'` 返回 `string` 类型，`import query from './getUser.graphql'` 返回 `DocumentNode` 类型。
