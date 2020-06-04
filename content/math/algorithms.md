# Data Structures and Algorithms

- [Data Structures and Algorithms](#data-structures-and-algorithms)
  - [Segment Tree](#segment-tree)
  - [Binary Indexed Tree*](#binary-indexed-tree)
    - [Least Significant Bit](#least-significant-bit)
    - [BIT Implementation](#bit-implementation)
  - [Heuristic Algorithm](#heuristic-algorithm)
    - [Dijkstra's Algorithm](#dijkstras-algorithm)
  - [Topological Sort](#topological-sort)
    - [Kahn's Algorithm](#kahns-algorithm)
    - [DFS Based Algorithm](#dfs-based-algorithm)
      - [DFS Loop Checking](#dfs-loop-checking)
  - [Backtracking](#backtracking)
    - [Minimax](#minimax)
    - [Permutation and Combinatorics](#permutation-and-combinatorics)
  - [Load Balancer Algorithms](#load-balancer-algorithms)

## Segment Tree

![Segment](https://www.geeksforgeeks.org/wp-content/uploads/segment-tree1.png)

## Binary Indexed Tree*

We know the fact that each integer can be represented as the sum of powers of two. Similarly, for a given array of size _N_, we can maintain an array `BIT[]` such that, at any index we can store the sum of some numbers of the given array. This can also be called a partial sum tree.

The tree should be such tat parent index of an _ith_ node is obtained by adding the decimal value corresponding to the last set bit of _i_.

### Least Significant Bit

`x&(-x)` gives the last set bit. Note that `-x` uses 2's complement.

![BIT in action](https://i.imgur.com/sc07IiO.png)

Using non least significant bit would break the number done to all power-of-2 terms.

All of these are in place so that the partial sums will not overlap between different values.

### BIT Implementation

```c++
class FenwickTree {
public:
    FenwickTree(int n) : sums_(n+1, 0) {}

    void update(int i, int delta) {
        for (; i<sums_.size(); i += lsb(i))
            sums_[i] += delta;
    }

    void query(int i) const {
        int sum{0};
        while (; i>0; i-=lsb(i))
            sum += sums_[i];
        return sum;
    }

private:
    vector<int> sums_;

    static int lsb(int x) {
        return x&(-x);
    }
};
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

#### DFS Loop Checking

Loop checking for dfs approach is a little bit trickier. Each vertice needs to have an extra property `v.occupied`.

> A vertice can be _visited_ but not _occupied_.

DFS approach achieves reverse topological sort through post order traversal.
The _occupation_ of a vertice occurs in the _reverse topological sorted_ fashion.
That is to say, when it is one vertice's turn to be occupied (post-order), all outgoing edges of that vertice must be occupied already.
If any of the outgoing edges are not occupied, then there is at least one loop.

## Backtracking

**Backtracking** is the process of finding solutions by trying partial solutions and then abandoning them if they are not suitable. It is often implemented recursively.

### Minimax

Minimax is a kind of backtracking algorithm that is used in decision making and game theory to find the optimal move for a player, assuming that your opponent also plays optimally.
It is widely used in two player turn-based games such as Tic-Tac-Toe, Backgammon, Mancala, Chess, etc.

There is a **minimizer** and a **maximizer**, where _maximizer_ is self, and _minimizer_ is the opponent.

### Permutation and Combinatorics

Permuting an array is pretty straight forward:

```c++
void permuteImpl(vector<int> & arr, int start_pos) {
    if (start_pos == arr.size() - 1) {
        printArr(arr);
        return;
    }

    for (int i=start_pos; i < arr.size(); ++i) {
        swap(arr[start_pos], arr[i]);
        permuteImpl(arr, start_pos+1);
        swap(arr[start_pos], arr[i]);
    }
}

void permute(vector<int> & arr) {
    permuteImpl(arr, 0);
}
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