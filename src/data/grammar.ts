export type GrammarDrill = {
  prompt: string;           // JP sentence with ___ blank
  translation: string;      // EN meaning
  choices: string[];        // shuffled answer choices
  answer: number;           // index into choices
  explain?: string;
};

export type GrammarExample = { jp: string; reading: string; en: string };

export type GrammarLesson = {
  id: string;
  title: string;
  category: "basics" | "particles" | "verbs" | "adjectives" | "connectors";
  pattern: string;
  summary: string;
  explanation: string;
  examples: GrammarExample[];
  drills: GrammarDrill[];
};

export const grammar: GrammarLesson[] = [
  // ==================== BASICS ====================
  {
    id: "desu",
    title: "X は Y です — to be",
    category: "basics",
    pattern: "N は N です",
    summary: "The core sentence. です = is / am / are.",
    explanation:
      "Use です at the end of a sentence to say something is something. は (wa) marks the topic — what we're talking about. です is the polite 'to be'.",
    examples: [
      { jp: "私は学生です。", reading: "わたしは がくせい です。", en: "I am a student." },
      { jp: "これは本です。", reading: "これは ほん です。", en: "This is a book." },
      { jp: "田中さんは先生です。", reading: "たなかさんは せんせい です。", en: "Mr. Tanaka is a teacher." },
    ],
    drills: [
      { prompt: "私___学生です。", translation: "I am a student.", choices: ["は", "が", "を", "の"], answer: 0 },
      { prompt: "これ___本です。", translation: "This is a book.", choices: ["を", "に", "は", "で"], answer: 2 },
      { prompt: "田中さんは先生___。", translation: "Tanaka is a teacher.", choices: ["です", "います", "あります", "ます"], answer: 0 },
    ],
  },
  {
    id: "desu-neg",
    title: "X は Y じゃありません — is not",
    category: "basics",
    pattern: "N は N じゃありません / ではありません",
    summary: "Negative of です. じゃありません (casual) / ではありません (formal).",
    explanation:
      "To negate です, change it to じゃありません (spoken) or ではありません (written). Both mean 'is not'.",
    examples: [
      { jp: "私は日本人じゃありません。", reading: "わたしは にほんじん じゃありません。", en: "I'm not Japanese." },
      { jp: "これはお茶ではありません。", reading: "これは おちゃ ではありません。", en: "This is not tea." },
      { jp: "あの人は学生じゃありません。", reading: "あのひとは がくせい じゃありません。", en: "That person isn't a student." },
    ],
    drills: [
      { prompt: "私は日本人___。", translation: "I am not Japanese.", choices: ["です", "じゃありません", "います", "ません"], answer: 1 },
      { prompt: "これはお茶___。", translation: "This is not tea.", choices: ["でした", "ではありません", "じゃありました", "ありません"], answer: 1 },
    ],
  },
  {
    id: "desu-past",
    title: "X は Y でした — was",
    category: "basics",
    pattern: "N は N でした / じゃありませんでした",
    summary: "Past of です. でした = was / were. じゃありませんでした = was not.",
    explanation:
      "Past tense of the copula. Positive: でした. Negative: じゃありませんでした (or ではありませんでした).",
    examples: [
      { jp: "昨日は雨でした。", reading: "きのうは あめ でした。", en: "Yesterday was rainy." },
      { jp: "テストは簡単じゃありませんでした。", reading: "テストは かんたん じゃありませんでした。", en: "The test wasn't easy." },
    ],
    drills: [
      { prompt: "昨日は雨___。", translation: "Yesterday was rainy.", choices: ["です", "でした", "います", "ありました"], answer: 1 },
      { prompt: "テストは簡単___。", translation: "The test wasn't easy.", choices: ["じゃありません", "でした", "じゃありませんでした", "ではありません"], answer: 2 },
    ],
  },
  {
    id: "kore-sore",
    title: "これ・それ・あれ・どれ",
    category: "basics",
    pattern: "これ / それ / あれ / どれ",
    summary: "This (near me) / that (near you) / that over there / which?",
    explanation:
      "Stand-alone demonstratives. これ = this (by speaker). それ = that (by listener). あれ = that (far from both). どれ = which one?",
    examples: [
      { jp: "これは何ですか。", reading: "これは なん ですか。", en: "What is this?" },
      { jp: "それは私のかばんです。", reading: "それは わたしの かばん です。", en: "That is my bag." },
      { jp: "あれは何の店ですか。", reading: "あれは なんの みせ ですか。", en: "What kind of shop is that over there?" },
    ],
    drills: [
      { prompt: "___は私のかばんです。（relative to listener）", translation: "That (near you) is my bag.", choices: ["これ", "それ", "あれ", "どれ"], answer: 1 },
      { prompt: "___は何ですか。（in your hand）", translation: "What is this (in my hand)?", choices: ["これ", "それ", "あれ", "どれ"], answer: 0 },
    ],
  },
  {
    id: "kono-sono",
    title: "この・その・あの + noun",
    category: "basics",
    pattern: "この/その/あの/どの + N",
    summary: "Adjectival: this X / that X / which X. Always paired with a noun.",
    explanation:
      "Use これ/それ/あれ on their own; use この/その/あの before a noun. この本 = this book. あの人 = that person over there.",
    examples: [
      { jp: "この本は面白いです。", reading: "このほんは おもしろい です。", en: "This book is interesting." },
      { jp: "あの人は誰ですか。", reading: "あのひとは だれ ですか。", en: "Who is that person over there?" },
    ],
    drills: [
      { prompt: "___本は面白いです。(this)", translation: "This book is interesting.", choices: ["これ", "この", "それ", "あの"], answer: 1 },
      { prompt: "___人は誰ですか。(over there)", translation: "Who is that person over there?", choices: ["あれ", "あの", "この", "どの"], answer: 1 },
    ],
  },

  // ==================== PARTICLES ====================
  {
    id: "wa-ga",
    title: "は vs が",
    category: "particles",
    pattern: "Topic は ... / Subject が ...",
    summary: "は marks the topic (old/known info). が marks the subject (new info, or answer to a question).",
    explanation:
      "は sets what we're talking about. が points to a specific subject — often the answer to 'who/what?'. With existence (あります／います), use が.",
    examples: [
      { jp: "私は田中です。", reading: "わたしは たなか です。", en: "I am Tanaka. (topic: me)" },
      { jp: "誰が来ましたか。— 田中さんが来ました。", reading: "だれが きましたか。— たなかさんが きました。", en: "Who came? — Tanaka did." },
      { jp: "机の上に本があります。", reading: "つくえの うえに ほんが あります。", en: "There is a book on the desk." },
    ],
    drills: [
      { prompt: "誰___来ましたか。", translation: "Who came?", choices: ["は", "が", "を", "に"], answer: 1, explain: "Asking 'who?' picks out the subject — use が." },
      { prompt: "机の上に本___あります。", translation: "There is a book on the desk.", choices: ["は", "を", "が", "で"], answer: 2, explain: "Existence (あります／います) takes が." },
      { prompt: "私___学生です。", translation: "I am a student.", choices: ["は", "が", "を", "の"], answer: 0, explain: "Introducing oneself as topic → は." },
    ],
  },
  {
    id: "wo",
    title: "を — direct object",
    category: "particles",
    pattern: "N を V",
    summary: "を (pronounced 'o') marks the thing a verb acts on.",
    explanation:
      "Place を after the direct object of a transitive verb: what is eaten, drunk, seen, read, bought, etc.",
    examples: [
      { jp: "ご飯を食べます。", reading: "ごはんを たべます。", en: "I eat rice / a meal." },
      { jp: "水を飲みます。", reading: "みずを のみます。", en: "I drink water." },
      { jp: "本を読みます。", reading: "ほんを よみます。", en: "I read a book." },
    ],
    drills: [
      { prompt: "ご飯___食べます。", translation: "I eat rice.", choices: ["は", "を", "が", "に"], answer: 1 },
      { prompt: "本___読みます。", translation: "I read a book.", choices: ["で", "に", "を", "の"], answer: 2 },
    ],
  },
  {
    id: "ni-de",
    title: "に vs で",
    category: "particles",
    pattern: "place に (exist / go) / place で (action)",
    summary: "に = destination, existence location, time. で = place where an action happens, means/tool.",
    explanation:
      "Use に for destination (行きます), existence (います／あります), specific time (七時に). Use で for location of activity (学校で勉強する), or means (電車で行く).",
    examples: [
      { jp: "学校に行きます。", reading: "がっこうに いきます。", en: "I go to school. (destination)" },
      { jp: "学校で勉強します。", reading: "がっこうで べんきょうします。", en: "I study at school. (activity location)" },
      { jp: "七時に起きます。", reading: "しちじに おきます。", en: "I wake up at 7. (specific time)" },
      { jp: "電車で行きます。", reading: "でんしゃで いきます。", en: "I go by train. (means)" },
    ],
    drills: [
      { prompt: "学校___行きます。", translation: "I go to school.", choices: ["で", "に", "を", "へ"], answer: 1 },
      { prompt: "学校___勉強します。", translation: "I study at school.", choices: ["に", "で", "を", "は"], answer: 1 },
      { prompt: "七時___起きます。", translation: "I wake up at 7.", choices: ["で", "は", "に", "を"], answer: 2 },
      { prompt: "電車___行きます。", translation: "I go by train.", choices: ["に", "を", "で", "は"], answer: 2 },
    ],
  },
  {
    id: "e-he",
    title: "へ — direction",
    category: "particles",
    pattern: "place へ (pronounced 'e')",
    summary: "へ marks direction/destination. Often interchangeable with に for movement verbs.",
    explanation:
      "With motion verbs (行く、来る、帰る), へ points toward the destination. 学校へ行く and 学校に行く are both fine.",
    examples: [
      { jp: "東京へ行きます。", reading: "とうきょうへ いきます。", en: "I'm going to Tokyo." },
      { jp: "家へ帰ります。", reading: "いえへ かえります。", en: "I'm going home." },
    ],
    drills: [
      { prompt: "東京___行きます。(direction)", translation: "I'm going to Tokyo.", choices: ["で", "を", "へ", "の"], answer: 2 },
    ],
  },
  {
    id: "no",
    title: "の — possessive / modifier",
    category: "particles",
    pattern: "N1 の N2",
    summary: "Connects two nouns: N1's N2, or N2 of type N1.",
    explanation:
      "の links a modifying noun to a head noun. 私の本 = my book. 日本語の先生 = Japanese-language teacher.",
    examples: [
      { jp: "これは私の本です。", reading: "これは わたしの ほん です。", en: "This is my book." },
      { jp: "日本語の先生です。", reading: "にほんごの せんせい です。", en: "(They are) a Japanese teacher." },
    ],
    drills: [
      { prompt: "これは私___本です。", translation: "This is my book.", choices: ["の", "は", "が", "を"], answer: 0 },
      { prompt: "日本語___先生です。", translation: "A Japanese teacher.", choices: ["で", "の", "は", "に"], answer: 1 },
    ],
  },
  {
    id: "to-mo",
    title: "と / も",
    category: "particles",
    pattern: "A と B (and/with) / N も (also)",
    summary: "と joins nouns or marks a companion. も replaces は/が/を for 'also'.",
    explanation:
      "A と B lists exhaustive nouns or means 'with' (友だちと行く = go with a friend). も = also/too; it replaces は, が, or を.",
    examples: [
      { jp: "パンと牛乳を買いました。", reading: "パンと ぎゅうにゅう を かいました。", en: "I bought bread and milk." },
      { jp: "友だちと映画を見ます。", reading: "ともだちと えいがを みます。", en: "I watch a movie with a friend." },
      { jp: "私も学生です。", reading: "わたしも がくせい です。", en: "I am also a student." },
    ],
    drills: [
      { prompt: "パン___牛乳を買いました。", translation: "I bought bread and milk.", choices: ["は", "と", "を", "も"], answer: 1 },
      { prompt: "私___学生です。(also)", translation: "I'm also a student.", choices: ["は", "も", "が", "を"], answer: 1 },
    ],
  },

  // ==================== VERBS ====================
  {
    id: "masu",
    title: "〜ます / ません / ました / ませんでした",
    category: "verbs",
    pattern: "V-stem + ます (polite forms)",
    summary: "Polite present positive, present negative, past positive, past negative.",
    explanation:
      "ます = polite present/future. ません = negative. ました = past positive. ませんでした = past negative. 食べます → 食べません → 食べました → 食べませんでした.",
    examples: [
      { jp: "毎日コーヒーを飲みます。", reading: "まいにち コーヒーを のみます。", en: "I drink coffee every day." },
      { jp: "昨日学校へ行きました。", reading: "きのう がっこうへ いきました。", en: "I went to school yesterday." },
      { jp: "お酒は飲みません。", reading: "おさけは のみません。", en: "I don't drink alcohol." },
      { jp: "昨日は来ませんでした。", reading: "きのうは きませんでした。", en: "They didn't come yesterday." },
    ],
    drills: [
      { prompt: "昨日学校へ行き___。", translation: "I went to school yesterday.", choices: ["ます", "ません", "ました", "ませんでした"], answer: 2 },
      { prompt: "お酒は飲み___。(don't drink)", translation: "I don't drink alcohol.", choices: ["ます", "ません", "ました", "ませんでした"], answer: 1 },
      { prompt: "昨日は来___。(didn't come)", translation: "They didn't come yesterday.", choices: ["ません", "ました", "ませんでした", "ます"], answer: 2 },
    ],
  },
  {
    id: "te-form",
    title: "て-form — the big one",
    category: "verbs",
    pattern: "V → V-て",
    summary: "Connector form. Many grammar patterns stack on て-form.",
    explanation:
      "Group 1 (u-verbs): depends on last kana — う/つ/る→って, む/ぶ/ぬ→んで, く→いて, ぐ→いで, す→して. Group 2 (ru-verbs): drop る add て. Irregular: する→して, 来る→きて, 行く→いって. (Example: 食べる→食べて, 飲む→飲んで, 書く→書いて.)",
    examples: [
      { jp: "食べる → 食べて", reading: "たべる → たべて", en: "eat → eat-and / eating" },
      { jp: "飲む → 飲んで", reading: "のむ → のんで", en: "drink → drink-and" },
      { jp: "書く → 書いて", reading: "かく → かいて", en: "write → write-and" },
      { jp: "する → して", reading: "する → して", en: "do → do-and" },
    ],
    drills: [
      { prompt: "食べる → ___", translation: "eat → て-form", choices: ["食べって", "食べて", "食べいて", "食べんで"], answer: 1, explain: "ru-verb: drop る, add て." },
      { prompt: "飲む → ___", translation: "drink → て-form", choices: ["飲みて", "飲って", "飲んで", "飲いで"], answer: 2, explain: "む ending → んで." },
      { prompt: "書く → ___", translation: "write → て-form", choices: ["書いて", "書きて", "書って", "書んで"], answer: 0, explain: "く ending → いて." },
      { prompt: "行く → ___", translation: "go → て-form", choices: ["行いて", "行って", "行きて", "行んで"], answer: 1, explain: "Irregular: 行く → 行って." },
    ],
  },
  {
    id: "te-kudasai",
    title: "〜てください — please do X",
    category: "verbs",
    pattern: "V-て ください",
    summary: "Polite request. Attach ください to the て-form.",
    explanation:
      "Adds 'please' to any action. 食べてください = please eat. 待ってください = please wait.",
    examples: [
      { jp: "ちょっと待ってください。", reading: "ちょっと まってください。", en: "Please wait a moment." },
      { jp: "これを見てください。", reading: "これを みてください。", en: "Please look at this." },
    ],
    drills: [
      { prompt: "ちょっと待___ください。", translation: "Please wait a moment.", choices: ["って", "んで", "いて", "ちて"], answer: 0 },
      { prompt: "これを見___ください。", translation: "Please look at this.", choices: ["んで", "て", "いて", "って"], answer: 1 },
    ],
  },
  {
    id: "te-imasu",
    title: "〜ています — ongoing / habit",
    category: "verbs",
    pattern: "V-て います",
    summary: "Currently doing, or habitually doing (for action verbs). A resulting state (for change verbs).",
    explanation:
      "読んでいます = (I'm) reading. 働いています = works (is employed). For verbs like 結婚する, 住む: state-of-being meaning — 結婚しています = is married.",
    examples: [
      { jp: "今、本を読んでいます。", reading: "いま、ほんを よんでいます。", en: "I'm reading a book right now." },
      { jp: "東京に住んでいます。", reading: "とうきょうに すんでいます。", en: "I live in Tokyo." },
      { jp: "彼女は結婚しています。", reading: "かのじょは けっこんしています。", en: "She is married." },
    ],
    drills: [
      { prompt: "今、本を読___います。", translation: "I'm reading a book right now.", choices: ["みて", "んで", "って", "いて"], answer: 1 },
      { prompt: "東京に住___います。", translation: "I live in Tokyo.", choices: ["みて", "んで", "いて", "って"], answer: 1 },
    ],
  },
  {
    id: "tai",
    title: "〜たい — want to do",
    category: "verbs",
    pattern: "V-stem + たい",
    summary: "Express the speaker's desire to do something.",
    explanation:
      "Drop ます from the polite form and add たい. 食べます → 食べたい (want to eat). Conjugates like an い-adjective: 食べたくない (don't want to eat).",
    examples: [
      { jp: "寿司が食べたいです。", reading: "すしが たべたい です。", en: "I want to eat sushi." },
      { jp: "日本へ行きたいです。", reading: "にほんへ いきたい です。", en: "I want to go to Japan." },
      { jp: "今日は働きたくないです。", reading: "きょうは はたらきたくない です。", en: "I don't want to work today." },
    ],
    drills: [
      { prompt: "寿司が食べ___です。(want to eat)", translation: "I want to eat sushi.", choices: ["ます", "たい", "ました", "ません"], answer: 1 },
      { prompt: "今日は働き___です。(don't want to)", translation: "I don't want to work today.", choices: ["たい", "たくない", "ません", "ないたい"], answer: 1 },
    ],
  },
  {
    id: "mashou",
    title: "〜ましょう / 〜ませんか",
    category: "verbs",
    pattern: "V-stem + ましょう / ませんか",
    summary: "ましょう = let's do X. ませんか = won't you ...? (polite invitation).",
    explanation:
      "行きましょう = let's go. 行きませんか = shall we go? / would you like to go? ませんか is softer.",
    examples: [
      { jp: "一緒に食べましょう。", reading: "いっしょに たべましょう。", en: "Let's eat together." },
      { jp: "コーヒーを飲みませんか。", reading: "コーヒーを のみませんか。", en: "Would you like to drink coffee?" },
    ],
    drills: [
      { prompt: "一緒に食べ___。(let's)", translation: "Let's eat together.", choices: ["ました", "ましょう", "ません", "ませんか"], answer: 1 },
      { prompt: "コーヒーを飲み___。(won't you?)", translation: "Won't you drink coffee?", choices: ["ましょう", "ません", "ませんか", "ました"], answer: 2 },
    ],
  },

  // ==================== ADJECTIVES ====================
  {
    id: "i-adj",
    title: "い-adjectives: negative & past",
    category: "adjectives",
    pattern: "〜い → 〜くない / 〜かった / 〜くなかった",
    summary: "Drop い, add くない (neg), かった (past), くなかった (past neg).",
    explanation:
      "高い → 高くない (not expensive) → 高かった (was expensive) → 高くなかった (wasn't expensive). Exception: いい → よくない / よかった / よくなかった.",
    examples: [
      { jp: "このラーメンは美味しいです。", reading: "この ラーメンは おいしい です。", en: "This ramen is delicious." },
      { jp: "昨日は寒かったです。", reading: "きのうは さむかった です。", en: "Yesterday was cold." },
      { jp: "映画は面白くなかったです。", reading: "えいがは おもしろくなかった です。", en: "The movie wasn't interesting." },
    ],
    drills: [
      { prompt: "昨日は寒___です。(was cold)", translation: "Yesterday was cold.", choices: ["い", "くない", "かった", "くなかった"], answer: 2 },
      { prompt: "映画は面白___です。(wasn't interesting)", translation: "The movie wasn't interesting.", choices: ["くない", "かった", "くなかった", "いでした"], answer: 2 },
      { prompt: "今日は天気がよ___です。(was good)", translation: "The weather was good today.", choices: ["かった", "くなかった", "いでした", "いかった"], answer: 0, explain: "Irregular: いい uses よ- as the stem." },
    ],
  },
  {
    id: "na-adj",
    title: "な-adjectives: modifying & tenses",
    category: "adjectives",
    pattern: "〜な + N / 〜です / 〜じゃない / 〜でした",
    summary: "Keep な before a noun. Conjugate like a noun with です.",
    explanation:
      "静かな部屋 = a quiet room. 元気です / 元気じゃありません / 元気でした / 元気じゃありませんでした.",
    examples: [
      { jp: "静かな部屋ですね。", reading: "しずかな へや ですね。", en: "It's a quiet room, isn't it." },
      { jp: "昨日は元気じゃありませんでした。", reading: "きのうは げんき じゃありませんでした。", en: "I wasn't well yesterday." },
    ],
    drills: [
      { prompt: "静か___部屋ですね。", translation: "It's a quiet room.", choices: ["い", "な", "の", "で"], answer: 1 },
      { prompt: "昨日は元気___。(wasn't)", translation: "I wasn't well yesterday.", choices: ["でした", "じゃありませんでした", "じゃありません", "ではありました"], answer: 1 },
    ],
  },

  // ==================== CONNECTORS ====================
  {
    id: "kara-node",
    title: "〜から / 〜ので — because",
    category: "connectors",
    pattern: "Reason から, Result. / Reason ので, Result.",
    summary: "から = because (any form). ので = so (softer; plain form before it).",
    explanation:
      "Both give a reason. から is more direct. ので sounds softer/more polite for explanations. Attach after the reason clause.",
    examples: [
      { jp: "寒いから、コートを着ます。", reading: "さむいから、コートを きます。", en: "It's cold, so I'll wear a coat." },
      { jp: "時間がないので、行けません。", reading: "じかんが ないので、いけません。", en: "I can't go because I have no time." },
    ],
    drills: [
      { prompt: "寒い___、コートを着ます。", translation: "It's cold, so I'll wear a coat.", choices: ["が", "から", "で", "に"], answer: 1 },
      { prompt: "時間がない___、行けません。(softer)", translation: "Because I have no time, I can't go.", choices: ["から", "のに", "ので", "けれど"], answer: 2 },
    ],
  },
];
