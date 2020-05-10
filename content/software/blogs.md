# Blogs

- [Blogs](#blogs)
  - [Capturing Magic Numbers in C++](#capturing-magic-numbers-in-c)
  - [C++ Cheatsheet](#c-cheatsheet)
    - [Vector Constructors](#vector-constructors)
    - [List Constructor](#list-constructor)
    - [Deque Constructor](#deque-constructor)
    - [Unordered Set](#unordered-set)
  - [Dirty C++ Secrets](#dirty-c-secrets)
    - [Print Vector/List](#print-vectorlist)
    - [Random Number in some Range](#random-number-in-some-range)
    - [Algorithm Cheatsheet](#algorithm-cheatsheet)
  - [Geometry in Game Development](#geometry-in-game-development)
    - [OpenGL](#opengl)
    - [Navigation Mesh and Algorithms](#navigation-mesh-and-algorithms)
  - [Logging in C++](#logging-in-c)

## Capturing Magic Numbers in C++

```regex
(.*(\(-?\d*\.?\d+F?\)|\[-?\d*\.?\d+F?\]|\{-?\d*\.?\d+F?\}|, ?-?\d*\.?\d+F?|\(-?\d*\.?\d+F?\,|"-?\d*\.?\d+F?"|'\d'|return -?\d*\.?\d+).*(\;|(?=\/\/))|(==|!=|<|>|<=|>=) ?-?([1-9]|0?\.)\d*\.?\d*F?)|case -?\d*\.?\d+:
```

First off, my apologies for the length and the repetitions in the expression, as I am in no way an expert at regex.
Nonetheless, this expression is very reliable at catching obvious magic numbers. The assumptions are listed below:

The regex does **not** consider the following numerical literals as magic numbers:

1. `strcmp(a,b) == 0` during string comparison, as it is very much a common sense.
2. Numbers in comments.
3. Numbers assigned to a variable.

Now, item no.3 may be a magic number assignment, but most of them are not. Capturing these numerical value assignment will lead to way too many false positives.

The numerical literals (both `float` and `int`) considered as magic numbers are:

1. Numerical literals enclosed in brackets,  i.e. `()`, `[]`, `{}`, `<>`.
2. Non-zero numerical literals used in numerical comparison.
3. Numerical literals used in argument list.

The [online testing](https://regex101.com/r/BuGpeu/29/) of the regex is available.
You are welcome to test and optimize the regex yourself, and if you do, I would appreciate it if you could share the result.

## C++ Cheatsheet

### Vector Constructors

```cpp
vector( size_type count );
vector( size_type count, const T& value = T(), const Allocator& alloc = Allocator() );

template< class InputIt >
vector( InputIt first, InputIt last, const Allocator& alloc = Allocator() );
```

### List Constructor

```cpp
explicit list( size_type count, const Allocator& alloc = Allocator() );
list( size_type count, const T& value, const Allocator& alloc = Allocator() );

template< class InputIt >
list( InputIt first, InputIt last, const Allocator& alloc = Allocator() );
```

### Deque Constructor

```cpp
explicit deque( size_type count );
list( size_type count, const T& value, const Allocator& alloc = Allocator() );

template< class InputIt >
deque( InputIt first, InputIt last, const Allocator& alloc = Allocator() );
```

### Unordered Set

```cpp
template<
    class Key,
    class Hash = std::hash<Key>,
    class KeyEqual = std::equal_to<Key>,
    class Allocator = std::allocator<Key>
> class unordered_set;

explicit unordered_set( size_type bucket_count,
                        const Hash& hash = Hash(),
                        const key_equal& equal = key_equal(),
                        const Allocator& alloc = Allocator() );

template< class InputIt >
unordered_set( InputIt first, InputIt last,
               size_type bucket_count = /*implementation-defined*/,
               const Hash& hash = Hash(),
               const key_equal& equal = key_equal(),
               const Allocator& alloc = Allocator() );
```

`bucket_count` is the minimal number of buckets to use on initialization. If it is not specified, implementation-defined default value is used.

Modifiers:

```cpp
iterator unordered_set::erase( const_iterator pos );
iterator unordered_set::erase( const_iterator first, const_iterator last );
size_type unordered_set::erase( const key_type& key );
```

1-2) returns iterator following last removed element
3) number of elements removed (gotta be 0 or 1)

## Dirty C++ Secrets

There are many things we take for granted from most modern languages that don't exist in C++, such random number generator, print list, vector, etc.

Of course, these operations could be implemented without fancy C++ techniques and are in fact quite trivial. Most of the time, however, user implementation are rather clumsy and _so uncivilized_.
This article summarizes some ~~modern~~ civilized C++ approach to perform these operations elegantly.

Most of the sources are from stack overflow (linked).

### Print Vector/List

```c++
#include <iterator>
#include <algorithm>

template<typename It>
void printList(const It & vec, const char* delim) {
    std::copy(vec.begin(), vec.end(), std::ostream_iterator<typename It::value_type>(std::cout, delim));
}
```

Source: [Stackoverflow](https://stackoverflow.com/a/11335634/498730)

### Random Number in some Range

```c++
#include <random>

/** i, j inclusive */
int randrange(int i, int j) {
    std::random_device rd; // rand num from hardware
    std::mt19937 eng(rd()); // seed the generator
    std::uniform_int_distribution<> distr(i, j);

    return distr(eng);
}
```

> "If you wonder "what the hack is mt19937 type?!" - A Mersenne Twister pseudo-random generator of 32-bit numbers with a state size of 19937 bits. It is a "wrapper" for the "mersenne_twister_engine" template (cplusplus.com/reference/random/mersenne_twister_engine) with pre-set params." -jave.web

Source: [Stackoverflow](https://stackoverflow.com/a/7560564)

### Algorithm Cheatsheet

- https://en.cppreference.com/w/cpp/algorithm/inplace_merge
- https://en.cppreference.com/w/cpp/algorithm/lower_bound
- https://en.cppreference.com/w/cpp/algorithm/accumulate
- https://en.cppreference.com/w/cpp/algorithm/find

## Geometry in Game Development

### OpenGL

http://ogldev.atspace.co.uk/
http://www.opengl-tutorial.org/beginners-tutorials/

### Navigation Mesh and Algorithms

https://wiki.xoreos.org/index.php?title=Pathfinding
http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html
https://gamedev.stackexchange.com/questions/68302/how-does-the-simple-stupid-funnel-algorithm-work
https://en.wikipedia.org/wiki/Navigation_mesh
https://en.wikipedia.org/wiki/Polygon_mesh
https://nwn.fandom.com/wiki/Walkmesh

## Logging in C++

```c++
#include <fstream>
#include <mutex>
#include <string>

std::mutex file_log_mutex;
void cbug(const std::string & msg) {
    std::ofstream fout;
    std::lock_guard<std::mutex> guard(file_log_mutex);

    fout.open("/home/sysadmin/",
        std::fstream::out | std::fstream::app);
    fout << msg  << std::endl;
}
```
