# Advanced Python Programming

- [Advanced Python Programming](#advanced-python-programming)
  - [Trivials Techniques](#trivials-techniques)
    - [Multiline String/Condition](#multiline-stringcondition)
    - [Removing All Whitespace](#removing-all-whitespace)
  - [Oneliners](#oneliners)
    - [FirstOrDefaultNone](#firstordefaultnone)
  - [Metaprogramming](#metaprogramming)
    - [Anti-OOP Mixin](#anti-oop-mixin)
    - [Modify Base Class](#modify-base-class)
  - [Debugging Techniques](#debugging-techniques)
    - [Find Class Attributes of Unknown Object](#find-class-attributes-of-unknown-object)
    - [PDB Debugger](#pdb-debugger)
    - [Using Inspect](#using-inspect)
    - [Log Hijacking](#log-hijacking)

## Trivials Techniques

### Multiline String/Condition

```python
s = ("a"
     "b"
     "c")

if (a and
    b and
    c)
```

### Removing All Whitespace

```python
''.join(dns_orig["nameservers"].split())
```

## Oneliners

### FirstOrDefaultNone

Sample 1:

```python
ip_family = next((IPAddress(n).version
    for n in ''.join(dns_orig["nameservers"].split()).split(',')
    if bool(n) and n != 'NC'), None)
```

Sample 2:

```python
ip_family = next(IPAddress(pool.network).version
    for pool in api.get_instance().address_pools_get_all()
    if pool.name in ['oam', 'management'])
```

## Metaprogramming

### Anti-OOP Mixin

One anti-OOP pattern in Python is called [**Mixin**](https://en.wikipedia.org/wiki/Mixin), example:

```python
class tool:
    def fire(self):
        print("fire!")

class A(Exception):
    def test(self):
        self.fire() # A.fire does not exist!

class B(A, tool):
    pass

>>> B().test()
fire!
```

How do we **inject** `A.fire` that throws `NotImplementedError` while making sure `B.fire` will be that of the tool's? See below [Modify Base Class](#modify-base-class).

Solution:

Added a fake class that doesn't implement any missing methods:

```python
class FakeTool:
    def fire(self):
        raise NotImplementedError

class A(Exception, FakeTool):
    def test(self):
        self.fire()
```

Then, using metaprogramming at run time to reset the base class of `A` to only `Exception`:

```python
A = type(A.__name__, (Exception,), dict(A.__dict__))
```

### Modify Base Class

Reference: [stackoverflow](https://stackoverflow.com/questions/9539052/how-to-dynamically-change-base-class-of-instances-at-runtime)

```python
Person = type('Person', (Friendly,), dict(Person.__dict__))
```

This makes `Friendly` the one base class of `Person`.

## Debugging Techniques

### Find Class Attributes of Unknown Object

```python
some_obj.__dict__
dir(some_obj)
```

### [PDB Debugger](https://docs.python.org/3/library/pdb.html)

In the case you're debugging a python process that's the main thread, i.e. you can perform i/o operations on the process.

```python
import  pdb
# ...
pdb.set_trace() # breakpoint
```

### Using Inspect

In case you are debugging a process that's running in background, i.e. you cannot perform i/o operations on the process, you'll have to resort to print/logging. If there is absolutely no way to print a message, try raising an error with messages to see if the messages show up anywhere.

Inspect lets you see the source code of a method/function.

```python
inspect.getsource(self.app._gen_request)
```

### Log Hijacking

Log Hijacking is a basic technique that I occassionally forget, so just take a quick note here.

In the case your program is is running as a background thread of a daemon service, you 1) don't have access to console printing, 2) have to inspect the log via something like `cat /var/log/daemon.log | grep <key phrase>`, and 3) when your code change is in effect you have no control or idea when the log will show up.
This can be a massive pain in the butt and significantly bloats the development cycle.
One way to alleviate this, is to simply perform a log hijacking:

```python
import threading
write_lock = threading.Lock()
def debug(*args):
    with write_lock:
        with open("/home/user/debug.txt", "a+") as fout:
            fout.write(' '.join(str(arg) for arg in args) + '\n')

debug("Checking in ...")
```

You can now treat `debug(args)` as `print`, and then, you can simply `tail -f ~/debug.txt | less` on a separate terminal and wait for the only relevent log to show up.

Sometimes the program crash if it tries to open/close the same file in rapid successions.
In those cases, one can try to run system commands like `echo blah > logfile` in place of `with open(...): ...`.
