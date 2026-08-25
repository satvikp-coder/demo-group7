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
}
