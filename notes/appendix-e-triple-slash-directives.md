# **Triple-Slash Directives**

<span id="page-302-0"></span>Triple-slash directives are just regular JavaScript comments that TypeScript looks for to do things like adjust compiler settings for a specific file, or indicate that your file depends on another file. Put your directives at the top of your file, before any code. Triple-slash directives look like this (each directive is a triple-slash, ///, followed by an XML tag):

```
/// <directive attr="value" />
```

TypeScript supports a handful of triple-slash directives. [Table E-1](#page-303-0) lists the ones you are most likely to use:

#### amd-module

Head over to ["The amd-module Directive" on page 264](#page-283-0) to learn more.

#### lib

The lib directive is a way to indicate to TypeScript which of TypeScript's libs your module depends on, which you may want to do if your project doesn't have a *tsconfig.json*. Declaring the libs you depend on in your *tsconfig.json* is almost always a better option.

#### path

When using TSC's outFile option, use the path directive to declare a depend‐ ency on another file, so that the other file appears earlier in your compiled out‐ put than the dependent file does. If your project uses imports and exports, you likely won't ever use this directive.

#### type

Head over to ["The types Directive" on page 262](#page-281-0) to learn more about the type directive.

<span id="page-303-0"></span>*Table E-1. Triple-slash directives*

| Directive  | Syntax                                                 | Use it to…                                                                      |
|------------|--------------------------------------------------------|---------------------------------------------------------------------------------|
| amd-module | <amd-module name="MyCompo&lt;br&gt;nent"></amd-module> | Declare export names when compiling to AMD modules                              |
| lib        | <reference lib="dom"></reference>                      | Declare which of TypeScript's built-in libs your type<br>declarations depend on |
| path       | <reference path="./&lt;br&gt;path.ts"></reference>     | Declare which TypeScript files your module depends on                           |
| type       | <reference types="./&lt;br&gt;path.d.ts"></reference>  | Declare which type declaration files your module depends<br>on                  |

# **Internal Directives**

You will probably never use the no-default-lib directive (Table E-2) in your own code.

*Table E-2. Internal triple-slash directives*

| Directive      | Syntax                                                                                                        | Use it to…                                               |
|----------------|---------------------------------------------------------------------------------------------------------------|----------------------------------------------------------|
| no-default-lib | <reference no-default<="" td=""><td>Tell TypeScript to not use any libs at all for this file</td></reference> | Tell TypeScript to not use any libs at all for this file |
|                | lib="true" />                                                                                                 |                                                          |

# **Deprecated Directives**

You should never use the amd-dependency directive (Table E-3), and instead stick to a regular import.

*Table E-3. Deprecated triple-slash directives*

| Directive      | Syntax                                                             | Instead use… |
|----------------|--------------------------------------------------------------------|--------------|
| amd-dependency | <amd-dependency name="MyComponent" path="./a.ts"></amd-dependency> | import       |
