# Real Time Operating System

- [Real Time Operating System](#real-time-operating-system)
  - [Introduction](#introduction)
    - [Typical Structure of Computer](#typical-structure-of-computer)
    - [Memory Technology](#memory-technology)
    - [Dynamic Memory Allocation](#dynamic-memory-allocation)
    - [Sized Integer Types](#sized-integer-types)
    - [Miscellaneous](#miscellaneous)
    - [Program Memory Layout](#program-memory-layout)
    - [Tool Chain](#tool-chain)
    - [Typical Microcontroller Startup Code](#typical-microcontroller-startup-code)
  - [C Safety Critical Code](#c-safety-critical-code)
  - [C Macro](#c-macro)
  - [I/O](#io)
    - [Memory-Mapping I/O](#memory-mapping-io)
      - [Universal Asynchronous Receiver-Transmitter](#universal-asynchronous-receiver-transmitter)
      - [__I, __O, and __IO Macro](#i-o-and-io-macro)
    - [Polling I/O](#polling-io)
    - [Interrupts](#interrupts)
      - [Exception Handling Mechanism](#exception-handling-mechanism)
      - [Multiple Interrupts](#multiple-interrupts)
  - [Scheduling](#scheduling)
    - [Bare Metal](#bare-metal)
    - [Foreground/Background Model](#foregroundbackground-model)
  - [RTOS](#rtos)
  - [Concurrent Execution](#concurrent-execution)

## Introduction

### Typical Structure of Computer

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

---

Blah blah blha

---

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

## C Safety Critical Code

1. Ensure all dynamic memory allocations occur at the very beginning, because `malloc` can fail (running out of memory).
2. ~2 Assertions per function, refer to `<assert.h>`
3. Always check function input and return value.
4. Don't use function pointer.
5. Always use 1-level dereferencing, i.e. don't do `a->b->c->d`

## C Macro

In C macro, `#` means stringify the macro function input.

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

#### __I, __O, and __IO Macro

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

![interrupt](https://i.imgur.com/7IKUMqp.png)

- **IRQ** Interrupt ReQuest

3 exception types:

1. **Interrupt**: request for service from a peripheral device
2. **Fault**: indicates a problem executing an instruction, e.g. divide by zero, invalid opecode, invalid memory address.
3. **Trap**: special instruction that requests OS services (e.g. the SVC - service call instruction in ARM assembly)

in all cases an exception causes a change in control flow, similar to a subroutine call, except that the hardware invokes the subroutine, not the software.

Application Code --> IRQ received --> suspended --> interrupt service routine --> resume execution

The application code is unaware that it was interrupted. In general exceptions cause "exception handlers" to execute. ISR is the common name for Interrupt exception handler. ARM calls ISRs "IRQHandler"

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

Watchdog timers are used in autonomous systems.
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

#### Multiple Interrupts

-  Each exception (IRQ) is assigned a priority
-  IRQs of higher priority can interrupt ISRs of lower priority requests ("nested interrupts")
  
Note that if low priority IRQs occur, processor will mask them and will process according to priority.

ISR Rules of THumb:

1. Keep it short
2. Use global variables to pass data to/from the application
3. If an ISR calls a function it should be re-entrant (a computer program or subroutine is called reentrant if multiple invocations can safely run concurrently); cannot use static variables

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

```
void ISR(void) {
    __disable__irg(); {
        countup();
    }__enable__irg();
}
```

Use the scope operator '{}' sparingly causes the program to become very inefficient and breaks scheduling.
Brackets are used in the example to highlight scope of disable IRQ.

- `__disable__irg()` and `__enable__irg()` are part of the Cortex Microcontroller Software Interface Standard (CMSIS).
- `printf()` and `malloc()` are _not_ re-entrant but as of C11 standard, they are multi-threading safe (MT-safe), by adding locks.

## Scheduling

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

## RTOS

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

## Concurrent Execution

Definition: task executions are interleaved on one or more processors with indeterminate ordering. E.g. 1 processor, 3 tasks of equal priority means round-robin scheduling, context switch changes the running thread (task).

A real-time application consists of a set of concurrent tasks (taskset), all tasks share the text segment, the data segment, and the heap.

RTOS memory map:

```json
[
    "text segment",
    "data segment",
    "heap",
    { "TCBs" : "task control blocks" },
    "stack"
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


