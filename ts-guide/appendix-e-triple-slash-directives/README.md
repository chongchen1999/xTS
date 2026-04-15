# 附录 E：三斜线指令

三斜线指令是特殊的 JavaScript 注释，TypeScript 用它来调整编译设置或声明文件依赖。必须放在文件顶部、所有代码之前。

```ts
/// <directive attr="value" />
```

## 常用指令

| 指令 | 语法 | 用途 |
|------|------|------|
| `amd-module` | `/// <amd-module name="MyComponent" />` | 编译为 AMD 模块时声明导出名 |
| `lib` | `/// <reference lib="dom" />` | 声明依赖的 TypeScript 内置 lib |
| `path` | `/// <reference path="./path.ts" />` | 声明依赖的 TypeScript 文件 |
| `type` | `/// <reference types="./path.d.ts" />` | 声明依赖的类型声明文件 |

### 使用场景

```ts
// declare dependency on DOM lib
/// <reference lib="dom" />

// declare dependency on another file (for outFile)
/// <reference path="./utils.ts" />

// declare dependency on type declarations
/// <reference types="node" />
```

> 大多数情况下，在 `tsconfig.json` 中配置 `lib` 和 `types` 是更好的选择。

## 内部指令

| 指令 | 语法 | 用途 |
|------|------|------|
| `no-default-lib` | `/// <reference no-default-lib="true" />` | 告诉 TypeScript 不加载任何内置 lib |

> 几乎不会在业务代码中使用。

## 已废弃指令

| 指令 | 替代方案 |
|------|----------|
| `amd-dependency` | 使用标准 `import` |
