# Data Structures & Algorithms (DSA) Architecture

**Course:** CSC210 Introduction to Data Structures & Algorithms — Ahmedabad University  
**Group:** Group 07  
**Status:** Core Master Specification for Intra-City Algorithmic Engine

---

## 1. Scope & Design Philosophy

The **DSA Engine** for the Heritage Tourism Planner operates strictly within an **intra-city boundary**. 
- **Graph Nodes:** Represent **one city's** attractions and its starting hotel(s) — never the 8 cities themselves.
- **Primary Itinerary Builder:** Driven by **Greedy Heuristics** (Nearest-Neighbor, Time-Budget Day Split, and Financial Allocation).
- **Shortest Path Solver:** **Dijkstra's Algorithm** serves as a *supporting utility* to compute shortest paths between non-adjacent intra-city attraction pairs when direct road edges are missing.
- **Search & Retrieval:** **Trie** powers prefix autocomplete search, while **Hash Tables** provide instant $O(1)$ access to confirmed city datasets.

---

## 2. Master DSA Mapping Table

| DSA / Algorithm | Application Feature | Input | Output | Complexity | Location in Code |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Graph** | Intra-city road network topology | City's attractions + starting hotel + road connections | Weighted Adjacency List | Space: $O(V+E)$ | `src/dsa/graph/AdjacencyListGraph.ts` |
| **Dijkstra** | Fallback shortest path solver | Source node ID, Target node ID (same city) | Shortest path node list + total transit time | Time: $O((V+E) \log V)$<br>Space: $O(V)$ | `src/dsa/dijkstra/DijkstraSolver.ts` |
| **Priority Queue** | (1) Dijkstra node selection<br>(2) Rating/cost recommendation ranking | Nodes + distance OR Items + rating/cost score | Minimum distance node / Ranked item array | Time: $O(\log V)$ per op<br>Space: $O(V)$ | `src/dsa/priorityQueue/MinHeap.ts` |
| **Greedy (Route)** | Circular visiting order generation | Unvisited attraction set + starting hotel node | Ordered circular stop list | Time: $O(V^2)$<br>Space: $O(V)$ | `src/dsa/greedy/GreedyRouteBuilder.ts` |
| **Greedy (Day-Split)**| Time-budget daily schedule split | Ordered circular stops + daily time budget | Day-wise grouped itinerary stops | Time: $O(V)$<br>Space: $O(V)$ | `src/dsa/greedy/TimeBudgetSplitter.ts` |
| **Greedy (Budget)** | Monetary allocation across categories | Total budget + item costs & rating scores | Itemized category spend breakdown | Time: $O(N \log N)$<br>Space: $O(N)$ | `src/dsa/greedy/BudgetAllocator.ts` |
| **Trie** | City and attraction search autocomplete | Prefix string query (e.g., `"Som"`) | Matching city and attraction names | Time: $O(L + k)$<br>Space: $O(N \cdot L)$ | `src/dsa/trie/PrefixTrie.ts` |
| **Hash Table** | Confirmed-city entity retrieval & caching | City ID string | City metadata, attractions, hotels, & restaurants | Time: $O(1)$ average<br>Space: $O(V + H + R)$ | `src/dsa/hashTable/EntityHashTable.ts` |
| **Merge Sort** | Custom display ranking for hotels/sites | Unsorted item array + custom comparator function | Sorted item array | Time: $O(N \log N)$<br>Space: $O(N)$ | `src/dsa/sorting/MergeSorter.ts` |

---

## 3. Detailed Algorithmic Specifications

### 3.1. Graph (Intra-City Road Network)

#### Problem Solved
Models the physical road network of a single chosen city, enabling spatial travel calculations between a starting hotel and local heritage attractions.

#### Data Representation
Weighted, Undirected **Adjacency List**.
- **Nodes ($V$):** The city's selected hotel and local attractions.
- **Edges ($E$):** Direct intra-city road segments.
- **Edge Weights ($W$):** Estimated travel time in minutes ($\text{weight} = \text{travel\_time\_mins}$).

$$G = (V, E), \quad V = \{\text{Hotel}, \text{Attraction}_1, \dots, \text{Attraction}_n\}, \quad E = \{(u, v, w) \mid u, v \in V\}$$

#### Justification: Adjacency List vs. Adjacency Matrix
For a small intra-city graph with $V \in [4, 6]$ nodes, the graph is relatively sparse ($E \ll V^2$).
- **Adjacency List** uses $O(V + E)$ memory, storing only existing road connections. Iterating over a node's actual neighbors runs in $O(\text{degree}(v))$ time.
- **Adjacency Matrix** consumes $O(V^2)$ space regardless of sparsity and requires scanning $V$ elements to find neighbors. Thus, the Adjacency List is optimal for graph storage and traversal efficiency.

#### Worked Example: Somnath Intra-City Network

```mermaid
graph TD
    H["Hotel: Premier Somnath (H)"]
    ST["Somnath Temple (ST)"]
    BT["Bhalka Tirth (BT)"]
    TS["Triveni Sangam (TS)"]
    SB["Somnath Beach (SB)"]

    H <-->|10 mins (3.0 km)| ST
    H <-->|15 mins (5.0 km)| BT
    ST <-->|8 mins (2.0 km)| TS
    ST <-->|5 mins (1.2 km)| SB
    BT <-->|12 mins (4.0 km)| TS
```

#### Code Location & Interface
- **File Path:** `src/dsa/graph/AdjacencyListGraph.ts`
- **Input:** City node list and road edge array.
- **Output:** Queryable graph instance with `getNeighbors(nodeId)`.

#### Edge Cases
1. **Isolated Node ($E=0$ for a node):** Handle by reporting unreachable status during pathfinding.
2. **Multiple Road Connections Between Same Pair:** Keep only the minimum edge weight (shortest travel time).

---

### 3.2. Dijkstra's Algorithm (Fallback Shortest-Path Solver)

#### Problem Solved
Calculates the true shortest road path between two attractions in the **same city** when no direct road edge connects them in the graph.

> [!IMPORTANT]
> **Role Clarification:** Dijkstra does **NOT** generate the overall itinerary or decide visiting order. It is a fallback utility called by the Greedy route builder when $Edge(u, v) = \varnothing$.

#### Worked Example Scenario
In Somnath, if a direct road between *Somnath Beach* and *Bhalka Tirth* is unavailable, Dijkstra computes the shortest path via *Somnath Temple*:

$$\text{Somnath Beach} \xrightarrow{5\text{ mins}} \text{Somnath Temple} \xrightarrow{10\text{ mins}} \text{Hotel} \xrightarrow{15\text{ mins}} \text{Bhalka Tirth}$$

#### Algorithm & Pseudocode

```text
ALGORITHM DijkstraShortestPath(Graph, SourceNode, TargetNode):
    Input: Graph G = (V, E), SourceNode u, TargetNode v
    Output: Shortest distance dist[v] and PathArray

    Initialize dist[node] = INFINITY for all node in V
    Initialize prev[node] = UNDEFINED for all node in V
    dist[SourceNode] = 0

    MinHeap PQ
    PQ.insert(SourceNode, 0)

    WHILE PQ is not empty:
        current = PQ.extractMin()

        IF current == TargetNode:
            BREAK

        FOR EACH neighbor, weight IN Graph.getNeighbors(current):
            altDistance = dist[current] + weight
            IF altDistance < dist[neighbor]:
                dist[neighbor] = altDistance
                prev[neighbor] = current
                PQ.decreaseKey(neighbor, altDistance)

    RETURN ReconstructPath(prev, TargetNode), dist[TargetNode]
```

#### Complexity Analysis
- **Time Complexity:** $O((V + E) \log V)$ using Min-Heap priority queue.
- **Space Complexity:** $O(V)$ to store distance table and previous-node array.

#### Code Location
- **File Path:** `src/dsa/dijkstra/DijkstraSolver.ts`

---

### 3.3. Priority Queue (Min-Heap)

#### Problem Solved & Dual Applications
1. **Dijkstra Engine:** Extracts the unvisited node with the smallest tentative distance in $O(\log V)$ time.
2. **Recommendation Engine:** Ranks hotels and attractions by rating-to-cost ratio score without invoking Dijkstra.

#### Generic Implementation
A single `MinHeap<T>` class with a swappable `comparator(a, b)` function handles both applications.

#### Pseudocode

```text
CLASS MinHeap<T>:
    ARRAY heap
    FUNCTION comparator(a, b)

    FUNCTION insert(element):
        heap.push(element)
        bubbleUp(heap.length - 1)

    FUNCTION extractMin():
        IF heap.length == 0 RETURN NULL
        minVal = heap[0]
        heap[0] = heap.pop()
        sinkDown(0)
        RETURN minVal

    FUNCTION sinkDown(index):
        // Standard heapify down logic swapping with smaller child
```

#### Complexity Analysis
- **Insert / Extract-Min:** $O(\log V)$
- **Peek Minimum:** $O(1)$
- **Space Complexity:** $O(V)$

#### Code Location
- **File Path:** `src/dsa/priorityQueue/MinHeap.ts`

---

### 3.4. Greedy Heuristics (Itinerary & Budget Engine)

The system employs **three distinct Greedy algorithms**:

#### 1. Greedy Circular Route Construction (Nearest-Neighbor)
- **Objective:** Build an efficient visiting order starting at the hotel, visiting unvisited sites, and returning to the hotel.
- **Algorithm:** At current node $u$, greedily select unvisited node $v$ that minimizes travel time $W(u, v)$.
- **Time Complexity:** $O(V^2)$

#### 2. Greedy Time-Budget Day-Splitting
- **Objective:** Distribute ordered attractions across multi-day schedules based on cumulative time availability rather than a fixed attraction count.
- **Logic:** 
  $$\text{RemainingTime} = \text{DailyWindow} - (\text{VisitDuration} + \text{TravelTime} + \text{MealBreaks})$$
  If site duration fits in $\text{RemainingTime}$, add to current day; else advance to next day.
- **Time Complexity:** $O(V)$

#### 3. Greedy Budget Allocation
- **Objective:** Allocate maximum funds to high-rated accommodations and key entry fees.
- **Logic:** Sort items by $\frac{\text{Rating}}{\text{Cost}}$ and greedily accept items while $\text{CumulativeCost} \le \text{Budget}$.
- **Time Complexity:** $O(N \log N)$

#### Real Somnath Data Trace

| Attraction | Duration | Entry Fee | Road Transit from Prev | Cumulative Day 1 Time | Decision |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hotel Premier Somnath** | - | - | 0 mins (Start 08:00 AM) | 08:00 AM | Starting Node |
| **Somnath Temple** | 1.5 hrs | ₹0 | 10 mins | 09:40 AM | Fits Day 1 |
| **Triveni Sangam** | 1.0 hr | ₹0 | 8 mins | 10:48 AM | Fits Day 1 |
| **Lunch Break** | 1.0 hr | ₹150 | 0 mins | 12:30 PM – 01:30 PM | Auto-Inserted |
| **Bhalka Tirth** | 1.0 hr | ₹0 | 12 mins | 02:42 PM | Fits Day 1 |
| **Somnath Beach** | 1.5 hrs | ₹0 | 15 mins | 04:42 PM | Fits Day 1 |
| **Hotel Return** | - | - | 10 mins | 04:52 PM | Return to Hotel |

#### Research Limitation Note
Greedy nearest-neighbor does not guarantee global TSP optimality. On small node sets ($V \in [4, 6]$), it yields near-optimal schedules within $< 1\text{ ms}$, serving as a core research trade-off discussion.

#### Code Location
- **File Paths:** `src/dsa/greedy/GreedyRouteBuilder.ts`, `src/dsa/greedy/TimeBudgetSplitter.ts`, `src/dsa/greedy/BudgetAllocator.ts`

---

### 3.5. Trie (Prefix Search Engine)

#### Problem Solved
Provides real-time $O(L)$ prefix matching for searching city names and local attractions.

#### Architectural Choice
A **Unified Trie** indexes both city names and attraction names using an internal entity tag (`type: 'city' | 'attraction'`). This allows unified search queries (e.g., `"som"` matching city *Somnath* and site *Somnath Temple* simultaneously).

#### Pseudocode

```text
CLASS TrieNode:
    MAP children
    BOOLEAN isEndOfWord
    ARRAY matches // Stores entity objects

CLASS PrefixTrie:
    TrieNode root

    FUNCTION insert(word, entity):
        current = root
        FOR EACH char IN word.toLowerCase():
            IF char NOT IN current.children:
                current.children[char] = NEW TrieNode()
            current = current.children[char]
            current.matches.push(entity)
        current.isEndOfWord = TRUE

    FUNCTION searchPrefix(prefix):
        current = root
        FOR EACH char IN prefix.toLowerCase():
            IF char NOT IN current.children:
                RETURN EMPTY ARRAY
            current = current.children[char]
        RETURN current.matches
```

#### Complexity Analysis
- **Search Time:** $O(L + k)$, where $L$ is query length and $k$ is number of matches returned.
- **Space Complexity:** $O(N \cdot L)$ for storing strings.

#### Code Location
- **File Path:** `src/dsa/trie/PrefixTrie.ts`

---

### 3.6. Hash Table (Entity Index & Cache)

#### Problem Solved
Provides $O(1)$ average-time retrieval of complete city metadata, attraction lists, hotels, and restaurants once a city ID is confirmed.

#### Justification vs. Database Index
While database indexes optimize SQL disk lookups, our application-level in-memory **Hash Table** caches parsed entity objects in RAM, eliminating redundant database queries during interactive user sessions.

#### Collision Handling Strategy
Uses **Separate Chaining** with linked lists to handle hash key collisions gracefully.

#### Pseudocode

```text
CLASS HashTable:
    ARRAY buckets[CAPACITY]

    FUNCTION hash(key):
        hashValue = 0
        FOR char IN key:
            hashValue = (hashValue * 31 + charCode(char)) % CAPACITY
        RETURN hashValue

    FUNCTION set(key, value):
        index = hash(key)
        FOR node IN buckets[index]:
            IF node.key == key:
                node.value = value
                RETURN
        buckets[index].push({key, value})

    FUNCTION get(key):
        index = hash(key)
        FOR node IN buckets[index]:
            IF node.key == key:
                RETURN node.value
        RETURN NULL
```

#### Complexity Analysis
- **Search / Insert / Delete:** $O(1)$ average, $O(N)$ worst-case.
- **Space Complexity:** $O(V + H + R)$ total indexed entities.

#### Code Location
- **File Path:** `src/dsa/hashTable/EntityHashTable.ts`

---

### 3.7. Merge Sort (Custom Ranking Sorter)

#### Problem Solved
Sorts hotels, attractions, and destinations by custom criteria (e.g., price ascending, rating descending) for UI display.

#### Manual Implementation Justification
Calling native `Array.prototype.sort()` abstracts algorithm execution. A manual, pure TypeScript implementation of **Merge Sort** is included to demonstrate algorithmic rigor ($O(N \log N)$ guaranteed worst-case time complexity).

#### Pseudocode & Proof

```text
FUNCTION mergeSort(arr, comparator):
    IF arr.length <= 1 RETURN arr

    mid = floor(arr.length / 2)
    left = mergeSort(arr.slice(0, mid), comparator)
    right = mergeSort(arr.slice(mid), comparator)

    RETURN merge(left, right, comparator)

FUNCTION merge(left, right, comparator):
    ARRAY result
    WHILE left.length > 0 AND right.length > 0:
        IF comparator(left[0], right[0]) <= 0:
            result.push(left.shift())
        ELSE:
            result.push(right.shift())

    RETURN result.concat(left).concat(right)
```

#### Complexity Proof
- **Recurrence Relation:** $T(N) = 2 T(N/2) + O(N)$
- **By Master Theorem:** $T(N) = \Theta(N \log N)$ in all cases (best, average, worst).
- **Space Complexity:** $O(N)$ auxiliary buffer space.

#### Code Location
- **File Path:** `src/dsa/sorting/MergeSorter.ts`

---

## 4. Architectural Summary

The intra-city DSA engine guarantees determinism, performance ($< 100\text{ ms}$), and mathematical clarity by strictly isolating each algorithm's responsibilities:

```
[User Input: "Som"] ──> Trie (Prefix Search) ──> [City Confirmed: "somnath"]
                                                        │
                                                        ▼
[Itinerary Rendered] <── Greedy Splitter <── Graph + Dijkstra <── Hash Table Lookup
```
