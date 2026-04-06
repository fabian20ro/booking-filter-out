## 2024-04-06 - O(n*m) Array Lookups in DOM Iteration
**Learning:** Checking for element existence in an array (`includes()` or `indexOf()`) inside a DOM element loop (like `querySelectorAll` iterations) creates a hidden `O(n*m)` complexity that blocks the main thread, especially on long listing pages like Booking.com.
**Action:** Always convert saved string arrays to a `Set` for `O(1)` lookups (`Set.has()`) before iterating over DOM elements to determine visibility or filtering, reducing complexity to `O(n)`.
