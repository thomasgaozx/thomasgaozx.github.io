# Kubernetes

- [Kubernetes](#kubernetes)
  - [Kubernetes Objects](#kubernetes-objects)
    - [Pods](#pods)
    - [Service](#service)
    - [Namespaces](#namespaces)
    - [Container Layers](#container-layers)
  - [Practical Kubernetes](#practical-kubernetes)
    - [Setting up Kubernetes Client](#setting-up-kubernetes-client)
      - [Install GO](#install-go)
      - [Install kubectl](#install-kubectl)
      - [Update Cluster CertSans to include Client IP](#update-cluster-certsans-to-include-client-ip)
    - [Access Docker Registry](#access-docker-registry)
    - [Case Study: kubernetes/perf-test](#case-study-kubernetesperf-test)
      - [Executing Benchmark](#executing-benchmark)
      - [Verify Benchmark Execution](#verify-benchmark-execution)
      - [General Development Workflow](#general-development-workflow)
      - [Contribute to Kubernetes Repo](#contribute-to-kubernetes-repo)

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

### Container Layers

- [Digging into Docker layers](https://medium.com/@jessgreb01/digging-into-docker-layers-c22f948ed612)
- [Use multi-stage builds](https://docs.docker.com/develop/develop-images/multistage-build/)

## Practical Kubernetes

### Setting up Kubernetes Client

Please, do yourself a favor and use 64 bit linux machine as client for minimal headache.

#### Install GO

```bash
wget https://dl.google.com/go/go1.12.13.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.12.13.linux-amd64.tar.gz
```

If using 32-bit machine, the package is here: `wget https://dl.google.com/go/go1.14.linux-386.tar.gz`

Add GO paths:

```bash
# add the following lines in .profile or .bashrc
export PATH=$PATH:/usr/local/go/bin
export GOROOT=/usr/local/go/
export GOPATH=$HOME/go
```

For example, if you installed go at /usr/local/go , you would export GOROOT=/usr/local/go. Then your GOPATH needs to point at the root of where you have your go code, e.g. `~/go`.

#### Install kubectl

```bash
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
```

i386:

```bash
curl -LO https://storage.googleapis.com/kubernetes-release/release/`curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt`/bin/linux/386/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
```

#### Update Cluster CertSans to include Client IP

This section is performed on the kubernetes cluster.
On the starlingX cluster, Kubernetes CLI/GO-client uses certificates to authenticate and communicate with Kubernetes API server on the same/different machine.

```bash
kubectl -n kube-system get configmap kubeadm-config -o jsonpath='{.data.ClusterConfiguration}' > kubeadm.yaml
vi kubeadm.yaml # add kubectl client IP to certSANs
mv /etc/kubernetes/pki/apiserver.{crt,key} ~
```

In the case that the client accesses the cluster via proxies, use the ip address of the immediate proxy before the cluster.

Then, generate new certificate and key for API server:

```bash
sudo kubeadm init phase certs apiserver --config kubeadm.yaml
```

Kill apiserver to restart it automatically:

If using containerd as container runtime:

```bash
crictl pods | grep kube-apiserver | cut -d' ' -f1 # get pod id of api server
crictl stopp <pod-id> # stop pod
crictl rmp <pod-id> # remove pod (will trigger restart automatically)
```

If using docker as container runtime:

```bash
docker ps | grep kube-apiserver | grep -v pause
docker kill <containerID>
```

Finally, move `/etc/kubernetes/admin.conf` from the cluster to the client machine as `${HOME}/.kube/config`, for example, and change the `clusters>cluster>server` option in the config to point to the cluster ip.

Now, the client machine should be properly authenticated to access the cluster, and one could use kubectl to access/modify the cluster directly, provided `~/.kube/config` is specified as `kubeConfig`. For example:

```bash
go run ./launch.go  --kubeConfig="${HOME}/.kube/config" --iterations 1 --image <some remote image>
```

`launch.go` is executed on the client, the code stored in the image is executed on the cluster.

Reference:

- [Adding a Name to the Kubernetes API Server Certificate](https://blog.scottlowe.org/2019/07/30/adding-a-name-to-kubernetes-api-server-certificate/)

### Access Docker Registry

To push a built image to a docker registry, one first needs access.

1. [Install docker](https://docs.docker.com/engine/install/ubuntu/)
2. Obtain a cert (file extension `.pem` or `.crt`), move the cert to `/usr/local/share/ca-certificates` and rename the file extension to `.crt` if not already
3. Run `sudo update-ca-certificates`
4. Make sure it says one certificate added.
5. Test `curl -v -X GET <registry remote location>`
6. Restart docker services: `systemctl restart docker`

This will allow you to tag and push docker images.

### Case Study: kubernetes/perf-test

#### Executing Benchmark

Set Up kubernetes/perf-test repo:

```bash
cd ~/go/src/kubernetes
git clone https://github.com/kubernetes/perf-tests.git
cd perf-tests
git checkout master && git pull
cd network/benchmarks/netperf/
```

Assume all of the appropriate set up have been done following the [Setting up Kubernetes Client](#setting-up-kubernetes-client). Simply run:

```bash
go run ./launch.go  --kubeConfig="${HOME}/.kube/config" --iterations 1 --image <remote image location>
```

where `<remote image location>` is the image built from `perf-tests/network/benchmarks/netperf/` that is  stored on the remote docker registry.

#### Verify Benchmark Execution

launch.go executes on the client machine, where as nptest.go executes in the pods of the cluster, under namespace netperf.
To verify the code is running properly on the cluster:

```bash
dev@ubuntu:~$ kubectl get pods --namespace=netperf
NAME                 READY   STATUS    RESTARTS   AGE
netperf-orch-bg8st   1/1     Running   0          8m10s
netperf-w1-th8kp     1/1     Running   0          8m7s
netperf-w2-klnc6     1/1     Running   0          8m4s
netperf-w3-dp6sb     1/1     Running   0          8m1s

dev@ubuntu:~$ kubectl logs netperf-orch-bg8st  --namespace=netperf
dev@ubuntu:~$ kubectl logs netperf-w1-th8kp --namespace=netperf
```

#### General Development Workflow

General workflow after making edits to launch.go or nptest.go:

```bash
cd $GOPATH/src/kubernetes/perf-tests/network/benchmarks/netperf/
sudo make docker

export IMAGE=k8s-netperf
export TAG=dev
sudo docker tag girishkalele/netperf-latest:latest <dca-ip>:9001/$USER/$IMAGE:$TAG
sudo docker push <dca-ip>:9001/$USER/$IMAGE:$TAG
```

Also remember in your 'go run' command, to specify your custom built image <dca-ip>:9001/$USER/$IMAGE:$TAG:

```bash
go run ./launch.go  --kubeConfig="${HOME}/.kube/config" --iterations 1 --image <registry ip>:9001/$USER/$IMAGE:$TAG
```

#### Contribute to Kubernetes Repo

1. Fork the repo
2. Clone the forked repo to local and cd into repo
3. Add and rebase upstream master

```bash
git remote add upstream https://github.com/kubernetes/perf-tests.git
git remote set-url --push upstream no_push
git checkout master
git fetch upstream
git rebase upstream/master
```

There are many heavily-coupled official guides on how to contribute to kubernetes repo, I find this [one guide](https://github.com/kubernetes/community/blob/master/contributors/guide/pull-requests.md) most useful.
