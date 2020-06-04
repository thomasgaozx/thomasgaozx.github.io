# Cloud Architecture

This article studies Openstack, Kubernetes, etc.

- Openstack supports virtualized deployment, i.e. applications running in isolated VM. It provides kernel isolation and not just userspace isolation. It also has features like the ability to snapshot, etc.
- Kubernetes supports containerized deployment. It provides only userspace isolation.

## Openstack Neutron

"OpenStack Networking allows you to create and manage network objects, such as networks, subnets, and ports, which other OpenStack services can use. Plug-ins can be implemented to accommodate different networking equipment and software, providing flexibility to OpenStack architecture. [...] neutron provides an API that lets you define network connectivity and addressing in the cloud. The Networking service also provides an API to configure and manage a variety of network services ranging from L3 forwarding and Network Address Translation (NAT) to perimeter firewalls, and virtual private networks." - [Openstack Neutron](https://docs.openstack.org/neutron/latest/admin/intro-os-networking.html)

The components of Neutron includes:

- **API server**: support for Layer 2 networking and IP Address Management (IPAM), as well as an extension for a Layer 3 router construct that enables routing between Layer 2 networks and gateways to external networks. It also works with plugins.
- **Neutron plug-in and agents**: turn on/off ports, creates networks or subnets, and provides IP addressing. The chosen plug-in and agents differ depending on the vendor and technologies used in the particular cloud. Only one plug-in can be used at a time. A network agent is an agent that handles various tasks used to implement virtual networks. These agents include neutron-dhcp-agent, neutron-l3-agent, neutron-metering-agent, and neutron-lbaas-agent, among others. The agent is available when the alive status of the agent is "True"<sup>[\[ref\]](https://docs.openstack.org/python-openstackclient/pike/cli/command-objects/network-agent.html#:~:text=A%20network%20agent%20is%20an,Network%20v2)</sup>. Plugins include:
  - openvswitch plugin (provide a switching stack for hardware virtualization environments, while supporting multiple protocols and standards used in computer networks) - wikipedia
  - calico neutron plugin
  - ryu openflow controller plugin
- **Messaging queue**: Accepts and routes RPC requests between agents to complete API operations. Message queue is used in the ML2 plug-in for RPC between the neutron server and neutron agents that run on each hypervisor, in the ML2 mechanism drivers for Open vSwitch and Linux bridge.

![network-layout](https://docs.openstack.org/neutron/latest/_images/networklayout.png)

- **Management network**: requires a gateway to provide Internet access to all nodes for administrative purposes such as package installation, security updates, Domain Name System (DNS), and Network Time Protocol (NTP).
- **Provider Network**: requires a gateway to provide Internet access to instances in your OpenStack environment.

## Openstack over Kubernetes

"OpenStack has a reputation for complexity that can sometimes rival its power. Kubernetes cluster orchestration makes OpenStack much easier to deploy and manage.<sup>[\[ref\]](https://coreos.com/openstack/#:~:text=Kubernetes%20cluster%20orchestration%20makes%20OpenStack,Kubernetes%20and%20containers%20call%20home.)</sup>"

In other words, one can deploy VMs in containers, if the network architecture are primarily kubernetes cluster, but is built to support openstack. For example, you'll need a vswitch.

OpenStack control plane running with containers:

![ex-1](https://coreos.com/assets/images/svg/Stackanetes-ControlPlane.svg)

Stateful storage deployed on a subset of nodes:

![ex-2](https://coreos.com/assets/images/svg/Stackanetes-Storage.svg)

User VM runs in containers, scheduled to nodes:

![ex-3](https://coreos.com/assets/images/svg/Stackanetes-Storage.svg)