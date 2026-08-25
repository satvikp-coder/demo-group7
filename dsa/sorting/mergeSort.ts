export function mergeSort<T>(array: T[], compare: (a: T, b: T) => number): T[] {
  if (array.length <= 1) {
    return [...array];
  }

  const mid = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, mid), compare);
  const right = mergeSort(array.slice(mid), compare);

  return merge(left, right, compare);
}

function merge<T>(left: T[], right: T[], compare: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  let l = 0;
  let r = 0;

  while (l < left.length && r < right.length) {
    if (compare(left[l], right[r]) <= 0) {
      result.push(left[l]);
      l++;
    } else {
      result.push(right[r]);
      r++;
    }
  }

  while (l < left.length) {
    result.push(left[l]);
    l++;
  }

  while (r < right.length) {
    result.push(right[r]);
    r++;
  }

  return result;
}
