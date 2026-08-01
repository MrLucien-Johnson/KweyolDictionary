import Link from "next/link";

type Option = { value: string; label: string };

type DictionaryFiltersProps = {
  current: {
    q?: string;
    letter?: string;
    partOfSpeech?: string;
    category?: string;
    difficulty?: string;
    hasAudio?: boolean;
    hasExamples?: boolean;
    hasCulturalNotes?: boolean;
    featured?: boolean;
    recent?: boolean;
  };
  partsOfSpeech: string[];
  categories: Option[];
};

function buildHref(
  current: DictionaryFiltersProps["current"],
  patch: Partial<DictionaryFiltersProps["current"]>,
) {
  const merged = { ...current, ...patch };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.letter) params.set("letter", merged.letter);
  if (merged.partOfSpeech) params.set("pos", merged.partOfSpeech);
  if (merged.category) params.set("category", merged.category);
  if (merged.difficulty) params.set("difficulty", merged.difficulty);
  if (merged.hasAudio) params.set("audio", "1");
  if (merged.hasExamples) params.set("examples", "1");
  if (merged.hasCulturalNotes) params.set("cultural", "1");
  if (merged.featured) params.set("featured", "1");
  if (merged.recent) params.set("recent", "1");
  const query = params.toString();
  return query ? `/dictionary?${query}` : "/dictionary";
}

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
      <div className="dict-filters__row">
        <label className="dict-filters__label" htmlFor="dict-q">
          Search
        </label>
        <input
          id="dict-q"
          name="q"
          type="search"
          defaultValue={current.q ?? ""}
          placeholder="Kwéyòl or English"
          className="dict-filters__input"
        />
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
      <fieldset className="dict-filters__checks">
        <legend className="sr-only">Content filters</legend>
        <label>
          <input type="checkbox" name="audio" value="1" defaultChecked={current.hasAudio} />
          With audio
        </label>
        <label>
          <input
            type="checkbox"
            name="examples"
            value="1"
            defaultChecked={current.hasExamples}
          />
          With examples
        </label>
        <label>
          <input
            type="checkbox"
            name="cultural"
            value="1"
            defaultChecked={current.hasCulturalNotes}
          />
          With cultural notes
        </label>
        <label>
          <input
            type="checkbox"
            name="featured"
            value="1"
            defaultChecked={current.featured}
          />
          Featured
        </label>
        <label>
          <input type="checkbox" name="recent" value="1" defaultChecked={current.recent} />
          Recently added
        </label>
      </fieldset>
      <div className="dict-filters__actions">
        <button type="submit" className="btn btn--primary btn--md">
          Apply filters
        </button>
        <Link href={buildHref({}, {})} className="btn btn--soft btn--md">
          Clear
        </Link>
      </div>
    </form>
  );
}
