# Asynchronous Programming

- [Asynchronous Programming](#asynchronous-programming)
  - [Task Asynchronous Programming](#task-asynchronous-programming)
    - [ThreadPool and Deadlock](#threadpool-and-deadlock)
  - [Embedded Buffering](#embedded-buffering)
    - [Producer-Consumer Pattern](#producer-consumer-pattern)
    - [Handshake Protocol](#handshake-protocol)
    - [Double Buffering](#double-buffering)
    - [Bounded-Buffer](#bounded-buffer)
    - [buffering Sizing](#buffering-sizing)
  - [Semaphore](#semaphore)
    - [Condition Variable](#condition-variable)
    - [Mutual Exclusion](#mutual-exclusion)
    - [Task Rendezvous](#task-rendezvous)
    - [Barrier Synchronization](#barrier-synchronization)
      - [Non-reusable Barrier Synchronization](#non-reusable-barrier-synchronization)
      - [Reusable Barrier Synchronization](#reusable-barrier-synchronization)

## Task Asynchronous Programming

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

### ThreadPool and Deadlock

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

Credits:

1. https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/
2. https://exceptionnotfound.net/asynchronous-programming-in-asp-net-csharp-ultimate-guide/
3. https://stackoverflow.com/questions/34680985/what-is-the-difference-between-asynchronous-programming-and-multithreading/34681101#34681101
4. https://exceptionnotfound.net/asynchronous-programming-asp-net-csharp-practical-guide-refactoring/
5. https://www.productiverage.com/i-didnt-understand-why-people-struggled-with-nets-async
6. https://blog.stephencleary.com/2014/04/a-tour-of-task-part-0-overview.html
7. https://medium.com/rubrikkgroup/understanding-async-avoiding-deadlocks-e41f8f2c6f5d

## Embedded Buffering

### Producer-Consumer Pattern

| **Producers**          | **Consumers**    |
| ---------------------- | ---------------- |
| move metadata to cache | process metadata |
| wheel rotation sensor  | ABS controller   |
| system health monitor  | LCD draw task    |

producer -> data(buffer) -> consumer

### Handshake Protocol

Below is a single message buffer:

```c
const uint32_t datasize = 512; // global
uint8_t buf[datasize];
sem_t empty = 1, full = 0;

void producer() { // task or ISR
    while (1) {
        wait(&empty);
        // ... write to buf
        signal(&full);
    }
}

void consumer() { // task
    while (1) {
        wait(&full);
        // ... read from buffer
        signal(&empty);
    }
}
```

Can producer and consumer operate in parallel? NO!

### Double Buffering

Using 2 buffers allows parallel production and consumption.
Frequently used in graphics to avoid tearing.
We'll use an empty and full semaphore per buffer.

- We may use semaphores `b0_empty=1, b0_full=0` for buffer `b0`
- We may use semaphores `b1_empty=1, b1_full=0` for buffer `b1`.

The producer and consumer switch between the two buffers alternatively. i.e. the producer writes `b0->b1->b0->b1`, and the consumer consumes `b0->b1->b0->b1`.

- We can combine `b0_full` and `b1_full` into a `full=0`.
- We can combine `b0_empty` and `b1_empty` into an `empty=2`

The producers and consumer _must_ use the buffers in the same order.

The advantage of this design is that we can statically allocate the buffers and pass pointers to the tasks.

```c
const uint32_t datasize = 512;
uint8_t buf[datasize * 2];
uint8_t* bPtr[2]={ buf, buf + datasize };

sem_t empty = 2, full = 0;

void producer() {
    int index = 0;
    while (1) {
        wait(&empty);
        // ... write to bPtr[index]
        signal(&full);
        index = 1 - index;
    }
}

void consumer() {
    int index = 0;
    while (1) {
        wait(&full);
        // ... read from bPtr[index]
        signal(&empty);
        index = 1 - index;
    }
}
```

Shortcoming: the producer and consumer must operate at the same rate.

### Bounded-Buffer

Generalizes double-buffering to n buffers.
It's called _bounded_ because there is still a finite number of buffers.

Solution:

- array-based queue of n buffers or buffer pointers.
- two semaphores: `empty = n, full = 0`
- two indices:
  - `tail=0` for producers
  - `head=0` for consumers
- two mutexes:
  - `tailMutex` for multiple producers
  - `headMutex` for multiple consumers

```c
const uint32_t n = 4; // buffer size

typedef struct {
    uint32_t data[n];
    uint32_t head_index;
    uint32_t tail_index;
    sem_t head_mutex;
    sem_t tail_mutex;
    sem_t full;
    sem_t empty;
} queue_t;

void queue_init(queue_t *q) {
    q->head_index = q->tail_index = 0;
    q->head_mutex = q->tail_mutex = 1;
    q->full = 0;
    q->empty = n;
}

void enqueue(queue_t *q, uint32_t msg) {
    wait(q->empty);
    wait(q->tail_mutex);
    q->tail_index = (q->tail_index + 1) % n;
    q->data[q->tail_index] = msg;
    signal(q->tail_mutex);
    signal(q->full);
}

uint32_t dequeue(queue_t *q) {
    wait(q->full);
    wait(q->head_mutex);
    uint32_t msg = q->data[q->head_index];
    q->head_index = (q->head_index + 1) % n;
    signal(q->head_mutex);
    signal(q->empty);
    return msg;
}
```

### buffering Sizing

Buffers allow production rates to exceed consumption rates for limited periods of time.
Let's assume that producing rate P(t) exceeds consuming rate C(t) for a short burst of duration T, how big should the buffer be?

- data produced during burst = PT
- data consumed during burst = CT
- buffer size B=(P-C)T

Example problem: I/O device produces data at 9600 B/s for bursts of 1s.
A task consumes this data at 800 B/s.

- Q1: What's the minimum buffer size? B=8800B/s*1s = 8800B
- Q2: What is the minimum time required between bursts? t=8800B/(800B/s)=11s

## Semaphore

A semaphore is a counter with 3 functions:

1. `init`: initialize counter value $s$
2. `wait`: try to decrement counter; wait/block if `s=0`
3. `signal`: increments counter

A standard implementation using **busy wait**:

```c
typdef uint32_t sem_t;
void init(sem_t* s, uint32_t count) {
    *s = count;
}

void wait(sem_t* s) {
    __disable_irq(); // CMSIS function
    while (*s == 0) {
        __enable_irq(); // this allows scheduler to run
        __disable_irq();
    }
    *s -= 1;
    __enable_irq();
}

void signal(sem_t *s) {
    __disable_irq();
    *s += 1;
    __enable_irq();
}
```

### Condition Variable

One task signals another task that an event has occured, then the other task can proceed.

1. initialize semaphore to 0
2. one task will `wait()` to wait on the event
3. the other task will invoke `signal()` to indicate that event has occured.

```c
sem_t cond;

void task1(void *arg) {
    // ...
    wait(&cond);
    // ...
}

void task2(void *arg) {
    // ... detect/generate event
    signal(&cond);
    // ...
}

int main(void) {
    init(&cond, 0);
    // start task 1 and task 2
}
```

### Mutual Exclusion

Protects code that accesses shared data (critical section) by using a semaphore as a lock.

1. initialize the semaphore to 1 (open)
2. invoke `wait()` to **acquire** the lock before entering the critical section.
3. invoke `signal()` to **release** the lock whne leaving the critical section.

```c
sem_t lock;

void task1(void *arg) {
    // ...
    wait(&lock); // acquire
    // execute critical section
    signal(&lock); // release
    // ...
}

void task2(void *arg) {
    // ...
    wait(&lock);
    // execute critical section
    signal(&lock);
    // ...
}

int main(void) {
    init(&lock, 1);
    // ... start task 1 and task 2
}
```

**Recursive Mutex**: same thread can acquire a mutex multiple times without blocking, and it must release it an equal number of times.

- Problem: it encourages holding the mutex for a long time.
- Mutexes should be held for as short a time as possible to maximize concurrency.

**Robust Mutex**: the mutex is automatically released if the thread that locked it terminates.

### Task Rendezvous

Synchronize two tasks to perform work at the same time.

Steps:

1. Initialize 2 semaphores to 0
2. Each signals the other task
3. Both tasks wait for the other's signal

e.g.

```c
sem_t s1, s2;

void task1(void *arg) {
    // ...
    // rendezvous
    signal(&s1);
    wait(&s2);
    // ...
}

void task2(void *arg) {
    // ...
    // rendezvous
    signal(&s2);
    wait(&s1);
    // ...
}

int main(void) {
    init(&s1, 0);
    init(&s2, 0);
    // start task 1 and task 2
}
```

### Barrier Synchronization

All tasks must arrive at the barrier before any continue past it (it's an $n$ task rendezvous).

#### Non-reusable Barrier Synchronization

General solution (Non-reusable): the little book of Semaphore.

- `n` number of tasks
- `count` tracks # arrived at barrier
- `mutex` semaphore protect access to count
- `turnstile` semaphore - tasks line up here

Steps:

1. initialize `count=0, mutex=1, turnstile=0`
2. each tasks will acquare mutax, increment count, if last task (`count == n`) signal turnstile, release mutex (signal mutex).
3. each task wait on turnstile and signal the turnstile

```c
#define N 5
uint32_t count;
sem_t mutex, turnstile;

void b_init() {
    count = 0;
    init(&mutex, 1);
    init(&turnstile, 0);
}

void b_sync(void) {
    wait(&mutex);
    if (++count == N)
        signal(&turnstile);
    signal(&mutex);

    wait(&turnstile);
    signal(&turnstile);
}

void task(void *arg) {
    // ...
    b_sync();
    // critical, synced code ...
}

/*
after all n tasks have synced, turnstile = 1, therefore
the barrier is not reusable.
*/
int main(void) {
    b_init();
    // start n tasks
}
```

The pattern where a `wait` and a `siganl` occurs in rapid succession is called a **turnstile**.

#### Reusable Barrier Synchronization

According to the little book of semaphores, the reusable solution requires 2 turnstiles:

- Initially the first is locked and the second is open.
- When all the threads arrive at the first, we lock the second and unlock the first.
- When all the threads arrive at the second we relock the first, which makes it safe for the threads to loop around to the beginning, and then open the second.

```c
```c
#define N 5
uint32_t count;
sem_t mutex, turnstile, turnstile2;

void b_init() {
    count = 0;
    init(&turnstile, 0);
    init(&turnstile2, 1);
    init(&mutex, 1);
}

void b_sync(sem_t* first, sem_t* second) {
    wait(&mutex);
    if (++count == n) {
        wait(&second);  // lock the second
        signal(&first); // unlock the first
        count = 0;
    }
    signal(&mutex);

    wait(&first);       // first turnstile
    signal(&first);
}

void task(void *arg) {
    // ...
    b_sync(&turnstile, &turnstile2);
    // critical, synced code ...
    b_sync(&turnstile2, &turnstile);
}
```

This solution is sometimes called a **two-phase barrier** because it forces all the threads to wait twice:
once for all the threads to arrive and again for all the threads to execute the critical section.

### Blocking Semaphores (Theoretical)

Busy wait is a waste of processor time because it repetitively disable and enable interrupts.
A better implementation is to block the task and `signal()` will unblock a task (if there are any).

```c
typdef uint32_t sem_t;
void init(sem_t* s, uint32_t count) {
    *s = count;
}

void wait(sem_t* s) {
    __disable_irq();
    *s -= 1;
    if (*s < 0) block_task();
    __enable_irq();
}

void signal(sem_t *s) {
    __disable_irq();
    *s += 1;
    if (s <= 0) unblock_task();
    __enable_irq();
}
```

Each semaphore now has a waitlist:

```c
typedef struct {
    int32_t s;
    TCB* waitlist; // task control block pointer
} sem_t;
```

![sem_t](https://i.imgur.com/mdC2MNW.png)

Suppose Task 1 waits on sem1 (s==-1):

- Task 1 becomes blocked and is moved to the tail of `sem1`, waitlist
- Task 2 is moved to the running 'list' and becomes running

### Priority Inheritance

**Priority Inversion** occurs when a high-priority task is indirectly blocked from running by a low-priority task. This requires 3+ tasks and a mutex.

e.g. Mars Pathfinder Reset Problem: used Vxworks RTOS.
The 3 tasks involved:

1. bus manager task:
    - high priority, executes frequently
    - acquires a mutex before using a communication pipe
2. communication task
    - medium priority, executes infrequently, long execution time
    - communicates with earth
3. meteorological data gathering task
    - low priority, executes infrequently
    - also acquires the same mutex as the bus management task

![priority-inheritance](https://i.imgur.com/hGBAE57.png)

With **priority inheritance**, the priority of the task holding the mutex is _temporarily_ promoted to that of the highest priority task blocked on the mutex.

### Deadlock

Noob.
A cycle of threads waiting for each other to finish, therefore none finishes.

#### Resource Allocation Graph

![rag](https://i.imgur.com/lUKnKBd.png)

- A resource with multiple instances (e.g. a semaphore initialized to 2) has multiple dots.
- Outward Arrow: wants a mutex/resource
- Inward Arrow: holds a mutex/resource

Access to resources such as timer, data, and I/O devices is typically mutex-protected.

#### Coffman Conditions

There exists 4 necessary ad sufficient conditions for deadlock:

1. Mutual Exclusion - resources are "unshareable", i.e. protected by mutex
2. Hold and Wait - a task holds 1 or more resources(mutexes) and waits to acquire another
3. Circular Wait - there exists a cycle in the Resource Allocation Graph
4. No Preemption of Resources - a resource(mutex) can only be released by its owner

If 1 of the 4 conditions is broken, there will not be deadlock.

#### Dining Philosopher Problem

Created by Edsger Dijkstra:
5 philosophers sit in front of 5 bowls of spaghetti.
Philosophers alternatively think and eat.
They need both forks to eat.
Design an algorithm so that no philosopher starves.

Model philosophers as threads and the forks as mutexes.

```c
osMutexId_t fork[5];
uint32_t id[] = {0, 1, 2, 3, 4}; // to implement loop

void philosopher(void* arg) {
    uint32_t first = *(uint32_t*)arg,
             second = (first + 1) % 5; // <-- naive deadlock solution
    while (1) {
        // ... think
        // pick up forks
        // ... eat
        // put down forks
    }
}

int main(void) {
    for (int i=0; i<5; ++i) {
        fork[i] = osMutexNew(NULL);
        osThreadNew(philosopher, id + i, NULL);
    }
    osKernelStart();
}
```

Dijkstra's solution: impose an order by which the forks are acquired (e.g. numerical order).
This breaks coffman's circular wait condition.

```c
uint32_t first, second;
if (id == 4) { // breaks the circular wait
    first = 0;
    second = 4;
} else {
    first = id;
    second = id + 1;
}

// pick up forks
osMutexAcquire(fork[first], osWaitForever);
osMutexAcquire(fork[second], osWaitForever);

// put down forks
osMutexRelease(fork[first]);
osMutexRelease(fork[second]);
```

No deadlock, no starvation.

### Starvation

A task is unable to access a shared resource indefinitely.
Happens when greedy tasks monopolize the resource.

e.g. philosophers try to pick up both forks at once and repeat if both aren't available.

| Timestamp | Philosopher 1      | Philosopher 2   | Philosopher 3      |
| --------- | ------------------ | --------------- | ------------------ |
| 1         | Pick up fork 0, 1  |                 |                    |
| 2         |                    | Tries fork 1, 2 |                    |
| 3         | Put down fork 0, 1 |                 |                    |
| 4         |                    |                 | Pick up fork 2, 3  |
| 5         |                    | Tries fork 1, 2 |                    |
| 6         |                    |                 | Put down fork 2, 3 |
| 7         | Pick up fork 0, 1  |                 |                    |
| 8         |                    | Tries fork 1, 2 |                    |

No deadlock, but starvation can occur.

### Appplications

#### Readers-Writers Problem

There are multiple readers and writers (threads) of shared data.

Requirements:

1. concurrent reader access
2. exclusive writer access
3. no starvation

Introducing **Lightswitch** pattern, where the first person into the room turns on the light (locks the mutex), and the last one out turns it off (unlocks the mutex).

```c
uint32_t counter = 0;
sem_t mutex = 1, turnstile = 1, room_empty = 1;

void writer() {
    wait(&turnstile);
    wait(&room_empty);

    /* --- critical section for writers --- */

    signal(&turnstile);
    signal(&room_empty);
}

void reader() {
    wait(&turnstile);
    signal(&turnstile);

    // reader lightswitch on
    wait(&mutex);
    if (++counter == 1) { // first one enter room
        wait(&room_empty);
    }
    signal(&mutex);

    /* --- critical section for readers ---  */

    // reader lightswitch off check
    wait(&mutex);
    if (--counter == 0) {
        signal(&room_empty);
    }
    signal(&mutex);
}
```

#### Single Lane Bridge Problem

Also use lightswitch pattern.

```c
typedef enum {North = 0, South = 1} dir_t;
sem_t mutex = 1;
int crossing_count = 0, waiting_count = 0;
sem_t waiting_sem;
dir_t crossing_direction = North;

void car(void *arg, dir_t direction) {
    // wait & condition check
    int to_wait = 1;
    wait(&mutex);
    if (crossing_count == 0)
        crossing_direction = direction;

    if (crossing_direction == direction) {
        crossing_count++;
        to_wait = 0;
    } else {
        waiting_count++;
    }
    signal(&mutex);

    if (to_wait) {
        wait(&waiting_sem);
    }

    // crossing
    osDelay(500);

    // update conditions and status
    wait(&mutex);
    if (--crossing_count == 0) {
        for (int i=0; i<waiting_count, ++i) {
            signal(&waiting_sem);
        }
        crossing_direction = 1 - direction; // reverse direction
        crossing_count = waiting_count;
        waiting_count = 0;
    }
    signal(&mutex);
}
```


