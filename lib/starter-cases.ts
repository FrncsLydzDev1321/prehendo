// Starter cases: written by the Prehendo developer (not AI-generated) and
// reviewed by hand. They make sure the game always works, even when no
// teacher has created cases yet or an AI provider is down.
//
// Everything happens in the FICTIONAL city of Puerto Liwanag.
// All people, pages, schools, and platforms are invented.
import type { CaseRecord } from "@/lib/types";

export const STARTER_CASES: CaseRecord[] = [
  // ─────────────── LEVEL 1: obvious clues ───────────────
  {
    id: "starter-1a",
    source: "starter",
    difficulty: 1,
    topic: "School life",
    verdict: "fake",
    techniques: ["emotional_language", "fake_account"],
    content: {
      format: "social",
      platform: "Kwento",
      accountName: "PL Student Newz 2026",
      accountHandle: "@plstudentnewz_official2",
      postedAgo: "1h",
      headline: "URGENT!!! ALL CLASSES CANCELLED FOR 2 WEEKS!!!",
      body: "BREAKING!!! All schools in Puerto Liwanag are CLOSED for TWO WEEKS starting tomorrow!!! Teachers don't want you to know yet. SHARE THIS NOW before they DELETE it!!! 😱😱😱",
      photo: null,
      stats: { likes: 3200, shares: 5100, comments: 870 },
    },
    evidence: {
      account:
        "Account created 2 days ago. 14 followers. No profile photo. The official schools page is @PLSchoolsDivision, created 2015, with 48,000 followers.",
      date: "Posted 1 hour ago. No other post about a school closure exists before this one.",
      source:
        "The Puerto Liwanag Schools Division page has no announcement. Its latest post says classes continue as normal this week.",
    },
    explanation:
      "This is fake. The account is brand new and only pretends to be a student news page, and the post uses ALL CAPS, many exclamation marks, and pressure to share before checking. The official schools page says classes continue.",
    clueNotes: {
      emotional_language: "ALL CAPS, '!!!', and 'SHARE THIS NOW before they DELETE it' push you to react fast.",
      fake_account: "The handle ends in 'official2' and the account is only 2 days old with 14 followers.",
    },
  },
  {
    id: "starter-1b",
    source: "starter",
    difficulty: 1,
    topic: "Science and technology",
    verdict: "fake",
    techniques: ["fake_expert", "emotional_language"],
    content: {
      format: "social",
      platform: "ChikaChat",
      accountName: "Gamer Facts Daily",
      accountHandle: "@gamerfactsdaily",
      postedAgo: "5h",
      headline: "SHOCKING: Gaming 6 hours a day boosts grades by 300%!!!",
      body: "Prof. Max Brainley, Chief Scientist of the Global Genius Institute, PROVED that students who play mobile games 6 hours a day get 300% higher grades!!! Parents are FURIOUS they didn't know!!! Tag a parent who NEEDS to see this!!!",
      photo: { description: "A teen holding a phone, smiling at a game screen", caption: "Science says: keep playing! 🎮" },
      stats: { likes: 9800, shares: 4300, comments: 1200 },
    },
    evidence: {
      account: "A meme page created 3 years ago with 220,000 followers. It mostly posts jokes and game clips, not news.",
      date: "Posted 5 hours ago. The 'study' has no date and no link.",
      source:
        "No record of a 'Prof. Max Brainley' or a 'Global Genius Institute' exists. No school, university, or science journal has published this study.",
    },
    explanation:
      "This is fake. The 'expert' and the 'institute' do not exist, and the claim of 300% higher grades is not supported by any real study. The angry, shocking wording is designed to make people share it.",
    clueNotes: {
      fake_expert: "'Prof. Max Brainley of the Global Genius Institute' sounds impressive, but no record of either exists.",
      emotional_language: "'SHOCKING', 'FURIOUS', and lots of !!! are designed to trigger strong feelings.",
    },
  },
  {
    id: "starter-1c",
    source: "starter",
    difficulty: 1,
    topic: "Local events",
    verdict: "real",
    techniques: [],
    content: {
      format: "social",
      platform: "Kwento",
      accountName: "Puerto Liwanag City Library",
      accountHandle: "@PLCityLibrary",
      postedAgo: "Oct 20",
      headline: "Free coding workshop for teens this Saturday",
      body: "The Puerto Liwanag City Library is hosting a free beginner coding workshop for students aged 13–17 every Saturday in November, 9:00–11:00 AM, at the 2nd floor computer room. Slots are limited to 25. Register at the library front desk or on our official website.",
      photo: { description: "A bright library computer room with rows of desktop computers", caption: "Our computer room, ready for you!" },
      stats: { likes: 412, shares: 96, comments: 38 },
    },
    evidence: {
      account: "Official verified page of the city library, created 2012, with 31,000 followers. It posts library events every week.",
      date: "Posted Oct 20. The photo was taken at the library this month and matches the library's website gallery.",
      source:
        "The workshop is listed on the library's official website and on the Puerto Liwanag city government events calendar.",
    },
    explanation:
      "This is real. It comes from the library's long-running official page, uses calm and specific details (dates, times, room, slot limits), and is confirmed by the library website and the city events calendar.",
    clueNotes: {},
  },
  {
    id: "starter-1d",
    source: "starter",
    difficulty: 1,
    topic: "Weather and safety",
    verdict: "misleading",
    techniques: ["old_photo_reused"],
    content: {
      format: "social",
      platform: "Kwento",
      accountName: "Tess Villareal",
      accountHandle: "@tessvillareal",
      postedAgo: "30m",
      headline: "LOOK: flood at Puerto Liwanag Public Market TODAY",
      body: "Grabe, look at the public market today! Water up to the knees. Stay safe everyone and avoid the area.",
      photo: { description: "A market street flooded with brown water, people wading through it", caption: "Public market right now 😢" },
      stats: { likes: 640, shares: 1900, comments: 210 },
    },
    evidence: {
      account: "A personal account of a local resident, created 2016, with 830 friends. Mostly family photos.",
      date:
        "This exact photo first appeared online in August 2021, during Typhoon Lunas. Today's weather report says it is sunny with no rain.",
      source:
        "The Puerto Liwanag Weather Office reports no flooding today. A 2021 news article about Typhoon Lunas uses the same photo.",
    },
    explanation:
      "This is misleading. The flood really happened, but in 2021, not today. Reusing an old photo as if it were new can cause panic, even if the person sharing it meant well.",
    clueNotes: {
      old_photo_reused: "The photo is real, but it is from Typhoon Lunas in 2021. The post says 'TODAY'.",
    },
  },
  {
    id: "starter-1e",
    source: "starter",
    difficulty: 1,
    topic: "Online scams",
    verdict: "fake",
    techniques: ["fake_account", "fake_quote"],
    content: {
      format: "social",
      platform: "ChikaChat",
      accountName: "Mayor Celia Dumalagan Official 💯",
      accountHandle: "@mayorcelia.free.load",
      postedAgo: "2h",
      headline: "FREE ₱500 load for every student!",
      body: "Mayor Celia Dumalagan said: \"Every student deserves free load this school year!\" Claim yours now: click the link and enter your phone number and password. Only for the first 1,000 students!",
      photo: null,
      stats: { likes: 7400, shares: 8800, comments: 2300 },
    },
    evidence: {
      account:
        "Account created 5 days ago, 63 followers. The mayor's real page is @MayorCeliaDumalagan, created 2019 and verified.",
      date: "Posted 2 hours ago. The same message was posted by 4 other new accounts today.",
      source:
        "The mayor's office never said this quote. Its official page warns: 'We will NEVER ask for your password. Beware of free-load scams.'",
    },
    explanation:
      "This is fake, and it is a scam. The account only pretends to be the mayor, and the quote was invented. Real offices never ask for your password.",
    clueNotes: {
      fake_account: "The handle '@mayorcelia.free.load' is not the official page, and it is only 5 days old.",
      fake_quote: "The mayor's office says she never said this, and warns about free-load scams.",
    },
  },

  // ─────────────── LEVEL 2: moderate clues ───────────────
  {
    id: "starter-2a",
    source: "starter",
    difficulty: 2,
    topic: "School life",
    verdict: "misleading",
    techniques: ["misleading_headline"],
    content: {
      format: "news",
      platform: "Liwanag Daily Scoop",
      accountName: "Liwanag Daily Scoop",
      accountHandle: "liwanagdailyscoop.ph",
      postedAgo: "Oct 19",
      headline: "Puerto Liwanag High BANS cellphones forever",
      body: "Puerto Liwanag National High School released a memo on Monday about cellphones. According to the memo, students must keep their phones in lockers during the final exam week, from November 3 to 7, to prevent cheating. Phones may be used normally after exam week. The principal said the rule will be reviewed after exams.",
      photo: { description: "Rows of blue metal lockers in a school hallway", caption: "Student lockers at PLNHS" },
      stats: { likes: 1500, shares: 3600, comments: 940 },
    },
    evidence: {
      account: "A local entertainment and news blog, created 2020, with 52,000 followers. Known for catchy headlines.",
      date: "Published Oct 19, one day after the school released its memo.",
      source:
        "The school's official memo says phones go in lockers during exam week only (Nov 3–7). It says nothing about a permanent ban.",
    },
    explanation:
      "This is misleading. The school did make a phone rule, but only for exam week. The headline says 'forever', which the article itself does not support.",
    clueNotes: {
      misleading_headline: "The headline says 'forever', but the article says phones are only stored during exam week.",
    },
  },
  {
    id: "starter-2b",
    source: "starter",
    difficulty: 2,
    topic: "Local events",
    verdict: "real",
    techniques: [],
    content: {
      format: "news",
      platform: "Puerto Liwanag Times",
      accountName: "Puerto Liwanag Times",
      accountHandle: "pltimes.ph",
      postedAgo: "Oct 18",
      headline: "City opens protected bike lane on Rizal Avenue",
      body: "A 3-kilometer protected bike lane opened on Rizal Avenue on Saturday, connecting the public market to the city sports complex. The City Engineering Office said the project cost ₱12 million and took eight months to finish. Cyclists welcomed the lane, while some drivers said traffic was slower during the first day.",
      photo: { description: "A green-painted bike lane separated from cars by low concrete barriers", caption: "The new Rizal Avenue bike lane on opening day" },
      stats: { likes: 2100, shares: 640, comments: 310 },
    },
    evidence: {
      account: "The city's main newspaper, publishing since 1998. Articles list the reporter's name and an editor contact.",
      date: "Published Oct 18, the day after the opening. The photo was taken by a Times photographer that day.",
      source:
        "Confirmed by a City Engineering Office press release and reported by two other local news outlets.",
    },
    explanation:
      "This is real. A long-running newspaper reports specific facts (length, cost, timeline), includes both positive and negative reactions, and other sources confirm the story.",
    clueNotes: {},
  },
  {
    id: "starter-2c",
    source: "starter",
    difficulty: 2,
    topic: "Weather and safety",
    verdict: "fake",
    techniques: ["fake_expert", "misleading_headline"],
    content: {
      format: "news",
      platform: "WowNews Online",
      accountName: "WowNews Online",
      accountHandle: "wownews-online.net",
      postedAgo: "Oct 15",
      headline: "Scientists confirm: Puerto Liwanag will have SNOW this December",
      body: "According to Dr. Elena Frost, a climate expert, December in Puerto Liwanag 'might feel a little colder than usual in the early mornings.' Dr. Frost added that people may want to bring a light jacket. Residents are excited about the possibility of cooler weather this holiday season.",
      photo: { description: "A snowy street with pine trees and snowmen", caption: "Coming soon to Puerto Liwanag?" },
      stats: { likes: 5600, shares: 4100, comments: 1800 },
    },
    evidence: {
      account: "A website created 4 months ago. No 'About us' page, no list of writers, and many pop-up ads.",
      date: "Published Oct 15. The snow photo is a stock image from another country.",
      source:
        "No record of a 'Dr. Elena Frost' at any weather office or university. The Puerto Liwanag Weather Office says snow is impossible in this tropical climate.",
    },
    explanation:
      "This is fake. The 'expert' cannot be found anywhere, and even her quote only says mornings might feel colder. The headline turns that into 'snow', which never happens in a tropical city.",
    clueNotes: {
      fake_expert: "'Dr. Elena Frost' has no record at any weather office or university.",
      misleading_headline: "The headline promises SNOW, but the article only says mornings may feel colder.",
    },
  },
  {
    id: "starter-2d",
    source: "starter",
    difficulty: 2,
    topic: "Sports",
    verdict: "misleading",
    techniques: ["fake_quote"],
    content: {
      format: "social",
      platform: "Kwento",
      accountName: "Liwanag Sports Fans",
      accountHandle: "@liwanagsportsfans",
      postedAgo: "3h",
      headline: "Jun Malaya wins regional 100m freestyle gold",
      body: "Congratulations to Jun Malaya for winning gold at the Regional Swimming Meet! After the race he told reporters: \"School is a waste of time. Just train!\" A true champion! 🏊‍♂️🥇",
      photo: { description: "A young swimmer on a podium holding a gold medal", caption: "Jun Malaya on the podium" },
      stats: { likes: 4800, shares: 1200, comments: 530 },
    },
    evidence: {
      account: "A fan page created 2018 with 40,000 followers. Usually shares accurate game results.",
      date: "Posted 3 hours ago, right after the race. The podium photo is from today's meet.",
      source:
        "The full interview video shows Jun said: \"School is not a waste of time. Finish school AND train hard.\" The quote was cut short.",
    },
    explanation:
      "This is misleading. Jun really won the gold medal, but the quote was cut and changed so it says the opposite of what he meant.",
    clueNotes: {
      fake_quote: "The full interview says 'School is NOT a waste of time. Finish school AND train hard.'",
    },
  },
  {
    id: "starter-2e",
    source: "starter",
    difficulty: 2,
    topic: "Local events",
    verdict: "fake",
    techniques: ["old_photo_reused", "emotional_language"],
    content: {
      format: "social",
      platform: "ChikaChat",
      accountName: "Real Talk PL",
      accountHandle: "@realtalk_pl",
      postedAgo: "45m",
      headline: "TERRIFYING!!! Giant sinkhole swallows Liwanag Mall parking lot!!!",
      body: "OMG!!! A HUGE sinkhole just opened at the Liwanag Mall parking lot and swallowed FIVE CARS!!! Nobody is talking about this!!! Stay AWAY from the mall!!! SHARE to warn your family!!!",
      photo: { description: "A giant round hole in a parking lot with cars tipping into it", caption: "Liwanag Mall right now!!!" },
      stats: { likes: 6100, shares: 9300, comments: 2700 },
    },
    evidence: {
      account: "A page created 2022 with 18,000 followers that often posts viral videos without sources.",
      date:
        "The photo first appeared online in 2018 in a news story from another country. It is not from Puerto Liwanag.",
      source:
        "Liwanag Mall posted that its parking lot is open and safe. No news outlet or city office reports a sinkhole.",
    },
    explanation:
      "This is fake. No sinkhole happened at the mall. The photo is from another country in 2018, and the scary all-caps wording is meant to make people share without checking.",
    clueNotes: {
      old_photo_reused: "The sinkhole photo is from another country in 2018.",
      emotional_language: "'TERRIFYING', 'OMG', and 'SHARE to warn your family!!!' push panic sharing.",
    },
  },

  // ─────────────── LEVEL 3: subtle clues ───────────────
  {
    id: "starter-3a",
    source: "starter",
    difficulty: 3,
    topic: "Science and technology",
    verdict: "real",
    techniques: [],
    content: {
      format: "news",
      platform: "Puerto Liwanag Times",
      accountName: "Puerto Liwanag Times",
      accountHandle: "pltimes.ph",
      postedAgo: "Oct 16",
      headline: "Grade 9 students build plastic-sorting robot, win regional science fair",
      body: "Four Grade 9 students from San Pablo Integrated School won first place at the Regional Science and Technology Fair with a robot that sorts plastic bottles by type. Their teacher, Mr. Rodel Abaya, said the team worked after classes for five months using recycled parts. The robot will compete at the national fair in February.",
      photo: { description: "Four students in school uniforms next to a small robot made of recycled parts", caption: "The winning team with their robot" },
      stats: { likes: 8700, shares: 2900, comments: 640 },
    },
    evidence: {
      account: "The city's main newspaper, publishing since 1998, with named reporters and an editor contact.",
      date: "Published Oct 16, two days after the fair. The photo was taken at the awarding ceremony.",
      source:
        "The regional education office's official list of winners includes the team. The school also posted the same news.",
    },
    explanation:
      "This is real. It sounds surprising, but surprising does not mean fake. The story has names, specific details, and is confirmed by the education office and the school.",
    clueNotes: {},
  },
  {
    id: "starter-3b",
    source: "starter",
    difficulty: 3,
    topic: "Online scams",
    verdict: "fake",
    techniques: ["fake_account"],
    content: {
      format: "social",
      platform: "Kwento",
      accountName: "Puerto Liwanag City Info",
      accountHandle: "@puertoliwanag.cityinfo",
      postedAgo: "Oct 21",
      headline: "Registration for the Student Travel Card is now open",
      body: "Good day, Liwanagons. Students aged 12–18 may now register for the new Student Travel Card, which gives 50% off jeepney fares. Please complete the online form using your school email and password. Registration closes on October 31. Thank you.",
      photo: { description: "A colorful ID card with a jeepney illustration", caption: "Sample Student Travel Card" },
      stats: { likes: 2300, shares: 3100, comments: 410 },
    },
    evidence: {
      account:
        "Created 3 weeks ago with 1,200 followers. The real city page is @PuertoLiwanagCity, created 2013, verified, with 210,000 followers.",
      date: "Posted Oct 21. The card image was edited from a design used by another city.",
      source:
        "The official city page has no 'Student Travel Card' program, and real offices never ask for passwords in a form.",
    },
    explanation:
      "This is fake. The post sounds calm and professional, but the account is a copycat of the official city page, and asking for a password is a classic scam sign.",
    clueNotes: {
      fake_account: "'@puertoliwanag.cityinfo' copies the real '@PuertoLiwanagCity' page and is only 3 weeks old.",
    },
  },
  {
    id: "starter-3c",
    source: "starter",
    difficulty: 3,
    topic: "Local events",
    verdict: "misleading",
    techniques: ["misleading_headline", "old_photo_reused"],
    content: {
      format: "news",
      platform: "Metro Buzz PL",
      accountName: "Metro Buzz PL",
      accountHandle: "metrobuzzpl.com",
      postedAgo: "Oct 20",
      headline: "Gas prices SKYROCKET; endless lines at Puerto Liwanag stations",
      body: "Fuel prices in Puerto Liwanag went up this week. Gasoline increased by ₱1.20 per liter and diesel by ₱0.80, according to the city's energy monitoring office. Station owners said customer numbers were normal for a weekday.",
      photo: { description: "Very long lines of cars waiting at a gas station at night", caption: "Lines at a city gas station" },
      stats: { likes: 1900, shares: 2600, comments: 1100 },
    },
    evidence: {
      account: "A local news site created 2019 with 75,000 followers. Mixes news with viral content.",
      date:
        "The photo of long lines first appeared online in December 2022, during the holiday rush, not this week.",
      source:
        "The energy monitoring office confirms a ₱1.20 increase. Station owners quoted in the article say lines were normal.",
    },
    explanation:
      "This is misleading. Prices really did go up, but by about one peso, not 'skyrocketing'. The article itself says lines were normal, and the photo of long lines is from 2022.",
    clueNotes: {
      misleading_headline: "'SKYROCKET' and 'endless lines' are not supported: the increase was ₱1.20, and the body says lines were normal.",
      old_photo_reused: "The long-lines photo is from the December 2022 holiday rush.",
    },
  },
  {
    id: "starter-3d",
    source: "starter",
    difficulty: 3,
    topic: "Science and technology",
    verdict: "fake",
    techniques: ["fake_expert", "fake_quote"],
    content: {
      format: "news",
      platform: "HealthWise Today",
      accountName: "HealthWise Today",
      accountHandle: "healthwisetoday.info",
      postedAgo: "Oct 17",
      headline: "Study: teens only need four hours of sleep",
      body: "A new study suggests teenagers may need far less sleep than previously thought. \"Teens only need four hours of sleep to stay healthy and focused,\" said Dr. Ramon Velasco, head of the Puerto Liwanag Sleep Institute. The institute plans to share its full results next year.",
      photo: { description: "A teenager studying at a desk late at night with a lamp", caption: "Less sleep, more study time?" },
      stats: { likes: 3400, shares: 2200, comments: 980 },
    },
    evidence: {
      account: "A health blog created 6 months ago. No named editors, and it sells 'focus supplements' on the same site.",
      date: "Published Oct 17. There is no date or link for the 'study' itself.",
      source:
        "There is no 'Puerto Liwanag Sleep Institute' and no record of a Dr. Ramon Velasco. Health experts recommend 8 to 10 hours of sleep for teens.",
    },
    explanation:
      "This is fake. The calm, scientific tone makes it believable, but the expert and the institute do not exist, and the quote was invented. Real health experts say teens need 8 to 10 hours of sleep.",
    clueNotes: {
      fake_expert: "The 'Puerto Liwanag Sleep Institute' and 'Dr. Ramon Velasco' cannot be found anywhere.",
      fake_quote: "No record of this quote exists, and the 'full results' are never shown.",
    },
  },
  {
    id: "starter-3e",
    source: "starter",
    difficulty: 3,
    topic: "Weather and safety",
    verdict: "real",
    techniques: [],
    content: {
      format: "news",
      platform: "Puerto Liwanag Times",
      accountName: "Puerto Liwanag Times",
      accountHandle: "pltimes.ph",
      postedAgo: "Oct 22",
      headline: "Wind Signal No. 1 raised; preschool classes suspended",
      body: "The Puerto Liwanag Weather Office raised Wind Signal No. 1 at 5:00 AM as a tropical depression approaches. Following city rules, preschool classes are suspended today. Elementary and high school classes continue. The office advises residents to secure loose objects and follow official updates.",
      photo: { description: "Dark clouds over a coastal city with palm trees bending in the wind", caption: "Clouds over Puerto Liwanag this morning" },
      stats: { likes: 5200, shares: 6100, comments: 720 },
    },
    evidence: {
      account: "The city's main newspaper, publishing since 1998, with named reporters and an editor contact.",
      date: "Published Oct 22 at 6:10 AM. The photo was taken this morning by a Times photographer.",
      source:
        "The Weather Office's official bulletin and the city's official page both confirm Signal No. 1 and the preschool suspension.",
    },
    explanation:
      "This is real. Alarming news is not automatically fake: the details are specific, the tone is calm, and official sources confirm it.",
    clueNotes: {},
  },
];

export function getStarterCase(id: string): CaseRecord | undefined {
  return STARTER_CASES.find((c) => c.id === id);
}
