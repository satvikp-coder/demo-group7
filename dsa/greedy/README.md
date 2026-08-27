# Greedy Heuristics Module (`dsa/greedy/`)

**Implementations:** `GreedyRouteBuilder.ts`, `TimeBudgetSplitter.ts`, `BudgetAllocator.ts`  
**Description:** Core itinerary generator using three distinct greedy algorithms:
1. **Circular Route Construction:** Nearest-neighbor attraction ordering starting and ending at the selected hotel.
2. **Time-Budget Day-Splitting:** Grouping attractions into daily schedules based on remaining time availability.
3. **Budget Allocation:** Greedily allocating funds across hotel, attraction entry fees, and meals based on rating efficiency.
