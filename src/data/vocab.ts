export type VocabItem = {
  word: string;
  reading: string;
  meaning: string;
  category: "greetings" | "people" | "food" | "numbers" | "time" | "places" | "verbs";
};

export const vocab: VocabItem[] = [
  { word: "こんにちは", reading: "konnichiwa", meaning: "Hello / Good afternoon", category: "greetings" },
  { word: "おはよう", reading: "ohayou", meaning: "Good morning", category: "greetings" },
  { word: "こんばんは", reading: "konbanwa", meaning: "Good evening", category: "greetings" },
  { word: "ありがとう", reading: "arigatou", meaning: "Thank you", category: "greetings" },
  { word: "さようなら", reading: "sayounara", meaning: "Goodbye", category: "greetings" },
  { word: "すみません", reading: "sumimasen", meaning: "Excuse me / Sorry", category: "greetings" },

  { word: "わたし", reading: "watashi", meaning: "I / me", category: "people" },
  { word: "あなた", reading: "anata", meaning: "You", category: "people" },
  { word: "ともだち", reading: "tomodachi", meaning: "Friend", category: "people" },
  { word: "せんせい", reading: "sensei", meaning: "Teacher", category: "people" },
  { word: "がくせい", reading: "gakusei", meaning: "Student", category: "people" },

  { word: "みず", reading: "mizu", meaning: "Water", category: "food" },
  { word: "おちゃ", reading: "ocha", meaning: "Tea", category: "food" },
  { word: "ごはん", reading: "gohan", meaning: "Rice / meal", category: "food" },
  { word: "すし", reading: "sushi", meaning: "Sushi", category: "food" },
  { word: "りんご", reading: "ringo", meaning: "Apple", category: "food" },
  { word: "たまご", reading: "tamago", meaning: "Egg", category: "food" },

  { word: "いち", reading: "ichi", meaning: "One", category: "numbers" },
  { word: "に", reading: "ni", meaning: "Two", category: "numbers" },
  { word: "さん", reading: "san", meaning: "Three", category: "numbers" },
  { word: "よん", reading: "yon", meaning: "Four", category: "numbers" },
  { word: "ご", reading: "go", meaning: "Five", category: "numbers" },

  { word: "きょう", reading: "kyou", meaning: "Today", category: "time" },
  { word: "あした", reading: "ashita", meaning: "Tomorrow", category: "time" },
  { word: "きのう", reading: "kinou", meaning: "Yesterday", category: "time" },
  { word: "いま", reading: "ima", meaning: "Now", category: "time" },

  { word: "がっこう", reading: "gakkou", meaning: "School", category: "places" },
  { word: "いえ", reading: "ie", meaning: "House / home", category: "places" },
  { word: "えき", reading: "eki", meaning: "Station", category: "places" },
  { word: "みせ", reading: "mise", meaning: "Shop / store", category: "places" },

  { word: "たべる", reading: "taberu", meaning: "To eat", category: "verbs" },
  { word: "のむ", reading: "nomu", meaning: "To drink", category: "verbs" },
  { word: "いく", reading: "iku", meaning: "To go", category: "verbs" },
  { word: "みる", reading: "miru", meaning: "To see / watch", category: "verbs" },
  { word: "する", reading: "suru", meaning: "To do", category: "verbs" },
];
