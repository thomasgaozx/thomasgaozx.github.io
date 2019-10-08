# Task Asynchronous Programming

- [Task Asynchronous Programming](#task-asynchronous-programming)
  - [ThreadPool and Deadlock](#threadpool-and-deadlock)
  - [Event Driven Programming](#event-driven-programming)

> **Task**: represents a value that will become available in the future; a task runs its own code asynchronously

When a task object is created, it started running its designated code asynchronously. A task has two states: _completed_, or not _completed_.

There are 2 ways to wait for a task:

1. The asynchronous way: `await`
2. The synchronous way: `GetAwaiter.GetResult`, `Task.Result`, `Task.Wait()` (requires little explanation)

To **`await`** a task `T` in the current _async_ function `FuncAsync`:
If the task is completed, continue executing next line, nothing happens.
If the task is not completed, the rest of `FuncAsync` is signed up as the continuation said task `T` and "returns"(3) - to whoever called `FuncAsync`.

Before the execution leaves the `FuncAsync`, it creates the `SynchronizationContext` which stores the context surrounding the execution of the task and is needed to resume said execution in the future(4).

When the execution of `T` completes, the task asks the correct thread (whoever was running `FuncAsync`?) to run the continuation i.e. the rest of `FuncAsync`.

## ThreadPool and Deadlock

> Threads are relatively expensive resource to create and discard over and over again. `ThreadPool` maintain a list of threads and reuse them when someone needs one(5).

An `await` call gives the current thread back to the `ThreadPool`, when the async work is completed, the rest of the function could continue on a thread provided by the `ThreadPool`.

Complication arises when `ThreadPool` provides one thread to start a the request on and a different thread to continue on after the async work has completed. Sometimes certain applications want to start and continue on the same thread (e.g. WinForms UI). .NET provides a way to achieve this by assigning threads `Synchronization Context`. This enforces the constraint that async work must continue on the same thread it started, and as a result a synchronous call to async method may cause deadlock!

Simple example of such deadlock:

```cs
async Task DoSomethingAsync() {
    await Task.Delay(1000);
    Console.WriteLine("haha deadlock");
}

void CallDoSomething() {
    DoSomethingAsync().Result
}
```

What's happening?

1. Thread A calls `CallDoSomething()`
2. `CallDoSomething()` calls `DoSomethingAsync()`, gets a `Task`, and blocks the thread with `.Result`.
3. `Task.Delay(1000)` completes and `SynchronizationContext` requires work to continue on Thread A, which is being blocked, waiting for `.Result`.

Possible solutions:

1. Once async, always async. Expect a long chain of async functions calling each other.
2. Always use `.ConfigureAwait(false)`, e.g. `Task.Delay(1000).ConfigureAwait(false)`. This lifts the constraint that "async work must continue on the same thread it started". The "false" value is for the "continueOnCapturedContext" parameter.
3. Disable synchronization context before calling async code: `SynchronizationContext.SetSynchronizationContext(null)`. This opts out the `SynchronizationContext` completely but has to be called every time you call async functions synchronously (e.g. `.Result`). It's recommended that you wrap the logic in a method (wrap the whole thing in a try-catch block, too!)
4. Use `Task.Run`: `Task.Run(async()=>{return await DoSomethingAsync();}).Result`. This works because `Task.Run` will asign work directly to `ThreadPool`, bypassing the `SynchronizationContext` entirely.

https://blog.stephencleary.com/2014/04/a-tour-of-task-part-0-overview.html
https://medium.com/rubrikkgroup/understanding-async-avoiding-deadlocks-e41f8f2c6f5d

## Event Driven Programming

Credits:

1. https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/
2. https://exceptionnotfound.net/asynchronous-programming-in-asp-net-csharp-ultimate-guide/
3. https://stackoverflow.com/questions/34680985/what-is-the-difference-between-asynchronous-programming-and-multithreading/34681101#34681101
4. https://exceptionnotfound.net/asynchronous-programming-asp-net-csharp-practical-guide-refactoring/
5. https://www.productiverage.com/i-didnt-understand-why-people-struggled-with-nets-async

