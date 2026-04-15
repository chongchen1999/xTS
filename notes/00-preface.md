# **Preface**

<span id="page-14-0"></span>This is a book for programmers of all walks: professional JavaScript engineers, C# people, Java sympathizers, Python lovers, Ruby aficionados, Haskell nerds. Whatever language(s) you write in, so long as you have some experience programming and know the basics of functions, variables, classes, and errors, this book is for you. Some experience with JavaScript, including a basic knowledge of the Document Object Model (DOM) and the network, will help you along the way—while we don't dive deep into these concepts, they are a wellspring of excellent examples, and if you're not familiar with them the examples might not make as much sense.

Regardless of what programming languages you've used in the past, what unites all of us is our shared experience of tracking down exceptions, tracing through code line by line to figure out what went wrong and how we can fix it. This is the experience that TypeScript helps prevent by examining your code automatically and pointing out the mistakes you may have missed.

It's OK if you haven't worked with a statically typed language before. I'll teach you about types and how to use them effectively to make your programs crash less, docu‐ ment your code better, and scale your applications across more users, engineers, and servers. I'll try to avoid big words when I can, and explain ideas in a way that's intu‐ itive, memorable, and practical, using lots of examples along the way to help keep things concrete.

That's the thing about TypeScript: unlike a lot of other typed languages, TypeScript is intensely practical. It invents completely new concepts so you can speak more con‐ cisely and precisely, letting you write applications in a way that's fun, modern, and safe.

# <span id="page-15-0"></span>**How This Book Is Organized**

This book has two aims: to give you a deep understanding of how the TypeScript lan‐ guage works (theory) and provide bucketfuls of pragmatic advice about how to write production TypeScript code (practice).

Because TypeScript is such a practical language, theory quickly turns to practice, and most of this book ends up being a mix of the two, with the first couple of chapters almost entirely theory, and the last few almost completely practice.

I'll start with the basics of what compilers, typecheckers, and types are. I'll then give a broad overview of the different types and type operators in TypeScript, what they're for, and how you use them. Using what we've learned, I'll cover some advanced top‐ ics like TypeScript's most sophisticated type system features, error handling, and asynchronous programming. Finally, I'll wrap up with how to use TypeScript with your favorite frameworks (frontend and backend), migrating your existing JavaScript project to TypeScript, and running your TypeScript application in production.

Most chapters come with a set of exercises at the end. Try to do these yourself they'll give you a deeper intuition for what we cover than just reading would. Answers for chapter exercises are available online, at *[https://github.com/bcherny/](https://github.com/bcherny/programming-typescript-answers) [programming-typescript-answers](https://github.com/bcherny/programming-typescript-answers)*.

# **Style**

Throughout this book, I tried to stick to a single code style. Some aspects of this style are deeply personal—for example:

- I only use semicolons when necessary.
- I indent with two spaces.
- I use short variable names like a, f, or \_ where the program is a quick snippet, or where the structure of the program is more important than the details.

Some aspects of the code style, however, are things that I think you should do too. A few of these are:

• You should use the latest JavaScript syntax and features (the latest JavaScript ver‐ sion is usually just called "esnext"). This will keep your code in line with the lat‐ est standards, improving interoperability and Googleability, and it can help reduce ramp-up time for new hires. It also lets you take advantage of powerful, modern JavaScript features like arrow functions, promises, and generators.

- <span id="page-16-0"></span>• You should keep your data structures immutable with spreads (...) most of the time.<sup>1</sup>
- You should make sure everything has a type, inferred when possible. Be careful not to abuse explicit types; this will help keep your code clear and terse, and improve safety by surfacing incorrect types rather than bandaiding over them.
- You should keep your code reusable and generic. Polymorphism (see ["Polymor‐](#page-83-0) [phism" on page 64](#page-83-0)) is your best friend.

Of course, these ideas are hardly new. But TypeScript works especially well when you stick to them. TypeScript's built-in downlevel compiler, support for read-only types, powerful type inference, deep support for polymorphism, and completely structural type system encourage good coding style, while the language remains incredibly expressive and true to the underlying JavaScript.

A couple more notes before we begin.

JavaScript doesn't expose pointers and references; instead it has value and reference types. Values are immutable, and include things like strings, numbers, and booleans, while references point to often-mutable data structures like arrays, objects, and func‐ tions. When I use the word "value" in this book, I usually mean it loosely to refer to either a JavaScript value or a reference.

Lastly, you might find yourself writing less-than-ideal TypeScript code in the wild when interoperating with JavaScript, or incorrectly typed third-party libraries, or leg‐ acy code, or if you're in a rush. This book largely presents how you *should* write TypeScript, and makes an argument for why you should try really hard not to make compromises. But in practice, how correct your code is is up to you and your team.

## **Conventions Used in This Book**

The following typographical conventions are used in this book:

*Italic*

Indicates new terms, URLs, email addresses, filenames, and file extensions.

#### Constant width

Used for program listings, as well as within paragraphs to refer to program ele‐ ments such as variable or function names, data types, environment variables, statements, and keywords.

<sup>1</sup> If you're not coming from JavaScript, here's an example: if you have an object o, and you want to add a prop‐ erty k to it with the value 3, you can either mutate o directly—o.k = 3—or you can apply your change to o, creating a *new* object as a result—let p = {...o, k: 3}.

<span id="page-17-0"></span>*Constant width italic*

Shows text that should be replaced with user-supplied values or by values deter‐ mined by context.

![](_page_17_Picture_2.jpeg)

This element signifies a tip or suggestion.

![](_page_17_Picture_4.jpeg)

This element signifies a general note.

![](_page_17_Picture_6.jpeg)

This element indicates a warning or caution.

# **Using Code Examples**

Supplemental material (code examples, exercises, etc.) is available for download at *<https://github.com/bcherny/programming-typescript-answers>*.

This book is here to help you get your job done. In general, if example code is offered with this book, you may use it in your programs and documentation. You do not need to contact us for permission unless you're reproducing a significant portion of the code. For example, writing a program that uses several chunks of code from this book does not require permission. Selling or distributing a CD-ROM of examples from O'Reilly books does require permission. Answering a question by citing this book and quoting example code does not require permission. Incorporating a signifi‐ cant amount of example code from this book into your product's documentation does require permission.

We appreciate, but do not require, attribution. An attribution usually includes the title, author, publisher, and ISBN. For example: "*Programming TypeScript* by Boris Cherny (O'Reilly). Copyright 2019 Boris Cherny, 978-1-492-03765-1."

If you feel your use of code examples falls outside fair use or the permission given above, feel free to contact us at *[permissions@oreilly.com](mailto:permissions@oreilly.com)*.

# <span id="page-18-0"></span>**O'Reilly Online Learning**

![](_page_18_Picture_1.jpeg)

For almost 40 years, *[O'Reilly Media](http://oreilly.com)* has provided technology and business training, knowledge, and insight to help compa‐ nies succeed.

Our unique network of experts and innovators share their knowledge and expertise through books, articles, conferences, and our online learning platform. O'Reilly's online learning platform gives you on-demand access to live training courses, indepth learning paths, interactive coding environments, and a vast collection of text and video from O'Reilly and 200+ other publishers. For more information, please visit *<http://oreilly.com>*.

# **How to Contact Us**

Please address comments and questions concerning this book to the publisher:

O'Reilly Media, Inc. 1005 Gravenstein Highway North Sebastopol, CA 95472 800-998-9938 (in the United States or Canada) 707-829-0515 (international or local) 707-829-0104 (fax)

We have a web page for this book, where we list errata, examples, and any additional information. You can access this page at *<https://oreil.ly/programming-typescript>*.

To comment or ask technical questions about this book, send email to *[bookques‐](mailto:bookquestions@oreilly.com) [tions@oreilly.com](mailto:bookquestions@oreilly.com)*.

For more information about our books, courses, conferences, and news, see our web‐ site at *<http://www.oreilly.com>*.

Find us on Facebook: *<http://facebook.com/oreilly>*

Follow us on Twitter: *<http://twitter.com/oreillymedia>*

Watch us on YouTube: *<http://www.youtube.com/oreillymedia>*

# **Acknowledgments**

This book is the product of years' worth of snippets and doodles, followed by a year's worth of early mornings and nights and weekends and holidays spent writing.

Thank you to O'Reilly for the opportunity to work on this book, and to my editor Angela Rufino for the support throughout the process. Thank you to Nick Nance for his contribution in ["Typesafe APIs" on page 210,](#page-229-0) and to Shyam Seshadri for his contri‐ bution in ["Angular" on page 207](#page-226-0). Thanks to my technical editors: Daniel Rosenwasser of the TypeScript team, who spent an unreasonable amount of time reading through this manuscript and guiding me through the nuances of TypeScript's type system, and Jonathan Creamer, Yakov Fain, and Paul Buying, and Rachel Head for technical edits and feedback. Thanks to my family—Liza and Ilya, Vadim, Roza and Alik, Faina and Yosif—for encouraging me to pursue this project.

Most of all, thanks to my partner Sara Gilford, who supported me throughout the writing process, even when it meant calling off weekend plans, late nights writing and coding, and far too many unprompted conversations about the ins and outs of type systems. I couldn't have done it without you, and I'm forever grateful for your support.
