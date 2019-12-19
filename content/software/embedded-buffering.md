# Embedded Buffering

## Producer-Consumer Pattern

| **Producers**          | **Consumers**    |
| ---------------------- | ---------------- |
| move metadata to cache | process metadata |
| wheel rotation sensor  | ABS controller   |
| system health monitor  | LCD draw task    |

producer -> data(buffer) -> consumer

## Handshake Protocol

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

## Double Buffering

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

## Bounded-Buffer

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
    q->empty = 1;
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

## buffering Sizing

Buffers allow production rates to exceed consumption rates for limited periods of time.
Let's assume that producing rate P(t) exceeds consuming rate C(t) for a short burst of duration T, how big should the buffer be?

- data produced during burst = PT
- data consumed during burst = CT
- buffer size B=(P-C)T

Example problem: I/O device produces data at 9600 B/s for bursts of 1s.
A task consumes this data at 800 B/s.

- Q1: What's the minimum buffer size? B=8800B/s*1s = 8800B
- Q2: What is the minimum time required between bursts? t=8800B/(800B/s)=11s
