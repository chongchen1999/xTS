# 附录 C：声明作用域

TypeScript 的声明会产生类型和/或值，不同类型的声明之间可以进行合并。

## 声明产生类型还是值？

| 关键字 | 产生类型？ | 产生值？ |
|--------|-----------|---------|
| `class` | ✅ | ✅ |
| `const` / `let` / `var` | ❌ | ✅ |
| `enum` | ✅ | ✅ |
| `function` | ❌ | ✅ |
| `interface` | ✅ | ❌ |
| `namespace` | ❌ | ✅ |
| `type` | ✅ | ❌ |

> `class` 和 `enum` 同时产生类型和值，这意味着它们既可以用作类型注解，也可以在运行时使用。

```ts
class MyClass { name = "" }

// as type
let a: MyClass
// as value
let b = new MyClass()

// typeof gets the constructor type
type Constructor = typeof MyClass
```

## 声明合并规则

不同声明之间的合并能力：

| From ↓ / To → | Value | Class | Enum | Function | Type Alias | Interface | Namespace | Module |
|----------------|-------|-------|------|----------|------------|-----------|-----------|--------|
| **Value** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | — |
| **Class** | — | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | — |
| **Enum** | — | — | ✅ | ❌ | ❌ | ❌ | ✅ | — |
| **Function** | — | — | — | ❌ | ✅ | ✅ | ✅ | — |
| **Type Alias** | — | — | — | — | ❌ | ❌ | ✅ | — |
| **Interface** | — | — | — | — | — | ✅ | ✅ | — |
| **Namespace** | — | — | — | — | — | — | ✅ | — |
| **Module** | — | — | — | — | — | — | — | ✅ |

### 常见合并场景

```ts
// interface merging
interface User { name: string }
interface User { age: number }
// merged: { name: string; age: number }

// namespace + function merging
function request(url: string): void {}
namespace request {
  export let timeout = 3000
}
request("https://api.example.com")
request.timeout // 3000

// namespace + enum merging
enum Color { Red, Green, Blue }
namespace Color {
  export function fromHex(hex: string): Color {
    return Color.Red
  }
}
Color.fromHex("#ff0000")

// namespace + class merging
class List<T> {
  items: T[] = []
}
namespace List {
  export function of<T>(...items: T[]): List<T> {
    let list = new List<T>()
    list.items = items
    return list
  }
}
List.of(1, 2, 3)
```
