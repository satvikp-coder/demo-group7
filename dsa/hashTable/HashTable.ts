export class HashTable<K, V> {
  private buckets: [K, V][][];
  private numBuckets: number;
  private count: number = 0;

  constructor(numBuckets: number = 64) {
    this.numBuckets = numBuckets;
    this.buckets = new Array(numBuckets).fill(null).map(() => []);
  }

  private hash(key: K): number {
    const str = String(key);
    let hashVal = 0;
    for (let i = 0; i < str.length; i++) {
      hashVal = (hashVal * 31 + str.charCodeAt(i)) % this.numBuckets;
    }
    return hashVal;
  }

  public set(key: K, value: V): void {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i][1] = value;
        return;
      }
    }

    bucket.push([key, value]);
    this.count++;
  }

  public get(key: K): V | undefined {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        return bucket[i][1];
      }
    }
    return undefined;
  }

  public has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  public delete(key: K): boolean {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        this.count--;
        return true;
      }
    }
    return false;
  }

  public size(): number {
    return this.count;
  }
}
