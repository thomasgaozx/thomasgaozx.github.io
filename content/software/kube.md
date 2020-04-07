# Kubernetes

**Kubernetes Control Plane** consists of:

- **Kubernetes Master**, a collection of 3 processes on a single **master node**:
  - **kube-apiserver**
  - **kube-controller-manager**: a daemon core control loops that watches the shared state of the cluster through the apiserver and makes changes attempting to move the current state towards the desired state.
  - **kube-scheduler**: impacts availability, schedule applications ...
- Each individual non-master node in the cluser has 2 processes:
  - **kubelet**: communicates with the Kubernetes Master
  - **kube-proxy**: a network proxy that reflects Kubernetes networking services on each node.

![pleg](https://github.com/kubernetes/community/raw/master/contributors/design-proposals/node/pleg.png)

## Kubernetes Objects

### Pods

A **Pod** encapsulates

- a single container, or, a small number of containers that are tightly coupled and that share resources.
- a set of shared storage **Volumes**. This abstraction solves 2 problems:
  - On-disk files in a Container are ephemeral; when a Container crashes, kubelet will restart it, but the files will be lost; the Container starts with a clean state.
  - The necessity to share files between two Containers in the same Pod.
- unique IP address: containers inside a Pod can communicate with each other using localhost, and all containers inside the Pod share the same network namespace, i.e. IP address and port.

A **container runtime** is software that executes containers and manages container images on a node. Pods support Docker and other container runtimes.

In the rare cases that a Pod runs multiple containers that needs to work together, an example:
you might have a container that acts as a web server for files in a shared volume, and a separate “sidecar” container that updates those files from a remote source.

![multi-container](https://d33wubrfki0l68.cloudfront.net/aecab1f649bc640ebef1f05581bfcc91a48038c4/728d6/images/docs/pod.svg)

### Service

A **Service** is an abstract way to expose an application running on a set of Pods as a network service.

- Service usually use **selector** to target the set of Pods.
- Service is a REST object, you can POST a Service definition to the API server to create a new instance

Example:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: MyApp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 9376
```

Assume you have a set of Pods that listen on TCP port 9376. This specification creates a new Service object that:

- Kubernetes assigns this Service an IP address, aka **cluster IP**, listening on Port 80, which is used by the Service proxies.
- Targets TCP port 9376 on any Pod with the app=MyApp label.
- Requests made to port 80 of the cluster IP is forwarded to the target port of selected Pods.
- The controller for the Service selector continuously scans for Pods that match its selector, and then POSTs any updates to an Endpoint object also named "my-service".

User space proxy mode:

![kube-proxy-user-space](https://d33wubrfki0l68.cloudfront.net/e351b830334b8622a700a8da6568cb081c464a9b/13020/images/docs/services-userspace-overview.svg)

iptables proxy mode:

![kube-proxy-iptables](https://d33wubrfki0l68.cloudfront.net/27b2978647a8d7bdc2a96b213f0c0d3242ef9ce0/e8c9b/images/docs/services-iptables-overview.svg)

Multi-Port Services:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: MyApp
  ports:
    - name: http
      protocol: TCP
      port: 80
      targetPort: 9376
    - name: https
      protocol: TCP
      port: 443
      targetPort: 9377
```

You can specify your own cluster IP address as part of a Service creation request. To do this, set the .spec.clusterIP field.

Types of Services:

- `ClusterIP`: expose the Service on cluster-internal IP. Only reachable from within the cluster.
- `NodePort`: expose the Service on each Node's IP at a static port. You can contact the NodePort Service from outside the cluster by requesting `<NodeIP>:<NodePort>`
- `LoadBalancer`: expose the Service externally using a cloud providers load balancer.
- `ExternalName`: maps the Service to the contents of the `externalName` field (hostname). No proxy of any kind is set up.

`ExternalName` example:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  namespace: prod
spec:
  type: ExternalName
  externalName: my.database.example.com
```

### Namespaces

Kubernetes supports multiple virtual clusters backed by the same physical cluster.
These virtual clusters are called **namespaces**.
Namespaces can not be nested inside one another and each Kubernetes resource can only be in one namespace.

