import { Trie } from "../../../dsa/trie/Trie";
import { Destination, GUJARAT_DESTINATIONS } from "../data/destinations";

/**
 * Normalizes text for clean insertion and query processing
 * (collapses excessive internal whitespace, trims outer spaces).
 */
export function normalizeSearchTerm(term: string): string {
  return term.trim().replace(/\s+/g, " ");
}

/**
 * Builds a Suffix/Prefix Trie index mapping searchable destination and attraction fields
 * to their respective destination IDs.
 *
 * Indexed fields per destination:
 *  - Primary name (English)
 *  - Alternative language names (Gujarati, Hindi)
 *  - District & Location
 *  - Monuments / Attractions (English, Gujarati, Hindi)
 *  - Nearby attractions (English, Gujarati, Hindi)
 */
export function buildDestinationTrie(destinations: Destination[]): Trie {
  const trie = new Trie();

  for (const dest of destinations) {
    const destId = dest.id;

    // 1. Destination names
    if (dest.name) {
      trie.insert(normalizeSearchTerm(dest.name), destId);
    }
    if (dest.gujaratiName) {
      trie.insert(normalizeSearchTerm(dest.gujaratiName), destId);
    }
    if (dest.hindiName) {
      trie.insert(normalizeSearchTerm(dest.hindiName), destId);
    }

    // 2. District & location
    if (dest.district) {
      trie.insert(normalizeSearchTerm(dest.district), destId);
    }
    if (dest.location) {
      trie.insert(normalizeSearchTerm(dest.location), destId);
    }

    // 3. Attractions within this destination
    if (Array.isArray(dest.attractions)) {
      for (const attr of dest.attractions) {
        if (attr.name) {
          trie.insert(normalizeSearchTerm(attr.name), destId);
        }
        if (attr.gujaratiName) {
          trie.insert(normalizeSearchTerm(attr.gujaratiName), destId);
        }
        if (attr.hindiName) {
          trie.insert(normalizeSearchTerm(attr.hindiName), destId);
        }
      }
    }

    // 4. Nearby attractions
    if (Array.isArray(dest.nearbyAttractions)) {
      for (const nearby of dest.nearbyAttractions) {
        if (nearby.name) {
          trie.insert(normalizeSearchTerm(nearby.name), destId);
        }
        if (nearby.gujaratiName) {
          trie.insert(normalizeSearchTerm(nearby.gujaratiName), destId);
        }
        if (nearby.hindiName) {
          trie.insert(normalizeSearchTerm(nearby.hindiName), destId);
        }
      }
    }
  }

  return trie;
}

// Module-level cache so the Trie is built once from GUJARAT_DESTINATIONS
let cachedDestinationTrie: Trie | null = null;

/**
 * Returns the memoized destination Trie instance, building it on first access.
 */
export function getDestinationTrie(destinations: Destination[] = GUJARAT_DESTINATIONS): Trie {
  if (!cachedDestinationTrie) {
    cachedDestinationTrie = buildDestinationTrie(destinations);
  }
  return cachedDestinationTrie;
}

/**
 * Explicitly clears the cached Trie (useful for tests or dynamic dataset reloads).
 */
export function resetDestinationTrie(): void {
  cachedDestinationTrie = null;
}

/**
 * Queries the Trie with a user-entered search string.
 *
 * @param query Raw user search input
 * @param trie The Trie index to query (defaults to cached index)
 * @param allowFuzzy Whether to perform typo-tolerant fuzzy search fallback if exact matches are 0
 * @returns A Set of matching destination IDs, or null if the query is empty (no text filter).
 */
export function searchDestinationsWithTrie(
  query: string,
  trie: Trie = getDestinationTrie(),
  allowFuzzy: boolean = true
): Set<string> | null {
  const normalized = normalizeSearchTerm(query);
  if (!normalized) {
    // Empty search query: no constraint, all destinations should be shown
    return null;
  }

  // 1. Exact prefix and substring search (fast O(L))
  const exactMatches = trie.searchPrefix(normalized);
  if (exactMatches.length > 0) {
    return new Set<string>(exactMatches);
  }

  // 2. Fuzzy Levenshtein fallback for queries of length >= 4 if no exact match exists
  if (allowFuzzy && normalized.length >= 4) {
    // For 4-letter queries, allow 1 edit; for >= 5 letters, allow up to 2 edits (including transpositions)
    const maxDistance = normalized.length <= 4 ? 1 : 2;
    const fuzzyMatches = trie.searchFuzzy(normalized, maxDistance);
    if (fuzzyMatches.length > 0) {
      return new Set<string>(fuzzyMatches);
    }
  }

  // No matches found
  return new Set<string>();
}

