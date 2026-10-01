import { mergeSort } from "../../dsa/sorting/mergeSort.ts";

function byNameAndId(a, b) {
  return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
}

export function sortHotels(hotels, sort = "price") {
  if (!["price", "rating", "name", "value"].includes(sort)) throw new Error("Unsupported hotel sort");
  return mergeSort(hotels, (a, b) => {
    if (sort === "price") return Number(a.price_per_night) - Number(b.price_per_night) || byNameAndId(a, b);
    if (sort === "rating" || sort === "value") {
      const field = sort === "value" ? "value_score" : "rating";
      // NULL means unknown, not a fabricated zero-star rating.
      if (a[field] == null && b[field] != null) return 1;
      if (a[field] != null && b[field] == null) return -1;
      if (a[field] != null && b[field] != null) {
        const difference = Number(b[field]) - Number(a[field]);
        if (difference) return difference;
      }
    }
    return byNameAndId(a, b);
  });
}
