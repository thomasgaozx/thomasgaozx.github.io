# Data Structures and Algorithms

- [Data Structures and Algorithms](#data-structures-and-algorithms)
  - [Segment Tree](#segment-tree)
  - [Binary Indexed Tree*](#binary-indexed-tree)
    - [BIT Implementation](#bit-implementation)
  - [Heuristic Algorithm](#heuristic-algorithm)
    - [Dijkstra's Algorithm](#dijkstras-algorithm)
  - [Topological Sort](#topological-sort)
    - [Kahn's Algorithm](#kahns-algorithm)
    - [DFS Based Algorithm](#dfs-based-algorithm)
    - [Graph Cycle Checking](#graph-cycle-checking)
  - [Backtracking](#backtracking)
    - [Minimax](#minimax)
    - [Permutation](#permutation)
    - [Combinatorics](#combinatorics)
  - [Load Balancer Algorithms](#load-balancer-algorithms)
  - [Additional Resources](#additional-resources)

## Segment Tree

![Segment](https://www.geeksforgeeks.org/wp-content/uploads/segment-tree1.png)

## Binary Indexed Tree*

Binary indexed tree, aka Fenwick tree, is able to maintain a prefix sum with $\log n$ update and query time.

- `x&(-x)` gives the last set bit. Note that `-x` uses 2's complement.
- The reason binary indexed tree works is: partial sums will not overlap between different values. Figure it out yourself.

### BIT Implementation

```python
class FenwickTree:
    def __init__(self, n):
        """tailored for num array of size n"""
        self.sums = [0] * (n + 1)

    def update(self, i, delta):
        """updates ith index in BIT with delta"""
        i += 1
        while i < len(self.sums):
            self.sums[i] += delta
            i += i&(-i) # add lsb

    def query(self, i):
        """retrieve sum from index 0 to i"""
        i += 1
        s = 0 # sum
        while i > 0:
            s += self.sums[i]
            i -= i&(-i) # remove lsb
        return s
```

## Heuristic Algorithm

### Dijkstra's Algorithm

Implementation using priority queue, features includes:

- able to track parents and trace the whole path.
- able to track distance for each vertex.
- pointers are not used for clarity of demonstration.
- garbage check included (although not necessary) for efficiency.

```c++
using DistInfo = pair<Vertex, int>;

class DInfoGreaterThan {
public:
    bool operator()(const DistInfo & lhs, const DistInfo & rhs) {
        return lhs.second > rhs.second;
    }
}

struct VInfo {
    bool locked; // permanently locked
    int dist;
    Vertex parent;

    VInfo() : locked{false}, dist{-1}, parent{nullptr} {}
}

// Graph: { Vertex:{ Edge:EdgeWeight } }
using Graph = unordered_map<Vertex, unordered_map<Vertex, int>>;

unordered_map<Vertex, VInfo> shortestPath(Graph G, Vertex src) {
    priority_queue<DistInfo, vector<DistInfo>, DInfoGreaterThan> q;
    unordered_map<Vertex, VInfo> tracked;
    q.push(make_pair(src, 0));

    while (!q.empty()) {
        auto next = q.top();
        q.pop();

        auto & info = tracked[next];
        if (info.locked) // already locked, must be garbage
            continue;
        info.locked = true;

        for (const auto & edgepair : G[next]) {
            auto & neighbour_info = tracked[edgepair.first];
            int newdist = info.dist + edgepair.second; /*[1]*/
            if (neighbour_info.dist == -1 || newdist < neighbour_info.dist) {
                neighbour_info.dist = newdist;
                neighbour_info.parent = next;
                q.push(make_pair(neighbour, newdist)); // old neighbour in q becomes garbage
            }
        }
    }

    return tracked;
}
```

For a generic heuristic algorithm, the difference occurs at _\[1\]_. Heuristic algorithms such as A star algorithm has an additional weight added to `newdist`.

## Topological Sort

Topological sort is the linear ordering of vertices such that for every directed edge $(u,v)$, vertex $u$ comes before $v$ in the ordering<sup>[\[ref\]](https://www.geeksforgeeks.org/topological-sorting/)</sup>.

### Kahn's Algorithm

Procedure:

1. Create a indegree map for all node.
2. Traverse all the nodes, and count indegree for each node.
3. Track all nodes that has indegree 0.
4. Remove the 0-indegree vertices from the indegree map, and decrement all vertices linked by the outgoing edge of the 0-indegree vertices. If the decremented indegree of the linked vertex is 0, add the decremented vertice to tracked queue.
5. Continue doing this until the tracked queue has size 0

```python
def top_sort(G):
    ordered = list()
    for u in V:
        u.in_degree = 0
    for u in V:
        for v in u.outgoing_edges:
            v.in_degree += 1

    Q = new Queue()
    for u in V:
        if (u.in_degree == 0)
            Q.enqueue(u)
    while len(Q) > 0:
        u = Q.deuqueue()
        ordered.append(u)
        for v in u.outgoing_edges:
            v.in_degree -= 1
            if (v.in_degree == 0)
                Q.enqueue(v)
```

### DFS Based Algorithm

Recursive Process:

```python
def reset_graph(G):
    for v in V:
        v.discovered = False

def reverse_top_sort(G):
    reset_graph(G)
    L=list()
    for u in V:
        if (not u.discovered)
            dfs(u, L)
    return L

def dfs(u, L):
    u.discovered = True
    for v in u.outgoing_edges:
        if (not v.discovered):
            dfs(v, L)
    L.append(u)
```

Non recursive just use stack.

### Graph Cycle Checking

Method 1:
Each vertice needs to have an extra property `v.occupied`.
A vertice can be _visited_ but not _occupied_.
DFS approach achieves reverse topological sort through post order traversal.
The _occupation_ of a vertice occurs in the _reverse topological sorted_ fashion.
That is to say, when it is one vertice's turn to be occupied (post-order), all outgoing edges of that vertice must be occupied already.
If any of the outgoing edges are not occupied, then there is at least one loop.

Method 2:
DFS, keep track of the vertices reached in the current recursion stack.
If a vertex is reached that is already in teh recursion stack, then there is a cycle in the tree.

## Backtracking

**Backtracking** is the process of finding solutions by trying partial solutions and then abandoning them if they are not suitable. It is often implemented recursively.

### Minimax

Minimax is a kind of backtracking algorithm that is used in decision making and game theory to find the optimal move for a player, assuming that your opponent also plays optimally.
It is widely used in two player turn-based games such as Tic-Tac-Toe, Backgammon, Mancala, Chess, etc.

There is a **minimizer** and a **maximizer**, where _maximizer_ is self, and _minimizer_ is the opponent.

### Permutation

Permuting an array is pretty straight forward:

```c++
def generate(A, n):
    if (n == 1):
        print(A)
        return
    for i in range(n):
        A[i], A[n-1] = A[n-1], A[i]
        generate(A, n-1)
        A[i], A[n-1] = A[n-1], A[i]

```

### Combinatorics

Let `{0,1,...,n-1}` be `n` different states.
Combinatorics algorithm checks all elements of the k-size string `{0,1,...,n-1}^k`, i.e. all possible combinations states in `k`-tuple.

One could do it the recursive way:

```python
def combinatorics(n, k, mem):
    """n-states, k-size string, mem should be of k-size,
    print all possible combinations as tuples"""
    if k < 1:
        print(tuple(mem))
        return
    for state in range(n):
        mem[k-1] = state
        combinatorics(n, k-1, mem)
```

Or do it the iterative way...

```python
def combinatorics(n, k):
    states = [0] * k
    for it in range(n**k):
        for i in range(k):
            states[i] = it % n
            it = it // n
        print(tuple(states))
```

## Load Balancer Algorithms

**Load balancing** refers to efficiently distributing incoming network traffic across a group of backend servers<sup>[\[ref\]](https://www.nginx.com/resources/glossary/load-balancing/)</sup>.

**Load Balancer** routes client requests across all backend servers in a manner that maximizes speed and ensure no one server is overworked.

![load-balancing](https://www.nginx.com/wp-content/uploads/2014/07/what-is-load-balancing-diagram-NGINX-640x324.png)

Load-balancing algorithms:

Static Algorithms:

- **Prefix sum**: if execution time of a sequence of tasks are known, divide the tasks in such a way that the same amount of computation goes to each processor. Use prefix sum algorithm, this division can be calculated in logrithmic time.
- **Round Robin**: requests are distributed across the group of servers sequentially
- **Randomized static**: simply assign tasks to random servers. Works well because it avoids communication costs for each assignment.
- **Hash**: allocate queries according to hash table, distributes request based on key, such as client IP address.
- **IP Hash**: client ip is used to select server.

Dynamic Algorithms

- **Least Connections**: a new request is sent to the server with fewest current connections to clients.
- **Least Time**: select the server by a formula that combines fastest response time and fewest active connections
- **Random with 2 choices**: pick 2 servers at random and then select using Least Connections Algorithm.

**Load Balancer** Architecture for neutron<sup>[\[ref\]](https://docs.openstack.org/mitaka/networking-guide/config-lbaas.html#:~:text=The%20load%20balancer%20occupies%20a,address%20assigned%20from%20a%20subnet.&text=Load%20balancers%20can%20listen%20for,is%20specified%20by%20a%20listener.&text=A%20pool%20holds%20a%20list,content%20through%20the%20load%20balancer.)</sup>:

![load-balancer](https://docs.openstack.org/mitaka/networking-guide/_images/lbaasv2-diagram.png)

- **Listener**: multiple listeners listen for requests on different ports
- **Pool**: holds a list of members that serve content through the load balancer
- **Member**: servers that serve traffic behind load balancer. Each member is specified by the IP address and port that it uses to serve traffic.
- **Health monitor**: members may go offline from time to time, health monitors tracks these.

Example load balancer CLI:

```bash
openstack loadbalancer create --name lb1 --vip-subnet-id public-subnet
# Re-run the following until lb1 shows ACTIVE and ONLINE statuses:
openstack loadbalancer show lb1
openstack loadbalancer listener create --name listener1 --protocol HTTP --protocol-port 80 lb1
openstack loadbalancer pool create --name pool1 --lb-algorithm ROUND_ROBIN --listener listener1 --protocol HTTP
openstack loadbalancer healthmonitor create --delay 5 --max-retries 4 --timeout 10 --type HTTP --url-path /healthcheck pool1
openstack loadbalancer member create --subnet-id private-subnet --address 192.0.2.10 --protocol-port 80 pool1
openstack loadbalancer member create --subnet-id private-subnet --address 192.0.2.11 --protocol-port 80 pool1
```

TCP/HTTP load balancer:

- HAproxy
- Nginx
- Octavia (for openstack)

Kubernetes have load balancer built in.

## Additional Resources

[**Coding Exercise**](https://github.com/thomasgaozx/thomasgaozx.github.io/blob/master/content/math/exercise.md)