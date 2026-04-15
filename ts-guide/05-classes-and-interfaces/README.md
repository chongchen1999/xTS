# 第五章：类与接口

## 类与继承

TypeScript 的类支持 `extends` 继承，可以用 `abstract` 声明抽象类来防止直接实例化。

```ts
type Color = 'Black' | 'White'
type File = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

class Position {
  constructor(
    private file: File,
    private rank: Rank
  ) {}

  distanceFrom(position: Position) {
    return {
      rank: Math.abs(position.rank - this.rank),
      file: Math.abs(position.file.charCodeAt(0) - this.file.charCodeAt(0))
    }
  }
}

abstract class Piece {
  protected position: Position
  constructor(
    private readonly color: Color,
    file: File,
    rank: Rank
  ) {
    this.position = new Position(file, rank)
  }
  moveTo(position: Position) {
    this.position = position
  }
  // Subclasses must implement this
  abstract canMoveTo(position: Position): boolean
}

class King extends Piece {
  canMoveTo(position: Position) {
    let distance = this.position.distanceFrom(position)
    return distance.rank < 2 && distance.file < 2
  }
}
```

## 访问修饰符 (Access Modifiers)

TypeScript 提供三种访问级别控制属性和方法的可见性。

| 修饰符 | 可访问范围 |
|--------|-----------|
| `public` | 任何地方（默认） |
| `protected` | 当前类及其子类 |
| `private` | 仅当前类 |

```ts
class Animal {
  public name: string          // accessible anywhere
  protected sound: string      // accessible in subclasses
  private id: number           // only in this class

  constructor(name: string, sound: string, id: number) {
    this.name = name
    this.sound = sound
    this.id = id
  }
}

class Dog extends Animal {
  bark() {
    console.log(this.sound)  // OK: protected
    // console.log(this.id)  // Error: private
  }
}
```

## super

子类可通过 `super` 调用父类方法；子类 constructor 中必须先调用 `super()`。

```ts
class Animal {
  constructor(protected name: string) {}
  move(distance: number) {
    console.log(`${this.name} moved ${distance}m`)
  }
}

class Horse extends Animal {
  constructor(name: string) {
    super(name) // must call super() in child constructor
  }
  move(distance: number) {
    console.log('Galloping...')
    super.move(distance) // call parent's move
  }
}
```

## 使用 this 作为返回类型

返回 `this` 类型可以让子类继承链式调用时自动返回正确类型，无需重写方法。

```ts
class Set {
  has(value: number): boolean {
    // ...
    return true
  }
  // Returns this instead of Set, so subclasses get correct type
  add(value: number): this {
    // ...
    return this
  }
}

class MutableSet extends Set {
  delete(value: number): boolean {
    // ...
    return true
  }
  // No need to override add() - it already returns MutableSet
}
```

## Interfaces

接口和类型别名类似，但接口支持 `extends` 继承并有声明合并特性。

```ts
interface Food {
  calories: number
  tasty: boolean
}

interface Sushi extends Food {
  salty: boolean
}

interface Cake extends Food {
  sweet: boolean
}
```

### type vs interface 三个关键区别

1. **type 更通用**：右侧可以是任意类型表达式；interface 右侧必须是对象形状
2. **interface extends 有赋值检查**：继承时会严格检查兼容性，type `&` 交叉则不会报错
3. **interface 支持声明合并**：同名 interface 自动合并；同名 type 则报错

## 声明合并 (Declaration Merging)

同名 interface 会自动合并为一个，但属性类型不能冲突。

```ts
interface User {
  name: string
}

interface User {
  age: number
}

// User now has both name and age
let user: User = {
  name: 'Ashley',
  age: 30
}

// type alias cannot merge - this would error:
// type User = { name: string }
// type User = { age: number }  // Error: Duplicate identifier
```

## implements 实现接口

用 `implements` 约束类必须实现接口定义的所有方法和属性，一个类可以实现多个接口。

```ts
interface Animal {
  readonly name: string
  eat(food: string): void
  sleep(hours: number): void
}

interface Feline {
  meow(): void
}

class Cat implements Animal, Feline {
  name = 'Whiskers'
  eat(food: string) {
    console.info('Ate some', food)
  }
  sleep(hours: number) {
    console.info('Slept for', hours, 'hours')
  }
  meow() {
    console.info('Meow')
  }
}
```

## 接口 vs 抽象类

接口是轻量级的类型约束，不生成 JS 代码；抽象类可以包含默认实现、构造函数和访问修饰符。

| 特性 | Interface | Abstract Class |
|------|-----------|----------------|
| 生成 JS 代码 | 否 | 是 |
| 默认实现 | 否 | 是 |
| 构造函数 | 否 | 是 |
| 访问修饰符 | 否 | 是 |
| 多继承 | 是（多 implements） | 否（单 extends） |

> 多个类共享实现 -> 抽象类；轻量类型约束 -> 接口

## 结构化类型与类 (Structural Typing)

TypeScript 按结构比较类，而非按名称。只要形状相同就兼容，但 `private`/`protected` 字段例外。

```ts
class Zebra {
  trot() {}
}

class Poodle {
  trot() {}
}

function ambleAround(animal: Zebra) {
  animal.trot()
}

ambleAround(new Zebra)   // OK
ambleAround(new Poodle)  // OK - same shape

// private fields break structural compatibility
class A {
  private x = 1
}

class B extends A {}

function f(a: A) {}
f(new A)       // OK
f(new B)       // OK - subclass
// f({x: 1})   // Error: 'x' is private in A
```

## 类同时声明值和类型

`class` 声明同时创建一个实例类型和一个构造函数值，用 `typeof` 获取类本身的类型。

```ts
type State = { [key: string]: string }

class StringDatabase {
  state: State = {}
  get(key: string): string | null {
    return key in this.state ? this.state[key] : null
  }
  set(key: string, value: string): void {
    this.state[key] = value
  }
  static from(state: State) {
    let db = new StringDatabase
    for (let key in state) {
      db.set(key, state[key])
    }
    return db
  }
}

// As instance type
let db: StringDatabase = new StringDatabase

// As constructor type (use typeof)
type StringDatabaseConstructor = typeof StringDatabase
```

## 多态 (Polymorphism)

类和接口支持泛型参数，可以设置默认值和约束。静态方法不能访问类级泛型。

```ts
class MyMap<K, V> {
  constructor(initialKey: K, initialValue: V) {}

  get(key: K): V {
    // ...
    return {} as V
  }

  set(key: K, value: V): void {}

  // Instance method can declare its own generics
  merge<K1, V1>(map: MyMap<K1, V1>): MyMap<K | K1, V | V1> {
    return {} as any
  }

  // Static method must declare its own generics
  static of<K, V>(k: K, v: V): MyMap<K, V> {
    return new MyMap(k, v)
  }
}

let a = new MyMap<string, number>('k', 1)  // explicit
let b = new MyMap('k', true)                // inferred: MyMap<string, boolean>
```

## Mixins

Mixin 是一个接收类构造函数并返回增强类的函数，用于模拟多重继承。

```ts
type ClassConstructor<T = {}> = new(...args: any[]) => T

function withEZDebug<C extends ClassConstructor<{
  getDebugValue(): object
}>>(Class: C) {
  return class extends Class {
    debug() {
      let Name = Class.constructor.name
      let value = this.getDebugValue()
      return Name + '(' + JSON.stringify(value) + ')'
    }
  }
}

class HardToDebugUser {
  constructor(
    private id: number,
    private firstName: string,
    private lastName: string
  ) {}
  getDebugValue() {
    return {
      id: this.id,
      name: this.firstName + ' ' + this.lastName
    }
  }
}

let User = withEZDebug(HardToDebugUser)
let user = new User(3, 'Emma', 'Gluzman')
user.debug() // 'User({"id": 3, "name": "Emma Gluzman"})'
```

## Decorators

装饰器是实验性特性（需开启 `experimentalDecorators`），本质上是对目标调用一个函数。目前 TypeScript 不追踪装饰器对类型的修改，建议用普通函数代替。

```ts
type ClassConstructor<T> = new(...args: any[]) => T

function serializable<
  T extends ClassConstructor<{ getValue(): Payload }>
>(Constructor: T) {
  return class extends Constructor {
    serialize() {
      return this.getValue().toString()
    }
  }
}

// Decorator syntax (experimental)
@serializable
class APIPayload {
  getValue(): Payload { /* ... */ }
}

// Recommended: use as regular function instead
let SafeAPIPayload = serializable(APIPayload)
let payload = new SafeAPIPayload()
payload.serialize() // string
```

## 模拟 final 类

TypeScript 没有 `final` 关键字，但可以用 `private constructor` + 静态工厂方法实现不可继承的类。

```ts
class MessageQueue {
  private constructor(private messages: string[]) {}

  // Static factory since constructor is private
  static create(messages: string[]) {
    return new MessageQueue(messages)
  }
}

// class BadQueue extends MessageQueue {}  // Error: cannot extend
// new MessageQueue([])                    // Error: constructor is private
MessageQueue.create([])                    // OK
```

## Factory 模式

工厂模式将对象创建逻辑集中管理，调用者不需要知道具体类。

```ts
type Shoe = {
  purpose: string
}

class BalletFlat implements Shoe {
  purpose = 'dancing'
}
class Boot implements Shoe {
  purpose = 'woodcutting'
}
class Sneaker implements Shoe {
  purpose = 'walking'
}

// Companion object pattern: type and value share the same name
let Shoe = {
  create(type: 'balletFlat' | 'boot' | 'sneaker'): Shoe {
    switch (type) {
      case 'balletFlat': return new BalletFlat
      case 'boot': return new Boot
      case 'sneaker': return new Sneaker
    }
  }
}

Shoe.create('boot') // Shoe
```

## Builder 模式

Builder 模式通过链式调用逐步构造对象，每个 setter 返回 `this` 实现链式 API。

```ts
class RequestBuilder {
  private data: object | null = null
  private method: 'get' | 'post' | null = null
  private url: string | null = null

  setMethod(method: 'get' | 'post'): this {
    this.method = method
    return this
  }
  setData(data: object): this {
    this.data = data
    return this
  }
  setURL(url: string): this {
    this.url = url
    return this
  }
  send() {
    // ...
  }
}

new RequestBuilder()
  .setURL('/users')
  .setMethod('get')
  .setData({ firstName: 'Anna' })
  .send()
```

---

## 练习题

### 练习 1：抽象类与接口

定义一个 `Shape` 接口（包含 `area(): number`），然后创建抽象类 `BaseShape` 实现该接口并提供 `describe()` 默认方法。最后创建 `Circle` 和 `Rectangle` 类继承 `BaseShape`。

### 练习 2：类型安全的 Builder

改进 `RequestBuilder`，在编译期保证 `send()` 调用前必须已设置 `url` 和 `method`。提示：每个方法返回不同类型而非 `this`。

### 练习 3：Mixin 组合

创建两个 mixin：`withTimestamp`（添加 `createdAt` 属性）和 `withSerialize`（添加 `serialize()` 方法）。将它们组合应用到一个 `User` 类上。

### 练习 4：Factory 模式增强

改进 Shoe 工厂，使用函数重载让 `Shoe.create('boot')` 返回 `Boot` 类型而非 `Shoe` 类型。

### 练习 5：结构化类型理解

以下代码是否能通过编译？为什么？

```ts
class Email {
  constructor(public address: string) {}
}

class Username {
  constructor(public address: string) {}
}

function sendEmail(email: Email) {
  console.log('Sending to', email.address)
}

sendEmail(new Username('alice'))
```
