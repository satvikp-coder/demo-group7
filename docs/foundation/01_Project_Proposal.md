# CSC210 Data Structures & Algorithms — Project Proposal

## 1. Project Title
**Heritage Tourism Planner for Gujarat**  
*An Intra-City Algorithmic Itinerary & Budget Optimization System*

---

## 2. Abstract
The **Heritage Tourism Planner for Gujarat** is an intra-city algorithmic itinerary generation and budget management system designed specifically for historic and cultural destinations across Gujarat, India. Existing commercial travel platforms focus predominantly on inter-city transport booking or static multi-city packages, leaving tourists to manually plan daily, hourly schedules within a destination. This manual process requires simultaneous balancing of attraction visit durations, physical road distances, realistic arrival and departure times, compulsory meal breaks, accommodation costs, and tight monetary constraints. 

To solve this problem, our system models each destination city as a dedicated spatial graph and applies fundamental Data Structures and Algorithms (DSA)—including **Graphs**, **Dijkstra's Algorithm**, **Priority Queues**, **Tries**, **Hash Tables**, **Greedy Optimization**, and **Sorting**. Given a single chosen city (from 8 supported heritage hubs), trip duration, budget, preferred starting hotel, and daily start time, the planner constructs a multi-day, circular intra-city itinerary (Hotel $\rightarrow$ Attractions $\rightarrow$ Hotel) with exact time schedules, automated lunch/dinner breaks, and a comprehensive budget breakdown.

---

## 3. Background
Gujarat is one of India's foremost cultural and heritage corridors, home to UNESCO World Heritage Sites, ancient sun temples, wildlife sanctuaries, and sacred pilgrimage hubs. Each heritage hub presents unique spatial characteristics, variable visitor visit durations (ranging from 45 minutes for local stepwells to 240 minutes for national parks), and distinct local road topologies. 

Despite rich cultural offerings, tourists frequently face friction when planning daily itineraries within a specific city. Generic trip planners either produce rigid, non-customizable lists or fail to respect real-world spatial-temporal constraints such as opening hours, mandatory meal windows, and circular return routes to the visitor's hotel. This project bridges that gap by offering a mathematically grounded, intra-city travel optimization engine tailored for Gujarat's key heritage hubs.

---

## 4. Problem Statement
Planning a multi-day trip **within a single Gujarat heritage city** requires balancing several interdependent variables simultaneously:
1. **Intra-City Spatial Routing:** Selecting a logical sequence of attraction visits that minimizes backtrack travel time from a specific hotel starting point.
2. **Temporal Management:** Accounting for exact visit durations (e.g., 180 mins at Gir Safari vs. 60 mins at Uparkot Fort) alongside road traversal times.
3. **Compulsory Meal Schedules:** Inserting lunch and dinner breaks automatically into daily schedules without overshooting daily departure/return bounds.
4. **Financial Constraints:** Allocating a fixed budget across accommodation, attraction entry fees, and meal expenses while filtering out unaffordable options.
5. **Inefficiency of Manual & Generic Planning:** Manual planning is tedious and error-prone. Generic travel platforms provide static point-to-point maps or unoptimized attraction lists rather than schedule-aware, budget-constrained, circular intra-city itineraries.

---

## 5. Motivation
* **Educational Purpose:** Applying core algorithms taught in CSC210 (Graphs, Dijkstra, Greedy heuristics, Priority Queues, Tries, Hash Tables) to a complex real-world optimization problem.
* **Regional Cultural Impact:** Promoting tourism in Gujarat by making heritage exploration accessible, transparent, and structured for domestic and international travelers.
* **Practical Utility:** Providing a functional, interactive web application that produces instant, actionable, minute-by-minute daily itineraries and cost breakdowns.

---

## 6. Proposed Solution
We propose a lightweight, highly responsive, web-based intra-city itinerary planner. The user selects **one city** at a time from 8 selected Gujarat heritage destinations. Upon specifying their trip duration (in days), budget limit, preferred starting hotel, and daily start time, the application executes an intra-city algorithm pipeline:
1. **Instant City & Attraction Search:** Powered by a **Trie** and **Hash Table** for prefix autocomplete and $O(1)$ entity retrieval.
2. **Constraint-Based Daily Time-Budgeting:** Allocates attractions to days based on cumulative time availability rather than a naive fixed attraction count.
3. **Greedy Circular Route Construction:** Orders attractions sequentially using a nearest-neighbor heuristic starting from and returning to the chosen hotel.
4. **Dijkstra-Assisted Path Finding:** Computes shortest paths between attraction pairs when direct road connections are absent in the intra-city road graph.
5. **Automatic Meal-Break Insertion:** Seamlessly injects lunch and dinner time blocks into the schedule during designated dining windows.
6. **Financial Allocation & Ranking:** Utilizes **Priority Queues** and **Sorting** to rank hotels and attractions by rating-to-cost ratios and aggregate accurate budget breakdowns.

---

## 7. Project Objectives
1. **Algorithmic Integration:** Implement and integrate Graph traversal, Dijkstra's algorithm, Priority Queues, Tries, Hash Tables, Greedy heuristics, and Sorting algorithms into a unified execution pipeline.
2. **Intra-City Circular Itinerary Generation:** Produce minute-by-minute day plans starting and ending at the user's selected hotel.
3. **Temporal Realism:** Incorporate attraction visit durations, road travel times, and compulsory meal breaks.
4. **Budget Management:** Provide instant financial analysis detailing hotel, attraction entry, meal, and estimated intra-city transit expenses.
5. **Algorithm Visualization:** Include an interactive visualizer showcasing Dijkstra's algorithm step-by-step for educational evaluation.

---

## 8. Target Users
* **Tourists & Travelers:** Independent or family travelers seeking customized, time-accurate daily schedules inside a chosen Gujarat destination.
* **Tour Operators & Local Agencies:** Destination management companies requiring fast, standardized itinerary generation and cost estimation for clients.

---

## 9. Main Features
* **Trie-Powered Search & Autocomplete:** Real-time prefix matching for searching cities and local attractions.
* **Intra-City Circular Itinerary Generator:** Constructs multi-day daily schedules (Hotel $\rightarrow$ Sites $\rightarrow$ Hotel) with real arrival/departure times.
* **Intra-City Distance Optimization:** Minimizes intra-city transit time using direct road graphs and supporting Dijkstra shortest-path calculations.
* **Automatic Meal Break Insertion:** Enforces lunch (12:30 PM – 2:30 PM) and dinner (7:30 PM – 9:30 PM) breaks based on active schedule state.
* **Hotel Suggestions & Filtering:** Ranks available hotels within the selected city based on user budget tier and rating-per-cost scores.
* **Interactive Budget Planner:** Dynamically calculates total projected expenditure (stay + entry fees + meals + transit) against user budget limits.
* **Algorithm Visualization Suite:** Interactive visual demonstration of Dijkstra's algorithm node relaxation and shortest path tree construction.

---

## 10. DSA Objectives & Conceptual Mapping

| Data Structure / Algorithm | Specific Role in System | Justification & Technical Mechanics |
| :--- | :--- | :--- |
| **Graph (Adjacency List)** | Represents Intra-City Road Topology | Vertices represent the city's hotel and attractions. Weighted edges represent direct road connections with edge weights as transit times (minutes) and distances (km). |
| **Dijkstra's Algorithm** | Shortest Path Support Between Non-Adjacent Nodes | Computes the true shortest path between two attractions in the *same* city when no direct road edge connects them directly in the graph topology. |
| **Priority Queue (Min/Max Heap)** | Dijkstra Node Selection & Ranking Engine | Powers Dijkstra's minimum distance node extraction in $O(\log V)$ time. Also used to rank hotels and attractions by rating-to-cost efficiency. |
| **Trie (Prefix Tree)** | Search & Autocomplete | Stores city and attraction names. Enables $O(L)$ prefix lookups ($L = \text{length of query}$) for responsive search inputs. |
| **Hash Table (Map / Record)** | $O(1)$ Entity Indexing | Maps city keys to their internal metadata, attraction lists, hotel options, and restaurant datasets for instant state retrieval. |
| **Greedy Heuristic** | Circular Ordering & Budget Allocation | 1. **Nearest-Neighbor:** Chooses the unvisited attraction closest to the current node.<br>2. **Time-Budget Split:** Fills a day's schedule up to the daily available time limit rather than using a static count.<br>3. **Cost Allocation:** Prioritizes high-value attractions/hotels within specified financial limits. |
| **Sorting (Custom Comparators)** | Display Order & Filtering | Sorts attractions by popularity, visit duration, or cost, and hotels by price tier for clean UI presentation. |

---

## 11. Research Objective
To evaluate intra-city itinerary quality, schedule feasibility, and financial adherence within a single destination under varying user parameters—specifically testing combinations of trip duration ($1–3$ days), total budget, daily start time, and starting hotel location.

---

## 12. Research Questions
* **RQ1:** How does overall itinerary quality (attractions visited vs. transit overhead) vary across different day counts ($1, 2, 3$ days) and budget thresholds within a single city?
* **RQ2:** How does a pure Greedy nearest-neighbor route compare against a Dijkstra-assisted Greedy route when some intra-city attractions lack direct road links?
* **RQ3:** How effective is a time-budget-based attraction selection strategy compared to a static fixed-attraction-count strategy in maximizing usable sightseeing time?
* **RQ4:** How does the mandatory insertion of fixed-window meal breaks affect the total number of attractions visited per day and daily return times?
* **RQ5:** How does itinerary optimization quality scale as the number of attractions in a city graph increases (comparing our 8 baseline cities' 4–6 nodes against an expanded node set)?

---

## 13. Expected Outcomes
1. A fully functional, responsive web application for Gujarat intra-city heritage tourism planning.
2. Verified algorithmic modules for Trie search, Graph modeling, Dijkstra pathfinding, Priority Queue ranking, and Greedy schedule generation.
3. Interactive UI components demonstrating real-time schedule generation, budget breakdown, and Dijkstra graph visualization.
4. Comprehensive documentation and evaluation metrics addressing all defined research questions.

---

## 14. Project Scope
* **Supported Destinations:** Exactly 8 fixed Gujarat heritage cities (Somnath, Dwarka, Rann of Kutch, Gir, Modhera, Champaner, Saputara, Ahmedabad).
* **Single-City Focus:** Exactly **one city** is planned per user session.
* **Intra-City Operations:** All routing, scheduling, hotel selection, and attraction visiting occur strictly **within** the boundaries of the chosen city.

---

## 15. Out of Scope
* **Inter-City Routing & Travel Planning:** Travel between different cities (e.g., Ahmedabad to Dwarka) is left entirely to the user and is **not** computed by the system.
* **Real-Time Booking Engines:** No live API integrations for booking hotels, flights, buses, or tickets.
* **Live GPS Navigation:** No real-time turn-by-turn tracking or live traffic updates.

---

## 16. Assumptions
1. Intra-city road distances and average travel speeds are pre-computed based on standard local traffic conditions.
2. Attraction opening hours and estimated visit durations are representative of standard tourist visits.
3. The user begins each day's tour from their selected hotel and returns to the same hotel at the end of the day.
4. Meal breaks (lunch and dinner) require a fixed 60-minute duration during standard dining windows.

---

## 17. Limitations
* **Greedy Heuristic Bound:** The intra-city circular route generator uses a Greedy nearest-neighbor heuristic, which is computationally efficient ($O(V^2)$ or $O(V \log V)$) but does not guarantee a mathematically optimal Travelling Salesperson Problem (TSP) solution.
* **Static Graph Data:** Road network graphs, entry fees, and hotel rates rely on curated static data structures rather than real-time dynamic web scraping.

---

## 18. Future Scope
* **Inter-City Corridor Planning:** Expanding the graph network to connect multiple Gujarat cities into a unified multi-city state-wide itinerary once a full regional highway dataset is constructed.
* **Dynamic Traffic Integration:** Integrating live maps APIs (e.g., Google Maps API) for real-time intra-city congestion adjustments.
* **TSP Exact Solvers:** Implementing dynamic programming or branch-and-bound algorithms for optimal TSP solving on small intra-city node sets ($V \le 15$).

---

## 19. Success Criteria
1. **Functional Correctness:** 100% successful generation of valid, circular intra-city itineraries without schedule overlapping or budget overruns.
2. **Algorithmic Accuracy:** Correct execution of Trie lookups, Dijkstra shortest path calculations, Priority Queue heap operations, and Hash Table indexing.
3. **Execution Speed:** Itinerary generation completing in $< 100\text{ ms}$ on the frontend client.
4. **User Experience:** Clean, intuitive UI displaying schedules, arrival/departure timestamps, meal breaks, budget charts, and visual graph algorithms.

---

## 20. Expected Demonstration Flow (For Evaluation)
During the evaluation presentation, the system demonstration will proceed through the following steps:
1. **City Search & Selection:** Demonstrate Trie autocomplete by typing a prefix (e.g., `"Ahme"` or `"Som"`), selecting the city, and retrieving metadata via Hash Table lookup.
2. **Parameters Configuration:** Set trip duration (e.g., 2 Days), total budget (e.g., ₹15,000), starting hotel, and daily start time (e.g., 09:00 AM).
3. **Itinerary Generation & Review:** Generate and inspect the circular day-by-day schedule showing:
   * Start at chosen hotel $\rightarrow$ travel to Attraction 1 $\rightarrow$ visit duration $\rightarrow$ automated lunch break $\rightarrow$ Attraction 2 $\rightarrow$ return to hotel.
   * Real arrival/departure timestamps for each activity.
4. **Budget Breakdown Analysis:** View itemized expenses across accommodation, attraction entry fees, food/meals, and estimated intra-city transport.
5. **Algorithm Visualization:** Switch to the **Dijkstra Visualizer** tab to demonstrate node relaxation, priority queue operations, and shortest path tree construction step-by-step.
