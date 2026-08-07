import { afterEach, describe, expect, it } from "vitest";
import {
  addFavouriteSlugs,
  getFavouriteSlugs,
  removeFavouriteSlug,
  setFavouriteSlugs,
  toggleFavouriteSlug,
} from "@/lib/favourites/storage";

describe("favourites storage", () => {
  afterEach(() => {
    setFavouriteSlugs([]);
  });

  it("toggles and bulk-adds unique slugs", () => {
    expect(toggleFavouriteSlug("bonjou")).toEqual(["bonjou"]);
    expect(addFavouriteSlugs(["bonjou", "mesi", "souple"])).toEqual([
      "bonjou",
      "mesi",
      "souple",
    ]);
    expect(removeFavouriteSlug("mesi")).toEqual(["bonjou", "souple"]);
    expect(getFavouriteSlugs()).toEqual(["bonjou", "souple"]);
  });
});
