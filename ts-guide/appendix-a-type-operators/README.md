# 附录 A：类型运算符

TypeScript 提供了丰富的类型运算符，用于对类型进行查询、变换和组合。

## 类型运算符速查表

| 运算符 | 语法 | 适用于 | 说明 |
|--------|------|--------|------|
| Type query | `typeof`, `instanceof` | 任意类型 | 类型查询与类型细化 |
| Keys | `keyof` | 对象类型 | 获取对象所有键的联合类型 |
| Property lookup | `O[K]` | 对象类型 | 按键查找属性类型 |
| Mapped type | `[K in O]` | 对象类型 | 遍历键生成新类型 |
| Modifier `+` | `+readonly`, `+?` | 对象类型 | 添加修饰符 |
| Modifier `-` | `-readonly`, `-?` | 对象类型 | 移除修饰符 |
| `readonly` | `readonly` | 对象/数组/元组 | 标记只读 |
| Optional `?` | `?` | 对象/元组/函数参数 | 标记可选 |
| Conditional | `T extends U ? A : B` | 泛型/类型别名 | 条件类型 |
| Nonnull assertion | `!` | 可空类型 | 断言非 null/undefined |
| Generic default | `=` | 泛型参数 | 泛型参数默认值 |
| Type assertion | `as`, `<>` | 任意类型 | 类型断言 |
| Type guard | `is` | 函数返回类型 | 用户自定义类型守卫 |

## 代码示例

### typeof / instanceof

```ts
let s = "hello"
type S = typeof s // string

function handle(x: string | number) {
  if (typeof x === "string") {
    x.toUpperCase() // x: string
  }
  if (x instanceof Date) {
    x.getTime()
  }
}
```

### keyof 与索引访问

```ts
type Person = { name: string; age: number }

type PersonKeys = keyof Person // "name" | "age"
type NameType = Person["name"] // string
```

### Mapped Types 与修饰符

```ts
type Optional<T> = { [K in keyof T]+?: T[K] }
type Mutable<T> = { -readonly [K in keyof T]: T[K] }
type Required<T> = { [K in keyof T]-?: T[K] }

type User = { readonly name: string; age?: number }
type MutableUser = Mutable<User>   // { name: string; age?: number }
type RequiredUser = Required<User> // { name: string; age: number }
```

### Conditional Types

```ts
type IsString<T> = T extends string ? true : false

type A = IsString<"hello"> // true
type B = IsString<42>      // false

// distributive conditional type
type ToArray<T> = T extends any ? T[] : never
type R = ToArray<string | number> // string[] | number[]
```

### Type Assertion 与 Type Guard

```ts
// as assertion
let input = document.getElementById("app") as HTMLInputElement

// is type guard
function isString(x: unknown): x is string {
  return typeof x === "string"
}

function process(val: string | number) {
  if (isString(val)) {
    val.toUpperCase() // val: string
  }
}
```

### Nonnull Assertion

```ts
function getLength(s?: string) {
  return s!.length // assert s is not null/undefined
}
```
