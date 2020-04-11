# Networking

- [Networking](#networking)
  - [Basic Terminologies](#basic-terminologies)
    - [Interfaces, Address, Routes, Gateway](#interfaces-address-routes-gateway)
    - [Subnet, LAN, VLAN](#subnet-lan-vlan)
    - [Summary: Layers and Reachability](#summary-layers-and-reachability)
    - [Address Pool](#address-pool)
    - [Interface Port](#interface-port)
  - [Tools](#tools)
    - [Packet Capturing using `tcpdump`](#packet-capturing-using-tcpdump)
    - [Reverse DNS Lookup](#reverse-dns-lookup)
    - [Iperf3 and mininet](#iperf3-and-mininet)
  - [Layer 2 Networking](#layer-2-networking)
    - [CDP, LLDP](#cdp-lldp)
      - [Practical LLDP](#practical-lldp)
  - [Layer 3 Networking](#layer-3-networking)
    - [NAT and Proxy](#nat-and-proxy)
    - [DMZ, Bastion Host, Jump Server](#dmz-bastion-host-jump-server)
    - [**SSH Tunneling**](#ssh-tunneling)
      - [Local Forwarding](#local-forwarding)
      - [Specify SSH Jump Hosts](#specify-ssh-jump-hosts)
    - [TCP Window Size, Socket Buffer](#tcp-window-size-socket-buffer)
  - [Practical IP](#practical-ip)
    - [Add/Remove IP to Interface](#addremove-ip-to-interface)
    - [Set Up VLAN Interface](#set-up-vlan-interface)
    - [Setting Up A Router](#setting-up-a-router)
      - [Enable Forwarding](#enable-forwarding)
      - [Set Static Gateway IP](#set-static-gateway-ip)
      - [Set up IPtables](#set-up-iptables)
      - [Instruct Node to use Router](#instruct-node-to-use-router)

## Basic Terminologies

### Interfaces, Address, Routes, Gateway

Logical layer 2 **interfaces** are used by network devices to access other networks, it contains the following attributes:

- name
- interface type
- a list of physical ethernet ports associated with the interface.
  - A single port is most common. Multiple ports are included
  - Multiple ports are included only for ethernet AE, they are logically on a single data port.
- a list of provider networks reachable through the physical interface

Relationship with host, route, and address:

- A host has network **interfaces** (layer 2)
- **Addresses** (layer 3) are attributed to interfaces
- **Routes** are information stating that for a particular subnet, where do I go? See command below. Routes (layer 3) are attributed to interfaces.

For example, the command

```bash
ip route add 192.168.1.0/24 via 192.168.1.1 dev eno3
```

states that for the particular network `192.168.1.0` with prefix 24, we use interface `eno3` to go to gateway `192.168.1.1`
If the host device tries to send traffic to an address that is in the subnet defined in the route, it will use the gateway.

Finally, interface should have at least one address that's in the same subnet as the gateway.
Otherwise there is no way to reach the gateway.

**Orphaned Route**: no address in the interface is in the same subnet as the route gateway, which means the gateway is not reachable.

### Subnet, LAN, VLAN

A **subnet** (i.e. network) represents all of the devices within a **LAN**.

- Without VLAN, a single switch is responsible for 1 LAN.
- With VLAn, a single switch can separate multiple LANs.

Multiple switches can be interconnected and divide VLANs between all hosts.

A **VLAN Interface** is a virtual interface that is attached to the physical network port or bond that your VLAN is configured on.
Each time a VLAN is created on a switch, a new VLAN interface is created.

### Summary: Layers and Reachability

Same network segment (layer 1) -> can reach each other physically
Same subnet (layer 2) -> requires switch but not router
Different subnet (layer 3) -> requires router

### Address Pool

What is address pool? It's a list of addresses that can be allocated from.  Here's an exmaple https://docs.starlingx.io/deploy_install_guides/r3_release/bare_metal/ironic_install.html 

### Interface Port

From database schema we can see a port is attributed to a host/node

What is an underlying port of an interface? It's the port associated with an (ethernet) interface.
Listing the host interfaces will show the ports attribute.
A 'VF' type interface does not have a port listed in the database because it's a virtual interface ontop of an ethernet SR-IOV interface.
So to get an underlying port for a VF interface, you have to find the ethernet interface that is using the VF interface.
Then you can get its underlying port.

## Tools

### Packet Capturing using `tcpdump`

1. Find out which network interface is responsible for the ip address.
2. Run the `tcpdump` command on that particular interface.

```bash
tcpdump -i eth1 'port 80'
```

One can also save the captured packet as `lldp.pcap` and open it with WireShark:

```bash
tcpdump -en -i enp0s9 ether proto 0x88cc -w lldp.pcap # save captured lldp packet
```

### Reverse DNS Lookup

```bash
nslookup <ip-addr>
```

### Iperf3 and mininet

`iperf3` may be used for performance comparison. Iperf3 can be run on two host machines, or a single machine With mininet installed:

```bash
sudo mn --topo single,2
xterm h1 h2
```

On h1, which we treat as server:

```bash
iperf3 -s $HOST_IP -J -i 60
```

On h2, which we treat as client:

```bash
iperf3 -c $SERVER_IP -V -N -i 30 -t 10 -f m -w 512M -Z -P 8 -M $MSS # tcp
iperf3 -c $SERVER_IP -i 30 -t 10 -f m -b 0 -u #udp
```

For TCP $MSS, use any value between mssMin and mssMax (inclusive) below:

```go
mssMin               = 96
mssMax               = 1460
mssStepSize          = 64
```

If the tcp test complains about socket buffer size error, check the output of:

```bash
sysctl net.ipv4.tcp_rmem
```

This will show the min, default, max of the receiver socket buffer size.
If the max is less than `512M`, the `-w 512M` asks the iperf3 test app to create sockets with buffer size greater than what the system allows.

As a result, you must run the following to reset the min, default, max size of the receiver and sender socket buffer size, make sure only the max size is changed to `512M`, i.e. `536870912`:

```bash
sysctl -w net.ipv4.tcp_rmem="10240 87380 536870912" # receiver socket
sysctl -w net.ipv4.tcp_wmem="10240 87380 536870912" # sender socket
```

## Layer 2 Networking

### CDP, LLDP

**Link Layer Discovery Protocol** (**LLDP**) is a link-layer neighbour discovery protocol.
LLDP allows network devices to learn about each other.

If a network is running Cisco network devices only, it uses Cisco Discovery Protocol (CDP).
LLDP is a protocol that can be used to support non-Cisco devices.
For every Cisco-proprietary protocol or service, there is an industry standard, equivalent service that can be run on non-Cisco devices.

![lldp-diagram](https://www.orbit-computer-solutions.com/wp-content/uploads/2016/07/lldp-med.png)

LLDP is used by network devices for advertising:

- Identity
- Capabilities: (B)Bridge/switch, (R)Router, (A)Access Point, (P) Phone, (S)station, (r)Repeater, etc.
- Neighbour devices

LLDP information is sent by devices from each of their interfaces at a fixed interval, in the form of an Ethernet frame.
These frames can be viewered via packet capturing tools, e.g. wireshark.
Each frame contains one **LLDP Data Unit** (**LLDPDU**).
Each LLDPDU is a sequence of **type-length-value structures** (**TLV**).

Basic TLVs include:

- system name
- system description
- system capabilities
- management address
- VLAN name

Each LLDP-enabled device sends LLDP data units to its directly-connected neighbor; each neighbor stores this information in a database.

![llpd-capabilities](https://i.imgur.com/W3Q6nBd.png)

Summary:

|                         | CDP                          | LLDP                                                                  |
| ----------------------- | ---------------------------- | --------------------------------------------------------------------- |
| Global Config           | `cdp run`/`no cdp run`       | `lldp run`/`no lldp run`                                              |
| Interface-Level Command | `cdp enable`/`no cdp enable` | `lldp receive`/`no lldp receive`, `lldp transmit`, `no lldp transmit` |

References:

- [lldp explained](https://www.orbit-computer-solutions.com/link-layer-discovery-protocol-lldp/)
- [Youtube 1](https://youtu.be/FMxou9zpVI8)
- [Youtube 2](https://youtu.be/oxMBI0muCHY)

#### Practical LLDP

Install lldpd (or lldpad), to see the neighbor information, do

Start lldpd:

```bash
/etc/init.d/lldpd restart
```

Show neighbors:

```bash
lldpcli show neighbors
lldpcli show neighbors details -f json
```

References:

1. https://community.mellanox.com/s/article/howto-enable-lldp-on-linux-servers-for-link-discovery
2. http://manpages.ubuntu.com/manpages/bionic/man8/lldpcli.8.html

## Layer 3 Networking

### NAT and Proxy

NAT can be either:

1. Router: port forwarding, home devices
2. Firewall: internal server

NAT requires the traffic to run through a router/firewall. No client-side configuration.

---

**Forward Proxies** are used by the client, e.g. to bypass firewall restrictions. Note that the real client ip may not be completely hidden.

- Before NAT is integrated into network routers, devices use forward proxy to access the internet.
- Forward proxy can act as **cache server** in an internal network: if a resource is downloaded many times, the proxy cache the content so if another device request the same content, the proxy will send along the cached one.
- Many different types: web proxy (Glype, PHP-Proxy), SOCKS proxy (Shadowsocks), etc. Note that web proxy doesn't have any characteristics of SOCKS proxy and VPN, just normal HTTPS traffic, therefore it is least suspicious (and slowest).
- Avoid free proxies, as they may be built by hackers to monitor all your activities.

**Reverse Proxies** are used by the server admins to balance load (high availability). The admin puts many backend servers behind a reverse proxy, hiding the unit ip of those servers.

- Nginx can act as web server and reverse proxy at the same time. HAProxy is another open source reverse proxy software.

**Transparent Proxies** end nodes are usually unaware of their existence. These can be set up by employers who want to monitor users' network activities.

**VPN Server**  also reroutes network traffic like proxy. The difference being proxy works on application layer, whereas VPN server works on the operating system level. It reroutes all network traffic (regardless whether it's coming from browser or daemon app). VPN also encrypts by mandate.

References:

- https://www.linuxbabe.com/it-knowledge/differences-between-forward-proxy-and-reverse-proxy

Fun read:

- [Set up shadowsocks proxy server](https://www.linuxbabe.com/ubuntu/shadowsocks-libev-proxy-server-ubuntu-16-04-17-10)
- [Set up web proxy](https://www.linuxbabe.com/ubuntu/create-your-own-web-proxy-ubuntu-16-04-glype-php-proxy)

### DMZ, Bastion Host, Jump Server

**Demilitarized Zone (DMZ)**, aka **perimeter network**, is an isolated subnet positioned between corporation internal network (LAN) and the dangerous Internet, not belonging to either party bordering it. It is neither as secure as internal network, nor as insecure as the Internet.

- Hosts outside the LAN are most vunerable to attack, and are often placed into the DMZ. Those include DNS, WWW, SMTP.
- Typical DMZ Architecture includes
  - Single Firewall: a single firewall managing the traffic between LAN (Intranet), DMZ, and WAN (Router)
  - Dual Firewall: one firewall allows WAN traffic into DMZ, another internal network only allow LAN traffic into DMZ. 

**Screening Router** filters packets and acts as a **firewall**.

**Screened Subnet** refers to the use of one or screening routers as firewall to define 3 separate subnets:

- an external router that separates external network from perimeter network (DMZ)
- an internal router that separates perimeter network from internal network.

**Bastion Hosts** are special nodes specifically configured to withstand attacks; they are either outside a firewall or in a DMZ.

- They're **hardened**: generally hosting a single application, e.g. a proxy server, with all other services removed.
- Examples of bastion host include: DNS server, Email server, FTP server, Proxy server, VPN server, Web server.

A **jump server** is a bastion host meant to access devices in a separate security zone. It is usually a hardened Linux box as an SSH server.

References:

- https://en.wikipedia.org/wiki/DMZ_(computing)
- https://en.wikipedia.org/wiki/Bastion_host

### **SSH Tunneling**

On the SSH target server set up a jump server:

```bash
sudo vim /etc/ssh/sshd_config
# AllowTcpForwarding yes
sudo systemctl restart sshd
```

#### Local Forwarding

```bash
ssh -L local_port:target_ip:target_port jump_ip
```

It's more secure to specify a local address to bind to such that other machines cannot connect to the specified port on the SSH client machine.

```bash
# Specify an local address to bind to
ssh -L 127.0.0.1:80:intra.example.com:80 gw.example.com
ssh -6 -N -L 6443:v6-150-11.yow.lab.wrs.com:6443 sysadmin@v6-150-11.yow.lab.wrs.com # suprress shell + ipv6
```

The `-f` option tells ssh command to run in the background and `-N` not to execute a remote command.

References:

- [Official SSH Tunneling](https://www.ssh.com/ssh/tunneling)
- [Official SSH Tunneling Example](https://www.ssh.com/ssh/tunneling/example)
- [VSCode debugging over ssh](https://code.visualstudio.com/docs/python/debugging#_debugging-over-ssh)
- [Linuxize Blog: How to set up ssh tunneling](https://linuxize.com/post/how-to-setup-ssh-tunneling/)

#### Specify SSH Jump Hosts

In case you were not aware of this capability I figured I would pass this information along.

To configure a “jump host” to reach the IPv6 only labs from your desktop, you can configure it for all of our labs with the following local ssh client configuration (~/.ssh/config).  Just add the following configuration and you can access the labs using the IPv6 DNS host name, which is based on the IPv4 address assigned.  The IPv6 host name includes the last two values of the IPv4 address of the lab.

```conf
# ~/.ssh/config
Host *.tgao.com
    ProxyJump ipv6proxy.tgao.com
```

Multiple Jump host:

```bash
ssh -J tgao@yow-cgts1-lx,tgao@yow-tuxlab2 sysadmin@v6-150-11.yow.lab.wrs.com
```

If you want SSH to go into the background, you can do so with the -f flag.

If you’ve tried the above examples, you may have noticed that running the command also opens up a shell. If you don’t need the shell, you can disable it with the -N switch:

### TCP Window Size, Socket Buffer

**RWIN** (**TCP Receive Window**) is the amount of data that a computer can accept without acknowledging the sender.
If the sender has not received acknowledgement for the first packet it sent, it will stop and wait and if this wait exceeds a certain limit, it may even retransmit

- **tcp_rmem**: receive buffer size
- **tcp_wmem**: send buffer size
- **window size** is the same as **socket buffer size**
- **packet size** is the same as **block size**

a socket's buffer can be of any size but cannot go beyond system min/max set by `tcp_rmem` and `tcp_wmem`

## Practical IP

### Add/Remove IP to Interface

```bash
sudo ip address add 10.0.0.1/24 dev eth0
sudo ip address del 10.0.0.1/24 dev eth0
```

### Set Up VLAN Interface

```bash
sudo apt-get install vlan
sudo modprobe 8021q
sudo vconfig add enp0s3 10
sudo ip addr add 10.0.0.4/24 dev enp0s3.10
sudo ip link set up enp0s3.10 # enable interface
```

To delete the vlan interface:

```bash
# cleanly shutdown the setting before removing link
sudo ip link set dev eth0.100 down

# Removing a VLAN interface
ip link delete eth0.100
```

Reference:

1. https://wiki.ubuntu.com/vlan
2. https://wiki.archlinux.org/index.php/VLAN

### Setting Up A Router

Ensure there are two interfaces, one connected to the external network, e.g. NAT, and the other to the internal network, e.g. host-only.

#### Enable Forwarding

```bash
sudo vim /etc/sysctl.conf
# Edit sysctl.conf and uncomment the following line:
# net.ipv4.ip_forward=1

sudo sysctl -p # activate the change
```

#### Set Static Gateway IP

Set a static ip address as the gateway IP address to interface connected to the host only network:

```bash
# Assuming that enp0s8 is connected to the OAM host only network:
cat > /etc/netplan/99_config.yaml << EOF
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s8:
      addresses:
        - 10.10.10.1/24
EOF
sudo netplan apply
```

> In case you encounter permission denied in latest Ubuntu dist. Simply touch 99_config.yaml and vim the content in.

#### Set up IPtables

Set up iptables to forward packets from the host only network to the NAT network:

```bash
# This assumes the NAT is on enp0s3 and the host only network is on enp0s8
sudo iptables -t nat -A POSTROUTING --out-interface enp0s3 -j MASQUERADE
sudo iptables -A FORWARD --in-interface enp0s8 -j ACCEPT
sudo apt-get install iptables-persistent
```

#### Instruct Node to use Router

On a node that wants to use the router, assuming enp0s3 interface is connected to the router:

```bash
sudo ip link set up dev enp0s3 # enable interface
sudo ip route add default via 10.10.10.1 dev enp0s3 # route via gateway ip
```
