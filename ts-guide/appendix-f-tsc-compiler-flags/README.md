# 附录 F：TSC 安全相关编译选项

TypeScript 提供了一系列编译器选项来增强代码安全性。推荐开启 `strict` 模式，它包含大部分 strict 前缀的选项。

## 安全选项速查表

| 选项 | 说明 |
|------|------|
| `strict` | 🔑 启用所有 strict 系列选项（推荐） |
| `alwaysStrict` | 生成 `"use strict"` |
| `noEmitOnError` | 有类型错误时不输出 JavaScript |
| `noFallthroughCasesInSwitch` | switch 的每个 case 必须 return 或 break |
| `noImplicitAny` | 禁止隐式 any 推断 |
| `noImplicitReturns` | 函数所有分支必须显式返回 |
| `noImplicitThis` | 禁止隐式 this 类型 |
| `noUnusedLocals` | 警告未使用的局部变量 |
| `noUnusedParameters` | 警告未使用的函数参数（`_` 前缀可忽略） |
| `strictBindCallApply` | bind/call/apply 的类型安全检查 |
| `strictFunctionTypes` | 函数参数逆变检查 |
| `strictNullChecks` | 将 null 提升为独立类型 |
| `strictPropertyInitialization` | 类属性必须初始化或可空 |

## 推荐 tsconfig.json 配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

## 关键选项示例

### noImplicitAny

```ts
// Error: Parameter 'x' implicitly has an 'any' type
function fn(x) { return x }

// Fix: explicit annotation
function fn(x: number) { return x }
```

### strictNullChecks

```ts
let a: string = "hello"
// a = null // Error with strictNullChecks

let b: string | null = "hello"
b = null // OK
```

### strictFunctionTypes

```ts
class Animal {}
class Dog extends Animal { bark() {} }

// contravariant parameter check
type Handler = (a: Animal) => void
let dogHandler: (d: Dog) => void = (d) => d.bark()
// let h: Handler = dogHandler // Error: Dog is not assignable to Animal param
```

### noUnusedParameters

```ts
// prefix with _ to suppress warning
function log(_unused: string, msg: string) {
  console.log(msg)
}
```
