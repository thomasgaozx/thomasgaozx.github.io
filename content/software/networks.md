# Networks

## Internet Layers

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

## Internet Protocol (IP)

IP routes datagrams hop-by-hop across networks.
Network nodes use use routing table to determine the next node (hop) to send the datagram to.

- The IP header includes a 32-bit IPv4 or 128-bit IPv6 address.
- DNS (domain name service) hosts translate domain names to IP addresses.

IP is unreliable: there can be datagram loss, duplication, reordering, corruption.

## Transmission Control Protocol (TCP)

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

## User Datagram Protocol (UDP)

UDP is a _connectionless_ alternative to TCP.
It is faster but not reliable (small header, no acks, no sequences, etc.)

UDP header looks like this:

![udp-header](https://i.imgur.com/vQYZkOd.png)

## Socket Programming

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
