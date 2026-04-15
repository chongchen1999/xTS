# 附录 D：声明文件

为第三方 JavaScript 模块编写 `.d.ts` 声明文件的模式与技巧。

## .ts 与 .d.ts 对照

| `.ts` 写法 | `.d.ts` 写法 |
|-----------|-------------|
| `var a = 1` | `declare var a: number` |
| `let a = 1` | `declare let a: number` |
| `const a = 1` | `declare const a: 1` |
| `function a(b) { return b.toFixed() }` | `declare function a(b: number): string` |
| `class A { b() { return 3 } }` | `declare class A { b(): number }` |
| `namespace A {}` | `declare namespace A {}` |
| `type A = number` | `type A = number` |
| `interface A { b?: string }` | `interface A { b?: string }` |

> `type` 和 `interface` 本身就是纯类型声明，不需要 `declare`。

## 导出类型

### Global 导出

在 script mode 文件中用 `declare` 声明全局变量，无需 import/export：

```ts
// globals.d.ts
declare let someGlobal: GlobalType
declare class GlobalClass {}
declare function globalFunction(): string
enum GlobalEnum { A, B, C }
type GlobalType = number
interface GlobalInterface {}
```

### ES2015 导出

用 `export` 替代 `declare`：

```ts
// module.d.ts
export class SomeExport {
  a: SomeOtherType
}
export function exportedFunction(): string
export type SomeType = { a: number }
export interface SomeOtherType { b: string }

// default export
declare let defaultExport: SomeType
export default defaultExport
```

### CommonJS 导出

使用 `export =` 语法，一个文件只能有一个 `export`：

```ts
// single default
declare let defaultExport: SomeType
export = defaultExport

// multiple named exports via namespace
declare namespace MyExports {
  export let someExport: SomeType
  export type SomeType = number
  export class OtherExport {
    otherType: string
  }
}
export = MyExports

// default + named via declaration merging
declare namespace MyExports {
  export let someExport: SomeType
  export type SomeType = number
}
declare function MyExports(a: number): string
export = MyExports
```

### UMD 导出

与 ES2015 类似，加上 `export as namespace` 使其全局可用：

```ts
declare let defaultExport: SomeType
export default defaultExport
export class SomeExport { a: SomeType }
export type SomeType = { a: number }
export as namespace MyModule

// script mode files can use directly:
// let a = new MyModule.SomeExport
```

## 扩展已有模块

### 扩展全局接口

创建 script mode 文件，利用 interface merging：

```ts
// jquery-extensions.d.ts
interface JQuery {
  marquee(speed: number): JQuery<HTMLElement>
}
```

### 扩展模块导出

使用 `declare module` 进行模块合并：

```ts
// react-extensions.d.ts
import { ReactNode } from "react"
declare module "react" {
  export function inspect(element: ReactNode): void
}
```

### 扩展模块中的特定类型

```ts
// react-extensions.d.ts
import "react"
declare module "react" {
  interface Component<P, S> {
    reducer(action: object, state: S): S
  }
}
```

> ⚠️ 尽量避免扩展模块，优先使用组合模式（包装函数/类），减少对加载顺序的依赖。
