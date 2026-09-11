class TrieNode {
  public children: Map<string, TrieNode> = new Map();
  public isEndOfWord: boolean = false;
  public values: string[] = []; // List of values (ids) associated with this prefix
}

export class Trie {
  private root: TrieNode = new TrieNode();

  public insert(word: string, value: string): void {
    const clean = word.trim().toLowerCase();
    if (!clean) return;

    // To support substring search via Suffix Trie, insert all suffixes
    for (let i = 0; i < clean.length; i++) {
      this.insertSuffix(clean.substring(i), value);
    }
  }

  private insertSuffix(suffix: string, value: string): void {
    let current = this.root;
    for (const char of suffix) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
      if (!current.values.includes(value)) {
        current.values.push(value);
      }
    }
    current.isEndOfWord = true;
  }

  public searchPrefix(prefix: string): string[] {
    let current = this.root;
    const cleanPrefix = prefix.trim().toLowerCase();

    for (const char of cleanPrefix) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }

    // Since we propagate values to all prefix nodes, current.values contains all matches
    return current.values;
  }

  /**
   * Performs typo-tolerant fuzzy search over the Trie using dynamic programming
   * with Damerau-Levenshtein distance (insertions, deletions, substitutions, and transpositions).
   *
   * Subtrees where the minimum edit distance in the row exceeds maxDistance are pruned in O(1).
   *
   * @param query The search query string
   * @param maxDistance Maximum allowed edit distance (default 2)
   * @returns Array of unique entity IDs matching within maxDistance edits
   */
  public searchFuzzy(query: string, maxDistance: number = 2): string[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const results = new Set<string>();
    const M = cleanQuery.length;

    // Initial DP row for distance from empty prefix to cleanQuery prefixes: [0, 1, 2, ..., M]
    const initialRow: number[] = new Array(M + 1);
    for (let i = 0; i <= M; i++) {
      initialRow[i] = i;
    }

    // Explore each root child branch
    for (const [char, childNode] of this.root.children.entries()) {
      this.searchFuzzyRecursive(
        childNode,
        char,
        null, // parentChar
        cleanQuery,
        initialRow,
        null, // grandparentRow
        maxDistance,
        results
      );
    }

    return Array.from(results);
  }

  private searchFuzzyRecursive(
    node: TrieNode,
    char: string,
    parentChar: string | null,
    query: string,
    previousRow: number[],
    grandparentRow: number[] | null,
    maxDistance: number,
    results: Set<string>
  ): void {
    const M = query.length;
    const currentRow: number[] = new Array(M + 1);
    currentRow[0] = previousRow[0] + 1;

    for (let j = 1; j <= M; j++) {
      const cost = query[j - 1] === char ? 0 : 1;
      const insertCost = currentRow[j - 1] + 1;
      const deleteCost = previousRow[j] + 1;
      const replaceCost = previousRow[j - 1] + cost;

      let minCost = Math.min(insertCost, deleteCost, replaceCost);

      // Damerau transposition check (e.g. "an" <-> "na" in "somanth" vs "somnath")
      if (
        parentChar !== null &&
        j > 1 &&
        char === query[j - 2] &&
        parentChar === query[j - 1] &&
        grandparentRow !== null
      ) {
        const transpositionCost = grandparentRow[j - 2] + 1;
        if (transpositionCost < minCost) {
          minCost = transpositionCost;
        }
      }

      currentRow[j] = minCost;
    }

    // Match criteria: if current prefix is within maxDistance of full query
    if (currentRow[M] <= maxDistance) {
      for (const val of node.values) {
        results.add(val);
      }
    }

    // Branch pruning: only continue exploring children if minimum value in currentRow <= maxDistance
    let minInRow = Infinity;
    for (let j = 0; j <= M; j++) {
      if (currentRow[j] < minInRow) {
        minInRow = currentRow[j];
      }
    }

    if (minInRow <= maxDistance) {
      for (const [nextChar, nextNode] of node.children.entries()) {
        this.searchFuzzyRecursive(
          nextNode,
          nextChar,
          char, // current char becomes parentChar
          query,
          currentRow,
          previousRow, // previousRow becomes grandparentRow
          maxDistance,
          results
        );
      }
    }
  }
}
