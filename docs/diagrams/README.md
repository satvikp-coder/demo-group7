# Architectural & Algorithmic Diagrams (`docs/diagrams/`)

**Course:** CSC210 Data Structures & Algorithms — Ahmedabad University  
**Group:** Group 07  
**Project:** Heritage Tourism Planner for Gujarat  

This directory contains standalone [Mermaid](https://mermaid.js.org/) (`.mmd`) diagrams reflecting the **actual, working implementation** of the Heritage Tourism Planner. Every diagram is strictly scoped to the project's **intra-city architecture**, post-DSA extraction, and incorporates the hard budget cap and boat transport mode fixes.

---

## Catalog of Standalone Diagrams

| File | Diagram Name | Type | Primary Supporting Document | Description |
| :--- | :--- | :--- | :--- | :--- |
| [`01_system_architecture.mmd`](01_system_architecture.mmd) | **System Architecture Flowchart** | `flowchart TD` | [`03_System_Architecture.md`](../foundation/03_System_Architecture.md) | High-level 4-tier architecture (React Frontend, Express Backend, In-Memory DSA Engine, PostgreSQL Database). |
| [`02_use_case_diagram.mmd`](02_use_case_diagram.mmd) | **Intra-City Use Case Diagram** | `flowchart LR` | [`02_Requirements_Specification.md`](../foundation/02_Requirements_Specification.md) | Detailed use cases for Tourist and Tour Operator actors within a single-city boundary. |
| [`04_dsa_architecture.mmd`](04_dsa_architecture.mmd) | **DSA Engine Dataflow** | `flowchart TD` | [`04_DSA_Architecture.md`](../foundation/04_DSA_Architecture.md) | End-to-end dataflow across Trie, Entity Hash Table, Graph, Greedy Engine, Dijkstra, and Merge Sort. |
| [`05_database_er_diagram.mmd`](05_database_er_diagram.mmd) | **PostgreSQL Relational ER Diagram** | `erDiagram` | [`06_Database_Design.md`](../foundation/06_Database_Design.md) | 3NF database schema mapping destinations, attractions, hotels, restaurants, intra-city routes, trips, stops, and budgets. |
| [`07_dijkstra_flow.mmd`](07_dijkstra_flow.mmd) | **Dijkstra Solver & Boat Bypass Flow** | `flowchart TD` | [`04_DSA_Architecture.md`](../foundation/04_DSA_Architecture.md) | Flowchart of `dijkstra.ts` and `evaluateRouteLeg()`, detailing real `routes.csv` lookups, island boat bypass, and MinHeap shortest path exploration. |
| [`08_greedy_flow.mmd`](08_greedy_flow.mmd) | **Greedy Optimization & Budget Flow** | `flowchart TD` | [`04_DSA_Architecture.md`](../foundation/04_DSA_Architecture.md) | Flowchart covering all 3 Greedy uses: budget allocator (with hard cap), daily time-budget splitter, and multi-strategy attraction scoring (`routeBuilder.ts`). |
| [`09_trie_search_flow.mmd`](09_trie_search_flow.mmd) | **Prefix Trie Insertion & Search Flow** | `flowchart TD` | [`04_DSA_Architecture.md`](../foundation/04_DSA_Architecture.md) | Flowchart of `Trie.ts` showing Suffix Trie construction for substring search and $O(L)$ prefix query resolution. |

---

## How to Render and Preview

1. **GitHub Markdown / VS Code:** Mermaid diagrams render natively in GitHub previews and markdown viewers.
2. **Mermaid Live Editor:** Copy and paste the contents of any `.mmd` file into [mermaid.live](https://mermaid.live/) for high-resolution SVG or PNG exports.
3. **CLI Generation:** Generate SVG/PNG images directly using the Mermaid CLI (`@mermaid-js/mermaid-cli`):
   ```bash
   npx @mermaid-js/mermaid-cli -i docs/diagrams/01_system_architecture.mmd -o docs/diagrams/01_system_architecture.svg
   ```
