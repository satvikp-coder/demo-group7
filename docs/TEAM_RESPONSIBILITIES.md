# Team Responsibilities & Task Assignments

**Course:** CSC210 Data Structures & Algorithms — Ahmedabad University  
**Group:** Group 07  
**Project:** Heritage Tourism Planner for Gujarat

---

## 👥 Module & Deliverable Ownership Matrix

| Workstream / Deliverable | Target Deadline | Primary Owner | Secondary Reviewer | Deliverable Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI/UX & Verification** | Completed | Lead Developer | UI/UX Reviewer | React 19 + Vite 6 + Stepwell design system and interactive components |
| **DSA Engine Specification** | Completed | DSA Architect | Lead Developer | Master DSA specifications for Graph, Dijkstra, Min-Heap, Greedy, Trie, Hash Table |
| **Database Relational Design** | Completed | Backend Architect | DSA Architect | 3NF PostgreSQL DDL, indexing strategy, and graph hydration query pipeline |
| **Phase 1 Data: Somnath & Dwarka Routes** | Immediate | Data Lead (Somnath/Dwarka) | Backend Architect | Collection of intra-city `routes.csv` road distance and travel time data for Somnath and Dwarka |
| **Phase 2 Data: Urban & Heritage Cities** | Next Sprint | Data Lead (Ahmedabad/Modhera) | Data Quality Lead | `attractions.csv`, `hotels.csv`, and `routes.csv` for Ahmedabad, Modhera, and Champaner |
| **Phase 2 Data: Eco & Wildlife Cities** | Next Sprint | Data Lead (Gir/Kutch/Saputara) | Data Quality Lead | `attractions.csv`, `hotels.csv`, and `routes.csv` for Gir, Rann of Kutch, and Saputara |
| **Phase 3 Data: Restaurants Dataset** | Final Sprint | Restaurant Data Lead | Lead Developer | `restaurants.csv` across all 8 cities for automated meal-break schedule insertion |
| **Express Backend & API Integration** | Upcoming | Backend Architect | Lead Developer | Express.js REST API endpoints, JWT auth, and PostgreSQL database connection pool |

---

## 📋 Data Collection Protocols & Compliance

1. **Validation Protocol:** All collected CSV entries must be validated against the schema rules in `docs/foundation/07_Data_Collection_Plan.md`.
2. **Provenance Logging:** Data collectors must log all source URLs and collection timestamps in `frontend/src/data/CHANGELOG.md`.
3. **No Unverified Data:** Placeholder data must be explicitly flagged with `UNVERIFIED` tags until primary source confirmation is complete.
