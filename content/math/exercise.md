# A Guide to Coding Problems

Disclaimer: most of the problems described in this article are from [LeetCode](https://leetcode.com/).

The article is approach oriented, and only the most concise code snippets are presented.
Readers should get a good idea of how to solve the problem by reading the code snippet.
Bear in mind that a working solution can be much nastier.

- [A Guide to Coding Problems](#a-guide-to-coding-problems)
  - [Trie](#trie)
    - [Palindrome Pair](#palindrome-pair)
    - [Word Search](#word-search)
  - [Backtracking](#backtracking)
    - [N Queens](#n-queens)
  - [Memorization Matrix](#memorization-matrix)
    - [Remove Boxes](#remove-boxes)
  - [Multi-Solution Problems](#multi-solution-problems)
    - [Count Smaller Numbers After Self](#count-smaller-numbers-after-self)

## Trie

Trie is an elegant replacement of dictionary.
In the case where a hash set may contain similar strings, e.g. `ab`, `abc`, `abcc`, `abd`, a hash set may be replaced with a trie: `[a[b[c[,c],d]]]`

### Palindrome Pair

> This problem could be solved with both dictionary and trie approach

Given a list of unique words, find all pairs of distinct indices `(i, j)` in the given list, so that the concatenation of the two words, i.e. `words[i] + words[j]` is a palindrome.

Example:

```example
Input: ["bat","tab","cat"]
Output: [[0,1],[1,0]]
Explanation: The palindromes are ["battab","tabbat"]
```

Solution using dictionary is pretty elegant and is displayed below.
Solution using trie is messy and is left for reader's exercise.
Although trie is much more efficient than dictionary in this case.

```python
def palindrome_pairs(self, words: 'List[str]') -> 'List[List[int]]':
    cands = dict() # { reversed_word : corresponding index }
    result = list()

    for i in range(len(words)):
        cands[words[i][::-1]] = i

    for i in range(len(words)):
        for j in range(len(word)):
            left = words[i][:j]
            right = words[i][j:]

            if (left in cands and is_palindrome(right) and cands[left] != i):
                result+=[[i, cands[left]]]

            if (right in cands and is_palindrome(left) and cands[right] != i):
                result+=[[cands[right], i]]

    return result
```

### Word Search

Problem Description: Given a 2D board and a list of words from the dictionary, find all words in the board.

Each word must be constructed from letters of sequentially adjacent cell, where "adjacent" cells are those horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.

Example:

```example
Input:
words = ["oath","pea","eat","rain"] and board =
[
  ['o','a','a','n'],
  ['e','t','a','e'],
  ['i','h','k','r'],
  ['i','f','l','v']
]

Output: ["eat","oath"]
Assumption: all inputs are consist of lowercase letters a-z
```

Solution:

The trie structure used is as shown below:

```c++
struct Trie {
    Trie() : children(26, nullptr), is_end{false} {}

    void addWord(const string & word);

    vector<Trie*> children;
    bool is_end; // marks the end of a word
}
```

the `addWord` algorithm is pretty straight forward:

```c++
Trie::addWord(const string & word) {
    Node* pos = this;
    for (char c : word) {
        int index = c - 'a';
        if (!(pos->children[index]))
            pos->children[index] = new Node{};
        pos = pos->children[index];
    }
    pos->is_end = true;
}
```

The dfs itself is pretty straight forward, but the implementation can get nasty. The simple version is shown here:

```c++
void dfs(const vector<vector<char>> & board, Node* pos, int x, int y) {
    path[x][y] = true; // set the coordinate as visited

    char c = board[x][y];
    int index = c-'a';

    if (pos->children[index]) {
        pos = pos->children[c-'a'];
        word_build.push_back(c); // `word_build` is a list of characters
        if (pos->is_end) // `result` is a unordered_set of strings
            result.insert(string(word_build.begin(), word_build.end()));

        if (x+1 < rows && !path[x+1][y])
            dfs(board, pos, x+1, y);
        if (x > 0 && !path[x-1][y])
            dfs(board, pos, x-1, y);
        if (y+1 < cols && !path[x][y+1])
            dfs(board, pos, x, y+1);
        if (y > 0 && !path[x][y-1])
            dfs(board, pos, x, y-1);

        word_build.pop_back();
    }

    path[x][y] = false;
}
```

It turns out this algorithm is slower and takes more memory space than a lot of other implementations. The primary suspect is the fact I had to build up characters to form each string. Ironically, efficient implementations put `string word` as a field of Trie node instead of `is_end`, which seemingly takes more space than a boolean. During execution, however, they never had to build up each individual string through `word_build` (which I thought was more efficient).

## Backtracking

### N Queens

_N Queens_ is a classic backtracking problem. One needs to place _n_ queens on an _n×n_ chessboard such that no two queens attack each other.

Given an integer n, return all distinct solutions to the n-queens puzzle. Each solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space respectively.

```example
Input: 4
Output: [
 [".Q..",  // Solution 1
  "...Q",
  "Q...",
  "..Q."],

 ["..Q.",  // Solution 2
  "Q...",
  "...Q",
  ".Q.."]
]
Explanation: There exist two distinct solutions to the 4-queens puzzle as shown above.
```

Solution:

The positions of the queens are kept as a vector of size n `queenPos`.
Each position in that vector represents a row number, and `queenPos[row]` is the column number.

Going through the helper functions first:

- `attackable` checks whether two queens in positions `(x1, y1)` and `(x2, y2)` can attack each other.
- `is_valid(row)` checks the queen on current row against queens on all upper rows.

```c++
bool attackable(int x1, int y1, int x2, int y2) {
    return x1 == x2 || y1 == y2 || abs(x1 - x2) == abs(y1 - y2);
}

bool is_valid(int row) {
    for (int row_num = row-1; row_num > -1; --row_num)
        if (attackable(row_num, queenPos[row_num], row, queenPos[row]))
            return false;
    return true;
}
```

Now comes the backtracking algorithm, which happens to be another dfs.

```c++
void dfs(int row) {
    for (int i=0; i<n; ++i) {
        queenPos[row] = i;

        // checks current row with upper rows
        if (!is_valid(row))
            continue;

        if (row == n-1) { // last row
            trackResult();
            return;
        }

        dfs(row+1);
    }
}
```

## Memorization Matrix

### Remove Boxes

Given several boxes with different colors represented by different positive numbers.
You may experience several rounds to remove boxes until there is no box left. Each time you can choose some continuous boxes with the same color (composed of k boxes, k >= 1), remove them and get k*k points.
Find the maximum points you can get.

Example:

```example
Input:
[1, 3, 2, 2, 2, 3, 4, 3, 1]

Output:
23

Explanation:
[1, 3, 2, 2, 2, 3, 4, 3, 1]
----> [1, 3, 3, 4, 3, 1] (3*3=9 points)
----> [1, 3, 3, 3, 1] (1*1=1 points)
----> [1, 1] (3*3=9 points)
----> [] (2*2=4 points)
Note: The number of boxes n would not exceed 100.
```

Solution: This question is certainly not easy to break down, especially for a person who have never done any 3D matrix memorization before.
While tackling this kind of problems, it is highly recommended that one figures out a brute-force approach before considering memorization. For this problem, once brute force approach is found, transforming the approach to dynamic programming is really simple.

In short, we want to memorize the maximum point given an interval (end point inclusive).
You may think, why shouldn't it be 2D matrix memorization?
The key is the color streak.
For example, if the start of the interval is color `A`, and there is no color streak before the interval, the maxmum point for that interval is indeed the same.
However, if the box before the start of the interval is also color `A`, then there is a streak, and the maximum point for the interval will be different.
Given the same interval, if the removing sequence of boxes before the interval is different, the #color-streak may be different too.
Therefore, 3D matrix memorization is required. In the 3D matrix, row# represents the start of interval (inclusive), column# represents the end of interval (inclusive), depth# represents the same-color streak that comes before the first box of the interval.

Overall an interval could be break down recursively in the following manners, the max of which will be memorized:

1. Assume the color streak will not continue: (binary configuration): `STREAKING() -> RECURSIVE(STREAKING_DIFF_COLOR())`
2. Assume the end of first color streak may be continued: (onion configuration): `STREAKING_SAME_COLOR() -> NON-STREAKING() -> RECURSIVE(STREAKING_SAME_COLOR() -> NON-STREAKING())`

For 1) the max point of the interval is `compute_point(initial_streaking) + max_point(rest_of_interval)`.
For 2) the max point of the interval is `no_point(streaking) + max_point(non_streaking) + max_point_with_combined_streaking(streaking)`.

TL;DR.

```c++
/*
parameters:
i - left bound (inclusive), j - right bound (inclusive)
k - color streak from left till `i` (exclusive)
*/
int max_point(int memo[100][100][100], const vector<int> & boxes, int i, int j, int k) {
    if (j < i)
        return 0;
    if (memo[i][j][k] > 0)
        return memo[i][j][k];

    for (; i < j && boxes[i] == boxes[i + 1]; ++i, ++k) {}
    memo[i][j][k] = (k + 1) * (k + 1) + max_point(memo, boxes, i + 1, j, 0);

    for (int m = i + 2; m <= j; ++m)
        if (boxes[m] == boxes[i]) {
            memo[i][j][k] = max(memo[i][j][k],
                max_point(memo, boxes, i + 1, m - 1, 0) + max_point(memo, boxes, m, j, k + 1));
            for (; m <= j && boxes[m] == boxes[i]; ++m) {} // go right as possible
        }

    return memo[i][j][k];
}
```

## Multi-Solution Problems

### Count Smaller Numbers After Self

[Try the problem here:](https://leetcode.com/problems/count-of-smaller-numbers-after-self/)

You are given an integer array nums and you have to return a new counts array. The counts array has the property where counts\[i\] is the number of smaller elements to the right of nums\[i\].

Example:

```example
Input: [5,2,6,1]
Output: [2,1,1,0]
Explanation:
To the right of 5 there are 2 smaller elements (2 and 1).
To the right of 2 there is only 1 smaller element (1).
To the right of 6 there is 1 smaller element (1).
To the right of 1 there is 0 smaller element.
```

There are so many O(NlogN) ways to tackle this problem, a couple obvious ones are explained below.

Using shifted **Binary Indexed Tree**:

1. Get min and max number from the array.
2. Shift the BIT such that the min index is located at index 0.
3. For each number in array in reverse order, shift the number to get an index at BIT. Query that index to get smaller number after self, then update the BIT at index + 1 position.

The implementation is left as an exercise.

Using **Binary Search Tree**:

The configuration of the binary tree should be `<` goes left and `>` goes right. `=` is tracked as duplication.

- Each node tracks the number of nodes to the left called `left_sum`, and duplication `dup`.
- While inserting a node, keep track of a `cur_sum`. If at node`pos`:
  - Right turn occurs: `cur_sum += pos.left_sum + pos.dup`
  - Left turn occurs: `++pos.left_sum`
- When insertion completes, record `cur_sum` as the `left_sum` of the node. The `cur_sum` is the count of smaller numbers after self.

Using an AVL tree will ensure a O(NlogN) run time, but AVL tree implementation can get real nasty, so forget it.

Using **Merge Sort**:

see [this](https://leetcode.com/problems/count-of-smaller-numbers-after-self/discuss/76583/11ms-JAVA-solution-using-merge-sort-with-explanation).

