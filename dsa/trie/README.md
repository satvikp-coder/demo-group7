# Trie Autocomplete Module (`dsa/trie/`)

**Implementation:** `Trie.ts`  
**Description:** Unified Prefix Trie ($O(L+k)$ search time) indexing city names and attraction names for real-time search autocomplete.

Runtime API search uses prefix matching; `Trie.ts` also preserves Levenshtein fuzzy
matching for standalone tests and academic evaluation.
