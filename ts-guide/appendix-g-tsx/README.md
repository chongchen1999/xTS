# 附录 G：TSX

TypeScript 通过 `global.JSX` 命名空间提供了一套可插拔的 TSX 类型钩子。如果只使用 React，不需要了解这些底层细节；如果你在编写不依赖 React 的 TSX 库，这些钩子非常有用。

## TSX 元素分类

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| Intrinsic elements（内置元素） | 小写 | `<div>`, `<h1>`, `<li>` |
| Value-based elements（自定义元素） | PascalCase | `<MyComponent>`, `<App>` |

自定义元素可以是函数组件或类组件。

## JSX 命名空间钩子

| 接口/类型 | 作用 |
|-----------|------|
| `JSX.Element` | value-based 元素的返回类型 |
| `JSX.ElementClass` | 类组件实例必须满足的接口 |
| `JSX.ElementAttributesProperty` | TypeScript 查找组件 attributes 的属性名（React 中为 `props`） |
| `JSX.ElementChildrenAttribute` | TypeScript 查找 children 类型的属性名（React 中为 `children`） |
| `JSX.IntrinsicAttributes` | 所有内置元素支持的属性（React 中为 `key`） |
| `JSX.IntrinsicClassAttributes<T>` | 所有类组件支持的属性（React 中为 `ref`） |
| `JSX.LibraryManagedAttributes<C, P>` | 声明属性类型的其他位置（React 中为 `propTypes`/`defaultProps`） |
| `JSX.IntrinsicElements` | 所有 HTML 元素及其属性类型的映射 |

## React 的 JSX 类型声明示例

```ts
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any> {}

    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode
    }

    interface ElementAttributesProperty {
      props: {}
    }

    interface ElementChildrenAttribute {
      children: {}
    }

    interface IntrinsicAttributes extends React.Attributes {}

    interface IntrinsicClassAttributes<T>
      extends React.ClassAttributes<T> {}

    interface IntrinsicElements {
      a: React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >
      div: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >
      // ... all HTML elements
    }
  }
}
```

## 自定义 TSX 框架的最小实现

```ts
// minimal JSX namespace for a custom framework
declare global {
  namespace JSX {
    interface Element {
      type: string
      props: Record<string, any>
    }

    interface IntrinsicElements {
      div: { className?: string; children?: Element[] }
      span: { className?: string; children?: Element[] }
      p: { className?: string; children?: Element[] }
    }
  }
}

// usage
function createElement(
  type: string,
  props: Record<string, any>
): JSX.Element {
  return { type, props }
}

let el = <div className="app"><span /></div>
```
