# Priority Queue Module (`dsa/priorityQueue/`)

**Implementation:** `MinHeap.ts`  
**Description:** Generic binary Min-Heap ($O(\log V)$ operations). Shares **one implementation** with a swappable `comparator(a, b)` function to serve two distinct uses:
1. Dijkstra node selection (minimum distance node extraction)
2. Recommendation engine ranking (hotels/attractions ranked by rating-to-cost score)
