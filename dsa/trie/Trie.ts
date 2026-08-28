class TrieNode {
  public children: Map<string, TrieNode> = new Map();
  public isEndOfWord: boolean = false;
  public values: string[] = []; // List of values (ids) associated with this prefix
}

export class Trie {
  private root: TrieNode = new TrieNode();

  public insert(text: string, value: string): void {
    const clean = text.trim().toLowerCase();
    if (!clean) return;

    // Tokenize into distinct words/phrases (supports Unicode/Gujarati/Hindi)
    const words = clean
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0);

    for (const word of words) {
      this.insertWord(word, value);
    }
  }

  public insertWord(word: string, value: string): void {
    let current = this.root;
    for (const char of word) {
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
    if (!cleanPrefix) return [];

    for (const char of cleanPrefix) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }

    return current.values;
  }
}

