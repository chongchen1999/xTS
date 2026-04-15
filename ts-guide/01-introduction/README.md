# Introduction

> TypeScript 通过类型安全，在编译期捕获错误，而非等到运行时。

## 类型安全

**类型安全**：利用类型防止程序执行无效操作。

无效操作示例：
- 数字和数组相加
- 调用对象上不存在的方法
- 函数参数类型不匹配

## JavaScript vs TypeScript

JavaScript 默默吞下错误：

```typescript
3 + []              // "3"
let obj = {}
obj.foo             // undefined
function a(b) { return b / 2 }
a("z")              // NaN
```

TypeScript 在编辑器中即时报错：

```typescript
3 + []              // Error TS2365: Operator '+' cannot be applied to types '3' and 'never[]'.
let obj = {}
obj.foo             // Error TS2339: Property 'foo' does not exist on type '{}'.
function a(b: number) { return b / 2 }
a("z")              // Error TS2345: Argument of type '"z"' is not assignable to parameter of type 'number'.
```

核心价值：TypeScript 的错误反馈发生在**编写代码时**，而非运行时。

## 练习

1. 列举 3 个 JavaScript 中会静默失败、但 TypeScript 能在编译期捕获的场景。
2. 解释"类型安全"的含义，并举一个你在日常开发中遇到的类型相关 bug。
3. 在编辑器中输入 `let x = { a: 1 }; x.b`，观察 TypeScript 报什么错误，理解其含义。
