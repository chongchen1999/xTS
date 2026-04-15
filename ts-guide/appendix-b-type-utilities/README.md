# 附录 B：内置工具类型

TypeScript 标准库内置了一系列工具类型（Utility Types），用于常见的类型变换。

## 工具类型速查表

| 工具类型 | 适用于 | 说明 |
|----------|--------|------|
| `Partial<T>` | 对象类型 | 所有属性变为可选 |
| `Required<T>` | 对象类型 | 所有属性变为必选 |
| `Readonly<T>` | 对象/数组/元组 | 所有属性变为只读 |
| `Pick<T, K>` | 对象类型 | 选取指定键的子类型 |
| `Record<K, V>` | 对象类型 | 键到值的映射类型 |
| `Exclude<T, U>` | 联合类型 | 从 T 中排除可赋值给 U 的类型 |
| `Extract<T, U>` | 联合类型 | 从 T 中提取可赋值给 U 的类型 |
| `NonNullable<T>` | 可空类型 | 排除 null 和 undefined |
| `Parameters<T>` | 函数类型 | 函数参数类型的元组 |
| `ReturnType<T>` | 函数类型 | 函数返回类型 |
| `ConstructorParameters<T>` | 类构造器 | 构造函数参数类型的元组 |
| `InstanceType<T>` | 类构造器 | 实例类型 |
| `ReadonlyArray<T>` | 任意类型 | 不可变数组 |

## 代码示例

### Partial / Required / Readonly

```ts
type User = { name: string; age: number }

type PartialUser = Partial<User>
// { name?: string; age?: number }

type RequiredUser = Required<Partial<User>>
// { name: string; age: number }

type ReadonlyUser = Readonly<User>
// { readonly name: string; readonly age: number }
```

### Pick / Record

```ts
type User = { id: number; name: string; email: string }

type UserPreview = Pick<User, "id" | "name">
// { id: number; name: string }

type RoleMap = Record<"admin" | "user" | "guest", number[]>
// { admin: number[]; user: number[]; guest: number[] }
```

### Exclude / Extract / NonNullable

```ts
type T = string | number | boolean

type A = Exclude<T, string>      // number | boolean
type B = Extract<T, string | number> // string | number

type C = NonNullable<string | null | undefined> // string
```

### Parameters / ReturnType

```ts
function add(a: number, b: number): number {
  return a + b
}

type P = Parameters<typeof add> // [number, number]
type R = ReturnType<typeof add> // number
```

### ConstructorParameters / InstanceType

```ts
class Point {
  constructor(public x: number, public y: number) {}
}

type CP = ConstructorParameters<typeof Point> // [number, number]
type IP = InstanceType<typeof Point>          // Point
```

### ReadonlyArray

```ts
const arr: ReadonlyArray<number> = [1, 2, 3]
// arr.push(4) // Error: Property 'push' does not exist
```

### 组合使用

```ts
type APIResponse = {
  id: number
  name: string
  email: string
  createdAt: Date
}

// pick fields and make partial for update API
type UpdatePayload = Partial<Pick<APIResponse, "name" | "email">>
// { name?: string; email?: string }
```
