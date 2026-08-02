import type { SeedEntry } from "@/data/types";
import { slugifyKweyol } from "@/lib/search/normalize";

/**
 * Beginner product-density curriculum for Dominican Kwéyòl.
 *
 * Status: APPROVED for public product journeys so the dictionary feels useful.
 * These entries remain open to community and linguist correction and are not a
 * final linguistic authority. Orthography and everyday usage vary by community.
 */

type ChildCat =
  | "animals"
  | "colours"
  | "numbers"
  | "family"
  | "food"
  | "fruit"
  | "vegetables"
  | "body-parts"
  | "clothes"
  | "school"
  | "toys"
  | "home"
  | "weather"
  | "nature"
  | "transport"
  | "feelings"
  | "actions"
  | "music"
  | "carnival"
  | "dominica"
  | "sea-life"
  | "farm-life";

type Row = {
  slug?: string;
  k: string;
  e: string;
  pos?: string;
  p?: string;
  cat: string;
  child?: ChildCat;
  alt?: string;
  feat?: boolean;
  cultural?: string;
  usage?: string;
  exK?: string;
  exE?: string;
  related?: string[];
  age?: "EARLY_4_6" | "GROWING_7_9" | "CONFIDENT_10_12";
};

const SOURCE_NOTE =
  "Provisional beginner curriculum — open for Dominican community/linguist correction; provided as a learning aid, not a final linguistic authority.";

const VARIATION_NOTE =
  "Dominican Kwéyòl varies by community, generation and speaker. Spellings and everyday use can differ.";

function guessPos(english: string, explicit?: string): string {
  if (explicit) return explicit;
  if (/^(to |be |have |go |come |see |eat |drink |play |run |walk |sleep |speak |listen |read |write |help |want |like |love |know |make |take |give |look |live |work |cook |sing |dance )/i.test(
    english,
  ) || /^(to )/.test(english)) {
    return "verb";
  }
  return "noun";
}

function capitalize(value: string): string {
  if (!value) return value;
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function bareEnglish(english: string): string {
  return english.replace(/^to\s+/i, "").replace(/\s*\/.*$/, "").trim();
}

/** Short learning sentences when a row has no handcrafted example. */
function defaultExample(
  word: string,
  english: string,
  pos: string,
): { exK: string; exE: string } {
  const bare = bareEnglish(english);
  switch (pos) {
    case "verb":
      return { exK: `Mwen ka ${word}.`, exE: `I ${bare}.` };
    case "noun":
      return { exK: `Sa sé yon ${word}.`, exE: `That is a ${bare}.` };
    case "adjective":
      return { exK: `Li ${word}.`, exE: `It is ${bare}.` };
    case "numeral":
      return { exK: `Mwen ni ${word}.`, exE: `I have ${bare}.` };
    case "pronoun":
      return {
        exK: `${capitalize(word)} la.`,
        exE: `${capitalize(bare)}.`,
      };
    case "interjection":
      return {
        exK: `${capitalize(word)}!`,
        exE: `${capitalize(bare)}!`,
      };
    case "phrase":
      return {
        exK: `${capitalize(word)}.`,
        exE: `${capitalize(bare)}.`,
      };
    case "preposition":
      return { exK: `I ${word} tab-la.`, exE: `It is ${bare} the table.` };
    case "adverb":
      return { exK: `Fè y ${word}.`, exE: `Do it ${bare}.` };
    case "particle":
      return {
        exK: `Mwen ${word} palé.`,
        exE: `I am speaking (using “${word}”).`,
      };
    default:
      return { exK: `Sa sé ${word}.`, exE: `That is ${bare}.` };
  }
}

function buildEntry(row: Row): SeedEntry {
  const slug = row.slug ?? slugifyKweyol(row.k);
  const pos = guessPos(row.e, row.pos);
  const pronunciation = row.p ?? row.k;
  const simple = `${capitalize(row.e)}.`;
  const fallback = defaultExample(row.k, row.e, pos);
  const exampleKweyol = row.exK ?? fallback.exK;
  const exampleEnglish = row.exE ?? fallback.exE;

  return {
    slug,
    kweyolWord: row.k,
    englishTranslation: row.e,
    alternativeEnglish: row.alt,
    partOfSpeech: pos,
    pronunciationGuide: pronunciation,
    simpleDefinition: simple,
    detailedDefinition: `${simple} (${SOURCE_NOTE})`,
    culturalNotes: row.cultural
      ? `${row.cultural} ${VARIATION_NOTE}`
      : VARIATION_NOTE,
    usageNotes: row.usage,
    topicCategory: row.cat,
    difficulty: "BEGINNER",
    reviewStatus: "APPROVED",
    isFeatured: Boolean(row.feat),
    relatedSlugs: row.related,
    example: {
      kweyolText: exampleKweyol,
      englishText: exampleEnglish,
    },
    child: row.child
      ? {
          simpleMeaning: simple,
          shortExampleKweyol: exampleKweyol,
          shortExampleEnglish: exampleEnglish,
          childCategoryKey: row.child,
          ageBand: row.age ?? "EARLY_4_6",
        }
      : undefined,
  };
}

const ROWS: Row[] = [
  // Greetings & conversation
  { k: "bonjou", e: "good morning", pos: "interjection", p: "bon-zhoo", cat: "greetings", child: "family", feat: true, cultural: "A common morning greeting in Dominica.", exK: "Bonjou, kouman ou yé?", exE: "Good morning, how are you?" },
  { k: "bonswa", e: "good evening", pos: "interjection", p: "bon-swa", cat: "greetings", child: "family", feat: true, exK: "Bonswa, tout moun.", exE: "Good evening, everyone." },
  { k: "mèsi", e: "thank you", pos: "interjection", p: "meh-see", cat: "everyday-conversation", child: "feelings", feat: true, exK: "Mèsi anpil.", exE: "Thank you very much." },
  { k: "souplé", e: "please", pos: "adverb", p: "soo-play", cat: "everyday-conversation", child: "feelings", exK: "Édé mwen, souplé.", exE: "Help me, please." },
  { slug: "wi-yes", k: "wi", e: "yes", pos: "interjection", p: "wee", cat: "everyday-conversation", child: "feelings", cultural: "Agreement particle (“yes”). Different from wi “to laugh”.", usage: "Homonym: see also wi (to laugh).", exK: "Wi, mwen ka vini.", exE: "Yes, I am coming.", related: ["wi-laugh"] },
  { slug: "non-no", k: "non", e: "no", pos: "interjection", p: "non", cat: "everyday-conversation", child: "feelings", cultural: "Negation (“no”). Different from non “name”.", usage: "Homonym: see also non (name).", exK: "Non, mèsi.", exE: "No, thank you.", related: ["non-name"] },
  { k: "orevwa", e: "goodbye", pos: "interjection", p: "o-rev-wa", cat: "greetings", child: "family", exK: "Orevwa!", exE: "Goodbye!" },
  { k: "bye", e: "bye", pos: "interjection", p: "bye", cat: "greetings", child: "family" },
  { k: "kouman ou yé", e: "how are you", pos: "phrase", p: "koo-man oo yay", cat: "greetings", child: "family", exK: "Kouman ou yé?", exE: "How are you?" },
  { k: "sa ka fèt", e: "what's up / what's happening", pos: "phrase", p: "sa ka fet", cat: "greetings", cultural: "A friendly informal greeting used in conversation." },
  { k: "pa pi mal", e: "not too bad", pos: "phrase", p: "pa pee mal", cat: "everyday-conversation" },
  { k: "tout an form", e: "all good / fine", pos: "phrase", p: "toot an form", cat: "everyday-conversation" },
  { k: "padon", e: "sorry / excuse me", pos: "interjection", p: "pa-don", cat: "everyday-conversation", child: "feelings" },
  { k: "konné", e: "to know", pos: "verb", p: "ko-nay", cat: "verbs", child: "actions", age: "GROWING_7_9" },
  { k: "vlé", e: "to want", pos: "verb", p: "vlay", cat: "verbs", child: "actions" },
  { k: "enmé", e: "to love / like", pos: "verb", p: "en-may", cat: "emotions", child: "feelings", feat: true, exK: "Mwen enmé Dominik.", exE: "I love Dominica." },
  { k: "édé", e: "to help", pos: "verb", p: "ay-day", cat: "verbs", child: "actions" },
  { k: "palé", e: "to speak", pos: "verb", p: "pa-lay", cat: "verbs", child: "actions", age: "GROWING_7_9" },
  { k: "koutré", e: "to listen", pos: "verb", p: "koo-tray", cat: "verbs", child: "actions" },
  { k: "gadé", e: "to look / watch", pos: "verb", p: "ga-day", cat: "verbs", child: "actions" },
  { k: "vini", e: "to come", pos: "verb", p: "vee-nee", cat: "verbs", child: "actions" },
  { k: "alé", e: "to go", pos: "verb", p: "a-lay", cat: "verbs", child: "actions" },
  { k: "fè", e: "to do / make", pos: "verb", p: "feh", cat: "verbs", child: "actions" },
  { k: "ni", e: "to have", pos: "verb", p: "nee", cat: "verbs", child: "actions", age: "GROWING_7_9" },
  { slug: "se-be", k: "sé", e: "to be / it is", pos: "verb", p: "say", cat: "verbs", child: "actions", age: "GROWING_7_9", cultural: "Copula / “it is” sense. Different from sé “salt”.", usage: "Homonym: see also sé (salt).", exK: "Sa sé yon kay.", exE: "That is a house.", related: ["se-salt"] },
  { k: "ka", e: "ongoing action marker", pos: "particle", p: "ka", cat: "everyday-conversation", cultural: "Often marks ongoing or habitual action in Kwéyòl sentences." },

  // Family
  { k: "maman", e: "mother", pos: "noun", p: "ma-man", cat: "family", child: "family", feat: true, exK: "Maman mwen ka travay.", exE: "My mother is working." },
  { k: "papa", e: "father", pos: "noun", p: "pa-pa", cat: "family", child: "family", feat: true, exK: "Papa mwen ka palé Kwéyòl.", exE: "My father speaks Kwéyòl." },
  { k: "fanmi", e: "family", pos: "noun", p: "fan-mee", cat: "family", child: "family" },
  { k: "frè", e: "brother", pos: "noun", p: "freh", cat: "family", child: "family" },
  { k: "sè", e: "sister", pos: "noun", p: "seh", cat: "family", child: "family" },
  { k: "timoun", e: "child", pos: "noun", p: "tee-moon", cat: "family", child: "family" },
  { k: "granmoun", e: "adult / elder", pos: "noun", p: "gran-moon", cat: "family", child: "family", age: "GROWING_7_9" },
  { k: "nou", e: "we / us / our", pos: "pronoun", p: "noo", cat: "pronouns", child: "family", age: "GROWING_7_9" },
  { k: "mwen", e: "I / me / my", pos: "pronoun", p: "mwen", cat: "pronouns", child: "family", age: "GROWING_7_9" },
  { k: "ou", e: "you / your", pos: "pronoun", p: "oo", cat: "pronouns", child: "family", age: "GROWING_7_9" },
  { slug: "li-pronoun", k: "li", e: "he / she / it", pos: "pronoun", p: "lee", cat: "pronouns", age: "GROWING_7_9", cultural: "Third-person pronoun. Different from li “bed” and li “to read”.", usage: "Homonym: see also li (bed) and li (to read).", exK: "Li ka vini.", exE: "He/she is coming.", related: ["li-bed", "li-read"] },
  { k: "yo", e: "they / them", pos: "pronoun", p: "yo", cat: "pronouns", age: "GROWING_7_9" },
  { k: "zanmi", e: "friend", pos: "noun", p: "zan-mee", cat: "family", child: "feelings" },
  { k: "nonm", e: "man", pos: "noun", p: "nom", cat: "family" },
  { k: "fanm", e: "woman", pos: "noun", p: "fam", cat: "family" },
  { k: "garson", e: "boy", pos: "noun", p: "gar-son", cat: "family", child: "family" },
  { k: "fi", e: "girl", pos: "noun", p: "fee", cat: "family", child: "family" },

  // Home
  { k: "kay", e: "house / home", pos: "noun", p: "kai", cat: "home", child: "home", feat: true, exK: "Kay mwen bèl.", exE: "My house is beautiful." },
  { k: "pwot", e: "door", pos: "noun", p: "pwot", cat: "home", child: "home", alt: "pòt" },
  { k: "fenèt", e: "window", pos: "noun", p: "feh-net", cat: "home", child: "home" },
  { k: "tab", e: "table", pos: "noun", p: "tab", cat: "home", child: "home" },
  { k: "chèz", e: "chair", pos: "noun", p: "shez", cat: "home", child: "home" },
  { slug: "li-bed", k: "li", e: "bed", pos: "noun", p: "lee", cat: "home", child: "home", cultural: "Furniture sense (“bed”). Different from li (pronoun) and li “to read”.", usage: "Homonym: see also li (he/she/it) and li (to read).", exK: "Li-a bèl.", exE: "The bed is nice.", related: ["li-pronoun", "li-read"] },
  { k: "kwizin", e: "kitchen", pos: "noun", p: "kwee-zeen", cat: "home", child: "home", age: "GROWING_7_9" },
  { k: "twalèt", e: "bathroom / toilet", pos: "noun", p: "twa-let", cat: "home", child: "home", age: "GROWING_7_9" },
  { k: "lakou", e: "yard", pos: "noun", p: "la-koo", cat: "home", child: "home", cultural: "Many Dominican homes have outdoor yard space used for gathering and plants." },
  { slug: "jaden-garden", k: "jaden", e: "garden", pos: "noun", p: "zha-den", cat: "plants", child: "nature", cultural: "Home or kitchen garden sense. Related farm-plot sense is listed separately.", usage: "Homonym/related sense: see also jaden (farm plot).", exK: "Jaden mwen plen flè.", exE: "My garden is full of flowers.", related: ["jaden-farm"] },
  { k: "klé", e: "key", pos: "noun", p: "klay", cat: "home", child: "home" },
  { k: "limyè", e: "light", pos: "noun", p: "leem-yeh", cat: "home", child: "home" },
  { k: "dlo", e: "water", pos: "noun", p: "dlo", cat: "food-and-drink", child: "food", feat: true, cultural: "Dominica is known for its many rivers and waterfalls.", exK: "Ban mwen dlo, souplé.", exE: "Give me water, please." },

  // Food & drink
  { k: "manjé", e: "food / to eat", pos: "noun", p: "man-zhay", cat: "food-and-drink", child: "food", feat: true, exK: "Manjé-a bon.", exE: "The food is good." },
  { k: "bwè", e: "to drink", pos: "verb", p: "bweh", cat: "food-and-drink", child: "actions" },
  { k: "pen", e: "bread", pos: "noun", p: "pen", cat: "food-and-drink", child: "food" },
  { k: "diri", e: "rice", pos: "noun", p: "dee-ree", cat: "food-and-drink", child: "food" },
  { k: "pwa", e: "beans / peas", pos: "noun", p: "pwa", cat: "food-and-drink", child: "vegetables" },
  { k: "pwason", e: "fish", pos: "noun", p: "pwa-son", cat: "food-and-drink", child: "sea-life", feat: true, cultural: "Food sense — fresh fish is part of many Dominican coastal meals. Animal sense listed separately.", usage: "Related sense: see also pwason (fish as animal).", exK: "Nou ka manjé pwason jòdi-a.", exE: "We are eating fish today.", related: ["pwason-animal"] },
  { k: "vyann", e: "meat", pos: "noun", p: "vyann", cat: "food-and-drink", child: "food", age: "GROWING_7_9" },
  { k: "poul", e: "chicken", pos: "noun", p: "pool", cat: "food-and-drink", child: "farm-life" },
  { k: "zé", e: "egg", pos: "noun", p: "zay", cat: "food-and-drink", child: "food" },
  { k: "lèt", e: "milk", pos: "noun", p: "let", cat: "food-and-drink", child: "food" },
  { k: "sik", e: "sugar", pos: "noun", p: "seek", cat: "food-and-drink", child: "food", age: "GROWING_7_9" },
  { slug: "se-salt", k: "sé", e: "salt", pos: "noun", p: "say", cat: "food-and-drink", child: "food", age: "GROWING_7_9", cultural: "Seasoning sense (“salt”). Different from sé “to be / it is”.", usage: "Homonym: see also sé (to be / it is).", exK: "Mété yon ti sé ladan.", exE: "Put a little salt in it.", related: ["se-be"] },
  { k: "lwil", e: "oil", pos: "noun", p: "lweel", cat: "cooking", child: "food", age: "GROWING_7_9" },
  { k: "soup", e: "soup", pos: "noun", p: "soop", cat: "food-and-drink", child: "food" },
  { k: "bouyon", e: "broth / bouillon", pos: "noun", p: "boo-yon", cat: "food-and-drink", child: "food", cultural: "Hearty soups and broths are common comfort food." },
  { k: "bakes", e: "bakes", pos: "noun", p: "bayks", cat: "food-and-drink", child: "food", cultural: "Fried or baked dough popular across Dominica." },
  { k: "kwibich", e: "crayfish", pos: "noun", p: "kree-beesh", cat: "food-and-drink", child: "sea-life", age: "CONFIDENT_10_12", cultural: "River crayfish appear in Dominican cooking traditions." },
  { k: "fig", e: "banana / fig banana", pos: "noun", p: "feeg", cat: "food-and-drink", child: "fruit" },
  { k: "banann", e: "plantain / banana", pos: "noun", p: "ba-nann", cat: "food-and-drink", child: "fruit" },
  { k: "mango", e: "mango", pos: "noun", p: "man-go", cat: "food-and-drink", child: "fruit", feat: true, exK: "Mango-a dous.", exE: "The mango is sweet." },
  { k: "zowanj", e: "orange", pos: "noun", p: "zo-wanj", cat: "food-and-drink", child: "fruit" },
  { k: "sitwon", e: "lemon / citrus", pos: "noun", p: "seet-won", cat: "food-and-drink", child: "fruit" },
  { k: "koko", e: "coconut", pos: "noun", p: "ko-ko", cat: "food-and-drink", child: "fruit" },
  { k: "yanm", e: "yam", pos: "noun", p: "yamm", cat: "food-and-drink", child: "vegetables" },
  { k: "patat", e: "sweet potato", pos: "noun", p: "pa-tat", cat: "food-and-drink", child: "vegetables" },
  { k: "yanm kouch", e: "dasheen / taro", pos: "noun", p: "yamm koosh", cat: "food-and-drink", child: "vegetables", age: "GROWING_7_9" },
  { k: "toumam", e: "tomato", pos: "noun", p: "too-mam", cat: "food-and-drink", child: "vegetables" },
  { k: "zonyon", e: "onion", pos: "noun", p: "zon-yon", cat: "food-and-drink", child: "vegetables" },
  { k: "ji", e: "juice", pos: "noun", p: "zhee", cat: "food-and-drink", child: "food" },
  { k: "té", e: "tea", pos: "noun", p: "tay", cat: "food-and-drink", child: "food" },
  { k: "kafé", e: "coffee", pos: "noun", p: "ka-fay", cat: "food-and-drink", age: "CONFIDENT_10_12" },
  { k: "bonbon", e: "cake / sweet", pos: "noun", p: "bon-bon", cat: "food-and-drink", child: "food" },
  { k: "gou", e: "taste / flavour", pos: "noun", p: "goo", cat: "food-and-drink", child: "food", age: "GROWING_7_9" },
  { k: "cho", e: "hot", pos: "adjective", p: "sho", cat: "adjectives", child: "feelings" },
  { k: "fwèt", e: "cold", pos: "adjective", p: "fwet", cat: "adjectives", child: "weather" },
  { k: "dous", e: "sweet", pos: "adjective", p: "doos", cat: "adjectives", child: "food" },
  { k: "sel", e: "salty", pos: "adjective", p: "sel", cat: "adjectives", child: "food", age: "GROWING_7_9" },

  // Colours
  { k: "wouj", e: "red", pos: "adjective", p: "wooj", cat: "colours", child: "colours", feat: true, exK: "Flè-a wouj.", exE: "The flower is red." },
  { k: "blé", e: "blue", pos: "adjective", p: "blay", cat: "colours", child: "colours", feat: true, exK: "Syèl-la blé.", exE: "The sky is blue." },
  { k: "vèt", e: "green", pos: "adjective", p: "vet", cat: "colours", child: "colours", feat: true, exK: "Fèy-la vèt.", exE: "The leaf is green." },
  { k: "jòn", e: "yellow", pos: "adjective", p: "zhon", cat: "colours", child: "colours" },
  { k: "nwa", e: "black", pos: "adjective", p: "nwa", cat: "colours", child: "colours" },
  { k: "blan", e: "white", pos: "adjective", p: "blan", cat: "colours", child: "colours" },
  { k: "owo", e: "orange (colour)", pos: "adjective", p: "o-wo", cat: "colours", child: "colours" },
  { k: "mouve", e: "purple", pos: "adjective", p: "moo-veh", cat: "colours", child: "colours" },
  { k: "gwiy", e: "grey", pos: "adjective", p: "gwee", cat: "colours", child: "colours", age: "GROWING_7_9" },
  { k: "mawon", e: "brown", pos: "adjective", p: "ma-won", cat: "colours", child: "colours" },
  { k: "kwoulè", e: "colour", pos: "noun", p: "kwoo-leh", cat: "colours", child: "colours" },

  // Numbers
  { k: "yon", e: "one", pos: "numeral", p: "yon", cat: "numbers", child: "numbers", feat: true, exK: "Ban mwen yon.", exE: "Give me one." },
  { k: "dé", e: "two", pos: "numeral", p: "day", cat: "numbers", child: "numbers", feat: true, exK: "Mwen ni dé zanmi.", exE: "I have two friends." },
  { k: "twa", e: "three", pos: "numeral", p: "twa", cat: "numbers", child: "numbers" },
  { k: "kat", e: "four", pos: "numeral", p: "kat", cat: "numbers", child: "numbers" },
  { k: "senk", e: "five", pos: "numeral", p: "senk", cat: "numbers", child: "numbers" },
  { k: "sis", e: "six", pos: "numeral", p: "sees", cat: "numbers", child: "numbers" },
  { k: "sèt", e: "seven", pos: "numeral", p: "set", cat: "numbers", child: "numbers" },
  { k: "wit", e: "eight", pos: "numeral", p: "weet", cat: "numbers", child: "numbers" },
  { k: "nèf", e: "nine", pos: "numeral", p: "nef", cat: "numbers", child: "numbers" },
  { k: "dis", e: "ten", pos: "numeral", p: "dees", cat: "numbers", child: "numbers", feat: true, exK: "Konté jouk dis.", exE: "Count up to ten." },
  { k: "onz", e: "eleven", pos: "numeral", p: "onz", cat: "numbers", child: "numbers", age: "GROWING_7_9" },
  { k: "douz", e: "twelve", pos: "numeral", p: "dooz", cat: "numbers", child: "numbers", age: "GROWING_7_9" },
  { k: "ven", e: "twenty", pos: "numeral", p: "ven", cat: "numbers", child: "numbers", age: "GROWING_7_9" },
  { k: "san", e: "hundred", pos: "numeral", p: "san", cat: "numbers", child: "numbers", age: "CONFIDENT_10_12" },
  { k: "kontré", e: "to count", pos: "verb", p: "kon-tray", cat: "numbers", child: "actions", age: "GROWING_7_9" },

  // Time / days
  { k: "jou", e: "day", pos: "noun", p: "zhoo", cat: "time", child: "nature" },
  { k: "lannuit", e: "night", pos: "noun", p: "lan-nweet", cat: "time", child: "weather" },
  { k: "maten", e: "morning", pos: "noun", p: "ma-ten", cat: "time", child: "weather" },
  { k: "apwémidi", e: "afternoon", pos: "noun", p: "ap-way-mee-dee", cat: "time", age: "GROWING_7_9" },
  { k: "swè", e: "evening", pos: "noun", p: "sway", cat: "time" },
  { k: "lé", e: "hour / time", pos: "noun", p: "lay", cat: "time", age: "GROWING_7_9" },
  { k: "semèn", e: "week", pos: "noun", p: "seh-men", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "mwa", e: "month", pos: "noun", p: "mwa", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "lané", e: "year", pos: "noun", p: "la-nay", cat: "days-and-months", age: "CONFIDENT_10_12" },
  { k: "lendi", e: "Monday", pos: "noun", p: "len-dee", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "madi", e: "Tuesday", pos: "noun", p: "ma-dee", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "mèkredi", e: "Wednesday", pos: "noun", p: "meh-kreh-dee", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "jedi", e: "Thursday", pos: "noun", p: "zheh-dee", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "vandwédi", e: "Friday", pos: "noun", p: "van-dweh-dee", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "samdi", e: "Saturday", pos: "noun", p: "sam-dee", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "dimanch", e: "Sunday", pos: "noun", p: "dee-manch", cat: "days-and-months", age: "GROWING_7_9" },
  { k: "jòdi-a", e: "today", pos: "adverb", p: "zho-dee-a", cat: "time", child: "nature" },
  { k: "yè", e: "yesterday", pos: "adverb", p: "yeh", cat: "time", age: "GROWING_7_9" },
  { k: "denmen", e: "tomorrow", pos: "adverb", p: "den-men", cat: "time", age: "GROWING_7_9" },

  // Weather & nature
  { k: "lapli", e: "rain", pos: "noun", p: "la-plee", cat: "weather", child: "weather", feat: true, exK: "Lapli ka tonbé.", exE: "Rain is falling." },
  { k: "solèy", e: "sun", pos: "noun", p: "so-lay", cat: "weather", child: "weather", feat: true, exK: "Solèy-la cho jòdi-a.", exE: "The sun is hot today." },
  { k: "nwaj", e: "cloud", pos: "noun", p: "nwazh", cat: "weather", child: "weather" },
  { k: "van", e: "wind", pos: "noun", p: "van", cat: "weather", child: "weather" },
  { k: "loraj", e: "thunder / storm", pos: "noun", p: "lo-razh", cat: "weather", child: "weather", age: "GROWING_7_9" },
  { k: "zifè", e: "lightning", pos: "noun", p: "zee-feh", cat: "weather", child: "weather", age: "GROWING_7_9" },
  { k: "chalè", e: "heat", pos: "noun", p: "sha-leh", cat: "weather", child: "weather" },
  { k: "syèl", e: "sky", pos: "noun", p: "syel", cat: "nature", child: "nature" },
  { k: "latè", e: "earth / ground", pos: "noun", p: "la-teh", cat: "nature", child: "nature" },
  { k: "lanmè", e: "sea", pos: "noun", p: "lan-meh", cat: "nature", child: "sea-life", feat: true, cultural: "The sea surrounds Dominica and shapes coastal life.", exK: "Nou ka najé nan lanmè.", exE: "We are swimming in the sea." },
  { k: "rivyè", e: "river", pos: "noun", p: "reev-yeh", cat: "nature", child: "nature", feat: true, cultural: "Dominica is famous for its many rivers.", exK: "Rivyè-a klè.", exE: "The river is clear." },
  { k: "saut", e: "waterfall", pos: "noun", p: "so", cat: "nature", child: "nature", cultural: "Waterfalls are a signature part of Dominica’s Nature Island identity." },
  { k: "mòn", e: "mountain", pos: "noun", p: "mon", cat: "nature", child: "nature" },
  { slug: "bwa-wood", k: "bwa", e: "wood / forest", pos: "noun", p: "bwa", cat: "nature", child: "nature", cultural: "Wood/forest sense. Different from bwa “arm”.", usage: "Homonym: see also bwa (arm).", exK: "Nou alé nan bwa.", exE: "We went into the woods.", related: ["bwa-arm"] },
  { k: "flè", e: "flower", pos: "noun", p: "fleh", cat: "plants", child: "nature" },
  { k: "pyé bwa", e: "tree", pos: "noun", p: "pyay bwa", cat: "plants", child: "nature" },
  { k: "fèy", e: "leaf", pos: "noun", p: "fay", cat: "plants", child: "nature" },
  { k: "wòch", e: "rock / stone", pos: "noun", p: "wosh", cat: "nature", child: "nature" },
  { k: "sab", e: "sand", pos: "noun", p: "sab", cat: "nature", child: "sea-life" },
  { k: "zèb", e: "grass", pos: "noun", p: "zeb", cat: "plants", child: "nature" },

  // Animals
  { k: "chat", e: "cat", pos: "noun", p: "shat", cat: "animals", child: "animals", feat: true, exK: "Chat-la ka dòmi.", exE: "The cat is sleeping." },
  { k: "chen", e: "dog", pos: "noun", p: "shen", cat: "animals", child: "animals", feat: true, exK: "Chen-an ka jwé.", exE: "The dog is playing." },
  { k: "zwazo", e: "bird", pos: "noun", p: "zwa-zo", cat: "animals", child: "animals" },
  { slug: "pwason-animal", k: "pwason", e: "fish (animal)", pos: "noun", p: "pwa-son", cat: "animals", child: "sea-life", cultural: "Living animal sense. Food sense listed separately.", usage: "Related sense: see also pwason (fish as food).", exK: "Pwason-la ka najé.", exE: "The fish is swimming.", related: ["pwason"] },
  { k: "kabwit", e: "goat", pos: "noun", p: "kab-weet", cat: "animals", child: "farm-life" },
  { k: "bèf", e: "cow", pos: "noun", p: "bef", cat: "animals", child: "farm-life" },
  { k: "kochon", e: "pig", pos: "noun", p: "ko-shon", cat: "animals", child: "farm-life" },
  { k: "mouton", e: "sheep", pos: "noun", p: "moo-ton", cat: "animals", child: "farm-life" },
  { k: "souwi", e: "mouse", pos: "noun", p: "soo-wee", cat: "animals", child: "animals" },
  { k: "krapo", e: "frog / toad", pos: "noun", p: "kra-po", cat: "animals", child: "animals", cultural: "Frogs are part of Dominican nature lore; local species names can vary." },
  { k: "kwab", e: "crab", pos: "noun", p: "kwab", cat: "animals", child: "sea-life" },
  { k: "tòti", e: "turtle", pos: "noun", p: "to-tee", cat: "animals", child: "sea-life" },
  { k: "mès", e: "snake", pos: "noun", p: "mes", cat: "animals", child: "animals", age: "GROWING_7_9" },
  { k: "myèl", e: "bee", pos: "noun", p: "myel", cat: "animals", child: "animals" },
  { k: "moustik", e: "mosquito", pos: "noun", p: "moos-teek", cat: "animals", child: "animals", age: "GROWING_7_9" },
  { k: "kòk", e: "rooster", pos: "noun", p: "kok", cat: "animals", child: "farm-life" },
  { k: "kannaw", e: "duck", pos: "noun", p: "kan-naw", cat: "animals", child: "farm-life" },

  // Body
  { k: "tèt", e: "head", pos: "noun", p: "tet", cat: "body", child: "body-parts" },
  { k: "zyé", e: "eye / eyes", pos: "noun", p: "zyay", cat: "body", child: "body-parts" },
  { k: "nen", e: "nose", pos: "noun", p: "nen", cat: "body", child: "body-parts" },
  { k: "bouch", e: "mouth", pos: "noun", p: "boosh", cat: "body", child: "body-parts" },
  { k: "zòwèy", e: "ear", pos: "noun", p: "zo-ray", cat: "body", child: "body-parts" },
  { k: "dan", e: "tooth / teeth", pos: "noun", p: "dan", cat: "body", child: "body-parts" },
  { k: "lanmen", e: "hand", pos: "noun", p: "lan-men", cat: "body", child: "body-parts" },
  { k: "pyé", e: "foot / leg", pos: "noun", p: "pyay", cat: "body", child: "body-parts" },
  { slug: "bwa-arm", k: "bwa", e: "arm", pos: "noun", p: "bwa", cat: "body", child: "body-parts", cultural: "Body-part sense (“arm”). Different from bwa “wood / forest”.", usage: "Homonym: see also bwa (wood / forest).", exK: "Bwa mwen ka fè mwen mal.", exE: "My arm is hurting me.", related: ["bwa-wood"] },
  { k: "vant", e: "stomach", pos: "noun", p: "vant", cat: "body", child: "body-parts" },
  { k: "kè", e: "heart", pos: "noun", p: "keh", cat: "body", child: "body-parts", age: "GROWING_7_9" },
  { k: "do", e: "back", pos: "noun", p: "do", cat: "body", child: "body-parts" },
  { k: "chivé", e: "hair", pos: "noun", p: "shee-vay", cat: "body", child: "body-parts" },
  { k: "po", e: "skin", pos: "noun", p: "po", cat: "body", child: "body-parts", age: "GROWING_7_9" },

  // Clothes
  { k: "wòb", e: "dress", pos: "noun", p: "wob", cat: "clothing", child: "clothes" },
  { k: "chimiz", e: "shirt", pos: "noun", p: "shee-meez", cat: "clothing", child: "clothes" },
  { k: "pantalon", e: "trousers / pants", pos: "noun", p: "pan-ta-lon", cat: "clothing", child: "clothes" },
  { k: "soulyé", e: "shoe", pos: "noun", p: "sool-yay", cat: "clothing", child: "clothes" },
  { k: "chapo", e: "hat", pos: "noun", p: "sha-po", cat: "clothing", child: "clothes" },
  { k: "jip", e: "skirt", pos: "noun", p: "zheep", cat: "clothing", child: "clothes" },
  { k: "chokèt", e: "socks", pos: "noun", p: "sho-ket", cat: "clothing", child: "clothes" },
  { k: "senti", e: "belt", pos: "noun", p: "sen-tee", cat: "clothing", child: "clothes", age: "GROWING_7_9" },
  { k: "lunèt", e: "glasses", pos: "noun", p: "loo-net", cat: "clothing", child: "clothes", age: "GROWING_7_9" },

  // School & work
  { k: "lékòl", e: "school", pos: "noun", p: "lay-kol", cat: "school", child: "school", feat: true, exK: "Timoun-yo alé lékòl.", exE: "The children went to school." },
  { k: "pwòfesè", e: "teacher", pos: "noun", p: "pwo-feh-seh", cat: "school", child: "school" },
  { k: "élèv", e: "student", pos: "noun", p: "ay-lev", cat: "school", child: "school" },
  { k: "liv", e: "book", pos: "noun", p: "leev", cat: "school", child: "school" },
  { k: "kwéyon", e: "pencil", pos: "noun", p: "kway-yon", cat: "school", child: "school" },
  { k: "papye", e: "paper", pos: "noun", p: "pap-yeh", cat: "school", child: "school" },
  { k: "tablo", e: "board / chalkboard", pos: "noun", p: "tab-lo", cat: "school", child: "school", age: "GROWING_7_9" },
  { k: "klas", e: "class", pos: "noun", p: "klas", cat: "school", child: "school" },
  { slug: "lekol-variant", k: "lekòl", e: "school (spelling variant)", pos: "noun", p: "leh-kol", cat: "school", child: "school", cultural: "Spelling may appear as lékòl or lekòl depending on writer and community." },
  { slug: "li-read", k: "li", e: "to read", pos: "verb", p: "lee", cat: "school", child: "actions", age: "GROWING_7_9", cultural: "Verb “to read”. Different from li (pronoun) and li “bed”.", usage: "Homonym: see also li (he/she/it) and li (bed).", exK: "Mwen ka li yon liv.", exE: "I am reading a book.", related: ["li-pronoun", "li-bed"] },
  { k: "ékwi", e: "to write", pos: "verb", p: "ay-kwee", cat: "school", child: "actions", age: "GROWING_7_9" },
  { k: "aprann", e: "to learn", pos: "verb", p: "a-prann", cat: "school", child: "actions", age: "GROWING_7_9" },
  { k: "travay", e: "work / to work", pos: "noun", p: "tra-vai", cat: "work", child: "actions", age: "CONFIDENT_10_12" },
  { k: "lajan", e: "money", pos: "noun", p: "la-zhan", cat: "work", age: "CONFIDENT_10_12" },
  { slug: "mache-market", k: "maché", e: "market", pos: "noun", p: "ma-shay", cat: "work", child: "actions", cultural: "Market/place sense. Walking sense is listed separately.", usage: "Homonym: see also maché (to walk).", exK: "Nou alé nan maché.", exE: "We went to the market.", related: ["mache-walk"] },

  // Transport & travel
  { k: "machin", e: "car", pos: "noun", p: "ma-sheen", cat: "transport", child: "transport" },
  { k: "bis", e: "bus", pos: "noun", p: "bees", cat: "transport", child: "transport" },
  { k: "batiman", e: "boat / ship", pos: "noun", p: "ba-tee-man", cat: "transport", child: "transport" },
  { k: "avyon", e: "airplane", pos: "noun", p: "av-yon", cat: "transport", child: "transport" },
  { k: "bisiklèt", e: "bicycle", pos: "noun", p: "bee-see-klet", cat: "transport", child: "transport" },
  { k: "wout", e: "road", pos: "noun", p: "woot", cat: "transport", child: "transport" },
  { k: "vil", e: "town / city", pos: "noun", p: "veel", cat: "travel", child: "dominica", age: "GROWING_7_9" },
  { k: "péyi", e: "country", pos: "noun", p: "pay-yee", cat: "travel", child: "dominica", age: "GROWING_7_9" },
  { k: "Dominik", e: "Dominica", pos: "noun", p: "do-mee-neek", cat: "dominican-culture", child: "dominica", feat: true, cultural: "The Nature Island of the Caribbean.", exK: "Mwen sòti Dominik.", exE: "I am from Dominica." },
  { k: "Kwéyòl", e: "Kwéyòl / Creole language", pos: "noun", p: "kway-yol", cat: "dominican-culture", child: "dominica", feat: true, cultural: "This platform focuses on Dominica’s Kwéyòl.", exK: "Nou ka palé Kwéyòl.", exE: "We speak Kwéyòl." },
  { k: "Wòzò", e: "Roseau", pos: "noun", p: "wo-zo", cat: "dominican-culture", child: "dominica", age: "GROWING_7_9", cultural: "Roseau is Dominica’s capital." },

  // Emotions & adjectives
  { k: "kontan", e: "happy", pos: "adjective", p: "kon-tan", cat: "emotions", child: "feelings", feat: true, exK: "Mwen kontan jòdi-a.", exE: "I am happy today." },
  { k: "tris", e: "sad", pos: "adjective", p: "trees", cat: "emotions", child: "feelings" },
  { k: "fâché", e: "angry", pos: "adjective", p: "fa-shay", cat: "emotions", child: "feelings" },
  { k: "pè", e: "afraid", pos: "adjective", p: "peh", cat: "emotions", child: "feelings" },
  { k: "fatigé", e: "tired", pos: "adjective", p: "fa-tee-gay", cat: "emotions", child: "feelings" },
  { k: "malad", e: "sick", pos: "adjective", p: "ma-lad", cat: "health", child: "feelings", age: "GROWING_7_9" },
  { k: "byen", e: "well / good", pos: "adverb", p: "byen", cat: "emotions", child: "feelings" },
  { k: "mal", e: "badly / hurt", pos: "adverb", p: "mal", cat: "emotions", child: "feelings" },
  { k: "bèl", e: "beautiful", pos: "adjective", p: "bel", cat: "adjectives", child: "feelings" },
  { k: "gwo", e: "big", pos: "adjective", p: "gwo", cat: "adjectives", child: "feelings" },
  { k: "piti", e: "small", pos: "adjective", p: "pee-tee", cat: "adjectives", child: "feelings" },
  { k: "bon", e: "good", pos: "adjective", p: "bon", cat: "adjectives", child: "feelings" },
  { k: "mové", e: "bad", pos: "adjective", p: "mo-vay", cat: "adjectives", child: "feelings" },
  { k: "nouvo", e: "new", pos: "adjective", p: "noo-vo", cat: "adjectives", age: "GROWING_7_9" },
  { k: "vyé", e: "old", pos: "adjective", p: "vyay", cat: "adjectives", age: "GROWING_7_9" },
  { k: "vit", e: "fast", pos: "adjective", p: "veet", cat: "adjectives", child: "actions" },
  { k: "lènt", e: "slow", pos: "adjective", p: "lent", cat: "adjectives", child: "actions" },
  { k: "fò", e: "strong", pos: "adjective", p: "fo", cat: "adjectives", child: "feelings" },
  { k: "fasil", e: "easy", pos: "adjective", p: "fa-seel", cat: "adjectives", age: "GROWING_7_9" },
  { k: "difisil", e: "difficult", pos: "adjective", p: "dee-fee-seel", cat: "adjectives", age: "GROWING_7_9" },

  // Actions / verbs more
  { slug: "jwe-play", k: "jwé", e: "to play", pos: "verb", p: "zhway", cat: "verbs", child: "toys", feat: true, cultural: "Verb “to play”. Noun “game” is listed separately.", usage: "Homonym: see also jwé (game).", exK: "Timoun-yo ka jwé déyò.", exE: "The children are playing outside.", related: ["jwe-game"] },
  { k: "soté", e: "to jump", pos: "verb", p: "so-tay", cat: "verbs", child: "actions" },
  { k: "kouri", e: "to run", pos: "verb", p: "koo-ree", cat: "verbs", child: "actions" },
  { slug: "mache-walk", k: "maché", e: "to walk", pos: "verb", p: "ma-shay", cat: "verbs", child: "actions", cultural: "Verb “to walk”. Market sense is listed separately.", usage: "Homonym: see also maché (market).", exK: "Nou ka maché lantman.", exE: "We are walking slowly.", related: ["mache-market"] },
  { k: "dòmi", e: "to sleep", pos: "verb", p: "do-mee", cat: "verbs", child: "actions" },
  { k: "lévé", e: "to get up", pos: "verb", p: "lay-vay", cat: "verbs", child: "actions" },
  { k: "asiz", e: "to sit", pos: "verb", p: "a-seez", cat: "verbs", child: "actions" },
  { k: "chanté", e: "to sing", pos: "verb", p: "shan-tay", cat: "music", child: "music" },
  { k: "dansé", e: "to dance", pos: "verb", p: "dan-say", cat: "dance", child: "music", feat: true, exK: "Nou ka dansé sou mizik-la.", exE: "We are dancing to the music." },
  { slug: "wi-laugh", k: "wi", e: "to laugh", pos: "verb", p: "wee", cat: "emotions", child: "feelings", cultural: "Verb “to laugh”. Different from wi “yes”.", usage: "Homonym: see also wi (yes).", exK: "Yo ka wi anpil.", exE: "They are laughing a lot.", related: ["wi-yes"] },
  { k: "pli", e: "to cry", pos: "verb", p: "plee", cat: "emotions", child: "feelings" },
  { k: "achtré", e: "to buy", pos: "verb", p: "ash-tray", cat: "verbs", age: "CONFIDENT_10_12" },
  { k: "vann", e: "to sell", pos: "verb", p: "vann", cat: "verbs", age: "CONFIDENT_10_12" },
  { k: "ba", e: "to give", pos: "verb", p: "ba", cat: "verbs", child: "actions" },
  { k: "pwann", e: "to take", pos: "verb", p: "pwann", cat: "verbs", child: "actions", age: "GROWING_7_9" },
  { k: "ouvè", e: "to open", pos: "verb", p: "oo-veh", cat: "verbs", child: "actions" },
  { k: "fèmé", e: "to close", pos: "verb", p: "feh-may", cat: "verbs", child: "actions" },
  { k: "netwayé", e: "to clean", pos: "verb", p: "net-way-yay", cat: "verbs", child: "home", age: "GROWING_7_9" },
  { k: "kwit", e: "to cook", pos: "verb", p: "kweet", cat: "cooking", child: "food", age: "GROWING_7_9" },

  // Music, festivals, culture
  { k: "mizik", e: "music", pos: "noun", p: "mee-zeek", cat: "music", child: "music", feat: true, exK: "Mizik-la bèl.", exE: "The music is beautiful." },
  { k: "tanbou", e: "drum", pos: "noun", p: "tan-boo", cat: "music", child: "music", cultural: "Drumming is part of Caribbean musical traditions in Dominica." },
  { k: "chan", e: "song", pos: "noun", p: "shan", cat: "music", child: "music" },
  { k: "kannaval", e: "carnival", pos: "noun", p: "kan-na-val", cat: "festivals", child: "carnival", feat: true, cultural: "Carnival is a major celebration in Dominica.", exK: "Kannaval Dominik amizan.", exE: "Dominica Carnival is fun." },
  { k: "mas", e: "mas / carnival costume play", pos: "noun", p: "mas", cat: "festivals", child: "carnival", age: "GROWING_7_9" },
  { k: "bandé", e: "band / music band", pos: "noun", p: "ban-day", cat: "music", child: "music", age: "GROWING_7_9" },
  { k: "jou ouvè", e: "J’ouvert", pos: "noun", p: "zhoo oo-veh", cat: "festivals", child: "carnival", age: "CONFIDENT_10_12", cultural: "Early-morning carnival celebration." },
  { k: "kwéyòl day", e: "Creole Day / Kwéyòl Day", pos: "noun", p: "kway-yol day", cat: "festivals", child: "dominica", age: "GROWING_7_9", cultural: "A day for celebrating Kwéyòl language and culture in Dominica." },
  { k: "pwovéb", e: "proverb", pos: "noun", p: "pwo-veb", cat: "proverbs", age: "CONFIDENT_10_12" },
  { k: "istwa", e: "story / history", pos: "noun", p: "ees-twa", cat: "history", child: "dominica", age: "GROWING_7_9" },
  { k: "kilti", e: "culture", pos: "noun", p: "keel-tee", cat: "dominican-culture", child: "dominica", age: "CONFIDENT_10_12" },

  // Health
  { k: "doktè", e: "doctor", pos: "noun", p: "dok-teh", cat: "health", age: "GROWING_7_9" },
  { k: "lopital", e: "hospital", pos: "noun", p: "lo-pee-tal", cat: "health", age: "GROWING_7_9" },
  { k: "médikaman", e: "medicine", pos: "noun", p: "may-dee-ka-man", cat: "health", age: "CONFIDENT_10_12" },
  { k: "doulè", e: "pain", pos: "noun", p: "doo-leh", cat: "health", age: "GROWING_7_9" },
  { k: "lafyèv", e: "fever", pos: "noun", p: "la-fyev", cat: "health", age: "GROWING_7_9" },

  // Question words & basics
  { k: "ki", e: "what / which", pos: "question word", p: "kee", cat: "question-words", age: "GROWING_7_9" },
  { k: "ki moun", e: "who", pos: "question word", p: "kee moon", cat: "question-words", age: "GROWING_7_9" },
  { k: "ki koté", e: "where", pos: "question word", p: "kee ko-tay", cat: "question-words", age: "GROWING_7_9" },
  { k: "ki lè", e: "when", pos: "question word", p: "kee leh", cat: "question-words", age: "GROWING_7_9" },
  { k: "pouki", e: "why", pos: "question word", p: "poo-kee", cat: "question-words", age: "GROWING_7_9" },
  { k: "kouman", e: "how", pos: "question word", p: "koo-man", cat: "question-words", age: "GROWING_7_9" },
  { k: "konbyen", e: "how many / how much", pos: "question word", p: "kon-byen", cat: "question-words", age: "GROWING_7_9" },
  { k: "isi", e: "here", pos: "adverb", p: "ee-see", cat: "prepositions", child: "actions" },
  { k: "la", e: "there", pos: "adverb", p: "la", cat: "prepositions", child: "actions" },
  { k: "anlè", e: "on / above", pos: "preposition", p: "an-leh", cat: "prepositions", age: "GROWING_7_9" },
  { k: "anba", e: "under / below", pos: "preposition", p: "an-ba", cat: "prepositions", age: "GROWING_7_9" },
  { k: "devan", e: "in front", pos: "preposition", p: "deh-van", cat: "prepositions", age: "GROWING_7_9" },
  { k: "dèyè", e: "behind", pos: "preposition", p: "deh-yeh", cat: "prepositions", age: "GROWING_7_9" },
  { k: "épi", e: "and / with", pos: "conjunction", p: "ay-pee", cat: "everyday-conversation", age: "GROWING_7_9" },
  { k: "men", e: "but", pos: "conjunction", p: "men", cat: "everyday-conversation", age: "GROWING_7_9" },
  { k: "pou", e: "for / to", pos: "preposition", p: "poo", cat: "prepositions", age: "GROWING_7_9" },
  { k: "nan", e: "in / into", pos: "preposition", p: "nan", cat: "prepositions", age: "GROWING_7_9" },
  { k: "sou", e: "on", pos: "preposition", p: "soo", cat: "prepositions", age: "GROWING_7_9" },
  { k: "san", e: "without", pos: "preposition", p: "san", cat: "prepositions", age: "CONFIDENT_10_12" },
  { k: "ankò", e: "again", pos: "adverb", p: "an-ko", cat: "everyday-conversation", child: "actions" },
  { k: "toujou", e: "always / still", pos: "adverb", p: "too-zhoo", cat: "everyday-conversation", age: "GROWING_7_9" },
  { k: "jamè", e: "never", pos: "adverb", p: "zha-meh", cat: "everyday-conversation", age: "GROWING_7_9" },
  { k: "kounyè-a", e: "now", pos: "adverb", p: "koon-yeh-a", cat: "time", age: "GROWING_7_9" },
  { k: "pito", e: "rather / prefer", pos: "adverb", p: "pee-to", cat: "everyday-conversation", age: "CONFIDENT_10_12" },

  // Toys & school fun
  { slug: "jwe-game", k: "jwé", e: "game", pos: "noun", p: "zhway", cat: "school", child: "toys", cultural: "Noun “game”. Verb “to play” is listed separately.", usage: "Homonym: see also jwé (to play).", exK: "Sa sé yon jwé amizan.", exE: "That is a fun game.", related: ["jwe-play"] },
  { k: "boul", e: "ball", pos: "noun", p: "bool", cat: "school", child: "toys" },
  { k: "poupé", e: "doll", pos: "noun", p: "poo-pay", cat: "school", child: "toys" },
  { k: "desen", e: "drawing", pos: "noun", p: "deh-sen", cat: "school", child: "school" },
  { k: "kwoulé", e: "to colour", pos: "verb", p: "kwoo-lay", cat: "school", child: "colours", age: "EARLY_4_6" },

  // Farming / fishing / construction basics
  { slug: "jaden-farm", k: "jaden", e: "farm plot", pos: "noun", p: "zha-den", cat: "farming", child: "farm-life", cultural: "Farm/provision-ground sense. Home-garden sense is listed separately.", usage: "Homonym/related sense: see also jaden (garden).", exK: "Papa ka travay nan jaden.", exE: "Father is working on the farm plot.", related: ["jaden-garden"] },
  { k: "planté", e: "to plant", pos: "verb", p: "plan-tay", cat: "farming", child: "farm-life", age: "GROWING_7_9" },
  { k: "wékolt", e: "harvest", pos: "noun", p: "ray-kolt", cat: "farming", age: "CONFIDENT_10_12" },
  { k: "péché", e: "to fish", pos: "verb", p: "peh-shay", cat: "fishing", child: "sea-life", age: "GROWING_7_9" },
  { k: "filé", e: "net / fishing line context", pos: "noun", p: "fee-lay", cat: "fishing", age: "CONFIDENT_10_12" },
  { k: "kay bati", e: "building a house", pos: "phrase", p: "kai ba-tee", cat: "construction", age: "CONFIDENT_10_12" },
  { k: "matlo", e: "hammer", pos: "noun", p: "mat-lo", cat: "construction", age: "CONFIDENT_10_12" },
  { k: "klou", e: "nail", pos: "noun", p: "kloo", cat: "construction", age: "CONFIDENT_10_12" },

  // Religion / spirituality soft set
  { k: "légliz", e: "church", pos: "noun", p: "lay-gleez", cat: "religion-and-spirituality", age: "GROWING_7_9" },
  { k: "priyé", e: "to pray", pos: "verb", p: "pree-yay", cat: "religion-and-spirituality", age: "GROWING_7_9" },
  { k: "Bondyé", e: "God", pos: "noun", p: "bon-dyay", cat: "religion-and-spirituality", age: "GROWING_7_9" },

  // Extra high-frequency everyday
  { slug: "non-name", k: "non", e: "name", pos: "noun", p: "non", cat: "everyday-conversation", child: "family", age: "GROWING_7_9", cultural: "“Name” sense. Different from non “no”.", usage: "Homonym: see also non (no).", exK: "Ki non ou?", exE: "What is your name?", related: ["non-no"] },
  { k: "bagay", e: "thing", pos: "noun", p: "ba-gai", cat: "everyday-conversation", age: "GROWING_7_9" },
  { k: "moun", e: "person / people", pos: "noun", p: "moon", cat: "everyday-conversation", child: "family" },
  { k: "kò", e: "body", pos: "noun", p: "ko", cat: "body", child: "body-parts", age: "GROWING_7_9" },
  { k: "viv", e: "to live", pos: "verb", p: "veev", cat: "verbs", age: "GROWING_7_9" },
  { k: "wè", e: "to see", pos: "verb", p: "weh", cat: "verbs", child: "actions" },
  { k: "tandé", e: "to hear", pos: "verb", p: "tan-day", cat: "verbs", child: "actions" },
  { k: "di", e: "to say", pos: "verb", p: "dee", cat: "verbs", child: "actions", age: "GROWING_7_9" },
  { k: "wété", e: "to stay / remain", pos: "verb", p: "weh-tay", cat: "verbs", age: "CONFIDENT_10_12" },
  { k: "tout", e: "all / every", pos: "determiner", p: "toot", cat: "everyday-conversation", age: "GROWING_7_9" },
  { k: "yon ti", e: "a little", pos: "phrase", p: "yon tee", cat: "everyday-conversation", child: "feelings" },
  { k: "anpil", e: "a lot / many", pos: "adverb", p: "an-peel", cat: "everyday-conversation", child: "feelings" },
  { k: "mézi", e: "measure / maybe context learning", pos: "noun", p: "may-zee", cat: "everyday-conversation", age: "CONFIDENT_10_12" },
  { k: "pwoblèm", e: "problem", pos: "noun", p: "pwo-blem", cat: "everyday-conversation", age: "CONFIDENT_10_12" },
  { k: "ékzamp", e: "example", pos: "noun", p: "ek-zamp", cat: "school", age: "CONFIDENT_10_12" },
  { k: "répons", e: "answer", pos: "noun", p: "ray-pons", cat: "school", child: "school", age: "GROWING_7_9" },
  { k: "kèsyon", e: "question", pos: "noun", p: "kes-yon", cat: "school", child: "school", age: "GROWING_7_9" },
];

function dedupeRows(rows: Row[]): Row[] {
  const seen = new Set<string>();
  const result: Row[] = [];
  for (const row of rows) {
    const key = row.slug ?? slugifyKweyol(row.k);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(row);
  }
  return result;
}

function withRelatedHomonyms(entries: SeedEntry[]): SeedEntry[] {
  const byWord = new Map<string, string[]>();
  for (const entry of entries) {
    const list = byWord.get(entry.kweyolWord) ?? [];
    list.push(entry.slug);
    byWord.set(entry.kweyolWord, list);
  }

  return entries.map((entry) => {
    const autoRelated = (byWord.get(entry.kweyolWord) ?? []).filter(
      (slug) => slug !== entry.slug,
    );
    const relatedSlugs = Array.from(
      new Set([...(entry.relatedSlugs ?? []), ...autoRelated]),
    );
    if (!relatedSlugs.length) return entry;

    const usageNotes =
      entry.usageNotes ??
      `Same spelling also appears with other meanings (${relatedSlugs.length}). Check related senses.`;

    return { ...entry, relatedSlugs, usageNotes };
  });
}

export const BEGINNER_CURRICULUM_ENTRIES: SeedEntry[] = withRelatedHomonyms(
  dedupeRows(ROWS).map(buildEntry),
);

export const BEGINNER_CURRICULUM_STATS = {
  total: BEGINNER_CURRICULUM_ENTRIES.length,
  withChild: BEGINNER_CURRICULUM_ENTRIES.filter((entry) => entry.child).length,
  featured: BEGINNER_CURRICULUM_ENTRIES.filter((entry) => entry.isFeatured).length,
};
