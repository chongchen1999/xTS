# 第八章：异步编程、并发与并行

本章涵盖 JavaScript event loop 机制、callback、Promise、async/await、异步流、Event Emitter 以及类型安全的多线程编程。

---

## JavaScript Event Loop

JavaScript 引擎通过单线程 event loop 实现并发：主线程调用异步 API 后立即继续执行，异步结果通过 event queue 回调。call stack 清空后才从 queue 取出 task。

```typescript
setTimeout(() => console.info('A'), 1)
setTimeout(() => console.info('B'), 2)
console.info('C')
// Output: C, A, B
```

---

## Callback

Callback 是最基本的异步模式。Node.js 约定回调第一个参数为 `Error | null`，第二个为结果。

```typescript
import * as fs from 'fs'

fs.readFile(
  '/var/log/apache2/access_log',
  { encoding: 'utf8' },
  (error, data) => {
    if (error) {
      console.error('error reading!', error)
      return
    }
    console.info('success reading!', data)
  }
)
```

多层嵌套会形成 "callback pyramid"，难以维护：

```typescript
async1((err1, res1) => {
  if (res1) {
    async2(res1, (err2, res2) => {
      if (res2) {
        async3(res2, (err3, res3) => {
          // ...
        })
      }
    })
  }
})
```

---

## Promise

Promise 将异步操作抽象为可链式调用的对象，`then` 处理成功，`catch` 处理失败，解决了 callback 嵌套问题。

```typescript
// Wrap callback-based API into Promise
function readFilePromise(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf8' }, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve(result!)
      }
    })
  })
}
```

链式调用让异步流程线性化：

```typescript
function appendAndReadPromise(path: string, data: string): Promise<string> {
  return appendPromise(path, data)
    .then(() => readPromise(path))
    .catch(error => console.error(error))
}
```

### Promise 类型定义

`reject` 参数为 `unknown`，因为 JavaScript 可以 `throw` 任何值：

```typescript
type Executor<T> = (
  resolve: (result: T) => void,
  reject: (error: unknown) => void
) => void

class Promise<T> {
  constructor(f: Executor<T>) {}
  then<U>(g: (result: T) => Promise<U>): Promise<U> { /* ... */ }
  catch<U>(g: (error: unknown) => Promise<U>): Promise<U> { /* ... */ }
}
```

---

## async / await

`async/await` 是 Promise 的语法糖，让异步代码看起来像同步代码。`await` 等价于 `.then`，用 `try/catch` 替代 `.catch`。

```typescript
async function getUser() {
  try {
    let user = await getUserID(18)
    let location = await getLocation(user)
    console.info('got location', location)
  } catch (error) {
    console.error(error)
  } finally {
    console.info('done getting location')
  }
}
```

对比 Promise 链式写法：

```typescript
function getUser() {
  getUserID(18)
    .then(user => getLocation(user))
    .then(location => console.info('got location', location))
    .catch(error => console.error(error))
    .finally(() => console.info('done getting location'))
}
```

---

## Event Emitter（异步流）

当需要处理多个异步值（如事件流）时，Event Emitter 是常用模式。通过 mapped type 可以实现类型安全的 emitter。

```typescript
// Define event-argument mapping
type Events = {
  ready: void
  error: Error
  reconnecting: { attempt: number; delay: number }
}

// Typed emitter using mapped types
type RedisClient = {
  on<E extends keyof Events>(
    event: E,
    f: (arg: Events[E]) => void
  ): void
  emit<E extends keyof Events>(
    event: E,
    arg: Events[E]
  ): void
}
```

### 封装 SafeEmitter

将 Node.js 的 `EventEmitter` 包装为泛型安全版本：

```typescript
import EventEmitter from 'events'

class SafeEmitter<
  Events extends Record<PropertyKey, unknown[]>
> {
  private emitter = new EventEmitter()

  emit<K extends keyof Events>(channel: K, ...data: Events[K]) {
    return this.emitter.emit(channel as string, ...data)
  }

  on<K extends keyof Events>(
    channel: K,
    listener: (...data: Events[K]) => void
  ) {
    return this.emitter.on(channel as string, listener)
  }
}
```

使用示例：

```typescript
type MyEvents = {
  login: [userId: string, timestamp: number]
  logout: [userId: string]
}

let emitter = new SafeEmitter<MyEvents>()
emitter.on('login', (userId, timestamp) => {
  console.log(`${userId} logged in at ${timestamp}`)
})
emitter.emit('login', 'user123', Date.now())
```

---

## Web Workers（浏览器多线程）

Web Workers 通过 message passing 实现真正的并行计算，数据在线程间被 clone，避免共享内存问题。

```typescript
// MainThread.ts
let worker = new Worker('WorkerScript.js')

worker.onmessage = e => {
  console.log(e.data)
}
worker.postMessage('some data')

// WorkerScript.ts
onmessage = e => {
  console.log(e.data)
  postMessage(`Ack: "${e.data}"`)
}
```

### Typesafe Protocol

定义 protocol 类型，将非类型安全的 message passing 封装为类型安全的请求-响应 API：

```typescript
type Matrix = number[][]

type MatrixProtocol = {
  determinant: {
    in: [Matrix]
    out: number
  }
  'dot-product': {
    in: [Matrix, Matrix]
    out: Matrix
  }
  invert: {
    in: [Matrix]
    out: Matrix
  }
}

type Protocol = {
  [command: string]: {
    in: unknown[]
    out: unknown
  }
}

// Generic protocol factory
function createProtocol<P extends Protocol>(script: string) {
  return <K extends keyof P>(command: K) =>
    (...args: P[K]['in']) =>
      new Promise<P[K]['out']>((resolve, reject) => {
        let worker = new Worker(script)
        worker.onerror = reject
        worker.onmessage = event => resolve(event.data.data)
        worker.postMessage({ command, args })
      })
}

// Usage
let runWithMatrixProtocol = createProtocol<MatrixProtocol>(
  'MatrixWorkerScript.js'
)
let parallelDeterminant = runWithMatrixProtocol('determinant')

parallelDeterminant([[1, 2], [3, 4]])
  .then(determinant => console.log(determinant)) // -2
```

---

## Node.js Child Processes（服务端多线程）

Node.js 用 `child_process.fork` 实现多进程，message passing 机制与 Web Workers 类似，可复用 typesafe protocol 模式。

```typescript
// MainThread.ts
import { fork } from 'child_process'

let child = fork('./ChildThread.js')

child.on('message', data =>
  console.info('Child process sent a message', data)
)
child.send({ type: 'syn', data: [3] })

// ChildThread.ts
process.on('message', data =>
  console.info('Parent process sent a message', data)
)
process.send!({ type: 'ack', data: [3] })
```

---

## 总结

| 场景 | 推荐方案 |
|------|----------|
| 简单异步任务 | Callback |
| 需要链式/并行组合 | Promise + async/await |
| 多次触发的事件 | Event Emitter / RxJS |
| 多线程（浏览器） | Web Workers + typesafe protocol |
| 多线程（Node.js） | Child Processes + typesafe protocol |

---

## 练习

### 练习 1：实现 promisify

将 Node.js 风格的回调函数转换为返回 Promise 的函数：

```typescript
import { readFile } from 'fs'

function promisify<T>(
  fn: (
    arg: string,
    callback: (error: Error | null, result: T | null) => void
  ) => void
): (arg: string) => Promise<T> {
  // Implement here
}

let readFilePromise = promisify(readFile)
readFilePromise('./myfile.ts')
  .then(result => console.log('success', result!.toString()))
  .catch(error => console.error('error', error))
```

### 练习 2：实现 Worker 端 MatrixProtocol

在 Web Worker 端实现消息处理，接收 command 并返回计算结果：

```typescript
// MatrixWorkerScript.ts
type Matrix = number[][]

onmessage = function (e) {
  const { command, args } = e.data

  switch (command) {
    case 'determinant':
      // Compute determinant and postMessage the result
      break
    case 'dot-product':
      // Compute dot product
      break
    case 'invert':
      // Compute inverse matrix
      break
  }
}
```

### 练习 3：Node.js typesafe child_process

使用 mapped type 为 Node.js `child_process` 通信实现类型安全的消息协议：

```typescript
type WorkerCommands = {
  processData: [string, number]
  shutdown: []
}

type WorkerEvents = {
  result: [string]
  error: [Error]
}

// Implement typesafe wrappers for child.send() and child.on('message', ...)
```

### 练习 4：实现 parallelMap

接收数组和异步映射函数，并行处理所有元素后返回结果数组：

```typescript
async function parallelMap<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>
): Promise<U[]> {
  // Implement here
}

const results = await parallelMap([1, 2, 3], async (n) => n * 2)
// results: [2, 4, 6]
```

### 练习 5：带超时的 Promise

实现 `withTimeout`，Promise 在指定时间内未 resolve 则自动 reject：

```typescript
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  // Implement here using Promise.race
}

let result = await withTimeout(fetchData(), 5000)
```
