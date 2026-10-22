# Requirements: Prehendo Phase 1

## Introduction
A web-based detective mini game for students aged 13–16 to practice media and
information literacy. Teachers design cases with open-weight AI and approve them
(human-in-the-loop). Students investigate simulated posts in a fictional city.

## Requirement 1: Role selection
**User story:** As a visitor, I want to choose Student or Teacher, so I reach the right experience.
1. WHEN a visitor opens the home page THE SYSTEM SHALL show "I'm a Student" and "I'm a Teacher" options.
2. WHEN a visitor chooses Student THE SYSTEM SHALL open the student lobby without login.
3. WHEN a visitor chooses Teacher and is not logged in THE SYSTEM SHALL redirect to the teacher login page.

## Requirement 2: Teacher accounts
**User story:** As a teacher, I want to register and log in, so my cases are private to me.
1. THE SYSTEM SHALL let a teacher register with full name, username, password, and confirm password.
2. IF the passwords do not match OR the username is taken THEN THE SYSTEM SHALL show a clear error.
3. THE SYSTEM SHALL let a teacher log in with username and password and log out.
4. THE SYSTEM SHALL only let a teacher see, edit, or delete their own cases (Row Level Security).

## Requirement 3: AI-assisted case design
**User story:** As a teacher, I want AI to write cases from my answer key, so I save time but stay in control.
1. THE SYSTEM SHALL let the teacher choose verdict, 0–3 techniques, difficulty (1–3), topic, and an optional idea.
2. IF the verdict is Real THEN THE SYSTEM SHALL not allow techniques; IF Fake/Misleading THEN at least one is required.
3. WHEN the teacher clicks Generate THE SYSTEM SHALL retrieve the matching Technique Cards (RAG) and ask Gemma 4 to write the post, evidence, explanation, and clue notes.
4. THE SYSTEM SHALL validate the AI output shape with Zod and check it with a second open-weight model (GPT-OSS).
5. IF validation fails THEN THE SYSTEM SHALL retry once with feedback, and save the result flagged for review.
6. THE SYSTEM SHALL save generated cases as "pending" and never show them to students until approved.

## Requirement 4: Teacher review (human-in-the-loop)
1. THE SYSTEM SHALL show a student preview, the evidence, the answer key, and the AI quality report.
2. THE SYSTEM SHALL let the teacher edit the headline, post text, and explanation.
3. THE SYSTEM SHALL let the teacher approve, reject, unpublish, regenerate, or delete a case.
4. THE SYSTEM SHALL show plays and accuracy per case on the dashboard.

## Requirement 5: Student gameplay
1. THE SYSTEM SHALL ask for a nickname only and store progress in the browser.
2. THE SYSTEM SHALL offer 3 levels; levels 2 and 3 unlock at 60 and 180 XP.
3. WHEN a round starts THE SYSTEM SHALL serve 5 cases (teacher-approved first, then starter cases) without the answer key.
4. THE SYSTEM SHALL provide 3 investigation tools (account, date, source) that reveal evidence.
5. THE SYSTEM SHALL let the student tick red flags and choose a verdict before filing the report.

## Requirement 6: Assessment and coaching
1. THE SYSTEM SHALL score answers deterministically against the blueprint (verdict + clues, penalties for false flags).
2. THE SYSTEM SHALL detect lucky guesses (right verdict, few correct clues).
3. THE SYSTEM SHALL reveal found, missed, and false-flagged clues with notes and the explanation.
4. THE SYSTEM SHALL request coach feedback from Gemma 4 grounded in retrieved Technique Cards.
5. IF every AI provider fails THEN THE SYSTEM SHALL show feedback built from the knowledge base.

## Requirement 7: Progression
1. THE SYSTEM SHALL award XP, ranks (Rookie → Chief Detective), and a badge per technique after 3 correct spots.
2. THE SYSTEM SHALL show a round report with points, cracked cases, promotions, and new badges.

## Non-functional requirements
- **Privacy:** no student personal data beyond a nickname; nothing stored server-side except anonymous attempt stats.
- **Safety:** fictional, age-appropriate content; every case labeled as a simulation; no AI-generated images.
- **Security:** keys server-only; RLS on all tables; answer key hidden until answer; rate limits on AI and auth routes.
- **Reliability:** provider fallback chain; starter cases and library coach work without AI.
- **Cost:** runs on free tiers (Vercel, Supabase, Cloudflare Workers AI, Groq).
- **Usability:** mobile and desktop; keyboard accessible; reduced-motion support.
- **Open source:** MIT license; open-weight models only; CI runs lint, typecheck, tests, build.
