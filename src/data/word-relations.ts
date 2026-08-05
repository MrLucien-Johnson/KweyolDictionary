/**
 * Curated beginner word relationships for search and word pages.
 * Pairs are undirected; both directions are indexed at runtime.
 */

export type WordRelationKind =
  | "antonym"
  | "synonym"
  | "variant"
  | "related";

export const RELATION_LABELS: Record<WordRelationKind, string> = {
  antonym: "Antonym — opposite meaning",
  synonym: "Synonym — similar meaning",
  variant: "Spelling variant",
  related: "Related word",
};

export type WordRelationPair = {
  a: string;
  b: string;
  kind: WordRelationKind;
};

/** Explicit slug pairs from the published beginner catalog. */
export const WORD_RELATION_PAIRS: WordRelationPair[] = [
  // Antonyms
  { a: "wi-yes", b: "non-no", kind: "antonym" },
  { a: "gwo", b: "piti", kind: "antonym" },
  { a: "bon", b: "move", kind: "antonym" },
  { a: "cho", b: "fwet", kind: "antonym" },
  { a: "ouve", b: "feme", kind: "antonym" },
  { a: "devan", b: "deye", kind: "antonym" },
  { a: "jou", b: "lannuit", kind: "antonym" },
  { a: "fasil", b: "difisil", kind: "antonym" },
  { a: "byen", b: "mal", kind: "antonym" },
  { a: "ale", b: "vini", kind: "antonym" },
  { a: "kontan", b: "tris", kind: "antonym" },
  { a: "nonm", b: "fanm", kind: "antonym" },
  { a: "garson", b: "fi", kind: "antonym" },
  { a: "papa", b: "maman", kind: "antonym" },
  { a: "nwa", b: "blan", kind: "antonym" },
  { a: "vit", b: "lent", kind: "antonym" },
  { a: "nouvo", b: "vye", kind: "antonym" },
  { a: "toujou", b: "jame", kind: "antonym" },
  { a: "achtre", b: "vann", kind: "antonym" },
  { a: "bonjou", b: "bonswa", kind: "antonym" },
  { a: "maten", b: "swe", kind: "antonym" },
  { a: "dous", b: "sel", kind: "antonym" },

  // Near-synonyms / closely related senses
  { a: "bon", b: "byen", kind: "synonym" },
  { a: "kontan", b: "byen", kind: "related" },
  { a: "tris", b: "mal", kind: "related" },
  { a: "fache", b: "tris", kind: "related" },
  { a: "pe", b: "tris", kind: "related" },
  { a: "gwo", b: "fo", kind: "related" },
  { a: "piti", b: "lent", kind: "related" },
  { a: "cho", b: "soley", kind: "related" },
  { a: "fwet", b: "lapli", kind: "related" },
  { a: "jou", b: "maten", kind: "related" },
  { a: "lannuit", b: "swe", kind: "related" },
  { a: "jodi-a", b: "ye", kind: "related" },
  { a: "manje", b: "bwe", kind: "related" },
  { a: "li-read", b: "ekwi", kind: "related" },
  { a: "pwofese", b: "elev", kind: "related" },
  { a: "lekol", b: "klas", kind: "related" },

  // Spelling / sense variants already linked as homonyms stay separate;
  // these are deliberate spelling variants learners often confuse.
  { a: "lekol", b: "lekol-variant", kind: "variant" },
];

export type IndexedRelation = {
  slug: string;
  kind: WordRelationKind;
  label: string;
};

function buildRelationIndex(): Map<string, IndexedRelation[]> {
  const index = new Map<string, IndexedRelation[]>();

  function add(from: string, to: string, kind: WordRelationKind) {
    const list = index.get(from) ?? [];
    if (list.some((item) => item.slug === to && item.kind === kind)) return;
    list.push({ slug: to, kind, label: RELATION_LABELS[kind] });
    index.set(from, list);
  }

  for (const pair of WORD_RELATION_PAIRS) {
    add(pair.a, pair.b, pair.kind);
    add(pair.b, pair.a, pair.kind);
  }

  return index;
}

const RELATION_INDEX = buildRelationIndex();

export function getRelationsForSlug(slug: string): IndexedRelation[] {
  return RELATION_INDEX.get(slug) ?? [];
}

export function listRelatedSlugs(slug: string, kind?: WordRelationKind): string[] {
  const rows = getRelationsForSlug(slug);
  return rows
    .filter((row) => (kind ? row.kind === kind : true))
    .map((row) => row.slug);
}
