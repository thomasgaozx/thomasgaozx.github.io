# Real Time Operating System

- [Real Time Operating System](#real-time-operating-system)
  - [Introduction](#introduction)
    - [Embedded vs Real-Time System](#embedded-vs-real-time-system)
      - [Types of Deadlines](#types-of-deadlines)
  - [Typical Structure of Computer](#typical-structure-of-computer)
    - [Word Size](#word-size)
    - [Memory Technology](#memory-technology)
      - [Endianness](#endianness)
      - [Using Union to Test Endianness](#using-union-to-test-endianness)
      - [Memory Size Prefixes](#memory-size-prefixes)
    - [Memory Hierachy](#memory-hierachy)
    - [Cache Memory](#cache-memory)
      - [Temperal vs Spatial Locality](#temperal-vs-spatial-locality)
    - [Virtual Memory](#virtual-memory)
      - [Memory Management Unit (MMU)](#memory-management-unit-mmu)
    - [Microcontroller Unit (MCU)](#microcontroller-unit-mcu)
  - [C Programming](#c-programming)
    - [Data Member Padding](#data-member-padding)
    - [Dynamic Memory Allocation](#dynamic-memory-allocation)
    - [Sized Integer Types](#sized-integer-types)
    - [Miscellaneous](#miscellaneous)
    - [C Strings](#c-strings)
    - [Program Memory Layout](#program-memory-layout)
    - [Tool Chain](#tool-chain)
    - [Typical Microcontroller Startup Code](#typical-microcontroller-startup-code)
    - [C Safety Critical Code](#c-safety-critical-code)
    - [C Macro](#c-macro)
  - [I/O](#io)
    - [Memory-Mapping I/O](#memory-mapping-io)
      - [Universal Asynchronous Receiver-Transmitter](#universal-asynchronous-receiver-transmitter)
      - [__I, __O, and __IO Macro, Volatile Keyword](#i-o-and-io-macro-volatile-keyword)
    - [Polling I/O](#polling-io)
    - [Interrupts](#interrupts)
      - [Exception Handling Mechanism](#exception-handling-mechanism)
      - [Coding ISR](#coding-isr)
      - [Multiple Interrupts](#multiple-interrupts)
  - [Scheduling Preliminaries](#scheduling-preliminaries)
    - [Bare Metal](#bare-metal)
    - [Foreground/Background Model](#foregroundbackground-model)
    - [RTOS](#rtos)
  - [Scheduling](#scheduling)
    - [Concurrent Execution](#concurrent-execution)
    - [Context Switch](#context-switch)
    - [Task State](#task-state)
    - [Task Characterization](#task-characterization)
    - [Scheduler Objectives](#scheduler-objectives)
    - [Non-Preemptive Schedulers](#non-preemptive-schedulers)
      - [Timeline Scheduling (Superloop)](#timeline-scheduling-superloop)
    - [Preemptive Schedulers](#preemptive-schedulers)
      - [Round-Robin Preemptive](#round-robin-preemptive)
      - [Fixed-Priorities Preemptive Scheduling (FPP)](#fixed-priorities-preemptive-scheduling-fpp)
      - [Rate Monotonic Scheduling (RM)](#rate-monotonic-scheduling-rm)
      - [Preemptive EDF](#preemptive-edf)
    - [WCET Analysis](#wcet-analysis)
      - [Empirical WCET](#empirical-wcet)
      - [Analytical WCET](#analytical-wcet)
  - [Queueing Theory](#queueing-theory)
    - [Deterministic and Markov Model](#deterministic-and-markov-model)
    - [Kendall Notation for Queueing Models](#kendall-notation-for-queueing-models)
    - [M/M/1 Queues](#mm1-queues)
  - [Fault Tolerance](#fault-tolerance)
    - [Concepts](#concepts)
    - [Clock Synchronized](#clock-synchronized)
      - [Standard Clock Cs](#standard-clock-cs)
      - [Precision Time Protocol (PTP)](#precision-time-protocol-ptp)
      - [Distributed Clock Synchronization](#distributed-clock-synchronization)
    - [Byzantine Generals Problem](#byzantine-generals-problem)
      - [Maximum 1 Traitor](#maximum-1-traitor)
      - [Maximum 2 Traitors](#maximum-2-traitors)
      - [Byzantine Generals Problem Applications](#byzantine-generals-problem-applications)
  - [Networks](#networks)
    - [Internet Layers](#internet-layers)
    - [Internet Protocol (IP)](#internet-protocol-ip)
    - [Transmission Control Protocol (TCP)](#transmission-control-protocol-tcp)
    - [User Datagram Protocol (UDP)](#user-datagram-protocol-udp)
    - [Socket Programming](#socket-programming)

## Introduction

### Embedded vs Real-Time System

**Embedded system** is purpose-built hardware and software and has a dedicated purpose.

**Real-time system** must respond to events within a strictly defined time (deadline).

#### Types of Deadlines

| Type | Description                      | Examples                           |
| ---- | -------------------------------- | ---------------------------------- |
| Hard | Missing may cause system failure | pacemaker, nuclear process control |
| Soft | Missing may cause QoS degrade    | streaming audio                    |

## Typical Structure of Computer

```json
{
    "processor",
    "system-bus" : {
        "GPU" : "graphics",
        "Flash" : "startup code (BIOS)",
        "Clock" : "peripheral devices",
        "I/O" : "peripheral devices",
        "RAM" : "instruction and data memory, Von Neumann architecture",
        "HDD/SSD" : "secondary storage"
    }
}
```

### Word Size

In computing, a **word** is the natural unit of data used by a particular processor design. A word is a fixed-sized piece of data handled as a unit by the instruction set or the hardware of the processor. The number of bits in a word (the word size, word width, or word length) is an important characteristic of any specific processor design or computer architecture.

### Memory Technology

**Non-Volatile Memory** retains data when powered off:

- ROM (read-only memory) whose contents are programmed at the foundry, formerly used for startup code (BIOS).
- Flash (reprogrammable  memory) that can only be reprogrammed in blocks of 16-128 KiB, used for startup code (e.g. in LPC 1768)

**Volatile Memory** loses data when powered off:

- SRAM (static RAM) uses a pair of invertors (NOT gates). SRAM is fast but expensive, and is used in **caches**.
- DRAM (dynamic RAM) uses a capacitor. DRAM is slower but cheaper, and is used for main memory.

**Hard-Disk Drive** (HDD):

- Data is stored on spinning magnetized platters
- The read/write head seeks to the correct **track** then waits for the correct **sector** to spin under it.
- Data is stored in sectors of 512B or 4 KiB
- HDDs have high latency (~10ms) but also high bandwidth (~100s MiB/s) and large capacity (~TiB)

**Solid-State Drive** (SSD):

- SSDs emulate HDDs but are built from flash memory chips, no moving parts
- It has ~100x lower latency and ~5x bandwidth of HDDs.

#### Endianness

Memory is ordered as an array of addressable bytes. Multi-byte data ordering:

Multi-byte data ordering:

![endian-ness](https://uwserver.github.io/image-server/endian_ness.png)

#### Using Union to Test Endianness

```c
#include <stdio.h>

typedef union {
    uint32_t num;
    char byte[4];
} numbyte_t;

int main(void) {
    numbyte_t nb;
    nb.num = 0x01020304;
    printf("%08x, %02d%02d%02d%02d\n", nb.num,
        nb.byte[0], nb.byte[1], nb.byte[2], nb.byte[3]);
    /*output: "01020304, 04030201"*/
}
```

#### Memory Size Prefixes

![size-prefix](https://uwserver.github.io/image-server/size_prefix.png)

- memory is sized in powers of 2 but frequently and inaccurately with SI prefixes.
- hard disk drive are sized in powers of 10 and accurately reported with SI prefixes.

### Memory Hierachy

```json
{
    "registers" : "flip flops",
    "cache" : "SRAM",
    "main memory" : "DRAM",
    "secondary storage" : "HDD/SSD"
}
```

### Cache Memory

Main memory is large but has high latency (~100s of processor cycles). **Caches** are smaller, faster memories storing a subset of data from main memory.

#### Temperal vs Spatial Locality

![cache-memory](https://uwserver.github.io/image-server/cache_memory.png)

Based on the idea that if a processor needs data from memory:

1. **Temperal Locality**: it will need it again soon
2. **Spatial Locality**: it will need data nearby

- Cache retrieve data in 4-byte blocks from memory to take advantage of its high bandwidth.

There are multiple levels of cache e.g. L1, L2, L3 (level 1,2,3)

- Smaler caches (e.g. L1) are faster
- Larger caches (e.g. L3) have higher "hit rate" (already holds the requested data)

![caches](https://uwserver.github.io/image-server/caches.png)

- The L1 cache is split for parallel instruction adn data fetch
- The L2 cache and L3 cache are unified caches (store instruction and data)

### Virtual Memory

Each process has its own _virtual_ address space: addresses in range [0, 2^n).
The virtual address space is divided into "**pages**".
Page sizes are large (4kiB or more) to take advantage of HDD bandwidth and compensate for its latency.
Virtual pages map to physical main memory pages.
Overflow pages are swapped to the HDD (swap memory).
  
A **page table** is the data structure used by a virtual memory system in a computer operating system to store the mapping between virtual addresses and physical addresses. Virtual addresses are used by the program executed by the accessing process, while physical addresses are used by the hardware, or more specifically, by the RAM subsystem. The page table is a key component of virtual address translation which is necessary to access data in memory.

![virtual-memory-page](https://uwserver.github.io/image-server/virtual_memory_page.png)

#### Memory Management Unit (MMU)

**MMU** translates virtual addresses to physical addresses for every memory access (instruction fetch or data load/store). Each process has a _page table_ that maps virtual page numbers to physical page numbers.

![mmu](https://uwserver.github.io/image-server/mmu.png)

### Microcontroller Unit (MCU)

An **MCU** integrates the processor, memory, clock, and peripheral devices on one chip. No virtual memory, an doften no cache.

The processor has 3 outgoing buses (Harvard architecture):

- **I-code bus**: for instructions (connects to flash).
- **D-code bus**: for data (connects to SRAM).
- **System bus**: for peripherals.

## C Programming

### Data Member Padding

Consider the simple data structure

```c
typedef struct {
    char first;
    int second;
} pair_t;
```

![struct-padding](https://uwserver.github.io/image-server/struct_padding.png)

### Dynamic Memory Allocation

```c
#include <stdlib.h>
int main(void) {
    int *p;
    p = malloc(sizeof(int)); // `malloc` returns void*
    *p = 10;
    free(p);
    p = NULL;
}
```

- `malloc` allocates a block of n-byte memory and return its address as `void*`
- `sizeof` operater returns the number of bytes of storage for the given type or variable
- `free` reclaims the storage indicated by the pointer

Dynamically allocated arrays:

```c
int* a = malloc(10*sizeof(int));
for (int i=0; i<10; ++i) {
    a[i] = i;
}
```

- `a` holds address of the first element
- `[i]` adds `i*sizeof(int)` and dereferences it.

### Sized Integer Types

C integer sizes are compiler dependent.

Rules:

1. `char` >= 8 bits
2. `short` >= 16 bits
3. `int` >= 16 bits
4. `long` >= 32 bits
5. `long long` >= 64 bits

Overall: `char <= short <= int <= long int <= long long int`

- Sized types are better for embedded systems.

Signed: `int8_t`, `int16_t`, `int32_t`, `int64_t`

Unsigned: `uint8_t`, `uint16_t`, `uint32_t`, `uint64_t`

### Miscellaneous

- Boolean values in C are defined in `<stdbool.h>`: `bool something = true || false;`
- `string`: null-terminated (ends in `\0`) char array: `char s[] = "abc";`
Note that `char* s = "abc";` is not mutable because string literal is initialized in the readonly memory segment.
- Pre-processor: macro, copy paste `#include`, `#else`, `#if`, `#elif`, `#ifndef`, `#undef`.

```c
#include <rt_misc.h>
#ifdef __RTGT_UART
    #include "uart.h"
    #define PORT_NUM 0
    #define BAUD_RATE 9600
#endif
```

including header files multiple times could result in multiple definitions of variables, types or functions.

`#pragma once` is a better but non-standard alternative to include guard.

### C Strings

C strings are represented as null-terminated (ends with `\0`) arrays of chars.

```c
char s[]="abc"; // allocate storage for s and initialize with "abc"
char *s = "abc"; // pointer initialized with the addr. of the str literal in text segment
```

### Program Memory Layout

| Location | Address       | Name             | What goes in here           |
| -------- | ------------- | ---------------- | --------------------------- |
| Low      | `0x0000 0000` | **Text Segment** | instructions (readonly)     |
| ↓        | ↓             | **Data Segment** | global and static variables |
| ↓        | ↓             | **Heap** ↓       | dynamic memory allocation   |
| High     | `0xffff ffff` | **Stack** ↑      | local variables             |

e.g.

```c
#include <stdio.h>
#include <stdlib.h>

char s[] = "abc";

int main(void) {
    uint32_t m = 4;
    uint32_t *p = malloc(sizeof(uint32_t));
    printf("%14p\n%14p\n%14p\n%14p\n", // %p - pointer
           s/*global*/, &m/*stack*/, &p/*stack*/, p/*heap*/);
}

/*
Output:
0x601050
0x7fffdcd8afa4
0x7fffdcd8afa8
0x252e010
*/
```

### Tool Chain

\*.c → cpp(preprocessor) → cc(compiler) → as(assembler) → \*.o → ld(linker) → *(executable)

### Typical Microcontroller Startup Code

Executes on system reset or power up:

1. initialize the clock, powers some peripheral devices
2. loads program instructions into the text segment
3. initializes the stack and heap and invokes main()

Blah blah blah:

### C Safety Critical Code

1. Ensure all dynamic memory allocations occur at the very beginning, because `malloc` can fail (running out of memory).
2. ~2 Assertions per function, refer to `<assert.h>`
3. Always check function input and return value.
4. Don't use function pointer.
5. Always use 1-level dereferencing, i.e. don't do `a->b->c->d`

### C Macro

In C macro, `#` means stringify the macro function input.

Useful compiler macros:

| Name       | Description |
| ---------- | ----------- |
| `__FILE__` | file name   |
| `__LINE__` | line number |

## I/O

### Memory-Mapping I/O

The address on the bus are shared between memory and peripheral devices.
Selected examples from the LPC1768 memory map:

| Address Range               | Device                      |
| --------------------------- | --------------------------- |
| `0x0000 0000 - 0x0007 ffff` | Flash Memory (instructions) |
| `0x1000 0000 - 0x1000 7fff` | SRAM Memory (data)          |
| `0x1fff 0000 - 0x1fff ffff` | ROM Memory                  |
| `0x2009 0000 - 0x2009 ffff` | GPIO (general-purpose I/O)  |
| `0x4000 c000 - 0x4000 c030` | UART0 (serial ports)        |
| `0x5000 0000 - 0x5000 0ff4` | Ethernet                    |

Peripheral devices have registers mapped to specific addresses.

```json
{
    "bus": {
        "processor",
        "memory",
        "I/O devices" : {
            "control registers",
            "status registers",
            "data registers"
        }
    }
}
```

External connections may connect to `I/O devices`.

#### Universal Asynchronous Receiver-Transmitter

**UART** aka serial port.

```json
{
    "data register" : "receive buffer register(RBR) 0x4000 c000",
    "control register" : "Interrupt Enable Register (IER) 0x4000 c00f",
    "status register" : "Line Status Register (LSR) 0x4000 c014"
}
```

Example code to control UART 0 interrupts:

```c
#define IER_RBR  0x01
#define IER_THRE 0x02
#define IER_RLS  0x04
```

These bit masks give names to bits in the Interrupt Enable Register (IER)

```c
// LPC_UART starts from 0x00000000
LPC_UART->IER |=  IER_RBR;
LPC_UART->IER |=  IER_RLS;
LPC_UART->IER &= ~IER_RBR; // clear the bit
```

Setting or clearing these bits controls when the UART interrupts the processor.

How does `LPC_UART->IER` address the IER register at `0x4000c004`

```c
LPC_UART_TypeDef *LPC_UART=
    (LPC_UART_TypeDef*)0x4000c000;
```

![uart-struct](https://uwserver.github.io/image-server/uart_struct.png)

#### __I, __O, and __IO Macro, Volatile Keyword

```c
#define __I volatile const
#define __O volatile
#define __IO volatile
```

`const` tells the compiler to disallow writes to this variable.

`volatile` keyword tells the compiler not to optimize out reads or writes to this variable. For example:

```c
int x;
x = 10; // compiler might optimize out this statement
x = 11;
```

Warning: `volatile` keyword is needed whenever accessing memory-mapped peripherals.

### Polling I/O

The program repeatedly checks an I/O devices' status register until it sees that the device is ready to send or receive data.

Bit 0 of the Line Status Register (LSR) indicates if received data is ready.

```c
uint8_t UARTReceiveChar(uint32_t portNum) {
    // ...
    while (!(LPC_UART->LSR & 0x01));
    return (LPC_UART->RBR); // reading RBR implicitly clears LSR bit 0
}
```

Polling is simple but often inefficient.

```asm
LOOP    LDRB    R1,[R0]     ; load byte into R1
        TST     R1, #0x01   ; test bit 0
        BEQ     LOOP        ; if zero, repeat
```

4 cycles in total. Cortex M3 clock rate = 96 MHz. Polling rate = 96E6 cycle/s / 4 cycles per loop = 24E6 loop/s

Assume the UART is receiving keyboard data. A fast typist = 70 wpm, average English word length = 5.1 letters = 5.11 char/word ==> 5.95 byte/second (data rate).

Average polling loop iteration per char = Polling rate / data rate = 4.03E6 loops/byte

### Interrupts

It may be better to let the I/O device signal the processor whne it needs service (e.g. when the UART receives data).

![interrupt](https://uwserver.github.io/image-server/interrupt.png)

- **IRQ** Interrupt ReQuest

3 exception types:

1. **Interrupt**: request for service from a peripheral device
2. **Fault**: indicates a problem executing an instruction, e.g. divide by zero, invalid opecode, invalid memory address.
3. **Trap**: special instruction that requests OS services (e.g. the SVC - service call instruction in ARM assembly)

in all cases an exception causes a change in control flow, similar to a subroutine call, except that the hardware invokes the subroutine, not the software.

![interrupt-flow](https://uwserver.github.io/image-server/interrupt_flow.png)

Application Code --> IRQ received --> suspended --> interrupt service routine --> resume execution

The application code is unaware that it was interrupted. In general exceptions cause "exception handlers" to execute. **ISR** is the common name for **Interrupt exception handler**. ARM calls ISRs "IRQHandler"

#### Exception Handling Mechanism

Every exception source, including IRQs, is assigned a "vector" (a number).
The vector table lists the ISR addresses for each vector (the vector table is a data structure in memory).

| Vector | Address of      | Description               |
| ------ | --------------- | ------------------------- |
| 0      |                 |                           |
| 1      | Reset_Handler   | Runs on start-up or reset |
| 2      | NMI_Handler     | non-maskable interrupt    |
| ...    |                 |                           |
| 11     | SVC_Handler     | for OS service calls      |
| ...    |                 |                           |
| 16     | WDT_IRQHandler  | Watchdog Timer            |
| ...    |                 |                           |
| 21     | UART_IQRHandler |                           |
| ...    |                 |                           |
| 37     | INT2_IQRHandler | Push button.              |

**Watchdog timers** are used in autonomous systems.
The application that must  periodically reset the timer to "kick the dog".
If it doesn't and the timer reaches terminal count, it resets the system.
It is used to recover from system failure.

When the IQR is received, the process:

1. looks up the ISR address in vector table
2. Save the execution context on the stack (PC, status register, general-purpose registers)
3. Invokes the ISR (execution handler).

When the ISR exits, the processor

1. restores the execution context from the stack
2. resumes the application

#### Coding ISR

Procedure:

1. Create a `IRQHandler` function
2. Enable IRQ by setting certain bits
3. Call function routine to allow IRQ at processor, providing vector number.

#### Multiple Interrupts

- Each exception (IRQ) is assigned a priority
- IRQs of higher priority can interrupt ISRs of lower priority requests ("nested interrupts")
  
Note that if low priority IRQs occur, processor will mask them and will process according to priority.

ISR Rules of THumb:

1. Keep it short
2. Use global variables to pass data to/from the application
3. If an ISR calls a function it should be **re-entrant** (a computer program or subroutine is called reentrant if multiple invocations can safely run concurrently); cannot use static variables

Example:

```c
uint32_t countup(void) {
    static uint32_t count; // Initiated to 0 on program load
    count++;
    return count;
}
```

```json
{
    "ISR 0" : {
        "load count" : 0,
        "add 1" : 1,
        "ISR 1" :{
            "load count" : 0,
            "add 1" : 1,
            "store count" : 1,
        },
        "store count": 1
    }
}
```

The final register value is 1, but we want two.

To use a non-reentrant function in an ISR you can disable interrupts:

```c
void ISR(void) {
    __disable__irg(); { // use sparingly!
        countup();
    }__enable__irg();
}
```

Use the scope operator '{}' sparingly causes the program to become very inefficient and breaks scheduling.
Brackets are used in the example to highlight scope of disable IRQ.

- `__disable__irg()` and `__enable__irg()` are part of the Cortex Microcontroller Software Interface Standard (CMSIS).
- `printf()` and `malloc()` are _not_ re-entrant but as of C11 standard, they are multi-threading safe (MT-safe), by adding locks.

## Scheduling Preliminaries

### Bare Metal

Some simple embedded systes are constructed with no OS, instead they might use a super loop.

E.g. We have 3 tasks `t1`, `t2`, `t3` (plain old functions)

```c
int main(void) {
    while (true) {
        t1();
        t2();
        t1();
        t3();
        t1();
        t2();
    }
}
```

The problem of this model is it cannot respond to asynchronous events.

### Foreground/Background Model

For this model, the superloop runs in the background, ISRs preempt the superloop to run in the foreground.

E.g. we have 3 tasks, `t1` only runs if the button is pushed

```c
bool pushed;
int push_isr() { // foreground
    pushed = true;
}

int main(void) { // background superloop
    while (true) {
        if (pushed) {
            t1();
            pushed = false;
        }
        t2();
        t3();
        t2()
    }
}
```

Limitation: lack priorities

### RTOS

**RTOS v2** is an API that defines how the RTOS functions and how an application interacts with it.

**RTX5 (Real-Time eXecutive v5)** is the kernel that implements the RTOS v2 specification.
It performs scheduling and provides other OS services.

e.g. 2 tasks: `t1` (normal priority) runs when the button is pushed, `t2` low priority.

```json
{
    "RTX5 Scheduler" : {
        "t1 loop (normal priority)" : "await push_event; print",
        "t2 loop (low priority)" : "p2.6 on; p2.6 off (flashing LED)",
        "PushButton ISR loop" : "clear IRQ; set flag"
    }
}
```

Tasks are typically infinite loops but must block (on I/O, timer, event flags, etc) to allow other tasks to run.

Note, RTOS v2 calls tasks "threads" (a term borrowed from multi-processing OSs with VM(virtual memory)s)

The scheduler runs the ready task with highest priority:
if more than 1 is ready, it gives each one a "timeslice" in round-robin fashion.
When no threads are ready, the scheduler runs the "idle thread.

```c
void osRtxIdleThread(void *arg) {
    (void)arg; // just so that one could use break point for function entry
    for(;;) {}
}
```

RTOS v2 priorities:

```json
{
    "osPriorityIdle" : 1,
    "osPriorityLow" : 8,
    "osPriorityBelowNormal" : 16,
    "osPriorityNormal" : 24,
    "osPriorityAboveNormal" : 32,
    "osPriorityRealTime" : 40
}
```

## Scheduling

### Concurrent Execution

Definition: task executions are interleaved on one or more processors with indeterminate ordering. E.g. 1 processor, 3 tasks of equal priority means round-robin scheduling, context switch changes the running thread (task).

A real-time application consists of a set of concurrent tasks (taskset), all tasks share the text segment, the data segment, and the heap.

RTOS memory map:

```json
[
    "text segment",
    "data segment",
    "heap",
    { "TCBs (task control blocks)" : ["τ1, τ2"] },
    { "stack" : ["τ1", "τ2"] }
]
```

The RTOS uses the TCBs to manage the tasks (book keeping)

TCB contents:

```json
[
    "task id",
    "stack_pointer",
    { "states" :
        ["Ready", "Running", "Blocked", "Inactive", "Terminated" ]
    },
    "priority",
    "linked list pointers",
    "event flags"
]
```

- task id
- stack pointer
- state = {Ready, running}

### Context Switch

To switch between running tasks, the OS must:

1. Store the execution context of the running task
2. Restore the execution context of hte ready task.

e.g. switch from τ1 (running) to τ2 (ready)

1. Push τ1's general purpose registers, PC, status register on to stack.
2. Record the stack pointer in τ1's TCB
3. Update the stack pointer from τ2's TCB
4. Pop stored context into general purpose registers, PC, and status register.

### Task State

![task-state](https://uwserver.github.io/image-server/task_state.png)

The schedule runs when:

- a task is created
- a task is terminated
- a task yields (tells OS to run another task)
- a task blocks (delay)
- a task unblocks
- a task finishes its time slice (default x5 timeslice is 5 system ticks = 5ms)

### Task Characterization

A typical real time task has this structure:

```c
while (1) {
    cv.wait();
    work();
}
```

The task is said to be _released_ when it unblocks and runs.
A task has parameters:

- **T** period (between releases)
- **C** worst-case execution time (**WCET**)
- **D** deadline (once released, work must finish within this time)

Our schedule analysis will assume **Di=Ti** (it's easier)

![scheduler](https://uwserver.github.io/image-server/scheduler.png)

### Scheduler Objectives

1. Minimize missed deadlines (or minimize lateness)
2. Minimize processor utilization (percentage of time that the processor is busy)
   ![processor-util](https://uwserver.github.io/image-server/processor_util.png)
3. Minimize scheduler overhead

### Non-Preemptive Schedulers

Preemption is the act of temporarily interrupting a task being carried out by a computer system.

> Advantage: minimizes scheduler overhead

#### Timeline Scheduling (Superloop)

- Task execute in a fixed order which repeats in definitely
- The schedule is created "offline" (at compile time)

E.g. Task Set

|     | T (Period) | C(WCET) |
| --- | ---------- | ------- |
| τ1  | 18         | 8       |
| τ2  | 30         | 10      |
| τ3  | 45         | 10      |

Procedures to draw scheduling diagram:

1. Check processor utilization. U = (8/18)+(10/30)+(10/45) = 1
  Make sure **U ≤ 1**, which is the case here.
2. Determine schedule length = least common multiple (LCM) of task periods(Ti)
3. Create the schedule using non-preemptive earliest deadline first (**EDF**)

![preemptive](https://uwserver.github.io/image-server/preemptive.png)

**Implementation**: store the order in an array and the scheduler moves to the next task each time.

- Schedular overhead: O(1)
- Array length is total # tasks scheduled = Σ (LCM/Ti)
- Often it's okay to shorten a task period so we can reduce storage

### Preemptive Schedulers

Tasks are suspended mid-execution to allow other tasks to run

#### Round-Robin Preemptive

- All tasks have equal priority
- Tasks switch occurs at the end of each **time slice**

![round-robin](https://uwserver.github.io/image-server/round_robin.png)

**Implementation**: ready queue which is based on a linked list.
On a context switch, equeue old task at tail and dequeue next task to run from head.
The TCBs have pointers for the purpose.

![round-robin-impl](https://uwserver.github.io/image-server/round_robin_impl.png)

- Scheduler Overhead O(1)
- Limitation: no priorities, no deadline

#### Fixed-Priorities Preemptive Scheduling (FPP)

- Priorities are static (assigned at compile time)
- The scheduler runs the ready task(s) with highest priority in round-robin fashion

**Implmenetaion**: an array of queues, one per priority level

e.g. priority levels: 0(lowest) - 7(highest)

- idle task = priority 0
- τ1, τ2 = priority 2
- τ3, τ4, τ5 = priority 5

![fpp](https://uwserver.github.io/image-server/fpp.png)

- When a timeslice ends, the scheduler enqueues the running task at the tail of its priority, queue and deque next task to run from the head of the same queue
- Adding a new task is O(1)

What happens when the high priority queue empties?

1. Linear scan for the next lowest non-empty queue = O(n)
2. Use a bit vector to represent the non-empty queues, each bit represents a priority level.
   - The first set bit (non-zero bit) can be found with a machine instruction such as ARM's CLZ (counting leading zeros)
   - Can also be done in O(1) time in software with the de Bruijn sequence algorithm

- FPP schedule overhead is O(1) and is widely used.
- Limitation: no explicit deadline, frequent context switching/scheduling

Note: active tasks are always on 1 list: running "list", ready list, or waiting lists.

#### Rate Monotonic Scheduling (RM)

RM is a way to map deadlines to priorities for FPP scheduling.
**The priority is _inversely_ proportional to the period**.

**Schedulability** test:
a task set is schedulable (i.e. will meet all deadlines) by RM if **Π(1+Ci/Ti) ≤ 2**.

![rm-schedulability](https://uwserver.github.io/image-server/rm_schedulability.png)

The test to accept a new task online can be performed in O(1) time.

e.g. Example 1: use Di=Ti

|     | T (Period) | C(WCET) |
| --- | ---------- | ------- |
| τ1  | 10         | 2       |
| τ2  | 12         | 3       |
| τ3  | 6          | 1       |

Procedures for RM:

1. Check processor utilization U=2/10+3/12+1/6 ≅ 0.62 ≤ 1
2. Schedulability test: (1+2/10)(1+3/12)+(1+1/6) = 1.75 ≤ 2

![rm-w-fpp](https://uwserver.github.io/image-server/rm_w_fpp.png)

e.g. Example 2:

|     | T (Period) | C(WCET) | Priority |
| --- | ---------- | ------- | -------- |
| τ1  | 50         | 15      | 1st      |
| τ2  | 50         | 15      | 1st      |
| τ3  | 60         | 10      | 2nd      |

U=0.67, Π=1.82

![ex2-scheduling](https://uwserver.github.io/image-server/ex2_scheduling.png)

#### Preemptive EDF

For Preemptive EDF, the priorities are dynamic (priority is relative to the closeness of the deadline).
The scheduler runs the task with the closest deadline.
If a task is released with earlier deadline, it preempts the current task.
There is no timeslice, no systick interrupt.

**Implementation**:
two priority queues

1. "ready" queue - all ready tasks sorted by deadline
2. "waiting" queue - waiting tasks sorted by next release time

Scheduler overhead is O(log n) assuming minheaps are used.

Advantages of Preemptive EDF:

- deadlines are explicit
- it is an optimal scheduling algorithm
- has fewest scheduler invocations and fewest context switches

Disadvantage:

- complex schedulability test (needed to decide if a new task can be added).

### WCET Analysis

#### Empirical WCET

The empirical WCET analysis is commonly used:
run the application many times with varying inputs;
Runtime is measured with a profiling tool such as gprof or a logic analyzer or hardware timers.

This method is prone to underestimating WCET so safety margins are added.

#### Analytical WCET

Flow-control analysis: e.g.

```c
do {
    if (x>0) {
        // ...
    } else {
        //...
    }
} while (i!=j);
```

- estimate loop bounds and longest path.
- low-level analysis estimates the execution time of basic blocks
- finally the flow-control and timing estimates are combined

This method is prone to over-estimating WCET.

## Queueing Theory

Models the real world as client/server systems.
Clients arrive and wait in a queue to be served.

- **λ** (Clients): average arrival rate
- **μ** (Server): average service rate
- **ρ** = λ/μ = **load factor**

### Deterministic and Markov Model

Deterministic D:

- Clients arrive with regular interval T = 1/λ
- Server time = 1/μ

Markov M:
A **Markov Process** is a memoryless stochastic process.
We use probability density functions to model the probability of next event occuring at a specific future time.

### Kendall Notation for Queueing Models

**Kendall Notation**: `A/S/K/N`

- A: arrival model (D or M)
- S: service model (D or M)
- K: number of servers (1 or m)
- N: queue length (default to ∞)

### M/M/1 Queues

M/M/1 queues (i.e. M/M/1/∞)

- Average \#clients = \#clients in queue + #clients being served: **L = ρ/(1-ρ)**
- Average client time in the system (waiting in queue + being served): **W** = (1/μ)/(1-ρ) **= 1/(μ-λ)**
- We have **Little's Law**: **L=λW**

Probability of \# clients assume infinite buffer (i.e. M/M/1/∞):

- Probability that there are 0 clients (system is idle): P0 = 1-ρ
- Probability that there are n clients (n<=k): Pn = (1-ρ)ρ^n

Probability of \# clients assume finite buffer (i.e. M/M/1/K):

- Probability that there are 0 clients (system is idle): P0 = (1-ρ)/(1-ρ^(k+1))
- Probability that there are n clients (n<=k): Pn = (1-ρ)ρ^n/(1-ρ^(k+1))
- Blocking probability (that there are K clients in the system, and that a new client is blocked): Pk = P_B = (1-ρ)ρ^k/(1-ρ^(k+1))

Example:
data is produced at a rate of λ=4 packets per second,
data is consumed at a rate of μ=5 packets per second,
assume an M/M/1 queueing model.

What is the average number of buffered packets?

L = ρ/(1-ρ) = 4

(there are 4 packets in the system on average and 3 packets in the buffer on average)

How long on average does a packet spend in the system?

W = (1/μ)/(1-ρ) = 1s

Probability that system is idle (infinite buffer)?

P0 = 1-ρ = 20%

Probability that there are 4 packets in the system?

Infinite buffer: P4 = P0 ρ^4 = 8.192%
Finite buffer (K=4): PB = (1-ρ)ρ^4/(1-ρ^5) = 12.18%

Why is P4 larger with a bounded buffer than an infinite buffer?
Because with the bounded buffer P4 also incorporates the cases where there would have been 5 or 6 or more in the system.

## Fault Tolerance

### Concepts

- **Fault**: cause of an error (e.g. environmental faults, mechanical faults, design faults).
- **Error**: manifestation of a fault within the system
- **Failure**: system deviates from the specification as the result of an error

Approaches to dealing with faults:

1. Avoidance: prevent them from happening, e.g. shielding, lightening rods, good coding practices.
2. Tolerance:
   - continue to operate within spec: redundant components.
   - graceful degradation of service, e.g. thermal throttling of a processor
   - fail safe (halt in a safe manner, e.g. deadman switches

Case study: **Voyager 2**

Launched on Auguest 20, 1977, Voyager 2 explored Jupiter, Saturn, and then flew by Uranus and Neptune, and headed to interstellar space (heliopause).
In May 2010, its transmissions became corrupted, it was 13.8 billion km from earth, which means the transmission latency approximately equals 13 hours.
Ground control examined the memory and found a flipped bit that was part of a command.
They hypothesized that cosmic radiation flipped the bit.
They corrected it and correct transmission resumed.

- Fault: cosmic radiation / insufficient shielding / lack of ECC RAM
- Error: flipped bit
- Failure: corrupted transmission

### Clock Synchronized

- devices in a distributed system often have their own clock.
- clocks are not perfect, they are affected by temperature and supply voltage
  - 0.5s of drift per day is not unusual
- options to keep a common time:
  - (centralized) have a standard clock, Cs against which the others synchronize
  - (distributed) synchronize with each other.

#### Standard Clock Cs

- clock Ci gives time Ci(t) at real time t
- requirements for synchronizang against Cs

1. **correctness**: \|Ci(t)-Cs(t)\| < Ɛ, e.g. an absolute error bound
2. **bounded drift** \|dCi(t)/dt - 1\| < ρ, e.g. clock i runs at approximately the correct rate
3. **monotonicity**: Ci(t1) >= Ci(t0) where t1 > t0, e.g. time moves forward, not backward
4. **chronoscopicity**: if t2-t1=t4-t3, then Ci(t2)-Ci(t1)≅Ci(t4)-Ci(t3), e.g. measurement of the equal intervals should be approximately equal

**clock correction**: e.g. 32768 Hz clock is determined to be 100 ms fast and needs correcting

A **sudden correction** (e.g. subtract 100ms) would satisfy requirement 1 but violate requirement 3, so a **gradual correction is perferred**, e.g. count 32768 + 1 ticks at 1s. This would slow the clock by 1/(32768+1Hz) = 3.05E-5s, and the correction will take 0.1s/3.05E-5=3275.9s ≅ 55 min.

How often should we synchronize?

- Assume clock i is synchronized at t0: \|Ci(t0) - t0\| < 𝛿 (max synchronization error).
- After drifting: \|Ci(t0) - t0\| < 𝛿 + ρ(t-t0) (where t is when to synchronize next)
- We must ensure \|Ci(t)-t\| < Ɛ (absolute error bound)

Therefore, because 𝛿 + ρ(t-t0) <= Ɛ:

t-t0 <= (Ɛ-𝛿)/ρ

where t-t0 is the maximum synchronization interval.

#### Precision Time Protocol (PTP)

> IEEE standard 1588-2008

PTP technique uses hardware timestamping to achieve ns accuracy.
PTP uses a **master-slave hierachy**, the standard clock (time server) is called the "grandmaster", it broadcasts synchronization packets (UDP) to clocks on its network at up to 10 Hz.

Synchronization sequence:

![synchronization-sequence](https://i.imgur.com/v1mh3Tm.png)

The slave will know T1 (Master), T1' (Slave), T2 (Slave), T2' (Master).

- T1' = T1 + 𝛿 + l
- T2' = T2 - 𝛿 + l

where 𝛿 is slave synchronization error, and l is network latency.
We obtain a correction factor for the slave synchronization error:

𝛿 = (T1' - T1 + T2 - T2')/2

#### Distributed Clock Synchronization

There are n clocks in the system that use averaging to synchronize.
Faulty clocks or faulty communication can interfere with synchornization.

![distributed-sync-avg](https://i.imgur.com/wCgchmT.png)

Averaging doesn't always work.

**CNV** (**Convergence**) Algorithm: at time t all clocks report their time Cj.
Each clock Ck records the time from each clock as Cj if \|Cj-Ck\| < Ɛ and Ck otherwise.
Update each clock Ck=(1/n) Σ Cj.

Example:

![distributed-sync-cnv](https://i.imgur.com/xzwiThm.png)

### Byzantine Generals Problem

The failure of components in a distributed system is modelled as treacherous generals.
The commanding general **C** sends a command "attack" or "retreat" to the lieutenant general **L**.
The commander or lieutenants may be traitors.

![byzantine-generals](https://i.imgur.com/4cIaNLI.png)

The loyal lieutenants all need to agree on the same action.

The solution requires that the total number of participants n>= 3d + 1, where d is the number of disloyal participants.
There are d rounds of communication.
In the event of a tie the lieutenants take a default action e.g. retreat.

#### Maximum 1 Traitor

- Requires n >= 3+1 = 4 participants (1 commander, 3 lieutenants).
- Commander issues order V to all lieutenants.
- The lieutenants tell each other their order.
- Each lieutenant forms a vector of the received commands and acts on the majority value.

![one-traitor](https://i.imgur.com/00V33Bd.png)

L3 was faulty (the information it sends is unreliable) but L1 and L2 still arrive at the correct action.

#### Maximum 2 Traitors

- Requires n >= 3*2+1 = 7 participants.
- Command issues order V to all lieutenants.
- The lieutenants communicate their vectors to each other.
- Each column j represents the command received by Lj as reported by each lieutenant.
- The diagonal is removed.
- Lj replaces each Vij forall i with the command it received from the commander
- Column majorities are computed and the lieutenant acts on the majority of the column majorities.

![2-traitors](https://i.imgur.com/7Uz0YTE.png)

- Column Majorities: a,a,a,a,r,r
- V = majority{a,a,a,a,r,r} = a
- Each lieutenant builds its own table.

#### Byzantine Generals Problem Applications

A Byzantine fault is the arbitrary failure of a component, e.g. it may communicate different values to different components.
Redundant systems use multiple components (e.g. sensors, busses, processors) that must decide on an outcome - usually by majority voting.

The BGP solution guarantees that the majority of non-faulty components will produce the same outcome.
It requries pair-wise communication between all components.
It also requires n >= 3d+1 compoenents where d is the number of tolerated faulty components, and d communication rounds.
The complexity of BGP solution is O(n^(d+1)), Expansive!
Newer solutions are faster, based on state machine replication.

BGP is used in bitcoin to reach consensus on "proof-of-work".
It is also used in aerospace.

## Networks

### Internet Layers

The internet grew from the ARPAnet (Advanced Research Projects Agency) which connected research networks in industry and universities.

The internet has 4 layers:

- **Link Layer**: ethernet (802.3), wifi (802.11)
- **Internet Layer**: IPv4, IPv6
- **Transport Layer**: TCP, UDP
- **Application Layer**: HTTP, SMTP, SSH

![four-network-layers](https://i.imgur.com/ALzmmXW.png)

Each layer adds a header to the data being sent and strips the headers off data being received.
Some layers subdivide data into smaller packets to pass to lower layers and recombine packets received from lower layers.

For example, TCP/IP over ethernet:

![tcp-over-ethernet](https://i.imgur.com/oWu9dmV.png)

### Internet Protocol (IP)

IP routes datagrams hop-by-hop across networks.
Network nodes use use routing table to determine the next node (hop) to send the datagram to.

- The IP header includes a 32-bit IPv4 or 128-bit IPv6 address.
- DNS (domain name service) hosts translate domain names to IP addresses.

IP is unreliable: there can be datagram loss, duplication, reordering, corruption.

### Transmission Control Protocol (TCP)

TCP is an end-to-end protocol.

TCP creates a virtual circuit between hosts (e.g. like establishing a telephone connection), and uses ACK messages and sequence numbers to ensure _all data_ gets to the receiving host _in order_.

Data is treated as a continuous stream of bytes delivered in segments of at most 64 kiB (often 1460 B to fit in an ethernet frame).

The ends of the virtual circuit are called sockets which are specified by IP address and port number.

Ports 0-1023 are well-known (reserved):

| Port Number | Acronym | Protocol                         |
| ----------- | ------- | -------------------------------- |
| 20          | FTP     | File Transfer Protocol           |
| 22          | SSH     | Secure Shell                     |
| 80          | HTTP    | Hypertext Transfer Protocol      |
| 143         | IMAP    | Internet Message Access Protocol |
| 443         | HTTPS   | Secure HTTP                      |
| 587         | SMTP    | Simple Mail Transfer Protocol    |

TCP header looks like this:

![tcp-header](https://i.imgur.com/PMRlI46.png)

### User Datagram Protocol (UDP)

UDP is a _connectionless_ alternative to TCP.
It is faster but not reliable (small header, no acks, no sequences, etc.)

UDP header looks like this:

![udp-header](https://i.imgur.com/vQYZkOd.png)

### Socket Programming

Over TCP:

![tcp-socket](https://i.imgur.com/UyCvMV4.png)

Socket Server:

```c
#include <stdio.h>
#include <stdint.h>
#include <sys/socket.h>
#include <netinet/in.h>

int main(void) {
    /* open socket */
    int sockfd = socket(AF_INET6, SOCK_STREAM, 0); // streaming socket (e.g. TCP/IP)
    if(sockfd < 0) { printf("error opening socket"); return 0; }

    /* bind socket */
    struct sockaddr_in server_addr = { AF_INET6, htons(1101), 0 } ; // 1101 is port number (hex?)
    inet_pton("127.0.0.1", &server_addr.sin_addr);
    if(bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        printf("error binding to port\n"); return 0; }

    /* listen and accept connections */
    listen(sockfd, 1);
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    int new_sockfd = accept(sockfd, (struct sockaddr *)&client_addr,
            &client_len); // gets client connection
    if(new_sockfd < 0) { printf("error accepting connection"); return 0; }

    /* receive and send messages */
    uint8_t request[256];
    int n = read(new_sockfd, request, sizeof(request));
    if(n < 0) { printf("error reading message"); return 0; }
    printf("server received: %s\n", request);
    char response[] = "response";
    n = write(new_sockfd, response, sizeof(response));
    if(n < 0) { printf("error writing message"); return 0; }

    close(new_sockfd);
    close(sockfd);
}
```

Socket Client:

```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>

int main(void) {
    /* open socket */
    int sockfd = socket(AF_INET6, SOCK_STREAM, 0);
    if(sockfd < 0) { printf("error opening socket"); return 0; }

    /* request connection */
    struct hostent *he = gethostbyname("localhost");
    if(he == NULL) { printf("hostname not found"); return 0; }
    struct sockaddr_in server_addr = { AF_INET6, htons(1101), 0 };
    memcpy(&server_addr.sin_addr, he->h_addr_list[0], he->h_length);
    if(connect(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr))
            < 0)
    {  printf("error requesting connection\n"); return 0; }

    /* send and receive messages */
    char request[] = "request";
    int n = write(sockfd, request, sizeof(request));
    if(n < 0) { printf("error writing message"); return 0; }
    uint8_t response[256];
    n = read(sockfd, response, sizeof(response));
    if(n < 0) { printf("error reading message"); return 0; }
    printf("client received: %s\n", response);
}

```
