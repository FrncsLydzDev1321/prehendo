// ─────────────────────────────────────────────────────────────
// Knowledge base for RAG (Retrieval-Augmented Generation).
//
// These "Technique Cards" are written by humans and are the single
// source of truth about each misinformation technique. Before the AI
// writes a case or coaches a student, we RETRIEVE the cards that match
// the case's techniques and give them to the model as context. This
// keeps the AI consistent with our definitions instead of its memory.
// ─────────────────────────────────────────────────────────────
import type { TechniqueId, ToolId } from "@/lib/types";

export interface TechniqueCard {
  id: TechniqueId;
  name: string;
  emoji: string;
  badge: string;
  short: string;
  whatItIs: string;
  howToSpot: string[];
  example: string;
  coachQuestion: string;
  /** Which investigation tool reveals it. "read" = visible in the post itself. */
  revealedBy: ToolId | "read";
  /** Instructions for the AI writer on how to plant this clue. */
  plantingGuide: string;
}

export const TECHNIQUES: Record<TechniqueId, TechniqueCard> = {
  fake_expert: {
    id: "fake_expert",
    name: "Fake Expert",
    emoji: "🥼",
    badge: "Expert Exposer",
    short: "A made-up or unqualified 'expert' is used to sound believable.",
    whatItIs:
      "The post quotes a doctor, scientist, or 'specialist' who does not exist, or whose expertise has nothing to do with the topic. A fancy title makes a claim feel true even when no real expert said it.",
    howToSpot: [
      "Search the expert's name. Do they really exist?",
      "Check where they work. Is the school, hospital, or institute real?",
      "Ask: is this person an expert in THIS topic?",
    ],
    example:
      '"Prof. Max Brainley of the Global Genius Institute says gaming boosts grades by 300%." There is no such professor or institute.',
    coachQuestion: "Who is this expert, and how could you check that they are real?",
    revealedBy: "source",
    plantingGuide:
      "Quote an impressive-sounding expert with a grand title or institute. The 'source' evidence must reveal that no record of this person or institute exists, or that they are not an expert in this field.",
  },
  emotional_language: {
    id: "emotional_language",
    name: "Emotional Bait",
    emoji: "😱",
    badge: "Cool Head",
    short: "Shocking words and ALL CAPS push you to react before you think.",
    whatItIs:
      "The post uses words like SHOCKING, URGENT, or TERRIFYING, lots of exclamation marks, and pressure like 'share before they delete this'. Strong emotions make people share without checking.",
    howToSpot: [
      "Look for ALL CAPS, many !!!, and scary or angry words.",
      "Notice pressure to share fast or 'before it's deleted'.",
      "Ask: is this post trying to inform me, or to make me feel something?",
    ],
    example: '"SHARE NOW!!! They don\'t want you to know this SHOCKING truth!!!"',
    coachQuestion: "How does this post want you to FEEL, and why might that matter?",
    revealedBy: "read",
    plantingGuide:
      "Use ALL CAPS words, multiple exclamation marks, fear or outrage words, and pressure to share quickly. This clue is visible in the post text itself.",
  },
  old_photo_reused: {
    id: "old_photo_reused",
    name: "Old Photo, New Story",
    emoji: "📅",
    badge: "Time Traveler",
    short: "A real photo from another time or place is used for a new story.",
    whatItIs:
      "The photo is real, but it was taken years ago or somewhere else. The post pretends it shows something happening now. This is one of the most common tricks online.",
    howToSpot: [
      "Check when the photo first appeared online.",
      "Look for clues in the photo: signs, weather, clothes, phones.",
      "Ask: does this photo really match the date and place in the post?",
    ],
    example:
      '"LOOK: flood at the market TODAY" with a photo first posted three years ago during a different storm.',
    coachQuestion: "When and where was this photo really taken?",
    revealedBy: "date",
    plantingGuide:
      "Include a photo that the post claims is recent. The 'date' evidence must reveal the photo first appeared online years earlier or in a different place.",
  },
  fake_account: {
    id: "fake_account",
    name: "Fake Account",
    emoji: "🎭",
    badge: "Account Auditor",
    short: "The poster pretends to be someone official or trusted.",
    whatItIs:
      "The account copies the name or look of a real organization or person, but it is new, has few followers, or has a slightly wrong handle. Scammers use these to steal passwords or spread lies.",
    howToSpot: [
      "Check when the account was created and how many followers it has.",
      "Compare the handle with the official one. Small spelling changes are a red flag.",
      "Be careful with links asking for passwords, codes, or money.",
    ],
    example:
      'A page called "City Hall Official 💯" created 3 days ago, asking students to "register" with their password.',
    coachQuestion: "Who is really behind this account, and how long has it existed?",
    revealedBy: "account",
    plantingGuide:
      "Make the account look official or trusted at first glance. The 'account' evidence must reveal it was created very recently, has few followers, or uses a handle different from the real official one.",
  },
  misleading_headline: {
    id: "misleading_headline",
    name: "Misleading Headline",
    emoji: "📰",
    badge: "Headline Hawk",
    short: "The headline says something the article itself does not support.",
    whatItIs:
      "Many people only read headlines. A misleading headline exaggerates or twists the story, while the actual text says something smaller or different.",
    howToSpot: [
      "Read past the headline. Does the body say the same thing?",
      "Look for words like 'forever', 'ALL', or 'skyrocket' that the facts don't support.",
      "Ask: if I only read the headline, what would I wrongly believe?",
    ],
    example:
      'Headline: "School BANS phones FOREVER." Article: phones are kept in lockers during exam week only.',
    coachQuestion: "Does the headline match what the article actually says?",
    revealedBy: "source",
    plantingGuide:
      "Write a headline that exaggerates or contradicts the body text. The body must quietly contain the smaller, true detail. The 'source' evidence should confirm what really happened.",
  },
  fake_quote: {
    id: "fake_quote",
    name: "Fake Quote",
    emoji: "💬",
    badge: "Quote Checker",
    short: "Words are put in someone's mouth that they never said.",
    whatItIs:
      "The post quotes a known person, but the quote is invented, cut short, or changed. Quotes feel convincing because they seem to come straight from the person.",
    howToSpot: [
      "Find the original interview, speech, or post.",
      "Check if the quote was cut short or taken out of context.",
      "Ask: would this person really say this? Where is the proof?",
    ],
    example:
      'A post claims an athlete said "School is a waste of time" when the full interview says "Finish school AND train hard."',
    coachQuestion: "Where did this quote come from, and can you find the original?",
    revealedBy: "source",
    plantingGuide:
      "Attribute a quote to a person in the story. The 'source' evidence must reveal that the original statement says something different or that no record of the quote exists.",
  },
};

export const TECHNIQUE_LIST: TechniqueCard[] = Object.values(TECHNIQUES);

/** RAG retrieval step: fetch the cards for the given technique ids. */
export function retrieveCards(ids: readonly TechniqueId[]): TechniqueCard[] {
  return [...new Set(ids)].map((id) => TECHNIQUES[id]);
}

/** Format retrieved cards as compact context for a prompt. */
export function cardsAsContext(cards: TechniqueCard[]): string {
  if (cards.length === 0) return "(no techniques)";
  return cards
    .map(
      (c) =>
        `### ${c.name} (id: ${c.id})\nWhat it is: ${c.whatItIs}\nHow to spot: ${c.howToSpot.join(" ")}\nRevealed by: ${c.revealedBy}\nPlanting guide: ${c.plantingGuide}\nCoach question: ${c.coachQuestion}`,
    )
    .join("\n\n");
}

export const VERDICT_INFO = {
  real: {
    label: "Real",
    meaning: "The post is accurate and comes from a trustworthy source.",
  },
  fake: {
    label: "Fake",
    meaning: "The event or claim was made up. It never happened.",
  },
  misleading: {
    label: "Misleading",
    meaning:
      "Something real happened, but the post twists it: old photos, exaggerated headlines, or changed quotes.",
  },
} as const;

export const TOOL_INFO: Record<ToolId, { label: string; emoji: string; prompt: string }> = {
  account: { label: "Check the Account", emoji: "👤", prompt: "Who posted this?" },
  date: { label: "Check the Date", emoji: "📅", prompt: "When is this from?" },
  source: { label: "Check the Source", emoji: "🔎", prompt: "Does anyone else confirm it?" },
};
