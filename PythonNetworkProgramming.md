---
---

# Python Network Programming

- [Python Network Programming](#python-network-programming)
  - [Socket API](#socket-api)
    - [Overview](#overview)
      - [Basic Operations](#basic-operations)
      - [Non-blocking Sockets](#non-blocking-sockets)
      - [TCP Operations](#tcp-operations)
      - [UDP Operations](#udp-operations)
    - [Introductory Demos](#introductory-demos)
      - [UDP Server](#udp-server)
      - [UDP Client](#udp-client)
      - [TCP Server](#tcp-server)
      - [TCP Client](#tcp-client)
  - [TCP Message Delivery](#tcp-message-delivery)
    - [One Message Per Connection](#one-message-per-connection)
    - [Reusing Connected Socket](#reusing-connected-socket)
      - [Fixed-Length Messages](#fixed-length-messages)
      - [Delimited Messages](#delimited-messages)
      - [Prefixed Messages](#prefixed-messages)
  - [TCP Multicasting](#tcp-multicasting)
    - [Single Thread Approach](#single-thread-approach)
      - [File Object](#file-object)
      - [DefaultSelector class](#defaultselector-class)
      - [SelectorKey class](#selectorkey-class)
      - [Bitwise Events Mask](#bitwise-events-mask)
      - [Multicasting Server](#multicasting-server)
      - [Multicasting Client](#multicasting-client)
    - [Thread Pool Approach](#thread-pool-approach)
      - [Executor Class](#executor-class)
      - [Future Class](#future-class)
      - [Multicasting With ThreadPoolExecutor](#multicasting-with-threadpoolexecutor)
  - [Additional Reading](#additional-reading)

## Socket API

### Overview

#### Basic Operations

- `socket.bind(address)`: Bind the socket to address. The socket must not already be bound. The format of address depends on the address family.
- `socket.shutdown(how)`: Strictly speaking, you’re supposed to use shutdown on a socket before you close it. The shutdown is an advisory to the socket at the other end. Depending on the argument you pass it, it can mean “I’m not going to send anymore, but I’ll still listen”, or “I’m not listening, good riddance!”. In most situations, an explicit shutdown is not needed.
- `socket.close()`: Mark the socket closed. Sockets are automatically closed when they are garbage-collected, but it is recommended to close() them explicitly, or to use a with statement around them.
- `socket.setblocking(flag): Set blocking or non-blocking mode of the socket: if flag is false, the socket is set to non-blocking, else to blocking mode.
  - `sock.setblocking(True)` is equivalent to `sock.settimeout(None)`.
  - `sock.setblocking(False)` is equivalent to `sock.settimeout(0.0)`
- `socket.settimeout(value)`: Set a timeout on blocking socket operations. If a non-zero value is given, subsequent socket operations will raise a `timeout` exception if the timeout period `value` has elapsed before the operation has completed.

#### Non-blocking Sockets

A socket object can be in one of three modes: blocking, non-blocking, or timeout.
Sockets are by default always created in blocking mode.

- In blocking mode, operations block until complete or the system returns an error (such as connection timed out).
- In non-blocking mode, operations fail if they cannot be completed immediately: functions from the select can be used to know when and whether a socket is available for reading or writing.
- In timeout mode, operations fail if they cannot be completed within the timeout specified for the socket (they raise a timeout exception) or if the system returns an error.

The `connect()` operation is also subject to the timeout setting, and in general it is recommended to call `settimeout()` before calling `connect()`.

If `getdefaulttimeout()` is not None, sockets returned by the `accept()` method inherit that timeout. Otherwise, the behaviour depends on settings of the listening socket:

- if the listening socket is in blocking mode or in timeout mode, the socket returned by `accept()` is in blocking mode.
- if the listening socket is in non-blocking mode, whether the socket returned by `accept()` is in blocking or non-blocking mode is operating system-dependent.

#### TCP Operations

- `socket.listen([backlog])`: Enable a server to accept connections. Backlog specifies the number of unaccepted connections that the system will allow before refusing new connections. If not specified, a default reasonable value is chosen.
- `socket.accept()`: Accept a connection. The socket must be bound to an address and listening for connections. The return value is a pair (conn, address) where conn is a new socket object usable to send and receive data on the connection, and address is the address bound to the socket on the other end of the connection.
- `socket.connect(address)`: Connect to a remote socket at address. The format of address depends on the address family.
- `socket.connect_ex(address)`: Same as `socket.connect(address)`, but return an error indicator instead of raising an exception for errors returned by the C-level connect() call (other problems, such as “host not found,” can still raise exceptions). The error indicator is 0 if the operation succeeded, otherwise the value of the errno variable.
- `socket.send(bytes)`: Send data to the socket. The socket must be **connected** to a remote socket. *Applications are responsible for checking that all data has been sent*; if only some of the data was transmitted, the application needs to attempt delivery of the remaining data.
- `socket.sendall()`: Like send(), except this method continues to send data from bytes until either all data has been sent or an error occurs.
- `socket.recv(bufsize)`: Receive data from the socket. The return value is a bytes object representing the data received. The maximum amount of data to be received at once is specified by bufsize.

#### UDP Operations

- `socket.sendto(bytes, address)`: Send data to the socket. The socket should **not** be **connected** to a remote socket, since the destination socket is specified by address. Return the number of bytes sent.
- `socket.recvfrom(bufsize)`: Receive data from the socket. The return value is a pair (bytes, address) where bytes is a bytes object representing the data received and address is the address of the socket sending the data.

### Introductory Demos

#### UDP Server

```python
sock = socket.socket(AF_INET, SOCK_DGRAM)
sock.bind((HOST_IP, HOST_PORT))

while True:
    data, addr = sock.recvfrom(1024)
    # process data ...
```

#### UDP Client

```python
sock = socket.socket(AF_INET, SOCK_DGRAM)
sock.sendto("TEST_MESSAGE", (TARGET_IP, TARGET_PORT))
```

#### TCP Server

```python
sock = socket.socket(AF_INET, SOCK_STREAM)
sock.bind((HOST_IP, HOST_PORT))
sock.listen() # server sock, always listening

while True:
    conn, addr = sock.accept # conn is the connected client sock
    # handle conn using conn.recv(BUFFER_SIZE)
```

#### TCP Client

```python
sock = socket.socket(AF_INET, SOCK_STREAM)
with sock:
    sock.connect((TARGET_IP, TARGET_PORT))
    sock.send("TEST_MESSAGE")
```

## TCP Message Delivery

The two fundamental functions for TCP communications are `send` and `recv`, which seems straight forward and easy. However, since both functions operate on network buffers, the bytes sent might not be received all at once. It is the server's responsibility to receive repeatedly until all bytes sent from a client message are handled.

When `recv` returns 0 bytes, the socket on other side has been shutdown, and the connection is closed. It is impossible to receive any more data on this connection, yet it is possible that you can still send data to the other side.

### One Message Per Connection

HTTP protocols use a socket for only one transfer, which makes sense. The client sends a request and then reads a reply. The socket is then discarded. This means during each transfer, the client only needs to send server **one** message, and get **one** response, and there won't be a second message from the client.

The client may call `send` multiple times to deliver all bytes of the message, and then does a `shutdown(1)`. The server may receive multiple times to get the complete message and only knows that the message is complete once 0 byte is received and the client shutdown its socket. The server then sends a reply. If the send completes successfully then, indeed, the client was still receiving.

### Reusing Connected Socket

If the end of message is not signaled by closing down a socket. It is clear that for the server to pick out the distinct messages from a stream of bytes, there are only so many ways:

- Using messages with fixed length
- Using some delimiters
- Indicate number of bytes for each message

#### Fixed-Length Messages

#### Delimited Messages

#### Prefixed Messages

## TCP Multicasting

### Single Thread Approach

`selectors` is a efficient high-level I/O multiplexing module, built upon the [`select`](https://docs.python.org/3/library/select.html#module-select) module primitives.

The type of file objects supported depends on the platform:
On Windows, sockets are supported, but not pipes, whereas on Unix, both are supported.

#### File Object

An object exposing a file-oriented API (with methods such as read() or write()) to an underlying resource. Depending on the way it was created, a file object can mediate access to a real on-disk file or to another type of storage or communication device (for example standard input/output, in-memory buffers, sockets, pipes, etc.). File objects are also called **file-like objects** or **streams**.

There are actually three categories of file objects: raw binary files, buffered binary files and text files. Their interfaces are defined in the io module. The canonical way to create a file object is by using the open() function.

#### DefaultSelector class

`DefaultSelector` is an alias to the most efficient implementation available on the current platform: this should be the default choice for most users.

- `register(fileobj, events, data=None)`: Register a file object for selection, monitoring it for I/O events. This returns a new `SelectorKey` instance, or raises a ValueError in case of invalid event mask or file descriptor, or KeyError if the file object is already registered.
  - `fileobj` is the file object to monitor. It may either be an integer file descriptor or an object with a `fileno()` method.
  - `events` is a bitwise mask of events to monitor.
  - `data` is an opaque object.
- `modify(fileobj, events, data=None)`: Change a registered file object’s monitored events or attached data. This is equivalent to `BaseSelector.unregister(fileobj)` followed by BaseSelector.register(fileobj, events, data), except that it is implemented more efficiently.
- `unregister(fileobj)`: Unregister a file object from selection, removing it from monitoring. A file object shall be unregistered prior to being closed. This returns the associated `SelectorKey` instance, or raises a KeyError if fileobj is not registered.
  - `fileobj` must be a file object previously registered.
- `select(timeout=None)`: Wait until some registered file objects become ready, or the timeout expires. This returns a list of `(key, events)` tuples, one for each ready file object. This method can return before any file object becomes ready or the timeout has elapsed if the current process receives a signal: in this case, an empty list will be returned.
  - `key` is the SelectorKey instance corresponding to a ready file object.
  - `events` is a bitmask of events ready on this file object.
- `close()`: Close the selector. This must be called to make sure that any underlying resource is freed. The selector shall not be used once it has been closed.

#### SelectorKey class

A `SelectorKey` is a namedtuple used to associate a file object to its underlying file descriptor, selected event mask and attached data.

- `fileobj`: File object registered.
- `fd`: Underlying file descriptor.
- `events`: Events that must be waited for on this file object.
- `data`: Optional opaque data associated to this file object.

#### Bitwise Events Mask

`events` is a bitwise mask indicating which I/O events should be waited for on a given file object:

- `selectors.EVENT_READ`: available for read
- `selectors.EVENT_WRITE`: available for write. **A healthy socket is always ready for writing.**

#### Multicasting Server

```python
def serve_forever():
    sel = selectors.DefaultSelector()
    lsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    lsock.bind((HOST_IP, HOST_PORT))
    lsock.listen()
    lsock.setblocking(False)
    sel.register(lsock, selectors.EVENT_READ)

    # event loop
    while True:
        event_tuples = sel.select(timeout=None)
        for key, mask in event_tuples:
            if key.fileobj is lsock: # the listening socket
                accept_conn(key.fileobj)
                # key.fileobj is the connected socket
            else: # the connected socket
                service_conn(key, mask)

def accept_conn(sock):
    """
    Accepts a connection and register the connected 
    socket for reading
    """
    conn, addr = sock.accept()  # Should be ready to read
    conn.setblocking(False)
    event_mask = selectors.EVENT_READ
    sel.register(conn, event_mask)

def service_conn(key, mask):
    if mask & selectors.EVENT_READ: # ready to receive
        sock = key.fileobj
        recv_data = sock.recv(1024)
        if recv_data:
            # do something with the received data
            # then send response
            pass
        else:
            sel.unregister(sock)
            sock.close()
```

#### Multicasting Client

```python
def start_conn(sel, target_addrs):
    """
    initialize the connections against multiple target addresses.
    sel is the selector object.
    target_addrs is a list of tuple (target_ip, target_port).
    """
    for target_addr in target_addrs:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.setblocking(False)
        sock.connect_ex(server_addr)
        event_mask = selectors.EVENT_WRITE
        sel.register(sock, event_mask)

def broadcast_message(sel, msg): # example 1
    """
    one-time broadcast.
    returns the number of targets broadcasted.
    """
    events = sel.select()
    for key, mask in events:
        sock = key.fileobj
        sock.sendall(msg)
        sel.modify(sock, selectors.EVENT_READ)
    return len(events)

def service_conn(sel, msg_queue): # example 2
    """
    continuously send message and receive response
    msg_queue is a thread safe queue whose pop method is blocking
    """
    while True:
        events = sel.select()
        for key, mask in events:
            sock = key.fileobj
            if mask & selectors.EVENT_READ:
                recv_data = sock.recv(1024)
                if recv_data: pass
                    # process received data
                    # may modify the socket to EVENT_WRITE_AGAIN
                else:
                    sel.unregister(sock)
            if mask & selectors.EVENT_WRITE:
                sock = key.fileobj
                sock.sendall(msg_queue.pop())
                sock.modify(sock, selectors.EVENT_READ)
```

### Thread Pool Approach

`concurrent.futures` module provides a high-level interface for asynchronously executing callables.

#### Executor Class

`concurrent.futures.Executor` is an abstract class that provides methods to execute calls asynchronously.

`concurrent.futures.ThreadPoolExecutor(max_workers=None, initializer=None, initargs=())` is an `Executor` subclass that uses a pool of at most `max_workers` threads to execute calls asynchronously. `initializer` is an optional callable that is called at the start of each worker thread; `initargs` is a tuple of arguments passed to the initializer. Should `initializer` raise an exception, all currently pending jobs will raise a BrokenThreadPool, as well as any attempt to submit more jobs to the pool. If `max_workers` is None or not given, it will default to the number of processors on the machine, multiplied by 5.

- `submit(func, *args, **kwargs)`: Schedules the callable, `func`, to be executed as `func(*args **kwargs)` and returns a Future object representing the execution of the callable.
- `shutdown(wait=True)`: Signal the executor that it should free any resources that it is using when the currently pending futures are done executing. Calls to Executor. `submit()` made after shutdown will raise RuntimeError. If wait is True then this method will not return until all the pending futures are done executing and the resources associated with the executor have been freed. If wait is False then this method will return immediately and the resources associated with the executor will be freed when all pending futures are done executing. Regardless of the value of wait, the entire Python program will not exit until all pending futures are done executing.

#### Future Class

`concurrent.futures.Future` class encapsulates the asynchronous execution of a callable.

- `cancel()`: Attempt to cancel the call. Returns true if successful.
- `cancelled()`: Return True if the call was successfully cancelled.
- `running()`: Return True if the call is currently being executed and cannot be cancelled.
- `done()`: Return True if the call was successfully cancelled or finished running.
- `result(timeout=None)`: Return the value returned by the call. TimeoutError may be raised. If the future is cancelled before completing then CancelledError will be raised. If the call raised, this method will raise the same exception.
- `exception(timeout=None)`: Return the exception raised by the call.
- `add_done_callback(func)`: Attaches the callable `func` to the future. fn will be called, with the future as its only argument, when the future is cancelled or finishes running. If the future has already completed or been cancelled, `func` will be called immediately.

#### Multicasting With ThreadPoolExecutor

```python

def handle_conn(conn, client_addr):
    with conn:
        while True:
            msg = conn.recv(1024)
            if not msg:
                break
            # do something with msg

def serve_forever(host_addr):
    pool = ThreadPoolExecutor(128)
    sock = socket(AF_INET, SOCK_STREAM)
    sock.bind(host_addr)
    sock.listen(5)
    while True:
        conn, client_addr = sock.accept()
        pool.submit(handle_conn, conn, client_addr)
```

## Additional Reading

- [Official Python `socket` Doc](https://docs.python.org/3/library/socket.html#socket-timeouts)
- [Official Python `selectors` Doc](https://docs.python.org/3/library/selectors.html)
- [Official Python `concurrent.future` Doc](https://docs.python.org/3/library/concurrent.futures.html)
- [Socket Programming HOWTO](https://docs.python.org/3/howto/sockets.html)
- [RealPython Socket Programming Guide](https://realpython.com/python-sockets)
- [Python Wiki UDP Communication](https://wiki.python.org/moin/UdpCommunication)
- [Python Wiki TCP Communication](https://wiki.python.org/moin/TcpCommunication)