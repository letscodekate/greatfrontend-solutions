GreatFrontEnd Solutions

Solutions to frontend interview questions and coding challenges from GreatFrontEnd.

The goal of this folder is to practice and strengthen frontend development skills through hands-on implementation and problem solving.

Topics
- JavaScript & TypeScript
- React
- CSS & UI
- Data structures & algorithms
- Frontend interview patterns
- Common UI components and interactions
Structure

Each challenge is organized in its own folder and contains the implementation and any supporting files needed to run or understand the solution.

greatfrontend/
├── connect-four/
├── data-table/
├── lodash-exercises/
└── README.md


| Challenge | Technologies | Concepts |
|-----------|--------------|----------|
| Connect Four | React, TypeScript, CSS | 2D arrays, grid traversal, state management |
| Data Table | React, TypeScript, CSS Modules | Generic components, pagination, reusable UI patterns |

Lodash Exercises

Reimplementations of Lodash utilities, written in TypeScript and tested with Jest. They live in `lodash-exercises/`.

| Exercise | Category | Concepts |
|----------|----------|----------|
| Curry | Functions | Currying, closures, `this` binding, function arity |
| Once | Functions | Closures, memoizing a result, `this` binding |
| Debounce | Functions | Timers, closures, generic function types, `this` binding |
| Debounce (advanced) | Functions | `cancel` and `flush`, callable interfaces, pending-call state |
| Throttle (leading only) | Functions | Rate limiting, timers, closures |
| Throttle (leading and trailing) | Functions | Rate limiting, trailing invocation with the latest arguments |
| conformsTo | Lang | Predicate checks, own properties, `Array.prototype.every` |
| deepClone | Lang | Recursion, circular references, property descriptors, prototypes, Map/Set/Date/RegExp |

To run the tests:

```
cd lodash-exercises
npm install
npm test
```

More solutions will be added as I work through the challenges.