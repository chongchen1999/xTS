# 第九章：前端与后端框架

TypeScript 与主流前端/后端框架深度集成，提供从视图层到数据层的端到端类型安全。

---

## DOM 类型声明

在 `tsconfig.json` 中启用 DOM 类型声明即可获得浏览器 API 的类型检查。

```json
{
  "compilerOptions": {
    "lib": ["dom", "es2015"]
  }
}
```

```typescript
let input = document.createElement('input')
input.classList.add('Input', 'URLInput')
input.addEventListener('change', () => {
  console.log(input.value.toUpperCase())
})
document.body.appendChild(input)

// querySelector returns nullable type
document.querySelector('.Element').innerHTML
// Error TS2531: Object is possibly 'null'.
```

---

## React：JSX 与 TSX

TSX 是 JSX 的 TypeScript 版本，提供编译时类型检查。使用 `.tsx` 扩展名，并配置：

```json
{
  "compilerOptions": {
    "jsx": "react",
    "esModuleInterop": true
  }
}
```

### Function Component

函数组件通过 `Props` 类型定义接收的属性，TypeScript 会强制校验所有必填属性。

```tsx
import React from 'react'

type Props = {
  isDisabled?: boolean
  size: 'Big' | 'Small'
  text: string
  onClick(event: React.MouseEvent<HTMLButtonElement>): void
}

export function FancyButton(props: Props) {
  const [toggled, setToggled] = React.useState(false)
  return (
    <button
      className={'Size-' + props.size}
      disabled={props.isDisabled || false}
      onClick={event => {
        setToggled(!toggled)
        props.onClick(event)
      }}
    >
      {props.text}
    </button>
  )
}

// TypeScript enforces required props
let button = (
  <FancyButton
    size="Big"
    text="Sign Up Now"
    onClick={() => console.log('Clicked!')}
  />
)
```

### Class Component

类组件通过泛型 `React.Component<Props, State>` 分别定义属性和状态的类型。

```tsx
import React from 'react'
import { FancyButton } from './FancyButton'

type Props = {
  firstName: string
  userId: string
}

type State = {
  isLoading: boolean
}

class SignupForm extends React.Component<Props, State> {
  state = {
    isLoading: false
  }

  render() {
    // Fragment <>...</> avoids extra DOM wrapper
    return (
      <>
        <h2>Sign up now, {this.props.firstName}.</h2>
        <FancyButton
          isDisabled={this.state.isLoading}
          size="Big"
          text="Sign Up Now"
          onClick={this.signUp}
        />
      </>
    )
  }

  // Arrow function preserves `this` binding
  private signUp = async () => {
    this.setState({ isLoading: true })
    try {
      await fetch('/api/signup?userId=' + this.props.userId)
    } finally {
      this.setState({ isLoading: false })
    }
  }
}

let form = <SignupForm firstName="Albert" userId="13ab9g3" />
```

### useState 类型推断

`useState` 可自动推断类型，复杂类型需显式指定泛型参数。

```tsx
const [toggled, setToggled] = React.useState(false)       // inferred as boolean
const [items, setItems] = React.useState<number[]>([])     // explicit generic
```

---

## Angular：组件与服务

Angular 使用 TypeScript 装饰器 + 接口驱动开发，内置 AoT 编译器利用类型信息进行优化。

### 初始化项目

```bash
npm install @angular/cli --global
ng new my-angular-app
```

### Component

组件通过 `@Component` 装饰器声明元数据，通过实现生命周期接口（如 `OnInit`）获得类型约束。

```typescript
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'simple-message',
  styleUrls: ['./simple-message.component.css'],
  templateUrl: './simple-message.component.html'
})
export class SimpleMessageComponent implements OnInit {
  message: string

  ngOnInit() {
    this.message = 'No messages, yet'
  }
}
```

### 模板类型检查

启用 `fullTemplateTypeCheck` 让 Angular 对模板也进行类型检查。

```json
{
  "angularCompilerOptions": {
    "fullTemplateTypeCheck": true
  }
}
```

### Service 与依赖注入

Angular 的 DI 系统根据构造函数参数的**类型**自动注入依赖，`@Injectable` 装饰器将类注册为可注入服务。

```typescript
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  constructor(private http: HttpClient) {}

  getMessage() {
    return this.http.get('/api/message')
  }
}
```

```typescript
import { Component, OnInit } from '@angular/core'
import { MessageService } from '../services/message.service'

@Component({
  selector: 'simple-message',
  templateUrl: './simple-message.component.html',
  styleUrls: ['./simple-message.component.css']
})
export class SimpleMessageComponent implements OnInit {
  message: string

  // DI resolves MessageService by type
  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.messageService.getMessage().subscribe(response =>
      this.message = response.message
    )
  }
}
```

---

## Typesafe API

客户端与服务端通过非类型化的网络协议通信，需要类型安全层。核心思路：共享类型定义 + 代码生成。

### 手动类型安全协议

```typescript
type Request =
  | { entity: 'user'; data: User }
  | { entity: 'location'; data: Location }

async function get<R extends Request>(
  entity: R['entity']
): Promise<R['data']> {
  let res = await fetch(`/api/${entity}`)
  let json = await res.json()
  if (!json) {
    throw ReferenceError('Empty response')
  }
  return json
}

async function startApp() {
  let user = await get('user') // type: User
}
```

### 主流方案

跨语言、跨平台的类型安全 API 工具通过共享 schema 生成类型绑定，防止客户端/服务端不同步。

| 协议类型 | 工具 | Schema 来源 |
|---------|------|------------|
| REST | Swagger | Data models |
| GraphQL | Apollo / Relay | GraphQL schema |
| RPC | gRPC / Apache Thrift | Protocol Buffers |

---

## 后端框架与 ORM

原始 SQL 查询返回 `any`，缺乏类型安全。ORM 从数据库 schema 生成类型化的高级 API。

### 原始查询 vs ORM

```typescript
// Raw query - returns any
let client = new Client()
let res = await client.query(
  'SELECT name FROM users WHERE id = $1',
  [739311]
) // any

// TypeORM - returns typed result
let user = await UserRepository
  .findOne({ id: 739311 }) // User | undefined
```

### TypeORM Entity 示例

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  email: string
}
```

ORM 同时提供类型安全和防 SQL 注入的双重保障。

---

## 练习

### 练习 1：React 函数组件

创建一个 `UserCard` 函数组件，Props 包含 `name: string`、`age: number`、`avatar?: string`。渲染用户信息卡片，`avatar` 不存在时显示默认占位图。

### 练习 2：React 状态管理

创建一个 `Counter` 组件，使用 `useState` 管理计数状态，包含"增加"和"减少"两个按钮。要求 `useState` 泛型参数显式指定为 `number`。

### 练习 3：Angular Service

定义一个 `TodoService`（使用 `@Injectable`），包含 `getTodos()` 方法返回 `Observable<Todo[]>`。再创建一个 `TodoListComponent`，通过构造函数注入 `TodoService` 并在 `ngOnInit` 中订阅数据。

### 练习 4：Typesafe API 协议

扩展手动类型安全协议示例，新增 `entity: 'product'` 对应 `Product` 类型，并实现 `post` 函数支持创建操作，确保请求体类型与 entity 匹配。

### 练习 5：TypeORM Entity 定义

使用 TypeORM 装饰器定义 `Order` entity，字段包含 `id`（自增主键）、`productName: string`、`quantity: number`、`price: number`、`createdAt: Date`。编写查询：查找所有 `quantity > 10` 的订单。
