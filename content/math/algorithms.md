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