# **Type Operators**

<span id="page-288-0"></span>TypeScript supports a rich set of type operators for working with types. Use Table A-1 as a handy reference for when you want to learn more about an operator.

*Table A-1. Type operators*

| Type operator                     | Syntax                | Use it on                                                   | Learn more                                                                                              |  |  |
|-----------------------------------|-----------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|--|--|
| Type query                        | typeof,<br>instanceof | Any type                                                    | "Refinement" on page 126, "Classes Declare Both<br>Values and Types" on page 98                         |  |  |
| Keys                              | keyof                 | Object types                                                | "The keyof operator" on page 134                                                                        |  |  |
| Property lookup                   | O[K]                  | Object types                                                | "The keying-in operator" on page 132                                                                    |  |  |
| Mapped type                       | [K in O]              | Object types                                                | "Mapped Types" on page 137                                                                              |  |  |
| Modifier addition                 | +                     | Object types                                                | "Mapped Types" on page 137                                                                              |  |  |
| Modifier subtraction              | -                     | Object types                                                | "Mapped Types" on page 137                                                                              |  |  |
| Read-only modifier                | readonly              | Object types, array<br>types, tuple types                   | "Objects" on page 25, "Classes and Inheritance" on<br>page 83, "Read-only arrays and tuples" on page 36 |  |  |
| Optional modifier                 | ?                     | Object types, tuple<br>types, function<br>parameter types   | "Objects" on page 25, "Tuples" on page 35,<br>"Optional and Default Parameters" on page 47              |  |  |
| Conditional type                  | ?                     | Generic types, type<br>aliases, function<br>parameter types | "Conditional Types" on page 143                                                                         |  |  |
| Nonnull assertion                 | !                     | Nullable types                                              | "Nonnull Assertions" on page 149, "Definite<br>Assignment Assertions" on page 151                       |  |  |
| Generic type<br>parameter default | =                     | Generic types                                               | "Generic Type Defaults" on page 78                                                                      |  |  |
| Type assertion                    | as, <>                | Any type                                                    | "Type Assertions" on page 148, "The const type"<br>on page 123                                          |  |  |
| Type guard                        | is                    | Function return types                                       | "User-Defined Type Guards" on page 142                                                                  |  |  |
