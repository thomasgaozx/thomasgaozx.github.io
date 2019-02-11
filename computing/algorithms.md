# Data Structures and Algorithms

- [Data Structures and Algorithms](#data-structures-and-algorithms)
  - [Segment Tree](#segment-tree)
  - [Binary Indexed Tree*](#binary-indexed-tree)
    - [Least Significant Bit](#least-significant-bit)
    - [BIT Implementation](#bit-implementation)
  - [Topological Sort](#topological-sort)
    - [Kahn's Algorithm](#kahns-algorithm)
    - [DFS Based Algorithm](#dfs-based-algorithm)
  - [Backtracking](#backtracking)
    - [Minimax](#minimax)
    - [Permutation and Combinatorics](#permutation-and-combinatorics)

## Segment Tree

![Segment](https://www.geeksforgeeks.org/wp-content/uploads/segment-tree1.png)

## Binary Indexed Tree*

We know the fact that each integer can be represented as the sum of powers of two. Similarly, for a given array of size $N$, we can maintain an array `BIT[]` such that, at any index we can store the sum of some numbers of the given array. This can also be called a partial sum tree.

The tree should be such tat parent index of an $i^th$ node is obtained by adding the decimal value corresponding to the last set bit of $i$.

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
        for v in u.utgoing_edges:
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
            reverse_top_sort_impl(u, L)
    return L

def reverse_top_sort_impl(u, L):
    u.discovred = True
    for v in u.outgoing_edges:
        if (not v.discovered):
            reverse_top_sort_impl(u, L)
    L.append(u)
```

Non recursive just use stack.

## Backtracking

**Backtracking** is the process of finding solutions by trying partial solutions and then abandoning them if they are not suitable. It is often implemented recursively.

### Minimax

Minimax is a kind of backtracking algorithm that is used in decision making and game theory to find the optimal move for a player, assuming that your opponent also plays optimally.
It is widely used in two player turn-based games such as Tic-Tac-Toe, Backgammon, Mancala, Chess, etc.

There is a **minimizer** and a **maximizer**, where _maximizer_ is self, and _minimizer_ is the opponent.

### Permutation and Combinatorics
