# Python Network Programming

- [Python Network Programming](#python-network-programming)
  - [Socket API](#socket-api)
    - [Overview](#overview)
      - [Basic Operations](#basic-operations)
      - [Non-blocking Sockets](#non-blocking-sockets)
      - [TCP Operations](#tcp-operations)
      - [UDP Operations](#udp-operations)
    - [UDP Server](#udp-server)
    - [UDP Client](#udp-client)
    - [TCP Server](#tcp-server)
    - [TCP Client](#tcp-client)
  - [Additional Reading](#additional-reading)

## Socket API

### Overview

#### Basic Operations

- `socket.bind(address)`: Bind the socket to address. The socket must not already be bound. The format of address depends on the address family.
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
- `socket.send(bytes)`: Send data to the socket. The socket must be **connected** to a remote socket. *Applications are responsible for checking that all data has been sent*; if only some of the data was transmitted, the application needs to attempt delivery of the remaining data.
- `socket.sendall()`: Like send(), except this method continues to send data from bytes until either all data has been sent or an error occurs.
- `socket.recv(bufsize)`: Receive data from the socket. The return value is a bytes object representing the data received. The maximum amount of data to be received at once is specified by bufsize.

#### UDP Operations

- `socket.sendto(bytes, address)`: Send data to the socket. The socket should **not** be **connected** to a remote socket, since the destination socket is specified by address. Return the number of bytes sent.
- `socket.recvfrom(bufsize)`: Receive data from the socket. The return value is a pair (bytes, address) where bytes is a bytes object representing the data received and address is the address of the socket sending the data.

### UDP Server

```python
sock = socket.socket(AF_INET, SOCK_DGRAM)
sock.bind((HOST_IP, HOST_PORT))

while True:
    data, addr = sock.recvfrom(1024)
    # process data ...
```

### UDP Client

```python
sock = socket.socket(AF_INET, SOCK_DGRAM)
sock.sendto("TEST_MESSAGE", (TARGET_IP, TARGET_PORT))
```

### TCP Server

```python
sock = socket.socket(AF_INET, SOCK_STREAM)
sock.bind((HOST_IP, HOST_PORT))
sock.listen() # server sock, always listening

while True:
    conn, addr = sock.accept # conn is the connected client sock
    # handle conn using conn.recv(BUFFER_SIZE)
```

### TCP Client

```python
sock = socket.socket(AF_INET, SOCK_STREAM)
with sock:
    sock.connect((TARGET_IP, TARGET_PORT))
    sock.send("TEST_MESSAGE")
```

## Additional Reading

- [Python Wiki UDP Communication](https://wiki.python.org/moin/UdpCommunication)
- [Python Wiki TCP Communication](https://wiki.python.org/moin/TcpCommunication)