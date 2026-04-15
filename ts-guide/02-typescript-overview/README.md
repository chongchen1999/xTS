# TypeScript: A 10,000 Foot View

> 了解 TypeScript 编译器的工作流程、类型系统的基本概念，以及开发环境搭建。

## 编译器工作流程

TypeScript 编译过程：

1. TS 源码 → AST（抽象语法树）
2. AST → 类型检查（typechecker）
3. AST → JavaScript 代码

关键点：**类型信息只用于检查，不影响生成的 JS 代码**。即修改类型不会改变运行时行为。

## 类型系统

TypeScript 支持两种类型标注方式：

```typescript
// explicit annotation
let a: number = 1
let b: string = 'hello'
let c: boolean[] = [true, false]

// type inference (recommended)
let a = 1              // number
let b = 'hello'        // string
let c = [true, false]  // boolean[]
```

最佳实践：**尽量让 TypeScript 推断类型**，只在必要时显式标注。

## TypeScript vs JavaScript 对比

| 特性 | JavaScript | TypeScript |
|------|-----------|------------|
| 类型绑定时机 | 动态（运行时） | 静态（编译时） |
| 隐式类型转换 | 是 | 否 |
| 类型检查时机 | 运行时 | 编译时 |
| 错误暴露时机 | 运行时 | 编译时 |

TypeScript 是**渐进类型**语言：可以部分类型化，但建议追求 100% 类型覆盖。

## 开发环境搭建

```bash
mkdir my-project && cd my-project
npm init -y
npm install --save-dev typescript @types/node
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "lib": ["es2015"],
    "module": "commonjs",
    "outDir": "dist",
    "sourceMap": true,
    "strict": true,
    "target": "es2015"
  },
  "include": ["src"]
}
```

| 选项 | 说明 |
|------|------|
| `lib` | 运行环境可用的 API（ES5、ES2015、DOM 等） |
| `module` | 模块系统（CommonJS、ES2015 等） |
| `outDir` | JS 输出目录 |
| `strict` | 启用最严格的类型检查 |
| `target` | 编译目标 JS 版本 |

### 编译运行

```bash
# compile
./node_modules/.bin/tsc

# run
node ./dist/index.js
```

快捷方式：使用 [ts-node](https://npmjs.org/package/ts-node) 一步编译运行。

## 练习

1. 新建一个 TypeScript 项目，配置 `tsconfig.json`，编写并运行一个简单程序。
2. 输入以下代码，hover 查看 TypeScript 推断的类型：
   ```typescript
   let a = 1 + 2
   let b = a + 3
   let c = { apple: a, banana: b }
   let d = c.apple * 4
   ```
3. 尝试写一段代码让 TypeScript 无法推断类型，需要你手动标注。
4. 将 `strict` 设为 `false`，观察哪些错误不再被报告。
