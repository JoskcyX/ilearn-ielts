/**
 * SAMPLE CONTENT — edit freely.
 * Everything below is placeholder marketing copy. Testimonials are fictional
 * (initials only, no real people), and nothing here is a measured statistic.
 * Replace with real, verified figures before launch.
 */

export const BRAND = {
  name: "ILEARN Spaces",
  disclaimer:
    "ILEARN Spaces is an independent practice platform. Not affiliated with or endorsed by IELTS, the British Council, IDP, or Cambridge University Press & Assessment.",
};

export const HERO = {
  badge: "Practice that behaves like exam day",
  titleBefore: "Know your band",
  titleAccent: "before exam day does",
  subcopy:
    "Timed Listening, Reading, Writing and Speaking mocks on a computer-based layout, with band feedback you can act on the same evening.",
  primaryCta: "Start practising free",
  secondaryCta: "Sign in",
  proofText: "Made for self-study and for classrooms",
  proofInitials: ["AK", "MR", "SL", "JP"],
};

/** Format facts about the IELTS test (not usage statistics). Number is animated on scroll. */
export const STATS = [
  { value: 4, suffix: "", label: "skills, one account" },
  { value: 40, suffix: "", label: "questions in each Listening and Reading test" },
  { value: 9, suffix: "", label: "band scale, in half-band steps" },
  { value: 165, suffix: "", label: "minutes for a full mock, about 2h 45m" },
];

export const WRITING_DEMO = {
  title: "Writing Task 2",
  minWords: 250,
  prompt:
    "Some people think cities should invest in public transport rather than new roads. To what extent do you agree or disagree?",
  starter:
    "I agree that public transport deserves most of a city's transport budget. Buses and trains move far more people per square metre than private cars, so every pound spent on them relieves congestion for everyone, including drivers.",
};

export const MODULES = [
  {
    id: "listening",
    name: "Listening",
    tagline: "One play, four parts, real pacing.",
    body: "Audio plays once, the timer keeps moving, and questions follow the recording just as they do on the day.",
    points: ["Four recorded sections", "Answers saved as you go", "Marked the moment you submit"],
  },
  {
    id: "reading",
    name: "Reading",
    tagline: "Split screen, passage left, questions right.",
    body: "Long academic passages beside the questions, so you can practise skimming, scanning and managing the clock.",
    points: ["Three passages in 60 minutes", "Highlight and revisit", "Instant raw score and band"],
  },
  {
    id: "writing",
    name: "Writing",
    tagline: "A quiet screen and a live word count.",
    body: "Two tasks with nothing else competing for your attention. Submit and see how each criterion was judged.",
    points: ["Task 1 and Task 2", "Live word counter", "Criterion-by-criterion feedback"],
  },
  {
    id: "speaking",
    name: "Speaking",
    tagline: "Cue card, preparation timer, recorder.",
    body: "Record your answers against the clock, then play them back and compare with the feedback you receive.",
    points: ["Three-part structure", "One-minute prep timer", "Playback of your recording"],
  },
];

export const STEPS = [
  { title: "Create a free account", body: "Name, email and a password. No class or teacher needed." },
  { title: "Choose a published test", body: "Pick a single skill or sit the whole mock back to back." },
  { title: "Sit it under exam conditions", body: "Timed, full screen, same navigation you will meet on the day." },
  { title: "Read your feedback and go again", body: "See weak question types, then aim at them in your next session." },
];

export const TESTIMONIALS = [
  {
    initials: "AK",
    name: "Sample student A.",
    quote: "The split-screen reading layout meant the real test felt familiar. I stopped wasting time on page layout.",
    gain: "+1.0",
    skill: "Reading",
  },
  {
    initials: "MR",
    name: "Sample student M.",
    quote: "Seeing criteria scored separately showed me my grammar was fine and my coherence was the real problem.",
    gain: "+0.5",
    skill: "Writing",
  },
  {
    initials: "SL",
    name: "Sample student S.",
    quote: "Recording myself against a prep timer was uncomfortable the first time and useful every time after.",
    gain: "+1.0",
    skill: "Speaking",
  },
];

/** Typical exam topics, shown in the scrolling strip. */
export const TOPICS = [
  "Urban planning", "Marine biology", "Remote work", "Renewable energy", "Museum curation",
  "Language learning", "Sleep science", "Public transport", "Space tourism", "Food waste",
  "Ancient trade routes", "Digital privacy", "Wildlife corridors", "Architecture", "Volunteering",
];

export const FAQS = [
  {
    q: "Is ILEARN Spaces the official IELTS test?",
    a: "No. It is an independent practice platform that imitates the computer-based format so the real test feels familiar.",
  },
  {
    q: "Do I need a teacher or a class?",
    a: "No. Create an account and open any published test. Teachers can also add students to classes and follow their results.",
  },
  {
    q: "How are my answers scored?",
    a: "Listening and Reading are marked automatically when you submit. Writing and Speaking feedback arrives once they have been assessed.",
  },
  {
    q: "Can I sign in with Google?",
    a: "Not yet. Google sign-in is planned; for now use your email and a password.",
  },
  {
    q: "Is the band on the landing page a real score?",
    a: "No. The writing preview on this page is a demo that only looks at length and word variety. Real feedback comes from the full exam.",
  },
];

export const FOOTER_COLUMNS = [
  {
    title: "Practice",
    links: [
      { label: "Listening", href: "#modules" },
      { label: "Reading", href: "#modules" },
      { label: "Writing", href: "#modules" },
      { label: "Speaking", href: "#modules" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Try writing", href: "#try-writing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Create account", href: "/register" },
      { label: "Sign in", href: "/login" },
      { label: "Forgot password", href: "/forgot-password" },
    ],
  },
];

/** How written work is judged. Mirrors the four public IELTS Writing criteria. */
export const CRITERIA = [
  { name: "Task response", body: "Did you answer every part of the question, with a clear position?" },
  { name: "Coherence and cohesion", body: "Do ideas follow a logical order, joined by natural linking?" },
  { name: "Lexical resource", body: "How precise and varied is your vocabulary?" },
  { name: "Grammatical range and accuracy", body: "A mix of sentence structures, with few slips." },
];

export const FINAL_CTA = {
  title: "Your first full mock should not be on exam day.",
  body: "Make a free account and sit a timed test in the next ten minutes.",
};
