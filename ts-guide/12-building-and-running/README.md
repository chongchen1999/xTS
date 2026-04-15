# 第十二章：构建与运行 TypeScript

## 项目目录结构

推荐将源码放在 `src/`，编译产物放在 `dist/`，便于工具集成和版本控制。

```
my-app/
├── dist/
│   ├── index.d.ts
│   ├── index.js
│   └── services/
│       ├── foo.d.ts
│       ├── foo.js
│       ├── bar.d.ts
│       └── bar.js
├── src/
│   ├── index.ts
│   └── services/
│       ├── foo.ts
│       └── bar.ts
```

## 编译产物（Artifacts）

TSC 可生成四种产物：

| 产物类型 | 扩展名 | tsconfig.json 配置 | 默认生成？ |
|---------|--------|-------------------|-----------|
| JavaScript | `.js` | `emitDeclarationOnly: false` | 是 |
| Source maps | `.js.map` | `sourceMap: true` | 否 |
| 类型声明 | `.d.ts` | `declaration: true` | 否 |
| 声明映射 | `.d.ts.map` | `declarationMap: true` | 否 |

## 编译目标（target）

`target` 控制 TSC 将代码转译到哪个 JavaScript 版本。不确定时用 `es5`。

```json
{
  "compilerOptions": {
    "target": "es5"
  }
}
```

TSC **能**转译的特性：`const`/`let`、`for...of`、spread、class、arrow function、`async`/`await`、async iterators 等。

TSC **不能**转译的特性：`Object getters/setters`（ES5）、`BigInt`（ESNext）、部分 Regex flags。不能转译的特性可用 Babel 插件处理。

## 标准库配置（lib）

`lib` 告诉 TypeScript 运行环境中有哪些 API 可用（需自行 polyfill）。

```json
{
  "compilerOptions": {
    "lib": ["es2015", "es2016.array.includes", "dom"]
  }
}
```

> `target` 负责语法转译，`lib` 负责声明可用 API，polyfill 负责实际提供 API 实现。

## Source Maps

Source maps 将编译后的 JS 映射回原始 TS 源码，便于调试和错误追踪。建议开发和生产环境都启用。

```json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

## Project References

大型项目可通过 project references 将代码拆分为多个子项目，显著加速编译。

子项目 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "rootDir": "."
  },
  "include": ["./**/*.ts"],
  "references": [
    { "path": "../myReferencedProject", "prepend": true }
  ]
}
```

根项目 `tsconfig.json`：

```json
{
  "files": [],
  "references": [
    { "path": "./myProject" },
    { "path": "./mySecondProject" }
  ]
}
```

编译时使用 `--build` 标志：

```bash
tsc --build   # or tsc -b
```

用 `extends` 减少重复配置：

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "target": "es5"
  }
}
```

```json
// subproject tsconfig.json
{
  "extends": "../tsconfig.base",
  "include": ["./**/*.ts"],
  "references": [
    { "path": "../myReferencedProject" }
  ]
}
```

## 错误监控（Error Monitoring）

TypeScript 在编译时捕获类型错误，但运行时异常需要专门的监控工具（如 Sentry、Bugsnag）来发现和追踪。

## 在服务端运行 TypeScript

编译为 ES2015，module 设为 `commonjs`。用 `source-map-support` 包在 Node.js 中启用 source map 支持。

```json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "commonjs"
  }
}
```

## 在浏览器中运行 TypeScript

根据使用场景选择 module 格式：

| 场景 | module 设置 |
|-----|------------|
| 发布 NPM 库 | `umd` |
| Webpack / Rollup | `es2015` |
| 含 dynamic import | `esnext` |
| Browserify | `commonjs` |
| RequireJS | `amd` |

常用构建工具插件：`ts-loader`（Webpack）、`tsify`（Browserify）、`@babel/preset-typescript`（Babel）。

浏览器端优化要点：保持代码模块化、使用 dynamic import 懒加载、利用 code splitting、监控页面加载时间。

## 发布到 NPM

推荐配置，兼容性最大化：

```json
{
  "compilerOptions": {
    "declaration": true,
    "module": "umd",
    "sourceMap": true,
    "target": "es5"
  }
}
```

配置 ignore 文件：

```gitignore
# .npmignore
src/           # Ignore source files

# .gitignore
dist/          # Ignore generated files
```

在 `package.json` 中声明类型入口：

```json
{
  "name": "my-awesome-typescript-project",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "prepublishOnly": "tsc -d"
  }
}
```

## Triple-Slash Directives

三斜杠指令是特殊的 TS 注释，作为对 TSC 的指示。

### types 指令

用于声明对 ambient 类型声明的依赖，避免生成不必要的 import：

```ts
/// <reference types="./global" />

/// <reference types="jasmine" />
```

> TypeScript 的 import elision 会自动移除仅用于类型的 import。但全模块 side-effect import 不会被移除，此时可用 `types` 指令替代。

### amd-module 指令

为 AMD 模块命名：

```ts
/// <amd-module name="LogService" />
export let LogService = {
  log() {
    // ...
  }
}
```

编译后生成具名 AMD 模块：

```js
define('LogService', ['require', 'exports'], function(require, exports) {
  exports.__esModule = true
  exports.LogService = {
    log() {
      // ...
    }
  }
})
```

---

## 练习

### 练习 1：配置编译目标

为一个需要同时支持旧版浏览器和 Node.js 的项目编写 `tsconfig.json`，要求：编译到 ES5，使用 UMD 模块，启用 source map 和类型声明。

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "umd",
    "sourceMap": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
```

### 练习 2：设置 Project References

假设项目有 `packages/core` 和 `packages/app`（依赖 core），请分别写出三个 `tsconfig.json`。

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "target": "es2015"
  }
}
```

```json
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base",
  "compilerOptions": { "rootDir": ".", "outDir": "../../dist/core" },
  "include": ["./**/*.ts"]
}
```

```json
// packages/app/tsconfig.json
{
  "extends": "../../tsconfig.base",
  "compilerOptions": { "rootDir": ".", "outDir": "../../dist/app" },
  "include": ["./**/*.ts"],
  "references": [{ "path": "../core" }]
}
```

```json
// root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
```

### 练习 3：NPM 发布配置

创建一个 TypeScript 库的完整发布配置，包含 `package.json`、`.npmignore`、`.gitignore`。确保 JS 用户和 TS 用户都能正常使用你的包。

```json
// package.json
{
  "name": "my-ts-lib",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  }
}
```

```gitignore
# .npmignore
src/
tsconfig.json
```

```gitignore
# .gitignore
dist/
node_modules/
```

### 练习 4：Import Elision 与 Triple-Slash

以下代码编译后 `import './setup'` 会不会被移除？如果你只需要 `setup.ts` 中的类型，如何避免生成多余的 JS import？

```ts
// setup.ts
export type Config = { debug: boolean }

// app.ts
import './setup'
```

**答案**：不会被移除，因为这是全模块 side-effect import。改用 triple-slash 指令或具名 import：

```ts
// Option A: triple-slash directive
/// <reference types="./setup" />

// Option B: named import (will be elided)
import { Config } from './setup'
let c: Config = { debug: true }
```

### 练习 5：浏览器构建方案选择

根据以下场景选择正确的 `module` 设置：

1. 用 Webpack 打包的 SPA 项目 → ?
2. 发布到 NPM 的工具库 → ?
3. 使用 dynamic import 的 Webpack 项目 → ?
4. 使用 Browserify 的旧项目 → ?

**答案**：

1. `es2015`
2. `umd`
3. `esnext`
4. `commonjs`
