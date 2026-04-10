/**
 * Daily encouragement one-liners displayed on the Home screen.
 *
 * 366 entries (one per day-of-year, covers leap years).
 * Selected deterministically via day-of-year so all users see the
 * same line on the same day. Updated via EAS (lives in JS bundle).
 *
 * Mix of three flavors:
 *   S = Scripture-rooted (themes, paraphrases, allusions)
 *   I = Inspirational (warm, non-denominational)
 *   F = Feature / study nudge
 */

const dailyEncouragements: string[] = [
  // ── Jan (1–31) ───────────────────────────────────────────
  'His mercies are new every morning',                          // S
  'Every chapter you open is a step closer to understanding',   // I
  'The word is a lamp — let it light today\'s path',            // S
  'Dig into the original languages today',                      // F
  'You were made for more than a surface reading',              // I
  'The God who parted seas still moves mountains',              // S
  'What did the ancient world look like? Explore the map',      // F
  'Grace met you before you opened this app',                   // S
  'Small steps in Scripture lead to giant leaps in faith',      // I
  'The psalms have a word for whatever you\'re feeling',        // S
  'Tap into centuries of scholarship with every panel',         // F
  'Be still and know — even five minutes matters',              // S
  'Every verse was written with you in mind',                   // I
  'The prophets spoke into chaos and found hope',               // S
  'Trace a word through the whole Bible in the concordance',    // F
  'Let patience have its perfect work today',                   // S
  'The Bible isn\'t a textbook — it\'s a love letter',          // I
  'Before the mountains were born, He was there',               // S
  'See how the scholars disagree — and why it matters',         // F
  'You don\'t need perfect understanding, just an open heart',  // I
  'He leads beside still waters — rest in that today',          // S
  'A single verse can reshape an entire day',                   // I
  'Walk through biblical genealogies and see God\'s plan',      // F
  'Joy comes in the morning',                                   // S
  'The God of Abraham is the God of your story too',            // S
  'Discovery awaits — open a book you\'ve never explored',      // F
  'You are seen, known, and deeply loved',                      // I
  'The steadfast love of the Lord never ceases',                // S
  'Every question you bring to Scripture is welcome',           // I
  'Study the cultural context — it changes everything',         // F
  'He who began a good work in you will complete it',           // S

  // ── Feb (32–60) ──────────────────────────────────────────
  'The same power that raised the dead lives in you',           // S
  'Let the word dwell in you richly today',                     // S
  'Curious about a Hebrew word? Tap it',                        // F
  'You are never too far from a fresh start',                   // I
  'Hope does not disappoint',                                   // S
  'The timeline shows how it all connects',                     // F
  'Even the smallest act of faith moves heaven',                // I
  'Cast your anxieties on Him — He cares for you',              // S
  'A good question is worth more than a quick answer',          // I
  'Where two or three gather, He is there',                     // S
  'Compare what different scholars see in today\'s passage',    // F
  'Strength rises when surrender begins',                       // I
  'The Lord is near to the brokenhearted',                      // S
  'You belong in this story',                                   // I
  'Cross-reference threads reveal surprising connections',      // F
  'What is impossible with man is possible with God',           // S
  'Progress isn\'t perfection — keep going',                    // I
  'He counts the stars and calls them each by name',            // S
  'Explore the difficult passages — wrestle with the text',     // F
  'Even in the wilderness, provision comes',                    // S
  'Your faithfulness in reading matters more than you know',    // I
  'The word that goes out will not return empty',               // S
  'Dive into a word study and see layers you\'ve missed',       // F
  'Today is a good day to be still',                            // I
  'Love bears all things, believes all things, hopes all things', // S
  'Don\'t rush through — slow reading reveals more',            // I
  'Tap any person\'s name to learn their story',                // F
  'His faithfulness reaches to the clouds',                     // S
  'One day at a time, one chapter at a time',                   // I

  // ── Mar (61–91) ──────────────────────────────────────────
  'The wilderness is where voices are found',                   // S
  'Check the historical context panel — it unlocks meaning',    // F
  'Nothing can separate you from His love',                     // S
  'Let today\'s reading surprise you',                          // I
  'Taste and see that the Lord is good',                        // S
  'What prophecy was fulfilled here? Find out',                 // F
  'The Creator of the universe knows your name',                // I
  'Weeping may last for the night, but joy comes with dawn',    // S
  'Reading Scripture together changes everything',              // I
  'Trace the Hebrew root — meaning lives there',                // F
  'I am with you always, to the end of the age',                // S
  'Your hunger for understanding is itself a gift',             // I
  'The Psalms were meant to be sung, not just read',            // S
  'Scroll through the timeline to see the bigger picture',      // F
  'Ask boldly — He delights in giving wisdom',                  // S
  'Let the text read you today',                                // I
  'In the beginning was the Word — and it still speaks',        // S
  'Explore how the Old and New Testaments connect',             // F
  'Courage isn\'t the absence of fear — it\'s trust in action', // I
  'The Lord your God goes with you wherever you go',            // S
  'Scholarship and devotion aren\'t opposites',                 // I
  'Open the interlinear to see what\'s behind the English',     // F
  'Come to me, all who are weary — and find rest',              // S
  'Every page of Scripture holds a gift for today',             // I
  'Mountains melt like wax before the Lord',                    // S
  'Explore the concept map to see themes across books',         // F
  'Your story is part of a much bigger one',                    // I
  'The heavens declare the glory of God',                       // S
  'Curiosity is the beginning of wisdom',                       // I
  'Browse the content library for deeper dives',                // F
  'Great is thy faithfulness — morning by morning',             // S

  // ── Apr (92–121) ─────────────────────────────────────────
  'He makes all things new',                                    // S
  'The best commentary on Scripture is more Scripture',         // I
  'Look up the Greek — nuance changes everything',              // F
  'His grace is sufficient for today',                          // S
  'Don\'t just read about faith — practice it today',           // I
  'Explore where this event happened on the map',               // F
  'The Lord is my shepherd — I lack nothing',                   // S
  'You\'re not behind — you\'re exactly where you need to be',  // I
  'Consider how this chapter echoes through the whole Bible',   // F
  'I have told you these things so that you may have peace',    // S
  'Deep understanding is built one faithful day at a time',     // I
  'The fear of the Lord is the beginning of wisdom',            // S
  'Check the debate panel to see both sides',                   // F
  'Breathe. Read. Reflect. Repeat',                             // I
  'For I know the plans I have for you',                        // S
  'Your questions honor the text',                              // I
  'Trace this prophecy chain to see God\'s faithfulness',       // F
  'The valley is where growth happens',                         // S
  'There is no wrong place to start reading',                   // I
  'God spoke the world into being — and He still speaks',       // S
  'Browse scholars to find a voice that resonates',             // F
  'Be transformed by the renewing of your mind',               // S
  'Discipline today, freedom tomorrow',                         // I
  'See how this passage connects to the parallel account',      // F
  'The light shines in the darkness and is never overcome',     // S
  'Learning is worship when the heart is open',                 // I
  'Draw near to God and He will draw near to you',              // S
  'Every chapter has layers — the panels help you see them',    // F
  'His compassions never fail',                                 // S
  'The text has waited centuries for you to read it today',     // I

  // ── May (122–152) ────────────────────────────────────────
  'Trust in the Lord with all your heart',                      // S
  'Let the Spirit guide your reading today',                    // I
  'Check the Hebrew panel for Old Testament richness',          // F
  'The Lord will fight for you — be still',                     // S
  'What you plant in study, you harvest in life',               // I
  'Above all else, guard your heart',                           // S
  'Tap a highlighted verse to see cross-references',            // F
  'Blessed are those who hunger for righteousness',             // S
  'Your consistency is building something beautiful',            // I
  'The Lord is gracious and compassionate, slow to anger',      // S
  'Explore the archaeological evidence behind the text',        // F
  'Even mustard-seed faith moves mountains',                    // S
  'You don\'t need all the answers to take the next step',      // I
  'I will never leave you nor forsake you',                     // S
  'The lexicon has over 13,000 entries — go exploring',         // F
  'Peace I leave with you — my peace I give to you',            // S
  'The most important chapter is the one you\'re in',           // I
  'From everlasting to everlasting, He is God',                 // S
  'See what 54 scholars have to say about this passage',        // F
  'He heals the brokenhearted and binds up their wounds',       // S
  'Rest is not laziness — it\'s obedience',                     // I
  'All Scripture is God-breathed and useful',                   // S
  'Explore the synoptic parallels in the Gospels',             // F
  'The battle belongs to the Lord',                             // S
  'A willing heart is all you need to begin',                   // I
  'Seek first the kingdom and everything else follows',         // S
  'Open a book you\'ve been avoiding — it might surprise you',  // F
  'Those who wait on the Lord will renew their strength',       // S
  'Faithfulness in the small things matters',                   // I
  'Let the ancient words come alive today',                     // I
  'Every name in the Bible tells a story',                      // F

  // ── Jun (153–182) ────────────────────────────────────────
  'The Lord is my rock and my fortress',                        // S
  'The space between questions and answers is where faith grows', // I
  'Read the book introduction before diving in',                // F
  'God is our refuge and strength',                             // S
  'What you study today shapes who you become tomorrow',        // I
  'Whoever has ears, let them hear',                            // S
  'Follow a cross-reference thread across the whole Bible',     // F
  'The Lord goes before you and will be with you',              // S
  'Don\'t compare your chapter one to someone\'s chapter ten',  // I
  'His eye is on the sparrow — and on you',                     // S
  'The timeline puts every event in perspective',               // F
  'I can do all things through Him who strengthens me',         // S
  'Growth is rarely visible day to day — keep going',           // I
  'By wisdom the Lord laid the earth\'s foundations',            // S
  'Explore the life topics for practical Scripture',            // F
  'God\'s word will stand forever',                             // S
  'You are braver than you believe',                            // I
  'Let everything that has breath praise the Lord',             // S
  'Search for a topic — the concordance finds every mention',   // F
  'The Lord is close to those who call on Him',                 // S
  'Slow reading is deep reading',                               // I
  'He leads me in paths of righteousness',                      // S
  'Tap the map to walk where the patriarchs walked',            // F
  'In all your ways acknowledge Him',                           // S
  'Gratitude turns what you have into enough',                  // I
  'Where can I go from your Spirit? Nowhere',                   // S
  'The scholars panel shows you what you might have missed',    // F
  'Create in me a clean heart, O God',                          // S
  'Today\'s reading is tomorrow\'s foundation',                 // I
  'The truth will set you free',                                // S

  // ── Jul (183–213) ────────────────────────────────────────
  'Commit your way to the Lord and He will act',                // S
  'You are exactly where you need to be',                       // I
  'Check the Greek panel in the New Testament',                 // F
  'A bruised reed He will not break',                           // S
  'Let Scripture wash over you — no performance required',      // I
  'Open the eyes of my heart, Lord',                            // S
  'Browse the dictionary for background on any term',           // F
  'The Lord is my light and my salvation',                       // S
  'The Bible was never meant to be read alone',                 // I
  'For God so loved the world',                                  // S
  'Study the genre — poetry reads differently than history',    // F
  'He gives power to the faint',                                // S
  'Wonder is the first step toward worship',                    // I
  'I have set the Lord always before me',                       // S
  'The parallel passages reveal details you\'d otherwise miss', // F
  'The steadfast love of the Lord is from everlasting',         // S
  'Showing up to read is itself an act of faith',               // I
  'As the deer pants for water, so my soul longs for you',      // S
  'Explore the redemptive arc across all 66 books',             // F
  'With God all things are possible',                           // S
  'Don\'t just accumulate knowledge — let it shape you',        // I
  'Blessed is the one who trusts in the Lord',                  // S
  'Read the scholar bios to see whose shoulders you stand on',  // F
  'The name of the Lord is a strong tower',                     // S
  'Every day you read, you\'re investing in eternity',          // I
  'Your word is a lamp to my feet',                             // S
  'See how this passage fits in the grand narrative',           // F
  'Delight yourself in the Lord',                               // S
  'What would change if you believed every word?',              // I
  'The grass withers, but the word of God stands forever',      // S
  'Explore the difficult passages — honesty honors God',        // F

  // ── Aug (214–244) ────────────────────────────────────────
  'The Lord is compassionate and gracious',                     // S
  'You\'re not just reading — you\'re being transformed',       // I
  'Follow the prophecy chains to see promises kept',            // F
  'My grace is sufficient for you',                             // S
  'Today\'s confusion is tomorrow\'s clarity — keep reading',   // I
  'The heavens declare His handiwork',                          // S
  'Check the source panel to see where the data comes from',    // F
  'He restores my soul',                                        // S
  'A curious mind and a humble heart — that\'s all it takes',   // I
  'If God is for us, who can be against us',                    // S
  'Every chapter panel is a window into deeper meaning',        // F
  'Be strong and courageous — do not be afraid',                // S
  'Understanding compounds — every session builds on the last', // I
  'Great are the works of the Lord',                            // S
  'Explore the themes panel to see patterns emerge',            // F
  'Surely goodness and mercy shall follow me',                  // S
  'You don\'t have to understand it all — just keep going',     // I
  'The Lord has done great things for us',                      // S
  'Search by person, place, or topic — it\'s all indexed',      // F
  'Forget the former things — behold, I am doing a new thing',  // S
  'One chapter a day keeps spiritual drift away',               // I
  'Teach me your way, O Lord',                                  // S
  'The interlinear shows every word\'s original form',          // F
  'The joy of the Lord is your strength',                       // S
  'Let the text ask the questions today',                       // I
  'Know that the Lord, He is God',                              // S
  'See what the early church fathers thought about this',       // F
  'The Lord bless you and keep you',                            // S
  'Reading Scripture is a conversation, not a lecture',         // I
  'How precious are your thoughts toward me, O God',            // S
  'The topical index surfaces connections you won\'t see alone', // F

  // ── Sep (245–274) ────────────────────────────────────────
  'His banner over me is love',                                 // S
  'The page in front of you is today\'s provision',             // I
  'Explore the genealogy to see the family tree unfold',        // F
  'Return to me, and I will return to you',                     // S
  'Courage doesn\'t mean certainty — it means trust',           // I
  'The Lord watches over all who love Him',                     // S
  'Browse the content library for essays and deep dives',       // F
  'Surely the Lord is in this place',                           // S
  'Your time in the word is never wasted',                      // I
  'The earth is the Lord\'s and everything in it',               // S
  'Try reading with the historical context panel open',         // F
  'Let the morning bring me word of your unfailing love',       // S
  'Clarity follows commitment',                                 // I
  'The Lord reigns — let the earth rejoice',                    // S
  'Follow a cross-reference to an unexpected book',             // F
  'You are the temple of the living God',                       // S
  'God speaks through ancient words into present moments',      // I
  'Whom shall I send? Here am I — send me',                     // S
  'Open a Minor Prophet today — big truths in small books',     // F
  'In quietness and trust is your strength',                    // S
  'The habit of reading is the habit of hearing',               // I
  'My soul finds rest in God alone',                            // S
  'Check the debate panel — two views are better than one',     // F
  'Let us run with perseverance the race set before us',        // S
  'Every translation choice tells a story',                     // I
  'He has shown you what is good',                              // S
  'Explore how the wisdom literature speaks to everyday life',  // F
  'The Lord is faithful to all His promises',                   // S
  'You are building a foundation that will last',               // I
  'The word of the Lord endures forever',                       // S

  // ── Oct (275–305) ────────────────────────────────────────
  'Give thanks to the Lord, for He is good',                    // S
  'The best insights come when you linger in the text',         // I
  'Follow the timeline from creation to the early church',      // F
  'The Lord is my strength and my song',                        // S
  'Your questions are signs of a living faith',                 // I
  'Consider the lilies — they neither toil nor spin',           // S
  'The map shows trade routes, battles, and journeys',          // F
  'He who dwells in the shelter of the Most High',              // S
  'Faithfulness is more important than feelings',               // I
  'Blessed are the peacemakers',                                // S
  'Tap any scholar for their unique perspective',               // F
  'The Lord is my portion — therefore I will wait for Him',     // S
  'You don\'t need more time — just more intention',            // I
  'I will lift up my eyes to the hills',                        // S
  'Study the chiastic structure scholars have uncovered',       // F
  'Eye has not seen, nor ear heard, what God has prepared',     // S
  'Let the word do the heavy lifting today',                    // I
  'The Lord gives wisdom — from His mouth come knowledge',      // S
  'The lexicon unlocks meaning the English can\'t carry',       // F
  'Abide in me and I in you',                                   // S
  'Spiritual growth is invisible until it isn\'t',              // I
  'Put on the full armor of God',                               // S
  'Read the footnotes — the scholars put treasures there',      // F
  'Cast your bread upon the waters',                            // S
  'Even ten minutes of focused reading bears fruit',            // I
  'The Lord is slow to anger and rich in love',                 // S
  'Explore a concept you\'ve always wondered about',            // F
  'They who sow in tears shall reap with shouts of joy',       // S
  'The Bible meets you where you are',                          // I
  'Great peace have those who love your law',                   // S
  'Trace a theme from Genesis to Revelation',                   // F

  // ── Nov (306–335) ────────────────────────────────────────
  'Enter His gates with thanksgiving',                          // S
  'Today\'s verse might be the one you remember forever',       // I
  'The word study tool reveals what English translations hide',  // F
  'The Lord your God is in your midst — mighty to save',        // S
  'Let wonder lead you deeper than duty ever could',            // I
  'This is the day the Lord has made',                          // S
  'Read the parallel account and spot the differences',         // F
  'He has made everything beautiful in its time',               // S
  'Transformation is a process — trust the process',            // I
  'Set your mind on things above',                              // S
  'Browse the scholars and discover a new voice today',         // F
  'The Lord is righteous in all His ways',                      // S
  'Reading is believing — one chapter at a time',               // I
  'As iron sharpens iron, so one person sharpens another',      // S
  'Dig into the original languages — the depth is worth it',    // F
  'Hold unswervingly to the hope we profess',                   // S
  'Consistency over intensity — always',                        // I
  'Let the peace of Christ rule in your hearts',                // S
  'The prophecy panel reveals patterns centuries in the making', // F
  'For where your treasure is, there your heart will be',       // S
  'Don\'t just read the Bible — let the Bible read you',        // I
  'The Lord is good to those whose hope is in Him',             // S
  'Explore how archaeology confirms the biblical record',       // F
  'My flesh and my heart may fail, but God is enough',          // S
  'Every scholar was once a student — you\'re in good company', // I
  'The Lord will be your everlasting light',                    // S
  'Search for a keyword and see every verse it appears in',     // F
  'His mercies are new every morning — great is His faithfulness', // S
  'Today\'s study is a seed — water it with reflection',        // I
  'He makes me lie down in green pastures',                     // S

  // ── Dec (336–366) ────────────────────────────────────────
  'Behold, I stand at the door and knock',                      // S
  'The best scholars never stop being students',                // I
  'Read the book intro to see the big picture first',           // F
  'Glory to God in the highest',                                // S
  'Let every word you read be an act of worship',               // I
  'For unto us a child is born',                                // S
  'See where this event falls on the timeline',                 // F
  'The people walking in darkness have seen a great light',     // S
  'Knowledge puffs up, but love builds up — study with love',   // I
  'Immanuel — God with us',                                     // S
  'Open the Hebrew panel and hear the text\'s heartbeat',       // F
  'A child has been given — and His name is Wonderful',         // S
  'You are further along than you think you are',               // I
  'All the promises of God find their Yes in Him',              // S
  'The map shows you the world the text was written in',        // F
  'He came so that you might have life abundantly',             // S
  'The most profound truths are often the simplest',            // I
  'The Word became flesh and dwelt among us',                   // S
  'Read a psalm aloud — let the words resonate',                // F
  'In Him all things hold together',                            // S
  'Let gratitude be the lens through which you read today',     // I
  'The Lord remembers His covenant forever',                    // S
  'Browse the debates to sharpen your own thinking',            // F
  'Faithful is He who calls you — He will do it',               // S
  'Every ending in the Bible is really a beginning',            // I
  'The Alpha and the Omega — the beginning and the end',        // S
  'See what scholars across traditions say about this text',    // F
  'Surely I am with you always, to the very end of the age',   // S
  'What a year of reading has built in you',                    // I
  'The best is yet to come — His promises never fail',          // S
  'Start the new year with an open heart and open Bible',       // I
];

export default dailyEncouragements;
