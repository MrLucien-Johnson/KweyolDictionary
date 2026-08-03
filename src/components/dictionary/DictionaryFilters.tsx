import Link from "next/link";
import {
  buildDictionaryHref,
  type DictionaryFilterState,
} from "@/lib/dictionary/filter-url";

type Option = { value: string; label: string };

type DictionaryFiltersProps = {
  current: DictionaryFilterState;
  partsOfSpeech: string[];
  categories: Option[];
};

/** Legacy get-form filters; DictionaryBrowser now owns the live filter UX. */
export function DictionaryFilters({
  current,
  partsOfSpeech,
  categories,
}: DictionaryFiltersProps) {
  return (
    <form className="dict-filters" method="get" action="/dictionary">
      {current.letter ? (
        <input type="hidden" name="letter" value={current.letter} />
      ) : null}
      <div className="dict-filters__search">
        <label className="sr-only" htmlFor="dict-q-legacy">
          Search
        </label>
        <input
          id="dict-q-legacy"
          name="q"
          type="search"
          defaultValue={current.q ?? ""}
          placeholder="Kwéyòl or English…"
          className="dict-filters__input dict-filters__input--search"
        />
        <button type="submit" className="btn btn--primary btn--md">
          Search
        </button>
      </div>
      <div className="dict-filters__grid">
        <label>
          Part of speech
          <select name="pos" defaultValue={current.partOfSpeech ?? ""}>
            <option value="">Any</option>
            {partsOfSpeech.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={current.category ?? ""}>
            <option value="">Any</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Difficulty
          <select name="difficulty" defaultValue={current.difficulty ?? ""}>
            <option value="">Any</option>
            <option value="BEGINNER">Beginner</option>
            <option value="ELEMENTARY">Elementary</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </label>
      </div>
      <div className="dict-filters__actions">
        <button type="submit" className="btn btn--primary btn--md">
          Apply filters
        </button>
        <Link href={buildDictionaryHref({})} className="btn btn--soft btn--md">
          Clear
        </Link>
      </div>
    </form>
  );
}
