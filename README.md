# xTS - TypeScript Study Guide

A comprehensive TypeScript study guide based on *Programming TypeScript* by Boris Cherny.

## Structure

```
notes/          # Chapter-by-chapter reading notes
ts-guide/       # Hands-on code guide organized by topic
  00-preface/
  01-introduction/
  02-typescript-overview/
  03-types/
  04-functions/
  05-classes-and-interfaces/
  06-advanced-types/
  07-error-handling/
  08-async-and-concurrency/
  09-frameworks/
  10-namespaces-and-modules/
  11-js-interop/
  12-building-and-running/
  13-conclusion/
  appendix-a ~ appendix-g/
```

## Getting Started

```bash
# Install TypeScript globally
npm install -g typescript

# Compile a single file
tsc ts-guide/01-introduction/code/e01-compile-error.ts

# Or use a project tsconfig.json
cd ts-guide/02-typescript-overview/code && tsc
```
