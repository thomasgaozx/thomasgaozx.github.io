---
---

# Regular Expressions Utility

## Capturing Magic Numbers in C++

```regex
(.*(\(\d*\.?\d+F?\)|\[\d*\.?\d+F?\]|\{\d*\.?\d+F?\}|, \d*\.?\d+F?|\(\d*\.?\d+F?\,|"\d*\.?\d+F?"|'\d').*(\;|(?=\/\/))|(==|!=|<|>|<=|>=) ?([1-9]|0\.)\d*\.?\d*F?)
```

First off, my apologies for the length and the repetitions in the expression, as I am in no way an expert at regex. Nonetheless, this expression is very reliable at catching obvious magic numbers. Now, there are some assumptions:

The regex does **not** consider the following numerical literals as magic numbers:

1. `strcmp(a,b) == 0` during string comparison, as it is very much a common sense.
2. Numbers in comments.
3. Numbers assigned to a variable.

Now, item no.3 may be a magic number assignment, but most of them are not. Capturing these numerical value assignment will lead to way too many false positives.

The numerical literals (both `float` and `int`) considered as magic numbers are:

1. Numerical literals enclosed in brackets,  i.e. `()`, `[]`, `{}`, `<>`.
2. Non-zero numerical literals used in numerical comparison.
3. Numerical literals used in argument list.

The [online testing](https://regex101.com/r/BuGpeu/15/) of the regex is available.
You are welcome to test and optimize the regex yourself, and if you do, I would appreciate it if you could share the result.