# **Type Utilities**

<span id="page-290-0"></span>TypeScript's type utilities come bundled into its standard library. Table B-1 enumera‐ tes all of the available utilities at the time of writing.

See *[es5.d.ts](http://bit.ly/2I0Ve2U)* for an up-to-date reference.

*Table B-1. Type utilities*

| Type utility              | Use it on                         | Description                                                                        |
|---------------------------|-----------------------------------|------------------------------------------------------------------------------------|
| ConstructorParame<br>ters | Class constructor types           | A tuple of a class constructor's parameter types                                   |
| Exclude                   | Union types                       | Exclude a type from another type                                                   |
| Extract                   | Union types                       | Select a subtype that's assignable to another type                                 |
| InstanceType              | Class constructor types           | The instance type you get from new-ing a class constructor                         |
| NonNullable               | Nullable types                    | Exclude null and undefined from a type                                             |
| Parameters                | Function types                    | A tuple of a function's parameter types                                            |
| Partial                   | Object types                      | Make all properties in an object optional                                          |
| Pick                      | Object types                      | A subtype of an object type, with a subset of its keys                             |
| Readonly                  | Array, Object, and Tuple<br>types | Make all properties in an object read-only, or make an array or<br>tuple read-only |
| ReadonlyArray             | Any type                          | Make an immutable array of the given type                                          |
| Record                    | Object types                      | A map from a key type to a value type                                              |
| Required                  | Object types                      | Make all properties in an object required                                          |
| ReturnType                | Function types                    | A function's return type                                                           |
