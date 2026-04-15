3 + 1               // TS2365 fix: use number instead of array
let obj = { foo: 'bar' }
obj.foo             // TS2339 fix: declare 'foo' in object
function a(b: number) { return b / 2 }
a(2)                // TS2345 fix: pass number instead of string

let x = { a: 1, b: 2 }; x.b
