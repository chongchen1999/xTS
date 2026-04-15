// ==============================
// strict: true  -> errors
// strict: false -> no errors
// ==============================

// --- 1. noImplicitAny ---
// strict:true  => Parameter 'x' implicitly has an 'any' type.
// strict:false => OK
function double(x) {
    return x * 2;
}

// --- 2. strictNullChecks ---
// strict:true  => 'string | undefined' is not assignable to 'string'
// strict:false => OK (undefined silently passes)
function greet(name?: string) {
    const upper: string = name;
    console.log("Hello, " + upper);
}

// --- 3. strictPropertyInitialization ---
// strict:true  => Property 'name' has no initializer
// strict:false => OK
class User {
    name: string;
    constructor() {
        // forgot to assign this.name
    }
}

// --- 4. noImplicitThis ---
// strict:true  => 'this' implicitly has type 'any'
// strict:false => OK
function getLength() {
    return this.length;
}

// --- 5. strictFunctionTypes ---
// strict:true  => Type '(animal: Animal) => void' is not assignable
// strict:false => OK (parameter bivariance allowed)
class Animal {
    name = "animal";
}
class Dog extends Animal {
    breed = "husky";
}

type DogHandler = (dog: Dog) => void;

const handleAnimal = (animal: Animal) => console.log(animal.name);
const handleDog: DogHandler = handleAnimal; // bivariant in non-strict

// --- 6. strictBindCallApply ---
// strict:true  => Argument of type 'string' is not assignable to 'number'
// strict:false => OK (call/bind/apply args not checked)
function add(a: number, b: number) {
    return a + b;
}
const result = add.call(null, 1, "2");

// --- 7. useUnknownInCatchVariables ---
// strict:true  => 'e' is of type 'unknown'
// strict:false => 'e' is of type 'any', property access OK
function safeParse(json: string) {
    try {
        return JSON.parse(json);
    } catch (e) {
        console.log(e.message);
    }
}
